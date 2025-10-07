// Property analysis utilities for commercial real estate
import { RetrievalQAChain } from 'langchain/chains'

export async function extractPropertyData(chain: RetrievalQAChain) {
  const extractionPrompts = [
    {
      key: 'basicInfo',
      query: `Extract basic property information and return as JSON:
      {
        "name": "property name or address",
        "address": "full property address", 
        "type": "property type (Office/Retail/Industrial/Multifamily/etc)",
        "totalUnits": number_of_units,
        "squareFootage": total_square_footage,
        "yearBuilt": year_built,
        "purchasePrice": purchase_or_asking_price
      }
      
      If any information is not available, use null for that field.`
    },
    {
      key: 'financials',
      query: `Extract financial information and return as JSON:
      {
        "revenue": annual_total_revenue,
        "expenses": annual_operating_expenses,
        "noi": net_operating_income,
        "currentRent": current_average_rent_per_unit_or_sqft,
        "marketRent": market_rate_rent_per_unit_or_sqft,
        "occupancyRate": current_occupancy_percentage,
        "capRate": cap_rate_if_mentioned
      }
      
      Extract numerical values only. Use null if not available.`
    }
  ]

  const results = {}
  
  for (const prompt of extractionPrompts) {
    try {
      const response = await chain.call({ query: prompt.query })
      
      // Try to parse JSON response
      try {
        const jsonMatch = response.text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          results[prompt.key] = JSON.parse(jsonMatch[0])
        } else {
          results[prompt.key] = response.text
        }
      } catch (parseError) {
        results[prompt.key] = response.text
      }
    } catch (error) {
      console.error(`Error extracting ${prompt.key}:`, error)
      results[prompt.key] = null
    }
  }

  return results
}
