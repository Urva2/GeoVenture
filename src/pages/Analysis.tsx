import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AnalysisHeader from "@/components/AnalysisHeader";
import ModernLocationAnalytics from "@/components/ModernLocationAnalytics";
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
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background animate-in fade-in duration-500">
      {/* Header */}
      <div className="h-16 shrink-0 border-b border-border">
        <AnalysisHeader location={location} />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0 gap-4 p-4 overflow-hidden">
        {/* Left Panel - Modern Dashboard (45%) */}
        <div className="w-[45%] flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1">
          <ModernLocationAnalytics analysisResult={analysis} />
        </div>

        {/* Right Panel - Map (55%) and Business Comparison */}
        <div className="w-[55%] flex flex-col gap-4 min-h-0">
          {/* Map */}
          <div className="flex-[3] min-h-0">
            <AnalysisMap location={location} businessType={businessType} />
          </div>

          {/* Business Comparison */}
          <div className="flex-[2] min-h-0">
            <BusinessComparison 
              searchedBusinessValue={businessType} 
              searchedScore={analysis.score} 
              location={location} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
