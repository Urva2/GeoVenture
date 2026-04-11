import { useState } from "react";
import { BUSINESS_TYPES, generateAnalysis, type AnalysisResult } from "@/lib/analysis";
import ScoreCard from "./ScoreCard";
import FactorBreakdown from "./FactorBreakdown";
import SuggestionsPanel from "./SuggestionsPanel";
import MiniDashboard from "./MiniDashboard";
import { Loader2, MapPin, Search } from "lucide-react";

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
      {/* Controls */}
      <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-3">
          Location Analysis
        </p>
        <div className="relative mb-3">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            readOnly
            value={clickedLocation ? `${clickedLocation[0].toFixed(4)}, ${clickedLocation[1].toFixed(4)}` : ""}
            placeholder="Select a location on the map..."
            className="w-full bg-secondary text-foreground text-sm pl-9 pr-3 py-2.5 rounded-lg border border-border outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Business Type</label>
        <select
          value={businessType}
          onChange={(e) => setBusinessType(e.target.value)}
          className="w-full bg-secondary text-foreground text-sm px-3 py-2.5 rounded-lg border border-border outline-none focus:ring-2 focus:ring-ring mb-4 appearance-none cursor-pointer"
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
          className="w-full bg-primary text-primary-foreground font-semibold text-sm py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2 shadow-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Analyze Location
            </>
          )}
        </button>
      </div>

      {/* Empty State */}
      {!result && !isLoading && (
        <div className="flex flex-col items-center justify-center text-center py-16 opacity-60">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <p className="text-foreground font-semibold">Click on the map to begin</p>
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
          <MiniDashboard result={result} />
          <SuggestionsPanel result={result} onJumpToLocation={onJumpToLocation} />
        </>
      )}
    </div>
  );
}
