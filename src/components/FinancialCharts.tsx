import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, ResponsiveContainer } from 'recharts';
interface FinancialChartsProps {
  data: {
    financialOverview: Array<{
      category: string;
      amount: number;
      color: string;
    }>;
    rentGapAnalysis: {
      currentRent: number;
      marketRent: number;
      upsidePotential: number;
    };
    projectionData: Array<{
      year: string;
      revenue: number;
      expenses: number;
      noi: number;
    }>;
  };
}
export default function FinancialCharts({
  data
}: FinancialChartsProps) {
  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--primary))"
    },
    expenses: {
      label: "Expenses",
      color: "hsl(var(--destructive))"
    },
    noi: {
      label: "Net Operating Income",
      color: "hsl(var(--success))"
    }
  };
  return <div className="grid md:grid-cols-2 gap-8">
      {/* Financial Overview Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
        </CardHeader>
        <CardContent className="mx-0 px-0">
          <ChartContainer config={chartConfig} className="h-64">
            <BarChart data={data.financialOverview}>
              <XAxis dataKey="category" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Rent Gap Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Rent Gap Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-muted-foreground">Current Avg Rent/SF</div>
                <div className="text-2xl font-bold">${data.rentGapAnalysis.currentRent}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Market Rent/SF</div>
                <div className="text-2xl font-bold text-success">${data.rentGapAnalysis.marketRent}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Upside Potential</div>
                <div className="text-2xl font-bold text-primary">{data.rentGapAnalysis.upsidePotential}%</div>
              </div>
            </div>
            
            {/* Visual comparison bars */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-16 text-sm">Current</div>
                <div className="flex-1 bg-muted rounded-full h-8 relative overflow-hidden">
                  <div className="bg-foreground h-full rounded-full flex items-center justify-end pr-2" style={{
                  width: `${data.rentGapAnalysis.currentRent / data.rentGapAnalysis.marketRent * 100}%`
                }}>
                    <span className="text-white text-xs font-medium">${data.rentGapAnalysis.currentRent}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 text-sm">Market</div>
                <div className="flex-1 bg-muted rounded-full h-8 relative overflow-hidden">
                  <div className="bg-foreground h-full rounded-full flex items-center justify-end pr-2 w-full">
                    <span className="text-white text-xs font-medium">${data.rentGapAnalysis.marketRent}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5-Year Financial Projection */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>5-Year Financial Projection</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <LineChart data={data.projectionData}>
              <XAxis dataKey="year" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} dot={{
              fill: "hsl(var(--primary))",
              strokeWidth: 2,
              r: 4
            }} />
              <Line type="monotone" dataKey="expenses" stroke="hsl(var(--destructive))" strokeWidth={3} dot={{
              fill: "hsl(var(--destructive))",
              strokeWidth: 2,
              r: 4
            }} />
              <Line type="monotone" dataKey="noi" stroke="hsl(var(--success))" strokeWidth={3} dot={{
              fill: "hsl(var(--success))",
              strokeWidth: 2,
              r: 4
            }} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>;
}