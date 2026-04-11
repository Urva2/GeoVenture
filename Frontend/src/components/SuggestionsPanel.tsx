import { Lightbulb, MapPin, AlertTriangle, TrendingUp } from "lucide-react";
import type { AnalysisResult } from "@/lib/analysis";

interface SuggestionsPanelProps {
  result: AnalysisResult;
  onJumpToLocation: (lat: number, lng: number) => void;
}

export default function SuggestionsPanel({ result, onJumpToLocation }: SuggestionsPanelProps) {
  const { bestBusiness, betterLocation, riskFlags } = result;

  return (
    <div className="space-y-3 animate-fade-up stagger-3">
      {/* Best Business */}
      <div className="bg-card rounded-xl border border-border p-5 card-hover shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Best Suitable Business</p>
            <p className="text-xs text-muted-foreground">AI recommendation</p>
          </div>
        </div>
        <div className="bg-primary/5 border border-primary/10 rounded-lg px-3 py-2.5 text-sm text-foreground mb-3">
          {bestBusiness.icon} <span className="font-semibold">{bestBusiness.type}</span>
        </div>
        <ul className="space-y-1.5">
          {bestBusiness.reasons.map((r, i) => (
            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
              <TrendingUp className="w-3 h-3 text-success mt-0.5 shrink-0" /> {r}
            </li>
          ))}
        </ul>
      </div>

      {/* Better Location */}
      <div className="bg-card rounded-xl border border-border p-5 card-hover shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-success" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Better Nearby Location</p>
            <p className="text-xs text-muted-foreground">Higher scoring alternative</p>
          </div>
        </div>
        <div className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2.5">
          <div>
            <p className="text-xs text-muted-foreground font-mono">
              {betterLocation.lat.toFixed(4)}, {betterLocation.lng.toFixed(4)}
            </p>
            <p className="text-sm text-foreground mt-0.5">
              Score: <span className="font-bold text-success">{betterLocation.score}/100</span>
            </p>
          </div>
          <button
            onClick={() => onJumpToLocation(betterLocation.lat, betterLocation.lng)}
            className="text-xs font-medium bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            Jump to Location
          </button>
        </div>
      </div>

      {/* Risk Flags */}
      {riskFlags.length > 0 && (
        <div className="bg-card rounded-xl border border-destructive/20 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-destructive" />
            </div>
            <p className="text-sm font-semibold text-foreground">Risk Flags</p>
          </div>
          <div className="space-y-2">
            {riskFlags.map((flag, i) => (
              <div key={i} className="bg-destructive/5 border border-destructive/10 text-destructive text-xs px-3 py-2 rounded-lg font-medium">
                ⚠️ {flag}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
