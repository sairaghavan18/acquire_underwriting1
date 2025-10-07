import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import TrustIndicators from "@/components/TrustIndicators";
import ProblemSolution from "@/components/ProblemSolution";
import ProductDemo from "@/components/ProductDemo";
import EmailCapture from "@/components/EmailCapture";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <TrustIndicators />
      <ProblemSolution />
      <ProductDemo />
      <EmailCapture />
      <Footer />
    </div>
  );
};

export default Index;
