import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, BarChart3, Download, LogOut, Plus, TrendingUp, Building2 } from 'lucide-react'
import { supabase } from '@/services/supabaseClient' // NEW

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true

    // Replace custom localStorage flag with Supabase session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      if (!session) {
        navigate('/auth', { replace: true })
      } else {
        setUserEmail(session.user.email ?? 'user@example.com')
      }
    })

    // Keep page in sync if session changes (sign-out, refresh)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/auth', { replace: true })
      } else {
        setUserEmail(session.user.email ?? 'user@example.com')
      }
    })

    return () => {
      mounted = false
      sub.subscription?.unsubscribe()
    }
  }, [navigate])

  const handleSignOut = async () => {
    await supabase.auth.signOut()  // clear Supabase session
    navigate('/')                  // go to landing page
  }

  const recentDeals = [
    { id: 1, property: "Manhattan Office Tower", date: "2024-01-20", status: "Strong Buy", capRate: "5.8%", value: "$45.2M", confidence: 92 },
    { id: 2, property: "Brooklyn Retail Complex", date: "2024-01-18", status: "Pass", capRate: "4.2%", value: "$12.8M", confidence: 78 },
    { id: 3, property: "Queens Industrial Warehouse", date: "2024-01-15", status: "Buy", capRate: "6.1%", value: "$23.5M", confidence: 85 },
    { id: 4, property: "Bronx Mixed-Use Development", date: "2024-01-12", status: "Caution", capRate: "5.3%", value: "$18.9M", confidence: 68 }
  ]

  const portfolioStats = {
    totalValue: "$124.5M",
    avgCapRate: "5.6%",
    totalDeals: 47,
    monthlyGrowth: "+12.4%"
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'strong buy':
      case 'buy': return 'text-success bg-success/10'
      case 'pass': return 'text-destructive bg-destructive/10'
      case 'caution': return 'text-warning bg-warning/10'
      default: return 'text-muted-foreground bg-muted'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="/lovable-uploads/32801df0-3105-4879-afde-7c180138cc4a.png"
                alt="Acquire logo"
                className="h-8 w-auto object-contain"
                loading="lazy"
              />
              <span className="text-xl font-bold">Dashboard</span>
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
        {/* Portfolio Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Building2 className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{portfolioStats.totalValue}</div>
              <div className="text-sm text-muted-foreground">Total Portfolio Value</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{portfolioStats.avgCapRate}</div>
              <div className="text-sm text-muted-foreground">Avg Cap Rate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-8 h-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{portfolioStats.totalDeals}</div>
              <div className="text-sm text-muted-foreground">Total Deals</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold text-success">{portfolioStats.monthlyGrowth}</div>
              <div className="text-sm text-muted-foreground">Monthly Growth</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-card transition-all duration-300 cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Upload Deal</h3>
              <p className="text-muted-foreground text-sm mb-4">Upload property documents for AI analysis</p>
              <Button variant="default" className="w-full" asChild>
                <Link to="/upload">
                  <Plus className="w-4 h-4 mr-2" />
                  New Analysis
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">View Analytics</h3>
              <p className="text-muted-foreground text-sm mb-4">Review your portfolio performance</p>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/analytics">Open Analytics</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Export Reports</h3>
              <p className="text-muted-foreground text-sm mb-4">Download professional deal memos</p>
              <Button variant="secondary" className="w-full" asChild>
                <Link to="/reports">View Reports</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Deals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Deal Analyses
              <Button variant="outline" size="sm">View All</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDeals.map((deal) => (
                <div key={deal.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{deal.property}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>{deal.date}</span>
                      <span>•</span>
                      <span>{deal.value}</span>
                      <span>•</span>
                      <span>{deal.confidence}% confidence</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">Cap Rate: {deal.capRate}</div>
                      <div className={`text-sm font-semibold px-2 py-1 rounded-full ${getStatusColor(deal.status)}`}>
                        {deal.status}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/analysis-results">View Details</Link>
                    </Button>
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
