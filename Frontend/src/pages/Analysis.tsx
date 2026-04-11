import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AnalysisHeader from "@/components/AnalysisHeader";
import ModernLocationAnalytics from "@/components/ModernLocationAnalytics";
import BusinessComparison from "@/components/BusinessComparison";
import AnalysisMap from "@/components/AnalysisMap";
import { type AnalysisResult, generateAnalysis } from "@/lib/analysis";

interface AnalysisLocationState {
  location: [number, number];
  businessType: string;
  analysis?: AnalysisResult;
}

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`animate-pulse bg-muted rounded-md ${className}`} {...props} />;
}

export default function Analysis() {
  const routeLocation = useLocation();
  const navigate = useNavigate();
  const state = routeLocation.state as AnalysisLocationState | null;

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(state?.analysis || null);
  const [isLoading, setIsLoading] = useState(!state?.analysis);

  useEffect(() => {
    if (!state || !state.location || !state.businessType) return;
    
    // If analysis was already passed, don't refetch
    if (state.analysis) {
      setAnalysis(state.analysis);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // Simulate network delay and fetch data
    const fetchData = async () => {
      const { location, businessType } = state;
      setIsLoading(true);
      
      try {
        const url = `http://127.0.0.1:8000/api/analyze?lat=${location[0]}&lng=${location[1]}&business_type=${businessType}`;
        // We let this run in the background just like before
        await fetch(url).catch(err => console.error("Backend fetch error:", err));
      } catch (err) {
        console.error(err);
      }
      
      // Simulate crunching data for UI effect
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (isMounted) {
        const newAnalysis = generateAnalysis(location[0], location[1], businessType);
        setAnalysis(newAnalysis);
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [state]);

  // Validate that we have the required data outline
  if (!state || !state.location) {
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

  const { location, businessType } = state;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="h-16 shrink-0 border-b border-border">
        <AnalysisHeader location={location} />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0 gap-4 p-4 overflow-hidden">
        {/* Left Panel - Modern Dashboard (45%) */}
        <div className="w-[45%] flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1 relative">
          {isLoading || !analysis ? (
             <div className="flex flex-col gap-4 absolute inset-0 pr-1 transition-opacity duration-500 opacity-100">
               <div className="bg-card rounded-2xl border border-border p-6 h-[220px] flex flex-col items-center justify-center gap-4">
                 <Skeleton className="w-[120px] h-[120px] rounded-full" />
                 <Skeleton className="w-1/3 h-5" />
               </div>
               <div className="bg-card rounded-2xl border border-border p-6 flex-1 min-h-[300px]">
                 <Skeleton className="w-1/2 h-6 mb-8" />
                 <div className="space-y-4">
                   {[1, 2, 3, 4].map(i => (
                     <Skeleton key={i} className="w-full h-[60px] rounded-xl" />
                   ))}
                 </div>
               </div>
             </div>
          ) : (
             <ModernLocationAnalytics analysisResult={analysis} />
          )}
        </div>

        {/* Right Panel - Map (55%) and Business Comparison */}
        <div className="w-[55%] flex flex-col gap-4 min-h-0">
          {/* Map */}
          <div className="flex-[3] min-h-0">
            <AnalysisMap location={location} businessType={businessType} />
          </div>

          {/* Business Comparison */}
          <div className="flex-[2] min-h-0 relative">
            {isLoading || !analysis ? (
              <div className="bg-card absolute inset-0 rounded-2xl border border-border p-6 flex flex-col transition-opacity duration-500 opacity-100">
                 <Skeleton className="w-[200px] h-6 mb-8" />
                 <div className="flex-1 flex items-end gap-4 overflow-hidden pt-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                       <Skeleton key={i} className="flex-1 rounded-t-xl" style={{ height: `${Math.floor(Math.random() * 60 + 20)}%` }} />
                    ))}
                 </div>
              </div>
            ) : (
              <BusinessComparison 
                searchedBusinessValue={businessType} 
                searchedScore={analysis.score} 
                location={location} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
