import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BUSINESS_TYPES, generateAnalysis } from "@/lib/analysis";
import { Loader2, MapPin, Search, Check, BarChart4, Copy, CheckCircle2 } from "lucide-react";

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
    setTimeout(async () => {
      // Send the data request to backend in the background
      const url = `http://127.0.0.1:8000/api/analyze?lat=${clickedLocation[0]}&lng=${clickedLocation[1]}&business_type=${businessType}`;
      try {
        await fetch(url);
      } catch (err) {
        console.error("Backend request failed", err);
      }


      const r = generateAnalysis(clickedLocation[0], clickedLocation[1], businessType);
      navigate("/analysis", {
        state: {
          location: clickedLocation,
          businessType,
          analysis: r,
        },
      });

      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col justify-between overflow-y-auto bg-slate-50/30 p-6">
      {/* Controls */}
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm relative z-0 transition-all hover:shadow-md shrink-0">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6 tracking-tight">
          Location Analysis
        </h2>

        <div className="space-y-6 relative">
          {/* Step 1 */}
          <div className="relative z-10 group">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2 transition-colors">
              <span className="flex items-center justify-center w-[16px] h-[16px] rounded-full bg-primary/20 text-primary text-[9px] shrink-0">1</span>
              <span className={clickedLocation ? "text-foreground" : ""}>Select Location</span>
            </label>
            <div className="pl-[24px]">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  readOnly
                  value={clickedLocation ? `${clickedLocation[0].toFixed(4)}, ${clickedLocation[1].toFixed(4)}` : ""}
                  placeholder="Click on the map..."
                  className="w-full bg-secondary text-foreground text-sm pl-9 pr-3 py-3 rounded-xl border border-border outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground transition-all cursor-default"
                />
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 group">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2 transition-colors">
              <span className={`flex items-center justify-center w-[16px] h-[16px] rounded-full text-[9px] shrink-0 ${clickedLocation ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>2</span>
              <span className={clickedLocation ? "text-foreground" : ""}>Business Type</span>
            </label>
            <div className="relative group-hover:scale-[1.01] transition-transform duration-300 pl-[24px]">
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full bg-secondary text-foreground text-sm pl-3 pr-10 py-3 rounded-xl border border-border outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer transition-all"
              >
                {BUSINESS_TYPES.map((bt) => (
                  <option key={bt.value} value={bt.value}>
                    {bt.icon} {bt.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 group">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className={`flex items-center justify-center w-[16px] h-[16px] rounded-full text-[9px] shrink-0 ${clickedLocation ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>3</span>
              Generate Report
            </label>
            <div className="pl-[24px]">
              <button
                onClick={handleAnalyze}
                disabled={!clickedLocation || isLoading}
                className="w-full bg-gradient-to-r from-primary to-blue-600 text-primary-foreground font-semibold text-sm py-3.5 rounded-xl hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:hover:shadow-none disabled:hover:translate-y-0 disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing Details...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Analyze Location
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Card */}
      {!isLoading && (
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <BarChart4 size={20} className="text-blue-500" />
            </div>
            <h3 className="font-bold text-base text-foreground">What you'll get</h3>
          </div>
          <ul className="space-y-4 pb-2">
            {[
              "Comprehensive Location Score",
              "Regulatory & Risk Analysis",
              "Local Competition Insights",
              "AI Business Recommendations"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground font-semibold">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
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
