import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Upload, Brain, FileText, Shield, Clock, BarChart3, Users, Zap, Play } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Upload,
      title: "Seamless Document Upload",
      description: "Upload multiple file formats including PDFs, Word documents, Excel files, and more. Our platform handles large document volumes with enterprise-grade security.",
      benefits: ["Multi-format support", "Batch processing", "Secure encryption", "Progress tracking"]
    },
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms analyze documents for key insights, risk factors, financial metrics, and compliance issues with institutional accuracy.",
      benefits: ["Pattern recognition", "Risk assessment", "Financial modeling", "Compliance checking"]
    },
    {
      icon: FileText,
      title: "Comprehensive Reports",
      description: "Generate detailed, professional reports with executive summaries, detailed findings, and actionable recommendations tailored for investment committees.",
      benefits: ["Executive summaries", "Visual charts", "Risk matrices", "Action items"]
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption, SOC 2 compliance, and strict data governance ensure your sensitive financial information remains protected throughout the process.",
      benefits: ["End-to-end encryption", "SOC 2 Type II", "Data residency", "Access controls"]
    },
    {
      icon: Clock,
      title: "Rapid Turnaround",
      description: "Complete comprehensive due diligence analysis in hours, not weeks. Accelerate deal timelines while maintaining thoroughness and accuracy.",
      benefits: ["Real-time processing", "Parallel analysis", "Priority queuing", "24/7 availability"]
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Deep financial modeling, trend analysis, and predictive insights help identify opportunities and risks that traditional methods might miss.",
      benefits: ["Trend analysis", "Predictive modeling", "Comparative benchmarks", "Scenario planning"]
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-background via-background to-accent/5">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6" variant="outline">Platform Features</Badge>
            <h1 className="text-5xl font-bold text-foreground mb-6">
              Institutional-Grade
              <span className="text-primary"> Due Diligence</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Advanced AI technology meets rigorous financial analysis standards. 
              Discover how Acquire transforms traditional due diligence processes for sophisticated investors.
            </p>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              See Acquire in Action
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Watch how institutional investors leverage our platform for comprehensive due diligence analysis
            </p>
            
            {/* Demo Video Placeholder */}
            <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border-2 border-dashed border-primary/20 aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Play className="w-8 h-8 text-primary ml-1" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Demo Video Coming Soon</h3>
                <p className="text-muted-foreground mb-4">
                  An in-depth walkthrough of our platform capabilities
                </p>
                <Button variant="outline">
                  Request Private Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Comprehensive Feature Set
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every feature designed for institutional-grade due diligence processes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Capabilities */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Built for Institutional Standards
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
                <p className="text-muted-foreground">
                  Multi-user access with role-based permissions for investment teams
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">API Integration</h3>
                <p className="text-muted-foreground">
                  Seamless integration with existing workflow and data management systems
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Audit Trail</h3>
                <p className="text-muted-foreground">
                  Complete documentation and audit trails for regulatory compliance
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features;