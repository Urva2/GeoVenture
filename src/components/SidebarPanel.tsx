import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BUSINESS_TYPES, generateAnalysis } from "@/lib/analysis";
import { Loader2, MapPin, Search } from "lucide-react";

interface SidebarPanelProps {
  clickedLocation: [number, number] | null;
}

export default function SidebarPanel({ clickedLocation }: SidebarPanelProps) {
  const navigate = useNavigate();
  const [businessType, setBusinessType] = useState("cafe");
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = () => {
    if (!clickedLocation) return;
    setIsLoading(true);
    setTimeout(() => {
      const r = generateAnalysis(clickedLocation[0], clickedLocation[1], businessType);
      navigate("/analysis", {
        state: {
          location: clickedLocation,
          businessType,
          analysis: r,
        },
      });
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
      {!isLoading && (
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

      {/* Full Screen Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="w-20 h-20 bg-card border border-border shadow-2xl rounded-2xl flex items-center justify-center relative z-10">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Analyzing Location...</h2>
          <p className="text-sm text-muted-foreground max-w-sm text-center">
            Processing geospatial data and generating insights
          </p>
        </div>
      )}
    </div>
  );
}
