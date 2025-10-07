import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download, FileText, Calendar, Search, Filter, LogOut, Eye, Star } from 'lucide-react'

export default function Reports() {
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

  const reports = [
    {
      id: 1,
      title: "Manhattan Office Tower - Investment Analysis",
      type: "Deal Memo",
      date: "2024-01-20",
      status: "Completed",
      pages: 28,
      recommendation: "Strong Buy",
      confidence: 92,
      value: "$45.2M"
    },
    {
      id: 2,
      title: "Brooklyn Retail Complex - Market Analysis",
      type: "Market Report",
      date: "2024-01-18",
      status: "Completed",
      pages: 22,
      recommendation: "Pass",
      confidence: 78,
      value: "$12.8M"
    },
    {
      id: 3,
      title: "Queens Industrial Warehouse - Due Diligence",
      type: "Due Diligence",
      date: "2024-01-15",
      status: "In Progress",
      pages: 35,
      recommendation: "Under Review",
      confidence: 85,
      value: "$23.5M"
    },
    {
      id: 4,
      title: "Bronx Mixed-Use Development - Financial Model",
      type: "Financial Analysis",
      date: "2024-01-12",
      status: "Completed",
      pages: 31,
      recommendation: "Buy",
      confidence: 68,
      value: "$18.9M"
    },
    {
      id: 5,
      title: "Staten Island Retail Strip - Portfolio Review",
      type: "Portfolio Report",
      date: "2024-01-10",
      status: "Completed",
      pages: 45,
      recommendation: "Hold",
      confidence: 75,
      value: "$8.2M"
    },
    {
      id: 6,
      title: "Long Island City Office - Acquisition Analysis",
      type: "Deal Memo",
      date: "2024-01-08",
      status: "Completed",
      pages: 26,
      recommendation: "Strong Buy",
      confidence: 89,
      value: "$32.1M"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-success/10 text-success'
      case 'In Progress': return 'bg-warning/10 text-warning'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation.toLowerCase()) {
      case 'strong buy':
      case 'buy': return 'bg-success/10 text-success'
      case 'pass': return 'bg-destructive/10 text-destructive'
      case 'hold': return 'bg-accent/10 text-accent'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const summaryStats = {
    totalReports: reports.length,
    completed: reports.filter(r => r.status === 'Completed').length,
    inProgress: reports.filter(r => r.status === 'In Progress').length,
    totalPages: reports.reduce((sum, r) => sum + r.pages, 0)
  }

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
                <span className="text-xl font-bold text-foreground">Reports</span>
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
        {/* Reports Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Investment Reports</h1>
            <p className="text-muted-foreground">Professional deal memos and analysis reports</p>
          </div>
          <Button variant="default">
            <FileText className="w-4 h-4 mr-2" />
            Generate New Report
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search reports..." 
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Date Range
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-foreground mb-1">{summaryStats.totalReports}</div>
              <div className="text-sm text-muted-foreground">Total Reports</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-success mb-1">{summaryStats.completed}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-warning mb-1">{summaryStats.inProgress}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-accent mb-1">{summaryStats.totalPages}</div>
              <div className="text-sm text-muted-foreground">Pages Generated</div>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold text-foreground">{report.title}</h4>
                      {report.confidence && report.confidence > 85 && (
                        <Star className="w-4 h-4 text-warning fill-warning" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{report.type}</span>
                      <span>•</span>
                      <span>{report.date}</span>
                      <span>•</span>
                      <span>{report.pages} pages</span>
                      <span>•</span>
                      <span>{report.value}</span>
                      {report.confidence && (
                        <>
                          <span>•</span>
                          <span>{report.confidence}% confidence</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(report.status)}`}>
                      {report.status}
                    </div>
                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${getRecommendationColor(report.recommendation)}`}>
                      {report.recommendation}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="/analysis-results">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Bulk Export Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export All as ZIP
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Selected
              </Button>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Create Summary Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}