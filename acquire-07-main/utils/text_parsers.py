from typing import List, Dict, Optional
import os
from utils.helpers import _to_number
from langsmith import traceable
import pandas as pd
import re
import pdfplumber
import csv
from dotenv import load_dotenv 
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

def _extract_amounts_from_line(line: str) -> List[float]:
    """Return list of monetary numbers found in a line."""
    amounts = []
    # A slightly more robust regex for money/ints
    for m in re.finditer(r"(-?\$?\d{1,3}(?:[,\d]{0,}|(?:\d+))(?:\.\d{1,2})?)", line):
        val = m.group(0)
        if '$' in val or re.search(r"\d", val):
            num = _to_number(val)
            if num is not None:
                amounts.append(num)
    return amounts

@traceable(name="parse_rent_roll_from_text")
def parse_rent_roll_from_text(path: str) -> pd.DataFrame:
    """
    Heuristic parser: scan page text for suites/tenant lines and nearby numbers.
    Returns a dataframe with candidate rows and parsed fields (best-effort).
    """
    candidates = []
    try:
        with pdfplumber.open(path) as pdf:
            for i, page in enumerate(pdf.pages):
                text = page.extract_text() or ""
                lines = [l.strip() for l in text.splitlines() if l.strip()]
                for idx, line in enumerate(lines):
                    if re.search(r"(^suite\s*\d+)|(^\d{2,4}\b)", line.lower()) or re.search(r"\b(suite|ste|#)\b", line.lower()):
                        window = " | ".join(lines[max(0, idx-2): idx+4])
                        amounts = _extract_amounts_from_line(window)
                        sqft = None
                        m_sq = re.search(r"(\d{3,6})(?:\s?(?:sf|sq\.?ft|s\.f\.))", window.replace(",", "").lower())
                        if m_sq:
                            sqft = _to_number(m_sq.group(1))
                        lease = None
                        m_lease = re.search(r"((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[\w\.-]*\s*\-?\s*\d{4})", window, flags=re.I)
                        if m_lease:
                            lease = m_lease.group(0)
                        m_tenant = re.search(r"\b(?:suite|ste|#)?\s*\d{0,4}\s*[-:]*\s*([A-Z][A-Za-z0-9&,\.\- ]{2,80})", window)
                        tenant = m_tenant.group(1).strip() if m_tenant else None
                        candidates.append({
                            "page": i+1,
                            "window": window,
                            "tenant": tenant,
                            "sqft": sqft,
                            "amounts": amounts,
                            "lease_hint": lease
                        })
    except Exception as e:
        print(f"parse_rent_roll_from_text failed for {path}: {e}")
    df = pd.DataFrame(candidates)
    def pick_amount(row):
        if not row.get("amounts"):
            return None
        nums = sorted(row["amounts"])
        return nums[-1]
    if not df.empty:
        df["best_amount"] = df.apply(pick_amount, axis=1)
    df.to_csv("debug_rent_roll_candidates.csv", index=False)
    return df

@traceable(name="parse_t12_from_text")
def parse_t12_from_text(path: str) -> Dict[str, Optional[float]]:
    text_all = ""
    try:
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                text_all += "\n" + (page.extract_text() or "")
    except Exception as e:
        print(f"parse_t12_from_text failed for {path}: {e}")
        text_all = ""

    txt = re.sub(r"\s{2,}", " ", text_all)
    lines = [l.strip() for l in txt.splitlines() if l.strip()]
    candidates = []
    for ln in lines:
        if re.search(r"(gross.*potential.*rent|potential.*rent|gpr|effective gross|effective gross income|net operating income|operating expenses|total expenses|vacancy|credit loss|other income|misc income|parking|laundry)", ln, flags=re.I):
            nums = _extract_amounts_from_line(ln)
            candidates.append({"line": ln, "amounts": nums})
    with open("debug_t12_candidates.csv", "w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=["line", "amounts"])
        writer.writeheader()
        for c in candidates:
            writer.writerow({"line": c["line"], "amounts": ";".join(str(a) for a in c["amounts"])})
    def pick_for_pattern(pats):
        for c in candidates:
            for p in pats:
                if re.search(p, c["line"], flags=re.I):
                    if c["amounts"]:
                        return c["amounts"][-1]
        return None
    gpr = pick_for_pattern([r"gross.*potential.*rent", r"potential.*rent", r"gpr"])
    vacancy = pick_for_pattern([r"vacancy", r"credit.*loss", r"loss.*to.*lease"])
    other_income = pick_for_pattern([r"other.*income", r"misc.*income", r"parking", r"laundry", r"storage"])
    egi_candidate = pick_for_pattern([r"effective gross income", r"effective.*gross", r"egi"])
    opex = pick_for_pattern([r"operating expenses", r"total expenses", r"expenses", r"total operating expenses"])
    noi = pick_for_pattern([r"net operating income", r"noi"])
    egi = egi_candidate
    if egi is None and gpr is not None:
        egi = gpr - (vacancy or 0.0) + (other_income or 0.0)
    return {
        "gross_potential_rent": gpr,
        "vacancy": vacancy,
        "other_income": other_income,
        "effective_gross_income": egi,
        "operating_expenses": opex,
        "net_operating_income": noi
    }
@traceable(name="parse_rent_roll_summary_text")
def parse_rent_roll_summary_text(path: str) -> dict:
    """
    Extracts 'Rent Roll Summary' values like Total Units, Current Rent Total, Market Rent Total, and Rent Gap %.
    Useful for summary tables without tenant-level data.
    """
    import pdfplumber
    import re

    result = {
        "total_units": None,
        "current_rent_total": None,
        "market_rent_total": None,
        "rent_gap_pct": None,
    }

    try:
        with pdfplumber.open(path) as pdf:
            full_text = "\n".join(page.extract_text() or "" for page in pdf.pages)

        patterns = {
            "total_units": r"Total\s+Units[:\s]*([\d,\.]+)",
            "current_rent_total": r"Current\s+Rent\s+Total[:\s]*\$?([\d,\,\.]+)",
            "market_rent_total": r"Market\s+Rent\s+Total[:\s]*\$?([\d,\,\.]+)",
            "rent_gap_pct": r"Rent\s+Gap\s*%[:\s]*([\d,\,\.]+)",
        }

        for key, pattern in patterns.items():
            match = re.search(pattern, full_text, re.IGNORECASE)
            if match:
                val = match.group(1).replace(",", "")
                try:
                    result[key] = float(val)
                except ValueError:
                    result[key] = None

    except Exception as e:
        print(f"[WARN] parse_rent_roll_summary_text failed for {path}: {e}")

    return result
@traceable(name="parse_t12_summary_text")
def parse_t12_summary_text(path: str) -> dict:
    """
    Extracts summary-level T12 metrics like:
    Gross Potential Rent, Vacancy, Effective Gross Income, Operating Expenses, and NOI.
    This is used when the PDF contains summary tables instead of detailed T12 rows.
    """
    import pdfplumber
    import re

    result = {
        "gross_potential_rent": None,
        "vacancy": None,
        "effective_gross_income": None,
        "operating_expenses": None,
        "net_operating_income": None,
    }

    try:
        with pdfplumber.open(path) as pdf:
            full_text = "\n".join(page.extract_text() or "" for page in pdf.pages)

        patterns = {
            "gross_potential_rent": r"(Gross\s+Potential\s+Rent)[:\s]*\$?([\d,\.]+)",
            "vacancy": r"(Vacancy|Credit\s+Loss)[:\s]*\$?([\d,\.]+)",
            "effective_gross_income": r"(Effective\s+Gross\s+Income|EGI)[:\s]*\$?([\d,\.]+)",
            "operating_expenses": r"(Operating\s+Expenses|Total\s+Expenses)[:\s]*\$?([\d,\.]+)",
            "net_operating_income": r"(Net\s+Operating\s+Income|NOI)[:\s]*\$?([\d,\.]+)",
        }

        for key, pattern in patterns.items():
            match = re.search(pattern, full_text, re.IGNORECASE)
            if match:
                val = match.group(2).replace(",", "")
                try:
                    result[key] = float(val)
                except ValueError:
                    pass

    except Exception as e:
        print(f"[WARN] parse_t12_summary_text failed for {path}: {e}")

    return result
