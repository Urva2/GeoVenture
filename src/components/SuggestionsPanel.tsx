import type { AnalysisResult } from "@/lib/analysis";

interface SuggestionsPanelProps {
  result: AnalysisResult;
  onJumpToLocation: (lat: number, lng: number) => void;
}

export default function SuggestionsPanel({ result, onJumpToLocation }: SuggestionsPanelProps) {
  const { bestBusiness, betterLocation, riskFlags } = result;

  return (
    <div className="bg-card rounded-xl border border-border p-6 card-hover animate-fade-up stagger-3">
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Intelligence Insights
        </p>
        <span className="text-[10px] font-semibold bg-primary/20 text-primary px-2 py-0.5 rounded-full">
          ✦ AI
        </span>
      </div>

      {/* Best Business */}
      <div className="mb-5">
        <p className="text-sm font-medium text-foreground mb-2">Best Business Type</p>
        <div className="bg-secondary rounded-lg px-3 py-2 text-sm text-foreground mb-2">
          {bestBusiness.icon} <span className="font-semibold">{bestBusiness.type}</span> is the best fit for this location
        </div>
        <ul className="space-y-1 ml-1">
          {bestBusiness.reasons.map((r, i) => (
            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span> {r}
            </li>
          ))}
        </ul>
      </div>

      {/* Better Location */}
      <div className="mb-5">
        <p className="text-sm font-medium text-foreground mb-2">Better Nearby Location</p>
        <div className="bg-secondary rounded-lg px-3 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-mono">
              📍 {betterLocation.lat.toFixed(4)}, {betterLocation.lng.toFixed(4)}
            </p>
            <p className="text-sm text-foreground mt-1">
              Predicted score: <span className="font-bold text-success">{betterLocation.score}</span>
            </p>
          </div>
          <button
            onClick={() => onJumpToLocation(betterLocation.lat, betterLocation.lng)}
            className="text-xs border border-primary/40 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors whitespace-nowrap"
          >
            📍 Jump to Better Location
          </button>
        </div>
      </div>

      {/* Risk Flags */}
      {riskFlags.length > 0 && (
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Risk Flags</p>
          <div className="space-y-2">
            {riskFlags.map((flag, i) => (
              <div key={i} className="bg-destructive/10 text-destructive text-xs px-3 py-2 rounded-lg">
                ⚠️ {flag}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
