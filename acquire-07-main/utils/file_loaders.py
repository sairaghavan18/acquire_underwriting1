"""
Enhanced multi-file loader for LangChain with OCR fallback.

✅ Handles:
    - PDFs (text & image-based)
    - CSV / Excel / TXT / JSON
✅ Uses multiple loaders for redundancy
✅ Automatic OCR fallback (pdf2image + pytesseract)
✅ Dynamic chunking based on document size
✅ Deduplication & metadata preservation
"""

import os
import traceback
import logging
import pandas as pd
from typing import List, Dict, Any

from dotenv import load_dotenv
from langsmith import traceable
from langchain.schema import Document
from langchain_community.document_loaders import (
    PDFPlumberLoader,
    PyPDFLoader,
    UnstructuredPDFLoader,
    PyPDFium2Loader,
    PyMuPDFLoader,
    PDFMinerLoader,
    PDFMinerPDFasHTMLLoader,
)
from langchain.text_splitter import RecursiveCharacterTextSplitter

# --- Optional OCR ---
try:
    from pdf2image import convert_from_path
    import pytesseract
    OCR_AVAILABLE = True
except Exception:
    OCR_AVAILABLE = False

# Load environment
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

# Logging setup
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# =========================================================
# Utility Functions
# =========================================================

def _df_to_document(df: pd.DataFrame, meta: Dict[str, Any]) -> Document:
    """Convert a pandas DataFrame into a text document."""
    text = df.to_csv(index=False)
    return Document(page_content=text, metadata=meta)


def get_text_splitter(text: str) -> RecursiveCharacterTextSplitter:
    """Dynamically adjust chunk size based on text length (approx token count)."""
    length = len(text)
    est_tokens = length // 4  # ~4 chars per token

    if est_tokens > 800_000:
        chunk_size, chunk_overlap = 1500, 200
    elif est_tokens > 400_000:
        chunk_size, chunk_overlap = 2000, 250
    elif est_tokens > 200_000:
        chunk_size, chunk_overlap = 2500, 300
    else:
        chunk_size, chunk_overlap = 3000, 300

    logging.info(f"⚙️ Using chunk_size={chunk_size}, overlap={chunk_overlap} for ~{est_tokens:,} tokens")
    return RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", " ", ""]
    )


# =========================================================
# OCR Fallback
# =========================================================

def ocr_fallback_pdf(path: str) -> List[Document]:
    """Extract text from image-only PDF using pdf2image + pytesseract."""
    if not OCR_AVAILABLE:
        logging.warning("OCR fallback not available (install pdf2image & pytesseract).")
        return []

    try:
        logging.info(f"🧠 Starting OCR fallback for {os.path.basename(path)} ...")
        images = convert_from_path(path, dpi=150)
        ocr_docs = []

        for i, img in enumerate(images):
            text = pytesseract.image_to_string(img, lang="eng")
            if text.strip():
                meta = {"source": path, "page": i, "loader": "pytesseract_ocr", "ocr_used": True}
                ocr_docs.append(Document(page_content=text.strip(), metadata=meta))

        logging.info(f"✅ OCR extracted {len(ocr_docs)} pages from {os.path.basename(path)}")
        return ocr_docs

    except Exception as e:
        logging.error(f"OCR fallback failed for {path}: {e}")
        traceback.print_exc()
        return []


# =========================================================
# PDF Loader
# =========================================================

@traceable(name="load_pdf_multi")
def load_pdf_multi(path: str) -> List[Document]:
    """Try multiple PDF loaders and fallback to OCR if no text found."""
    docs: List[Document] = []

    loaders = [
        ("PDFPlumberLoader", PDFPlumberLoader(path)),
        ("PyPDFLoader", PyPDFLoader(path)),
        ("UnstructuredPDFLoader (OCR)", UnstructuredPDFLoader(path, strategy="ocr_only")),
        ("PyPDFium2Loader", PyPDFium2Loader(path)),
        ("PyMuPDFLoader", PyMuPDFLoader(path)),
        ("PDFMinerLoader", PDFMinerLoader(path)),
        ("PDFMinerPDFasHTMLLoader", PDFMinerPDFasHTMLLoader(path)),
    ]

    # Try multiple text-based extractors
    for name, loader in loaders:
        try:
            new_docs = loader.load()
            docs.extend(new_docs)
            logging.info(f"✅ {name} extracted {len(new_docs)} docs from {os.path.basename(path)}")
        except Exception as e:
            logging.warning(f"⚠️ {name} failed for {os.path.basename(path)}: {e}")

    # If all loaders produced little/no text → OCR fallback
    total_text_len = sum(len((d.page_content or "").strip()) for d in docs)
    if total_text_len < 50:
        logging.warning(f"⚠️ No meaningful text extracted from {os.path.basename(path)} — trying OCR fallback...")
        ocr_docs = ocr_fallback_pdf(path)
        docs.extend(ocr_docs)

    # Deduplicate content
    seen = set()
    unique_docs = []
    for d in docs:
        key = (d.page_content or "").strip()
        if key and key not in seen:
            unique_docs.append(d)
            seen.add(key)

    logging.info(f"📄 Total unique PDF docs after merging: {len(unique_docs)}")
    return unique_docs


# =========================================================
# Other File Loaders
# =========================================================

def load_csv_as_documents(path: str) -> List[Document]:
    try:
        df = pd.read_csv(path)
        doc = _df_to_document(df, {"source": path, "type": "csv", "rows": len(df)})
        doc.metadata["dataframe"] = df
        return [doc]
    except Exception as e:
        logging.error(f"⚠️ Failed to read CSV {path}: {e}")
        traceback.print_exc()
        return [Document(page_content="", metadata={"source": path})]


def load_excel_as_documents(path: str) -> List[Document]:
    docs = []
    try:
        xls = pd.read_excel(path, sheet_name=None)
        for sheet_name, df in xls.items():
            meta = {"source": path, "sheet": sheet_name, "type": "excel", "rows": len(df)}
            doc = _df_to_document(df, meta)
            doc.metadata["dataframe"] = df
            docs.append(doc)
        return docs
    except Exception as e:
        logging.error(f"⚠️ Failed to read Excel {path}: {e}")
        traceback.print_exc()
        return [Document(page_content="", metadata={"source": path})]


def load_text_or_json(path: str) -> List[Document]:
    try:
        with open(path, "r", encoding="utf-8") as fh:
            txt = fh.read()
        return [Document(page_content=txt, metadata={"source": path, "type": "text_or_json"})]
    except Exception as e:
        logging.error(f"⚠️ Failed to read text/json {path}: {e}")
        traceback.print_exc()
        return [Document(page_content="", metadata={"source": path})]


# =========================================================
# Chunking
# =========================================================

def chunk_documents(docs: List[Document]) -> List[Document]:
    """Split long documents into smaller parts for vectorization."""
    chunked_docs: List[Document] = []
    for doc in docs:
        if not doc.page_content:
            continue
        splitter = get_text_splitter(doc.page_content)
        splits = splitter.split_documents([doc])
        chunked_docs.extend(splits)
    logging.info(f"✅ Chunked into {len(chunked_docs)} total parts.")
    return chunked_docs


# =========================================================
# Main Unified Loader
# =========================================================

def load_files(paths: List[str]) -> List[Document]:
    """Main entrypoint to load PDFs, CSVs, Excels, or text files."""
    all_docs: List[Document] = []

    for p in paths:
        if not os.path.exists(p):
            logging.warning(f"⚠️ Path not found: {p}")
            continue

        ext = os.path.splitext(p)[1].lower()

        try:
            if ext == ".pdf":
                all_docs.extend(load_pdf_multi(p))
            elif ext == ".csv":
                all_docs.extend(load_csv_as_documents(p))
            elif ext in [".xls", ".xlsx"]:
                all_docs.extend(load_excel_as_documents(p))
            elif ext in [".txt", ".json"]:
                all_docs.extend(load_text_or_json(p))
            else:
                # Fallback try CSV
                try:
                    df = pd.read_csv(p)
                    doc = _df_to_document(df, {"source": p, "type": "csv_fallback", "rows": len(df)})
                    doc.metadata["dataframe"] = df
                    all_docs.append(doc)
                except Exception:
                    all_docs.extend(load_text_or_json(p))
        except Exception as e:
            logging.error(f"❌ Failed loading {p}: {e}")
            traceback.print_exc()

    logging.info(f"📚 Loaded {len(all_docs)} base documents before chunking.")
    chunked = chunk_documents(all_docs)
    logging.info(f"✅ Final document count: {len(chunked)}")
    return chunked
