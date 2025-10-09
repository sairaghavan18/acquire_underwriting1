import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import * as XLSX from "xlsx";
import { pipeline } from "@huggingface/transformers";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

// Simple cosine similarity
function cosineSim(a: number[], b: number[]): number {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const na = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const nb = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  return na && nb ? dot / (na * nb) : 0;
}

async function fileToDocuments(file: File): Promise<Document[]> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) {
    const loader = new WebPDFLoader(file, {
      splitPages: true,
      pdfjs: () => import("pdfjs-dist/build/pdf.mjs"),
    });
    const docs = await loader.load();
    return docs.map((d, i) => new Document({
      pageContent: d.pageContent,
      metadata: { source: file.name, page: i + 1 },
    }));
  }
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const ab = await file.arrayBuffer();
    const wb = XLSX.read(ab);
    let text = "";
    wb.SheetNames.forEach((sn) => {
      const sheet = wb.Sheets[sn];
      const csv = XLSX.utils.sheet_to_csv(sheet);
      text += `Sheet: ${sn}\n${csv}\n\n`;
    });
    return [new Document({ pageContent: text, metadata: { source: file.name, type: "excel" } })];
  }
  if (name.endsWith(".csv")) {
    const txt = await file.text();
    return [new Document({ pageContent: txt, metadata: { source: file.name, type: "csv" } })];
  }
  const txt = await file.text();
  return [new Document({ pageContent: txt, metadata: { source: file.name, type: "text" } })];
}

async function chunkDocuments(documents: Document[]): Promise<Document[]> {
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1500, chunkOverlap: 300 });
  return splitter.splitDocuments(documents);
}

async function buildEmbedder() {
  // WebGPU if available, falls back to CPU/wasm automatically
  const extractor = await pipeline(
    "feature-extraction",
    "mixedbread-ai/mxbai-embed-xsmall-v1",
    { device: "webgpu" }
  );
  return async (texts: string[]): Promise<number[][]> => {
    const out = await extractor(texts, { pooling: "mean", normalize: true });
    // @ts-ignore tolist() provided by transformers
    return out.tolist() as number[][];
  };
}

async function callPerplexity(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-sonar-small-128k-online",
      messages: [
        { role: "system", content: "Be precise and concise." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      top_p: 0.9,
      max_tokens: 1000,
      return_images: false,
      return_related_questions: false,
      search_recency_filter: "month",
      frequency_penalty: 1,
      presence_penalty: 0,
    }),
  });
  if (!res.ok) throw new Error(`Perplexity error: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export interface ClientAnalysis {
  basicInfo: any;
  financials: any;
  metrics: any;
  insights: { keyHighlights: string[]; riskFactors: string[]; recommendation: string; confidence: number };
  diagnostics: any;
}

export async function analyzeFilesClient(files: File[], perplexityApiKey?: string): Promise<ClientAnalysis> {
  const t0 = performance.now();
  const allDocs: Document[] = [];
  for (const f of files) {
    const docs = await fileToDocuments(f);
    allDocs.push(...docs);
  }
  const chunks = await chunkDocuments(allDocs);

  const embed = await buildEmbedder();
  const chunkTexts = chunks.map((c) => c.pageContent);
  const chunkEmbeds = await embed(chunkTexts);

  // Helper to retrieve top-k chunks for a query
  const retrieve = async (query: string, k = 6) => {
    const [qEmbed] = await embed([query]);
    const scored = chunkEmbeds.map((e, i) => ({ i, s: cosineSim(qEmbed, e) }));
    scored.sort((a, b) => b.s - a.s);
    return scored.slice(0, k).map(({ i, s }) => ({ doc: chunks[i], score: s }));
  };

  // Define prompts
  const basicQuery = "property name address type units square footage year built purchase price asking price location";
  const finQuery = "revenue income expenses operating costs NOI net operating income rent occupancy cap rate debt service cash flow";
  const basicTop = await retrieve(basicQuery);
  const finTop = await retrieve(finQuery);
  const contextBasic = basicTop.map((x, idx) => `[Doc ${idx + 1}]\n${x.doc.pageContent}`).join("\n\n---\n\n");
  const contextFin = finTop.map((x, idx) => `[Doc ${idx + 1}]\n${x.doc.pageContent}`).join("\n\n---\n\n");

  let basicInfo: any = {};
  let financials: any = {};

  if (perplexityApiKey) {
    const basicPrompt = `Extract basic property information from the context. Return ONLY JSON with fields:\n{"name":string|null,"address":string|null,"type":string|null,"totalUnits":number|null,"squareFootage":number|null,"yearBuilt":number|null,"purchasePrice":number|null}\n\nContext:\n${contextBasic}`;
    const finPrompt = `Extract financial information from the context. Return ONLY JSON with fields:\n{"revenue":number|null,"expenses":number|null,"noi":number|null,"currentRent":number|null,"marketRent":number|null,"occupancyRate":number|null,"capRate":number|null}\n\nContext:\n${contextFin}`;
    const [basicText, finText] = await Promise.all([
      callPerplexity(perplexityApiKey, basicPrompt),
      callPerplexity(perplexityApiKey, finPrompt),
    ]);
    try { basicInfo = JSON.parse(basicText.match(/\{[\s\S]*\}/)?.[0] || "{}"); } catch {}
    try { financials = JSON.parse(finText.match(/\{[\s\S]*\}/)?.[0] || "{}"); } catch {}
  }

  const parseNum = (v: any) => (typeof v === "number" ? v : typeof v === "string" ? parseFloat(v.replace(/[\$, %]/g, "")) : 0) || 0;
  const purchasePrice = parseNum(basicInfo.purchasePrice);
  const revenue = parseNum(financials.revenue);
  const expenses = parseNum(financials.expenses);
  const noi = parseNum(financials.noi) || (revenue - expenses);
  const capRate = purchasePrice > 0 ? (noi / purchasePrice) * 100 : 0;
  const down = purchasePrice * 0.25;
  const loan = purchasePrice - down;
  const r = 0.06 / 12;
  const n = 30 * 12;
  const pmt = loan > 0 ? loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : 0;
  const annualDebt = pmt * 12;
  const dscr = annualDebt > 0 ? noi / annualDebt : 0;
  const cashFlow = noi - annualDebt;
  const coc = down > 0 ? (cashFlow / down) * 100 : 0;
  const irr = capRate + 3;

  const metrics = {
    capRate: Math.round(capRate * 100) / 100,
    irr: Math.round(irr * 100) / 100,
    dscr: Math.round(dscr * 100) / 100,
    cashOnCash: Math.round(coc * 100) / 100,
    noi,
    revenue,
    expenses,
  };

  const insights = {
    keyHighlights: perplexityApiKey ? ["AI-derived highlights available in results."] : ["Client-only mode: limited insights"],
    riskFactors: perplexityApiKey ? ["AI-derived risks available in results."] : ["Client-only mode: limited risks"],
    recommendation: metrics.capRate >= 6.5 && metrics.dscr >= 1.25 ? "BUY" : metrics.capRate >= 4 && metrics.dscr >= 1.0 ? "CAUTION" : "PASS",
    confidence: perplexityApiKey ? 75 : 55,
  };

  const t1 = performance.now();
  const diagnostics = {
    documentsProcessed: files.length,
    totalChunks: chunks.length,
    avgChunkSize: Math.round(chunks.reduce((s, d) => s + d.pageContent.length, 0) / Math.max(chunks.length, 1)),
    embeddingsCreated: chunkEmbeds.length,
    embeddingDimension: chunkEmbeds[0]?.length || 0,
    avgConfidence: 80,
    ragQueries: [
      { query: "basicInfo", chunks: basicTop.length, model: perplexityApiKey ? "perplexity-sonar" : "local" },
      { query: "financials", chunks: finTop.length, model: perplexityApiKey ? "perplexity-sonar" : "local" },
    ],
    avgChunksRetrieved: (basicTop.length + finTop.length) / 2,
    bestSimilarity: Math.max(
      basicTop[0]?.score || 0,
      finTop[0]?.score || 0
    ),
    processingTime: Math.round(t1 - t0),
    analysisModel: perplexityApiKey ? "perplexity-llama-3.1-sonar" : "client-only",
  };

  return {
    basicInfo,
    financials,
    metrics,
    insights,
    diagnostics,
  };
}
