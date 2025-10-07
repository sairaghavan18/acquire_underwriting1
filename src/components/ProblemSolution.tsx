import { Card, CardContent } from "@/components/ui/card";
import { Clock, AlertTriangle, DollarSign, BarChart3, CheckCircle, Zap } from "lucide-react";

export default function ProblemSolution() {
  const problems = [
    {
      icon: Clock,
      title: "Manual Analysis Takes Days",
      description: "Traditional underwriting requires hours of spreadsheet work, delaying deal closures and missing opportunities."
    },
    {
      icon: AlertTriangle,
      title: "Human Error Risk",
      description: "Manual calculations lead to costly mistakes in cap rates, IRR analysis, and cash flow projections."
    },
    {
      icon: DollarSign,
      title: "Missed Opportunities",
      description: "Slow analysis means competitors close deals first. Speed matters in competitive CRE markets."
    }
  ];

  const solutions = [
    {
      icon: Zap,
      title: "Instant AI Analysis",
      description: "Upload property documents and get complete underwriting analysis in under 2 minutes."
    },
    {
      icon: BarChart3,
      title: "99% Accurate Calculations",
      description: "AI-powered algorithms ensure precise cap rates, IRR, DSCR, and NOI calculations every time."
    },
    {
      icon: CheckCircle,
      title: "Clear Recommendations",
      description: "Get instant Buy/Pass/Caution recommendations with detailed reasoning and risk analysis."
    }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Problem Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            The CRE Analysis Problem
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Commercial real estate professionals waste countless hours on manual underwriting, 
            leading to delayed decisions and missed opportunities.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {problems.map((problem, index) => (
            <Card key={index} className="border-destructive/20 bg-destructive/5 hover:shadow-card transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <problem.icon className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">{problem.title}</h3>
                <p className="text-muted-foreground">{problem.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Solution Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Our AI-Powered Solution
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Acquire transforms your CRE workflow with intelligent automation that delivers 
            institutional-grade analysis in minutes, not days.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {solutions.map((solution, index) => (
            <Card key={index} className="border-success/20 bg-success/5 hover:shadow-premium transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <solution.icon className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">{solution.title}</h3>
                <p className="text-muted-foreground">{solution.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}