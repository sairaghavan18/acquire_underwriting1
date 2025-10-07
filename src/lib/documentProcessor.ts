// Document processing utilities for real estate analysis

import path from 'path'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { OpenAIEmbeddings } from '@langchain/openai'
import { FaissStore } from '@langchain/community/vectorstores/faiss'
import { ChatOpenAI } from '@langchain/openai'
import { RetrievalQAChain } from 'langchain/chains'
import * as XLSX from 'xlsx'
import { extractPropertyData } from './propertyAnalyzer'
import { performFinancialCalculations } from './financialCalculations'
import { generateInsights } from './insightsGenerator'

export async function processDocuments(files: any) {
  const documents = []
  
  // Step 1: Load documents
  for (const [key, fileArray] of Object.entries(files)) {
    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray
    const filePath = file.filepath
    const originalName = file.originalFilename
    
    const extension = path.extname(originalName).toLowerCase()
    
    switch (extension) {
      case '.pdf':
        const pdfLoader = new PDFLoader(filePath)
        const pdfDocs = await pdfLoader.load()
        documents.push(...pdfDocs)
        break
        
      case '.csv':
        const csvLoader = new CSVLoader(filePath)
        const csvDocs = await csvLoader.load()
        documents.push(...csvDocs)
        break
        
      case '.xlsx':
      case '.xls':
        const workbook = XLSX.readFile(filePath)
        const textContent = convertExcelToText(workbook)
        documents.push({
          pageContent: textContent,
          metadata: { source: originalName, type: 'excel' }
        })
        break
    }
  }

  // Step 2: Split documents
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  })
  
  const splitDocs = await textSplitter.splitDocuments(documents)

  // Step 3: Create embeddings and vector store
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  })
  
  const vectorStore = await FaissStore.fromDocuments(splitDocs, embeddings)

  // Step 4: Set up AI model
  const model = new ChatOpenAI({
    temperature: 0,
    modelName: 'gpt-4',
    openAIApiKey: process.env.OPENAI_API_KEY,
  })

  // Use vector store retriever for LangChain compatibility
  const retriever = vectorStore.asRetriever(4)
  
  const chain = RetrievalQAChain.fromLLM(model, retriever)

  // Step 5: Extract property data
  const propertyAnalysis = await extractPropertyData(chain)
  
  // Step 6: Calculate financial metrics
  const calculatedMetrics = performFinancialCalculations(propertyAnalysis)
  
  // Step 7: Generate insights and recommendations
  const insights = await generateInsights(chain, calculatedMetrics)
  
  return {
    ...propertyAnalysis,
    ...calculatedMetrics,
    ...insights,
    processedAt: new Date().toISOString()
  }
}

function convertExcelToText(workbook: XLSX.WorkBook): string {
  let text = ''
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName]
    const csv = XLSX.utils.sheet_to_csv(sheet)
    text += `Sheet: ${sheetName}\n${csv}\n\n`
  })
  return text
}
