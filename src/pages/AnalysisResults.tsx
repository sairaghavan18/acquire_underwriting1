import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, Line, ComposedChart
} from 'recharts'
import { Download, TrendingUp, CheckCircle, Building, DollarSign, AlertTriangle } from 'lucide-react'

type UnderwriteResult = {
  quick_summary?: Record<string, any>
  metrics?: Record<string, number | null>
  ai_summary?: string
  ai_analysis?: {
    investment_recommendation?: string
    key_investment_highlights?: string[] | null
    risk_considerations?: string[] | null
  }
  t12_summary?: Record<string, number | null>
  rent_roll_summary?: Record<string, number | null>
  narrative_fields?: Record<string, any>
}

export default function AnalysisResults(): JSX.Element {
  const memoRef = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()
  const [data, setData] = useState<UnderwriteResult | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('underwritingResult')
    if (!stored) return
    try {
      setData(JSON.parse(stored))
    } catch {
      setData(null)
    }
  }, [])

  const handleDownloadPDF = async () => {
    if (!memoRef.current) return
    if (typeof window === 'undefined') return
    const mod = await import('html2pdf.js/dist/html2pdf.min.js')
    const html2pdf = (mod as any).default || (mod as any)
    html2pdf()
      .from(memoRef.current)
      .set({
        margin: 10,
        filename: 'analysis.pdf',
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      })
      .save()
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">No analysis data found. Please upload files first.</p>
      </div>
    )
  }

  const quick = data.quick_summary || {}
  const metrics = data.metrics || {}
  const t12 = data.t12_summary || {}
  const aiSummary = data.ai_summary || ''
  const aiAnalysis = data.ai_analysis || {}
  const rentRoll = data.rent_roll_summary || {}
  const narrative = data.narrative_fields || {}
  const executive_summary = (data as any).executive_summary || ''

  const getRecommendationColor = (recommendation?: string) => {
    if (!recommendation) return 'bg-gray-500'
    const rec = recommendation.toLowerCase()
    if (rec.includes('strong buy') || rec.includes('buy')) return 'bg-green-500'
    if (rec.includes('hold')) return 'bg-yellow-500'
    if (rec.includes('pass') || rec.includes('avoid')) return 'bg-red-500'
    return 'bg-blue-500'
  }

  const financialMetricsData = [
    { name: 'Cap Rate', value: Number(metrics.cap_rate ?? 0) },
    { name: 'DSCR', value: Number(metrics.dscr ?? 0) },
    { name: 'CoC Return', value: Number(metrics.coc_return ?? 0) },
    { name: 'Break-even Occ.', value: Number(metrics.break_even_occupancy ?? 0) },
  ]

  const expenseData = [
    { name: 'Gross Potential Rent', value: Number(t12.gross_potential_rent ?? 0) },
    { name: 'Net Operating Income', value: Number(t12.net_operating_income ?? 0) },
    { name: 'Operating Expenses', value: Number(t12.operating_expenses ?? 0) },
  ]

  const rentGapData = [
    { name: 'Current', value: Number(metrics.current_rent_total), color: '#f87171' },
    { name: 'Market', value: Number(metrics.market_rent_total), color: '#34d399' },
  ]

  const baseRevenue = Number(t12.gross_potential_rent ?? 0)
  const baseExpenses = Number(t12.operating_expenses ?? 0)
  const baseNoi = Number(t12.net_operating_income ?? 0)
  const fiveYearProjection = Array.from({ length: 5 }).map((_, i) => {
    const year = i + 1
    const revenue = baseRevenue ? baseRevenue * Math.pow(1.05, i) : 0
    const expenses = baseExpenses ? baseExpenses * Math.pow(1.03, i) : 0
    const noi = baseNoi ? baseNoi * Math.pow(1.05, i) : Math.max(revenue - expenses, 0)
    return { year: `Year ${year}`, revenue, expenses, noi }
  })

  const COLORS = ['#6366f1', '#10b981', '#ef4444', '#f59e0b']

  const investmentRecommendation =
    quick['Investment Recommendation'] || aiAnalysis.investment_recommendation || 'N/A'
  const keyHighlights =
    (Array.isArray(quick['Key Investment Highlights']) && quick['Key Investment Highlights']) ||
    aiAnalysis.key_investment_highlights ||
    []
  const riskConsiderations =
    (Array.isArray(quick['Risk Considerations']) && quick['Risk Considerations']) ||
    aiAnalysis.risk_considerations ||
    []

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Button variant="default" className="absolute top-4 right-4 z-50" onClick={() => navigate('/dashboard')}>
        Back to Dashboard
      </Button>

      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Underwriting Analysis for {quick.property || narrative.property_name || 'N/A'}
      </h1>

      <ScrollArea className="space-y-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Purchase Price</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(narrative.purchase_price ?? 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Investment Recommendation</p>
                  <Badge className={`${getRecommendationColor(investmentRecommendation)} text-white`}>
                    {investmentRecommendation}
                  </Badge>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rent Gap %</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(Number((metrics as any).rent_gap_pct ?? 0)).toFixed(1)}%
                  </p>
                  <Progress value={Math.min(100, Math.max(0, Number((metrics as any).rent_gap_pct ?? 0)))} className="mt-2" />
                </div>
                <CheckCircle className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Net Operating Income</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${(Number(t12.net_operating_income ?? 0)).toLocaleString()}
                  </p>
                </div>
                <Building className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm shadow-md border border-gray-100">
            <CardHeader>
              <CardTitle className="text-gray-800">Financial Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={financialMetricsData}>
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                  <Bar dataKey="value" fill="rgba(59,130,246,0.6)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm shadow-md border border-gray-100">
            <CardHeader>
              <CardTitle className="text-gray-800">Operating Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={expenseData} dataKey="value" nameKey="name" outerRadius={90} label>
                    {expenseData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg rounded-2xl border border-gray-200 bg-white/70 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-gray-800">Rent Gap Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={rentGapData}>
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '12px' }} />
                  <Bar dataKey="value" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth={2} radius={[6, 6, 0, 0]}>
                    {rentGapData.map((d, i) => (
                      <Cell key={i} fill={d.color + '33'} stroke={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-2xl border border-gray-200 bg-white/70 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-gray-800">5-Year Financial Projection</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={fiveYearProjection}>
                  <XAxis dataKey="year" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '12px' }} />
                  <Legend />
                  <Bar dataKey="revenue" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth={2} radius={[6, 6, 0, 0]} name="Revenue" />
                  <Bar dataKey="expenses" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth={2} radius={[6, 6, 0, 0]} name="Expenses" />
                  <Line dataKey="noi" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} name="NOI" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="animate-fadeInUp">
          <CardHeader>
            <CardTitle>AI Underwriting Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>{aiSummary || 'No AI summary available.'}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="animate-fadeInUp">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Key Investment Highlights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(keyHighlights) && keyHighlights.length > 0 ? (
                <ul className="space-y-3">
                  {keyHighlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{h}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No highlights found.</p>
              )}
            </CardContent>
          </Card>

          <Card className="animate-fadeInUp">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Risk Considerations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(riskConsiderations) && riskConsiderations.length > 0 ? (
                <ul className="space-y-3">
                  {riskConsiderations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{r}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No risk items found.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card ref={memoRef} className="animate-fadeInUp">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Deal Memo - Investment Analysis Summary
              <Button onClick={handleDownloadPDF} variant="outline" size="sm" className="flex items-center gap-2">
                <Download className="w-4 h-4" /> Download PDF
              </Button>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Executive Summary</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  {executive_summary ||'Executive summary not available — based on extracted property and financial data.'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Property Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Property Name</p>
                  <p className="text-lg font-semibold">{quick.property_name || narrative.property_name || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Address</p>
                  <p className="text-lg font-semibold">{quick.property_address || narrative.property_address || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Type</p>
                  <p className="text-lg font-semibold">{narrative.property_type || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Total Units</p>
                  <p className="text-lg font-semibold">{quick.units || narrative.total_units || 0}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Square Footage</p>
                  <p className="text-lg font-semibold">{Number(quick.sqft || narrative.total_building_sqft || 0).toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Year Built</p>
                  <p className="text-lg font-semibold">{quick.year_built || narrative.year_built || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Financial Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-blue-600">Revenue (GPR)</p>
                  <p className="text-2xl font-bold text-blue-900">${Number(t12.gross_potential_rent || 0).toLocaleString()}</p>
                </div>
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-red-600">Expenses</p>
                  <p className="text-2xl font-bold text-red-900">${Number(t12.operating_expenses || 0).toLocaleString()}</p>
                </div>
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-green-600">NOI</p>
                  <p className="text-2xl font-bold text-green-900">${Number(t12.net_operating_income || 0).toLocaleString()}</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-purple-600">Cap Rate</p>
                  <p className="text-2xl font-bold text-purple-900">{Number(metrics.cap_rate || 0).toFixed(2)}%</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 text-center text-sm text-gray-500">
              <p>
                Generated on{' '}
                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="font-semibold">RE Underwriting Platform</p>
            </div>
          </CardContent>
        </Card>
      </ScrollArea>
    </div>
  )
}