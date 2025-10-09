import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, BarChart, Download, Play } from "lucide-react";

export default function ProductDemo() {
  return (
    <section className="py-24 bg-gradient-premium">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            See Acquire in Action
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
            Watch how our AI transforms raw property documents into comprehensive investment analysis
          </p>
          <Button variant="cta" size="lg" className="mb-12">
            <Play className="w-5 h-5" />
            Watch 2-Minute Demo
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Step 1: Upload */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">1. Upload Documents</h3>
              <p className="text-white/70 mb-6">
                Drag and drop your offering memorandum, rent roll, or property financials. 
                Supports PDF, CSV, and Excel formats.
              </p>
              <div className="bg-white/5 border border-white/20 rounded-lg p-4 text-left">
                <div className="text-white/60 text-sm mb-2">Sample Files:</div>
                <div className="space-y-1">
                  <div className="text-white text-sm">📄 Property_OM.pdf</div>
                  <div className="text-white text-sm">📊 Rent_Roll.xlsx</div>
                  <div className="text-white text-sm">📈 Financials.csv</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: AI Analysis */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">2. AI Analysis</h3>
              <p className="text-white/70 mb-6">
                Our AI extracts key data points and runs comprehensive financial analysis 
                including cap rates, IRR, DSCR, and cash flow projections.
              </p>
              <div className="bg-white/5 border border-white/20 rounded-lg p-4 text-left">
                <div className="text-white/60 text-sm mb-2">Key Metrics:</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Cap Rate:</span>
                    <span className="text-financial-positive">5.8%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">IRR:</span>
                    <span className="text-financial-positive">16.4%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">DSCR:</span>
                    <span className="text-accent">1.7</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Export */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Download className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">3. Export Report</h3>
              <p className="text-white/70 mb-6">
                Get a professional investment memo with clear Buy/Pass/Caution recommendation 
                and detailed supporting analysis.
              </p>
              <div className="bg-white/5 border border-white/20 rounded-lg p-4 text-left">
                <div className="text-white/60 text-sm mb-2">Export Options:</div>
                <div className="space-y-1">
                  <div className="text-white text-sm">📋 Investment Memo PDF</div>
                  <div className="text-white text-sm">📊 Excel Analysis</div>
                  <div className="text-white text-sm">🎯 Executive Summary</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-primary">
            Try Sample Analysis
          </Button>
        </div>
      </div>
    </section>
  );
}