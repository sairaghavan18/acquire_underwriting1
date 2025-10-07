import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star, Shield, Headphones } from "lucide-react";

export default function Pricing() {

  const handleSubscribe = async (planType: 'individual' | 'team') => {
    const emailSubject = planType === 'individual' ? 
      'Request Access - Individual Broker License' : 
      'Schedule Consultation - Team Package';
    
    const emailBody = planType === 'individual' ? 
      'Hi Kaleb,\n\nI would like to request access to the Individual Broker License plan ($300/month).\n\nPlease reach out to discuss next steps.\n\nThank you!' :
      'Hi Kaleb,\n\nI would like to schedule a consultation for the Team Package plan ($1,500/month).\n\nPlease reach out to schedule a meeting.\n\nThank you!';
    
    const mailtoLink = `mailto:kaleb@acquireunderwriting.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
  };

  const handleDiscussRequirements = () => {
    const emailSubject = 'Discuss Requirements - Bespoke Solution';
    const emailBody = 'Hi Kaleb,\n\nI would like to discuss requirements for a bespoke solution for our investment firm.\n\nPlease reach out to schedule a consultation.\n\nThank you!';
    
    const mailtoLink = `mailto:kaleb@acquireunderwriting.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
  };

  return (
    <section className="py-24 bg-gradient-to-b from-background to-accent/5">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Institutional-Grade CRE Intelligence
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional-grade analysis platform designed for sophisticated commercial real estate professionals and investment firms
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Individual Broker License */}
          <Card className="relative border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5 text-primary" />
                <CardTitle className="text-2xl">Individual Broker License</CardTitle>
              </div>
              <div className="mb-4">
                <span className="text-4xl font-bold text-primary">$300</span>
                <span className="text-muted-foreground">/month per user</span>
              </div>
              <p className="text-muted-foreground">
                Designed for independent professionals and boutique firms
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Comprehensive market intelligence</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Advanced AI-powered underwriting</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Live market data integration</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Professional deal analysis</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Dedicated client support</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Flexible engagement terms</span>
                </li>
              </ul>
              
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => handleSubscribe('individual')}
              >
                Request Access
              </Button>
              
              <p className="text-xs text-muted-foreground text-center mt-3">
                Professional consultation included
              </p>
            </CardContent>
          </Card>

          {/* Team Package */}
          <Card className="relative border-2 border-primary bg-primary/5 hover:border-primary transition-colors">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-2xl">Team Package</CardTitle>
              </div>
              <div className="mb-4">
                <span className="text-4xl font-bold text-primary">$1,500</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground">
                Enterprise solution for investment firms and institutional clients
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span><strong>Up to 5 users included</strong></span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Full platform capabilities</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Multi-user collaboration suite</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Executive analytics dashboard</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Institutional reporting & API access</span>
                </li>
                <li className="flex items-center gap-3">
                  <Headphones className="h-5 w-5 text-primary flex-shrink-0" />
                  <span><strong>Dedicated relationship manager</strong></span>
                </li>
              </ul>
              
              <Button 
                className="w-full bg-primary hover:bg-primary/90" 
                size="lg"
                onClick={() => handleSubscribe('team')}
              >
                Schedule Consultation
              </Button>
              
              <p className="text-xs text-muted-foreground text-center mt-3">
                Custom enterprise solutions available
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Trust & Security Section */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-5 w-5" />
              <span className="text-sm">Enterprise-grade security</span>
            </div>
            <div className="text-muted-foreground">
              <span className="text-sm">Institutional compliance</span>
            </div>
            <div className="text-muted-foreground">
              <span className="text-sm">Professional grade infrastructure</span>
            </div>
          </div>
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            Require a bespoke solution for your investment firm?
          </p>
          <Button variant="outline" size="lg" onClick={handleDiscussRequirements}>
            Discuss Requirements
          </Button>
        </div>
      </div>
    </section>
  );
}