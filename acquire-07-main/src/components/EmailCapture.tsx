import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

export default function EmailCapture() {
  const [email, setEmail] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to email automation/CRM
    console.log("Email submitted:", email);
    setEmail("");
  };

  return (
    <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Experience Institutional-Grade CRE Intelligence
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Join the exclusive community of sophisticated commercial real estate professionals leveraging advanced AI-powered analysis.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-8">
            <Input 
              type="email" 
              placeholder="Enter your professional email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              className="flex-1 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 focus:border-accent" 
            />
            <Button type="submit" variant="secondary" size="lg">
              Request Consultation
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>

          <p className="text-sm text-primary-foreground/70 mt-4">
            Professional consultation and platform demonstrations available upon request.
          </p>
        </div>
      </div>
    </section>
  );
}