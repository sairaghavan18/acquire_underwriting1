import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import FileUpload from "./pages/fileupload";
import AnalysisResults from "./pages/AnalysisResults";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import PricingPage from "./pages/Pricing";
import Features from "./pages/Features";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<FileUpload />} />
          <Route path="/analysis-results" element={<AnalysisResults />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/features" element={<Features />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
