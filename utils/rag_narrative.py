from typing import List, Dict, Any
from langsmith import traceable
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os
from dotenv import load_dotenv
from langchain_community.vectorstores.faiss import FAISS
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_openai import ChatOpenAI
import re
from langchain.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda, RunnableParallel, RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
import json

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
EMBED_MODEL = os.getenv("EMBED_MODEL", "text-embedding-3-small")
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")
TABLE_CHUNK_SIZE = int(os.getenv("TABLE_CHUNK_SIZE", "1500"))
TABLE_CHUNK_OVERLAP = int(os.getenv("TABLE_CHUNK_OVERLAP", "150"))


def _format_docs(docs):
    return "\n\n".join(d.page_content for d in docs)


@traceable(name="split_documents")
def split_documents(docs, chunk_size=TABLE_CHUNK_SIZE, chunk_overlap=TABLE_CHUNK_OVERLAP):
    """
    Splits documents into chunks. Tables are detected roughly and kept intact.
    """
    splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    final_splits = []
    for doc in docs:
        text = doc.page_content or ""
        # Rough table detection: multiple numbers + newlines or tabs
        if re.search(r"\d+\s+\d+", text) and ("\n" in text or "\t" in text):
            final_splits.append(doc)
        else:
            final_splits.extend(splitter.split_documents([doc]))
    print(f"Total chunks after table-aware splitting: {len(final_splits)}")
    return final_splits


def build_vectorstore_incremental(docs, batch_size=50):
    """
    Incrementally embeds document chunks in batches and builds FAISS.
    """
    emb = OpenAIEmbeddings(model=EMBED_MODEL)
    vs = None
    for i in range(0, len(docs), batch_size):
        batch_docs = docs[i:i + batch_size]
        if vs is None:
            vs = FAISS.from_documents(batch_docs, emb)
        else:
            vs.add_documents(batch_docs)
        print(f"Embedded batch {i // batch_size + 1} / {len(docs) // batch_size + 1}")
    return vs


@traceable(name="extract_narrative_fields")
def extract_narrative_fields(vs, pdf_path: str = None) -> Dict[str, Any]:
    """
    Uses RAG + LLM to extract property details.
    If fields are missing, defaults to 'Not found' instead of None.
    """
    retriever = vs.as_retriever(search_type="similarity", search_kwargs={"k": 6})
    llm = ChatOpenAI(model=LLM_MODEL, temperature=0)

    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            "Extract ONLY from the provided context. "
            "If not found, write 'Not found'. Respond in strict JSON format."
        ),
        (
            "human",
            """Extract these fields:
- purchase_price
- property_name
- property_address
- property_type
- year_built
- renovation_year
- number_of_stories
- total_units_or_suites
- total_building_sqft
- amenities

Context:
{context}"""
        ),
    ])

    parallel = RunnableParallel({
        "context": retriever | RunnableLambda(_format_docs),
        "question": RunnablePassthrough(),
    })
    chain = parallel | prompt | llm | StrOutputParser()

    query = "Extract property details (name, address, type, year built, sqft, units, amenities)"
    out = chain.invoke(query)

    # Clean up Markdown JSON formatting
    out = re.sub(r"^```(?:json)?\s*|\s*```$", "", out.strip(), flags=re.I | re.M)

    try:
        narrative = json.loads(out)
    except Exception:
        narrative = {"raw": out}

    # Default fallback values (so you don't get None or "I don't know")
    for key in [
        "property_name",
        "property_address",
        "purchase_price",
        "property_type",
        "year_built",
        "renovation_year",
        "number_of_stories",
        "total_units_or_suites",
        "total_building_sqft",
        "amenities",
    ]:
        if not narrative.get(key) or "I don't know" in str(narrative.get(key)):
            narrative[key] = "Not found"

    return narrative
def extract_sqft_value(value):
    """
    Extract a numeric square footage from messy strings like '125,043 SF', '125k sqft', '125043 sq ft', etc.
    """
    if not value:
        return None
    if isinstance(value, (int, float)):
        return value
    text = str(value).lower().replace(",", "").strip()
    m = re.search(r"(\d{3,8})(?:\s?(?:sf|sq\.?ft|s\.f\.|square\s?feet|square\s?foot|sq\s?foot|sq\s?feet|sqft|sq\s?ft|s/f|s f))?", text)
    if m:
        try:
            return int(m.group(1))
        except:
            return float(m.group(1))
    return None