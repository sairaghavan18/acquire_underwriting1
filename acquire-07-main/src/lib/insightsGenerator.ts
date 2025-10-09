// AI-powered insights generation for real estate analysis
import { RetrievalQAChain } from 'langchain/chains'

export async function generateInsights(chain: RetrievalQAChain, metrics: any) {
  const insightPrompts = [
    {
      key: 'keyHighlights',
      query: `Based on the property documents, identify 4 key positive highlights about this investment opportunity. Focus on:
      - Cash flow potential
      - Market position  
      - Growth opportunities
      - Competitive advantages
      
      Return as an array of strings, each highlight as a concise bullet point.`
    },
    {
      key: 'riskFactors', 
      query: `Identify 3-4 main risk factors or concerns about this property investment from the documents. Consider:
      - Lease rollover risks
      - Maintenance issues
      - Market risks
      - Operational challenges
      
      Return as an array of strings, each risk as a concise statement.`
    }
  ]

  const insights = {}
  
  for (const prompt of insightPrompts) {
    try {
      const response = await chain.call({ query: prompt.query })
      
      // Try to extract array-like content
      const lines = response.text
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^[-*•]\s*/, '').trim())
        .filter(line => line.length > 10) // Filter out short lines
        .slice(0, 4) // Limit to 4 items
      
      insights[prompt.key] = lines
    } catch (error) {
      console.error(`Error generating ${prompt.key}:`, error)
      insights[prompt.key] = []
    }
  }

  // Generate recommendation based on metrics
  const recommendation = generateRecommendation(metrics)
  
  return {
    ...insights,
    ...recommendation
  }
}

function generateRecommendation(metrics: any) {
  let score = 0
  
  // Cap Rate scoring
  if (metrics.capRate >= 7) score += 30
  else if (metrics.capRate >= 5) score += 20
  else if (metrics.capRate >= 3) score += 10
  
  // DSCR scoring
  if (metrics.dscr >= 1.3) score += 25
  else if (metrics.dscr >= 1.2) score += 15
  else if (metrics.dscr >= 1.0) score += 5
  
  // Cash-on-Cash scoring
  if (metrics.cashOnCash >= 8) score += 25
  else if (metrics.cashOnCash >= 5) score += 15
  else if (metrics.cashOnCash >= 2) score += 5
  
  // IRR scoring
  if (metrics.irr >= 12) score += 20
  else if (metrics.irr >= 8) score += 10
  else if (metrics.irr >= 5) score += 5
  
  const confidence = Math.min(score + 20, 95) // Base confidence + score
  
  let recommendation = "PASS"
  if (score >= 70) recommendation = "STRONG BUY"
  else if (score >= 50) recommendation = "BUY" 
  else if (score >= 30) recommendation = "CAUTION"
  
  return { recommendation, confidence }
}
