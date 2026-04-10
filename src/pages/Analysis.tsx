import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AnalysisHeader from "@/components/AnalysisHeader";
import AnalysisSummary from "@/components/AnalysisSummary";
import TopFactors from "@/components/TopFactors";
import BusinessComparison from "@/components/BusinessComparison";
import AnalysisMap from "@/components/AnalysisMap";
import { type AnalysisResult } from "@/lib/analysis";

interface AnalysisLocationState {
  location: [number, number];
  businessType: string;
  analysis: AnalysisResult;
}

export default function Analysis() {
  const routeLocation = useLocation();
  const navigate = useNavigate();
  const state = routeLocation.state as AnalysisLocationState | null;

  // Validate that we have the required data
  if (!state || !state.location || !state.analysis) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-foreground mb-4">No analysis data available</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const { location, businessType, analysis } = state;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="h-16 shrink-0 border-b border-border">
        <AnalysisHeader location={location} />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0 gap-4 p-4">
        {/* Left Panel - Summary + Top Factors (35%) */}
        <div className="w-[35%] flex flex-col gap-4 min-h-0">
          <AnalysisSummary businessType={businessType} score={analysis.score} />
          
          <div className="flex-1 min-h-0">
            <TopFactors factors={analysis.factors} businessType={businessType} />
          </div>
        </div>

        {/* Right Panel - Map (40%) and Business Comparison (25%) */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Map */}
          <div className="flex-1 min-h-0">
            <AnalysisMap location={location} businessType={businessType} />
          </div>

          {/* Business Comparison */}
          <div className="flex-1 min-h-0">
            <BusinessComparison />
          </div>
        </div>
      </div>
    </div>
  );
}
