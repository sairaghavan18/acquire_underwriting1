// Financial calculation utilities for real estate analysis


export function performFinancialCalculations(propertyData: any) {
  const basicInfo = propertyData.basicInfo || {}
  const financials = propertyData.financials || {}
  
  // Extract and clean numerical values
  const purchasePrice = parseNumeric(basicInfo.purchasePrice) || 0
  const noi = parseNumeric(financials.noi) || 0
  const revenue = parseNumeric(financials.revenue) || 0
  const expenses = parseNumeric(financials.expenses) || 0
  
  // Calculate NOI if not provided
  const calculatedNOI = noi || (revenue - expenses)
  
  // Calculate Cap Rate
  const capRate = purchasePrice > 0 ? (calculatedNOI / purchasePrice) * 100 : 0
  
  // Estimate financing metrics (using typical assumptions)
  const downPaymentPercent = 0.25 // 25%
  const loanRate = 0.06 // 6%
  const loanTerm = 30 // 30 years
  
  const downPayment = purchasePrice * downPaymentPercent
  const loanAmount = purchasePrice - downPayment
  
  // Monthly payment calculation
  const monthlyRate = loanRate / 12
  const numPayments = loanTerm * 12
  const monthlyPayment = loanAmount > 0 ? 
    loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
    (Math.pow(1 + monthlyRate, numPayments) - 1) : 0
    
  const annualDebtService = monthlyPayment * 12
  
  // Calculate key metrics
  const dscr = annualDebtService > 0 ? calculatedNOI / annualDebtService : 0
  const cashFlow = calculatedNOI - annualDebtService
  const cashOnCash = downPayment > 0 ? (cashFlow / downPayment) * 100 : 0
  
  // Simple IRR estimation
  const irr = capRate + 3 // Basic estimation
  
  return {
    capRate: Math.round(capRate * 100) / 100,
    irr: Math.round(irr * 100) / 100,
    dscr: Math.round(dscr * 100) / 100,
    cashOnCash: Math.round(cashOnCash * 100) / 100,
    noi: calculatedNOI,
    revenue: revenue || 0,
    expenses: expenses || 0
  }
}

function parseNumeric(value: any): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    // Remove commas, dollar signs, etc.
    const cleaned = value.replace(/[\$,]/g, '')
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}
