import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Zap, Shield } from "lucide-react";
import { Link } from "react-router-dom";
export default function Hero() {
  return <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      <div className="absolute inset-0 opacity-30" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
    }}></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-primary-foreground">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-full px-6 py-2 mb-8">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">AI-Powered CRE Underwriting</span>
          </div>

          <h1 className="font-playfair text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in-up">
            Institutional-Grade
            <span className="block text-primary-foreground/70">CRE Underwriting</span>
          </h1>

          <p className="text-xl md:text-2xl text-primary-foreground/80 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in-up">Advanced AI-powered analysis platform delivering comprehensive market intelligence, sophisticated financial modeling, and institutional-quality due diligence for commercial real estate investments.</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button variant="cta" size="xl" className="min-w-48" asChild>
              <Link to="/auth">
                Request Access
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" className="min-w-48 bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              Schedule Demo
            </Button>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 text-primary-foreground/60">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm">Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm">Institutional Quality</span>
            </div>
            <div className="text-sm">Professional CRE Platform</div>
          </div>
        </div>
      </div>

      <div className="absolute top-1/4 left-10 w-20 h-20 bg-accent/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-primary-foreground/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
    </section>;
}