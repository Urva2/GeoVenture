import { useState } from "react";
import { BUSINESS_TYPES, generateAnalysis, type AnalysisResult } from "@/lib/analysis";
import ScoreCard from "./ScoreCard";
import FactorBreakdown from "./FactorBreakdown";
import SuggestionsPanel from "./SuggestionsPanel";
import { Loader2, MapPin } from "lucide-react";

interface SidebarPanelProps {
  clickedLocation: [number, number] | null;
  onJumpToLocation: (lat: number, lng: number) => void;
}

export default function SidebarPanel({ clickedLocation, onJumpToLocation }: SidebarPanelProps) {
  const [businessType, setBusinessType] = useState("cafe");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = () => {
    if (!clickedLocation) return;
    setIsLoading(true);
    setResult(null);
    setTimeout(() => {
      const r = generateAnalysis(clickedLocation[0], clickedLocation[1], businessType);
      setResult(r);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="h-full overflow-y-auto bg-panel px-5 py-5 space-y-4">
      {/* Section 1 - Location & Business Selector */}
      <div className="bg-card rounded-xl border border-border p-5 card-hover">
        <input
          readOnly
          value={clickedLocation ? `${clickedLocation[0].toFixed(4)}, ${clickedLocation[1].toFixed(4)}` : ""}
          placeholder="Select a location on the map..."
          className="w-full bg-input text-foreground text-sm px-3 py-2.5 rounded-lg border border-border outline-none focus:ring-2 focus:ring-ring mb-3 placeholder:text-muted-foreground"
        />
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Business Type</label>
        <select
          value={businessType}
          onChange={(e) => setBusinessType(e.target.value)}
          className="w-full bg-input text-foreground text-sm px-3 py-2.5 rounded-lg border border-border outline-none focus:ring-2 focus:ring-ring mb-4 appearance-none cursor-pointer"
        >
          {BUSINESS_TYPES.map((bt) => (
            <option key={bt.value} value={bt.value}>
              {bt.icon} {bt.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleAnalyze}
          disabled={!clickedLocation || isLoading}
          className="w-full bg-primary text-primary-foreground font-semibold text-sm py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze Location"
          )}
        </button>
      </div>

      {/* Empty State */}
      {!result && !isLoading && (
        <div className="flex flex-col items-center justify-center text-center py-20 opacity-50">
          <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-foreground font-medium">Click on the map to begin analysis</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-[260px]">
            Select a location and business type to generate your site intelligence report
          </p>
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          <ScoreCard score={result.score} />
          <FactorBreakdown factors={result.factors} />
          <SuggestionsPanel result={result} onJumpToLocation={onJumpToLocation} />
        </>
      )}
    </div>
  );
}
