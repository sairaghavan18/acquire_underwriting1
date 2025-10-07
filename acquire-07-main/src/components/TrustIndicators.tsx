import { Shield, Award, Lock, Globe } from "lucide-react";

export default function TrustIndicators() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Professional Standards
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Built to meet the demanding requirements of institutional commercial real estate professionals
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Enterprise Security</h3>
            <p className="text-sm text-muted-foreground">
              Advanced security protocols and data protection standards
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Professional Grade</h3>
            <p className="text-sm text-muted-foreground">
              Institutional-quality analysis and reporting capabilities
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Data Privacy</h3>
            <p className="text-sm text-muted-foreground">
              Strict confidentiality and proprietary information protection
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Global Markets</h3>
            <p className="text-sm text-muted-foreground">
              Comprehensive coverage of major commercial real estate markets
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}