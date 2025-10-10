import os
import json
import tempfile
import shutil
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client
from datetime import datetime
from dotenv import load_dotenv
from pydantic import BaseModel
import math
from utils.file_loaders import load_files
from utils.table_parsers import extract_tables_to_dataframes_from_docs
from utils.orchestration import split_documents
from utils.rag_narrative import extract_narrative_fields
from utils.aggregation import aggregate_rent_roll, aggregate_t12
from utils.metrics import compute_metrics
from utils.ai_summary import generate_underwriting_summary
from utils.ai_analysis import generate_underwriting_analysis
from langchain_community.vectorstores import FAISS  # or from langchain_community.vectorstores.faiss import FAISS
from langchain_openai import OpenAIEmbeddings
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
 
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
 
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
 
def clean_number(value):
    """Convert strings like '$25,000' or '25,000' to float, handling NaN values"""
    if value is None:
        return None
    
    if isinstance(value, str):
        value = value.replace(",", "").replace("$", "")
    
    try:
        result = float(value)
        # Check for NaN, infinity, or other invalid float values
        if math.isnan(result) or math.isinf(result):
            return None
        return result
    except:
        return None
 
def clean_dict_for_json(data):
    """Recursively clean dictionary to remove NaN, infinity, and other non-JSON compliant values"""
    if isinstance(data, dict):
        cleaned = {}
        for key, value in data.items():
            cleaned[key] = clean_dict_for_json(value)
        return cleaned
    elif isinstance(data, list):
        return [clean_dict_for_json(item) for item in data]
    elif isinstance(data, float):
        if math.isnan(data) or math.isinf(data):
            return None
        return data
    else:
        return data
 
def save_to_supabase(narrative_fields, metrics, t12_summary, ai_summary, ai_analysis):
    data = {
        "property_name": narrative_fields.get("property_name"),
        "address": narrative_fields.get("property_address"),
        "year_built": narrative_fields.get("year_built"),
        "sqft": clean_number(narrative_fields.get("total_building_sqft")),
        "metrics": {
            "cap_rate": clean_number(metrics.get("cap_rate")),
            "dscr": clean_number(metrics.get("dscr")),
            "coc_return": clean_number(metrics.get("coc_return")),
            "irr_5yr": clean_number(metrics.get("irr_5yr")),
            "current_rent_total": clean_number(metrics.get("current_rent_total")),  # ADDED
            "market_rent_total": clean_number(metrics.get("market_rent_total")),    # ADDED
            "rent_gap_pct": clean_number(metrics.get("rent_gap_pct")),
            "price_per_sqft": clean_number(metrics.get("price_per_sqft")),
            "price_per_unit": clean_number(metrics.get("price_per_unit")),
            "break_even_occupancy": clean_number(metrics.get("break_even_occupancy")),
        },
        "t12_summary": clean_dict_for_json(t12_summary),  # ADDED cleaning
        "ai_summary": ai_summary,
        "ai_analysis": ai_analysis,
        "created_at": datetime.utcnow().isoformat()
    }
    try:
        supabase.table("Underwriting").insert(data).execute()
    except Exception as e:
        print("Supabase insert failed:", e)
 
# Import your existing pipeline functions
from utils.aggregation import *
from utils.ai_summary import *
from utils.ai_analysis import *
from utils.file_loaders import *
from utils.helpers import *
from utils.metrics import *
from utils.orchestration import *
from utils.rag_narrative import *
from utils.table_parsers import *
from utils.text_parsers import *
 
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
 
app = FastAPI(title="CRE Underwriting API", version="1.0")
 
# Allow frontend origin
origins = [
    "http://localhost:5173",  # Vite/React dev server
    "http://127.0.0.1:5173",
]
 
# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # temporarily allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
# Explicitly use OpenAI embeddings for FAISS vectorstore
def build_vectorstore(docs):
    embeddings = OpenAIEmbeddings(model=os.getenv("EMBED_MODEL", "text-embedding-3-small"))
    return FAISS.from_documents(docs, embeddings)
 
# User schema
class User(BaseModel):
    email: str
    name: str
    picture: str
 
@app.post("/save_user")
def save_user(user: User):
    try:
        # Check if already exists
        existing = supabase.table("users").select("*").eq("email", user.email).execute()
        if existing.data:
            return {"message": "User already exists"}
 
        # Insert user
        result = supabase.table("users").insert({
            "email": user.email,
            "name": user.name,
            "picture": user.picture
        }).execute()
 
        return {"message": "User saved", "data": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
@app.post("/underwrite")
async def underwrite(
    files: List[UploadFile] = File(...),
    overrides: str = Form(default="{}"),
):
    """
    Upload one or more files (PDF, Excel, CSV, JSON, TXT) and get underwriting metrics.
    Optionally pass overrides (JSON string) to inject purchase price, debt service, etc.
    """
    tmpdir = tempfile.mkdtemp()
    paths = []
 
    try:
        # Save uploads to temp files
        for f in files:
            path = os.path.join(tmpdir, f.filename)
            with open(path, "wb") as buffer:
                shutil.copyfileobj(f.file, buffer)
            paths.append(path)
 
        # Load and process files
        docs = load_files(paths)
        table_dfs = extract_tables_to_dataframes_from_docs(docs)
 
        rent_roll_summary = aggregate_rent_roll(table_dfs.get("rent_roll", []), paths)
        t12_summary = aggregate_t12(table_dfs.get("t12", []), paths)
 
        splits = split_documents(docs)
        vs = build_vectorstore_incremental(splits)
        ##narrative_fields = extract_narrative_fields(vs)
        narrative_fields = extract_narrative_fields(vs)
 
        # Parse overrides
        try:
            overrides_dict: Dict[str, Any] = json.loads(overrides)
        except Exception:
            overrides_dict = {}
 
        # Compute metrics
        metrics = compute_metrics(
            t12_summary,
            rent_roll_summary,
            narrative_fields,
            overrides=overrides_dict
        )
 
        # Generate AI underwriting summary
        ai_summary = generate_underwriting_summary(narrative_fields, metrics)
        ai_analysis = generate_underwriting_analysis(narrative_fields, metrics)
        ai_executive_summary = generate_executive_summary(narrative_fields, metrics)
 
        # Clean all data before processing
        clean_narrative_fields = clean_dict_for_json(narrative_fields)
        clean_metrics = clean_dict_for_json(metrics)
        clean_t12_summary = clean_dict_for_json(t12_summary)
        clean_rent_roll_summary = clean_dict_for_json(rent_roll_summary)
 
        # Save to Supabase with cleaned data
        save_to_supabase(clean_narrative_fields, clean_metrics, clean_t12_summary, ai_summary, ai_analysis)
 
        result = {
            "rent_roll_summary": clean_rent_roll_summary,
            "t12_summary": clean_t12_summary,
            "narrative_fields": clean_narrative_fields,
            "metrics": clean_metrics,
            "ai_summary": ai_summary,
            "executive_summary": ai_executive_summary,
            "quick_summary": {
                "property": clean_narrative_fields.get("property_name"),
                "address": clean_narrative_fields.get("property_address"),
                "year_built": clean_narrative_fields.get("year_built"),
                "sqft": extract_sqft_value(narrative_fields.get("total_building_sqft")),
                "NOI": clean_t12_summary.get("net_operating_income"),
                "Expenses": clean_t12_summary.get("operating_expenses"),
                "GPR": clean_t12_summary.get("gross_potential_rent"),
                "Current Rent Total": clean_rent_roll_summary.get("current_rent_total"),  # ADDED
                "Market Rent Total": clean_rent_roll_summary.get("market_rent_total"),    # ADDED
                "IRR 5-Year": clean_metrics.get("irr_5yr"),                              # ADDED
                "Rent Gap %": clean_metrics.get("rent_gap_pct"),
                "Cap Rate": clean_metrics.get("cap_rate"),
                "DSCR": clean_metrics.get("dscr"),
                "CoC Return": clean_metrics.get("coc_return"),
                "Price per SqFt": clean_metrics.get("price_per_sqft"),
                "Price per Unit": clean_metrics.get("price_per_unit"),
                "Break-even Occupancy": clean_metrics.get("break_even_occupancy"),
                "Investment Recommendation": ai_analysis.get("investment_recommendation"),
                "Key Investment Highlights": ai_analysis.get("key_investment_highlights"),
                "Risk Considerations": ai_analysis.get("risk_considerations"),
            
            },
        }
 
        # Final clean of the entire result before JSON serialization
        result = clean_dict_for_json(result)
        return JSONResponse(content=result)
 
    finally:
        # Clean up temp directory
        shutil.rmtree(tmpdir, ignore_errors=True)
 
 
