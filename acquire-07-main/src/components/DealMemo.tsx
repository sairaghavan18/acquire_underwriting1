import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Building2,
  Calendar,
  MapPin
} from 'lucide-react'

interface DealMemoProps {
  propertyData: {
    name: string
    address: string
    type: string
    totalUnits: number
    squareFootage: number
    yearBuilt: number
    purchasePrice: number
    capRate: number
    irr: number
    dscr: number
    cashOnCash: number
    noi: number
    recommendation: string
    confidence: number
    revenue: number
    expenses: number
    keyHighlights: string[]
    riskFactors: string[]
  }
}

export default function DealMemo({ propertyData }: DealMemoProps) {
  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation.toLowerCase()) {
      case 'strong buy': return 'bg-success/10 text-success border-success/20'
      case 'buy': return 'bg-success/10 text-success border-success/20'
      case 'pass': return 'bg-destructive/10 text-destructive border-destructive/20'
      case 'caution': return 'bg-warning/10 text-warning border-warning/20'
      default: return 'bg-muted text-muted-foreground border-border'
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* Header */}
      <div className="border-b border-border p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Deal Memo</h1>
              <p className="text-muted-foreground">Investment Analysis Summary</p>
            </div>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="p-8">
        <h2 className="text-xl font-bold text-foreground mb-6">Executive Summary</h2>
        
        {/* Property Details & Key Metrics */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Property Details */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="w-5 h-5" />
                Property Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Property Name:</span>
                <span className="font-medium">{propertyData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Address:</span>
                <span className="font-medium">{propertyData.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">{propertyData.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Units:</span>
                <span className="font-medium">{propertyData.totalUnits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Square Footage:</span>
                <span className="font-medium">{propertyData.squareFootage.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Year Built:</span>
                <span className="font-medium">{propertyData.yearBuilt}</span>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="w-5 h-5" />
                Key Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Purchase Price:</span>
                <span className="font-medium">${propertyData.purchasePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cap Rate:</span>
                <span className="font-medium">{propertyData.capRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IRR:</span>
                <span className="font-medium">{propertyData.irr}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">DSCR:</span>
                <span className="font-medium">{propertyData.dscr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cash-on-Cash:</span>
                <span className="font-medium">{propertyData.cashOnCash}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">NOI:</span>
                <span className="font-medium">${propertyData.noi.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Investment Recommendation */}
        <Card className={`mb-8 border-2 ${getRecommendationColor(propertyData.recommendation)}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-success/20 text-success rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">
                    Investment Recommendation: {propertyData.recommendation.toUpperCase()}
                  </h3>
                  <p className="text-sm opacity-80">
                    Analysis Confidence: {propertyData.confidence}%
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-success">
                  ${propertyData.noi.toLocaleString()}
                </div>
                <div className="text-sm opacity-80">Net Operating Income</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-primary/5 p-4 rounded-lg text-center">
                <div className="text-sm text-muted-foreground mb-1">Revenue</div>
                <div className="text-2xl font-bold text-primary">
                  ${propertyData.revenue.toLocaleString()}
                </div>
              </div>
              <div className="bg-destructive/5 p-4 rounded-lg text-center">
                <div className="text-sm text-muted-foreground mb-1">Expenses</div>
                <div className="text-2xl font-bold text-destructive">
                  ${propertyData.expenses.toLocaleString()}
                </div>
              </div>
              <div className="bg-success/5 p-4 rounded-lg text-center">
                <div className="text-sm text-muted-foreground mb-1">Net Operating Income</div>
                <div className="text-2xl font-bold text-success">
                  ${propertyData.noi.toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Investment Highlights & Risk Considerations */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
                <CheckCircle className="w-5 h-5" />
                Key Investment Highlights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {propertyData.keyHighlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{highlight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-warning">
                <AlertTriangle className="w-5 h-5" />
                Risk Considerations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {propertyData.riskFactors.map((risk, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-warning rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{risk}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-border text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Generated on {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <div>RE Underwriting Platform</div>
        </div>
      </div>
    </div>
  )
}