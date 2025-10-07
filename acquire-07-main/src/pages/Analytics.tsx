import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, TrendingUp, PieChart, Calendar, Filter, LogOut, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export default function Analytics() {
  const [userEmail, setUserEmail] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated')
    const email = localStorage.getItem('userEmail')
    
    if (!isAuth) {
      navigate('/auth')
      return
    }
    
    setUserEmail(email || 'user@example.com')
  }, [navigate])

  const handleSignOut = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userEmail')
    navigate('/')
  }

  const analyticsCards = [
    { 
      title: "Total Portfolio Value", 
      value: "$124.5M", 
      change: "+15.2%", 
      trend: "up",
      period: "vs last quarter"
    },
    { 
      title: "Average Cap Rate", 
      value: "5.8%", 
      change: "+0.3%", 
      trend: "up",
      period: "vs last month"
    }, 
    { 
      title: "Occupancy Rate", 
      value: "94.2%", 
      change: "-1.1%", 
      trend: "down",
      period: "vs last month"
    },
    { 
      title: "Monthly NOI", 
      value: "$2.4M", 
      change: "+18.7%", 
      trend: "up",
      period: "vs last month"
    }
  ]

  const propertyPerformance = [
    { 
      property: "Manhattan Office Tower", 
      capRate: "5.8%", 
      occupancy: "96%", 
      noi: "$450K", 
      status: "Excellent",
      trend: "up",
      change: "+12.5%" 
    },
    { 
      property: "Brooklyn Retail Complex", 
      capRate: "4.2%", 
      occupancy: "89%", 
      noi: "$180K", 
      status: "Good",
      trend: "up",
      change: "+8.2%" 
    },
    { 
      property: "Queens Industrial Warehouse", 
      capRate: "6.1%", 
      occupancy: "100%", 
      noi: "$320K", 
      status: "Excellent",
      trend: "up",
      change: "+15.1%" 
    },
    { 
      property: "Bronx Mixed-Use Development", 
      capRate: "5.3%", 
      occupancy: "92%", 
      noi: "$240K", 
      status: "Good",
      trend: "down",
      change: "-2.3%" 
    },
    { 
      property: "Staten Island Retail Strip", 
      capRate: "4.8%", 
      occupancy: "87%", 
      noi: "$160K", 
      status: "Fair",
      trend: "up",
      change: "+5.7%" 
    }
  ]

  const marketInsights = [
    { 
      category: "Office", 
      avgCapRate: "5.2%", 
      marketTrend: "Softening", 
      outlook: "Cautious",
      color: "warning"
    },
    { 
      category: "Retail", 
      avgCapRate: "6.1%", 
      marketTrend: "Stable", 
      outlook: "Positive",
      color: "success"
    },
    { 
      category: "Industrial", 
      avgCapRate: "4.8%", 
      marketTrend: "Strong", 
      outlook: "Bullish",
      color: "success"
    },
    { 
      category: "Mixed-Use", 
      avgCapRate: "5.5%", 
      marketTrend: "Growing", 
      outlook: "Positive",
      color: "success"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard">← Back to Dashboard</Link>
              </Button>
              <div className="flex items-center gap-2">
                <img 
                  src="/lovable-uploads/32801df0-3105-4879-afde-7c180138cc4a.png" 
                  alt="Acquire logo" 
                  className="h-8 w-auto object-contain" 
                  loading="lazy" 
                />
                <span className="text-xl font-bold text-foreground">Analytics</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Welcome, {userEmail}</span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Analytics Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Portfolio Analytics</h1>
            <p className="text-muted-foreground">Comprehensive view of your real estate investments</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Last 30 Days
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {analyticsCards.map((metric, index) => (
            <Card key={index} className="hover:shadow-card transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{metric.title}</span>
                  {metric.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4 text-success" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-destructive" />
                  )}
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                  <div className={`text-sm font-medium flex items-center gap-1 ${
                    metric.trend === 'up' ? 'text-success' : 'text-destructive'
                  }`}>
                    {metric.change} {metric.period}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Revenue Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Revenue trending upward</p>
                  <p className="text-sm text-muted-foreground">18% growth this quarter</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-accent" />
                Property Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="text-center">
                  <PieChart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Diversified portfolio</p>
                  <p className="text-sm text-muted-foreground">5 property types</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Insights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Market Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {marketInsights.map((insight, index) => (
                <div key={index} className="p-4 border border-border rounded-lg">
                  <div className="font-semibold text-foreground mb-2">{insight.category}</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Cap Rate:</span>
                      <span className="font-medium">{insight.avgCapRate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trend:</span>
                      <span className="font-medium">{insight.marketTrend}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Outlook:</span>
                      <span className={`font-medium ${
                        insight.color === 'success' ? 'text-success' : 
                        insight.color === 'warning' ? 'text-warning' : 'text-muted-foreground'
                      }`}>
                        {insight.outlook}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Property Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Property Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {propertyPerformance.map((property, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{property.property}</h4>
                    <p className="text-sm text-muted-foreground">Monthly NOI: {property.noi}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Cap Rate</div>
                      <div className="font-semibold">{property.capRate}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Occupancy</div>
                      <div className="font-semibold">{property.occupancy}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Change</div>
                      <div className={`font-semibold flex items-center gap-1 ${
                        property.trend === 'up' ? 'text-success' : 'text-destructive'
                      }`}>
                        {property.trend === 'up' ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {property.change}
                      </div>
                    </div>
                    <div className={`text-sm font-semibold px-3 py-1 rounded-full ${
                      property.status === 'Excellent' ? 'bg-success/10 text-success' :
                      property.status === 'Good' ? 'bg-primary/10 text-primary' :
                      'bg-warning/10 text-warning'
                    }`}>
                      {property.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}