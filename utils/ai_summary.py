from typing import Dict, Any, Optional
import os
import json
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

def generate_underwriting_summary(narrative: Dict[str, Any], metrics: Dict[str, Any]) -> str:
    """Use OpenAI to generate a brief professional underwriting summary."""
    prompt = f"""
You are a real estate underwriting analyst. 
Given the following property narrative and financial metrics, create a concise, professional underwriting summary:

Narrative:
{json.dumps(narrative, indent=2)}

Metrics:
{json.dumps(metrics, indent=2)}

Summary:
"""
    try:
        response = ChatOpenAI(
            model="gpt-4",
            temperature=0.3,
        )
        messages=[{"role": "user", "content": prompt}]
        response = response.invoke(messages)
        summary = response.content.strip()
        return summary
    except Exception as e:
        return f"AI summary generation failed: {e}"
    

def generate_executive_summary(narrative: Dict[str, Any], metrics: Dict[str, Any]) -> str:
    """
    Generate a short, professional Executive Summary focused on investment highlights,
    property facts, and location advantages — distinct from the AI Summary.
    """
    prompt = f"""
You are a senior real estate investment analyst. 
Write a **concise, bullet-style Executive Summary** (3–5 points max) for an investment memo based on this data.

- Keep tone: professional, investor-oriented, and factual.
- Focus on property attributes, market location, and financial appeal.
- Avoid repetition with AI Summary (no detailed underwriting discussion).
- Use short sentences or bullet points (not paragraphs).
- use  all the analytics details to show
- just kepp it it small and use only the most important details
- make it as executive summary

Property Narrative:
{json.dumps(narrative, indent=2)}

Financial Metrics:
{json.dumps(metrics, indent=2)}

Executive Summary:
"""
    try:
        response = ChatOpenAI(
            model="gpt-4",
            temperature=0.4,
        )
        messages = [{"role": "user", "content": prompt}]
        result = response.invoke(messages)
        return result.content.strip()
    except Exception as e:
        return f"Executive summary generation failed: {e}"