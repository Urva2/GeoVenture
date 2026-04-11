import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Cell, Legend
} from "recharts";
import {
  ArrowLeft, Trophy, TrendingUp, TrendingDown, CheckCircle2,
  AlertTriangle, Crown, ArrowLeftRight, Zap
} from "lucide-react";
import { type AnalysisResult, generateAnalysis, BUSINESS_TYPES } from "@/lib/analysis";

interface CompareState {
  locationA: [number, number];
  locationB: [number, number];
  businessType: string;
}

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`animate-pulse bg-muted rounded-md ${className}`} {...props} />;
}

export default function Compare() {
  const routeLocation = useLocation();
  const navigate = useNavigate();
  const state = routeLocation.state as CompareState | null;

  const [analysisA, setAnalysisA] = useState<AnalysisResult | null>(null);
  const [analysisB, setAnalysisB] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!state) return;

    const fetchBoth = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));

      const a = generateAnalysis(state.locationA[0], state.locationA[1], state.businessType);
      const b = generateAnalysis(state.locationB[0], state.locationB[1], state.businessType);
      setAnalysisA(a);
      setAnalysisB(b);
      setIsLoading(false);
    };

    fetchBoth();
  }, [state]);

  if (!state) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-foreground mb-4">No comparison data available</p>
          <button onClick={() => navigate("/")} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90">
            Go back
          </button>
        </div>
      </div>
    );
  }

  const businessLabel = BUSINESS_TYPES.find(b => b.value === state.businessType)?.label || state.businessType;
  const locALabel = `${state.locationA[0].toFixed(4)}, ${state.locationA[1].toFixed(4)}`;
  const locBLabel = `${state.locationB[0].toFixed(4)}, ${state.locationB[1].toFixed(4)}`;

  // Build comparison chart data
  const chartData = useMemo(() => {
    if (!analysisA || !analysisB) return [];
    return analysisA.factors.map((fA, i) => {
      const fB = analysisB.factors[i];
      const effA = fA.inverted ? 100 - fA.value : fA.value;
      const effB = fB.inverted ? 100 - fB.value : fB.value;
      return {
        name: fA.label.replace(" Access", "").replace(" Index", ""),
        "Location A": effA,
        "Location B": effB,
      };
    });
  }, [analysisA, analysisB]);

  // Summary insights
  const insights = useMemo(() => {
    if (!analysisA || !analysisB || chartData.length === 0) return { aWins: [], bWins: [], winner: "" };
    const aWins: string[] = [];
    const bWins: string[] = [];
    chartData.forEach(d => {
      if (d["Location A"] > d["Location B"]) aWins.push(d.name);
      else if (d["Location B"] > d["Location A"]) bWins.push(d.name);
    });
    const winner = analysisA.score > analysisB.score ? "A" : analysisA.score < analysisB.score ? "B" : "Tie";
    return { aWins, bWins, winner };
  }, [analysisA, analysisB, chartData]);

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-600";
    if (score >= 40) return "text-amber-500";
    return "text-rose-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50";
    if (score >= 40) return "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50";
    return "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50";
  };

  // Custom tooltip for the grouped bar chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover backdrop-blur-md border border-border shadow-xl rounded-xl p-3 min-w-[180px]">
          <p className="font-bold text-sm text-foreground mb-2">{label}</p>
          {payload.map((p: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-4 text-sm">
              <span className="font-medium text-muted-foreground">{p.name}</span>
              <span className="font-black" style={{ color: p.fill }}>{p.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen w-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-16 shrink-0 bg-card flex items-center px-6 border-b border-border z-50 shadow-sm">
        <button onClick={() => navigate("/")} className="mr-4 p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-sm shrink-0">
            <ArrowLeftRight size={16} className="text-white" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="font-extrabold text-lg tracking-tight leading-none mb-0.5 text-foreground">
              Location Comparison
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
              {businessLabel}
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Score Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location A Card */}
            <div className={`relative rounded-2xl border p-6 shadow-sm transition-all ${
              isLoading ? 'bg-card border-border' : getScoreBg(analysisA?.score || 0)
            } ${!isLoading && insights.winner === 'A' ? 'ring-2 ring-emerald-500/30' : ''}`}>
              {!isLoading && insights.winner === 'A' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                  <Crown size={12} /> Best Pick
                </div>
              )}
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Location A</p>
              <p className="text-xs text-muted-foreground font-mono mb-4">{locALabel}</p>
              {isLoading ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <Skeleton className="w-20 h-20 rounded-full" />
                  <Skeleton className="w-24 h-5" />
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center">
                    <span className={`text-5xl font-black leading-none ${getScoreColor(analysisA!.score)}`}>{analysisA!.score}</span>
                    <span className="text-xs text-muted-foreground font-semibold mt-1">/ 100</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    {analysisA!.factors.map((f, i) => {
                      const eff = f.inverted ? 100 - f.value : f.value;
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-foreground/70 w-28 truncate">{f.label.replace(" Access", "").replace(" Index", "")}</span>
                          <div className="flex-1 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600" style={{ width: `${eff}%` }} />
                          </div>
                          <span className="text-[11px] font-bold text-foreground/70 w-6 text-right">{eff}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Location B Card */}
            <div className={`relative rounded-2xl border p-6 shadow-sm transition-all ${
              isLoading ? 'bg-card border-border' : getScoreBg(analysisB?.score || 0)
            } ${!isLoading && insights.winner === 'B' ? 'ring-2 ring-emerald-500/30' : ''}`}>
              {!isLoading && insights.winner === 'B' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                  <Crown size={12} /> Best Pick
                </div>
              )}
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Location B</p>
              <p className="text-xs text-muted-foreground font-mono mb-4">{locBLabel}</p>
              {isLoading ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <Skeleton className="w-20 h-20 rounded-full" />
                  <Skeleton className="w-24 h-5" />
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center">
                    <span className={`text-5xl font-black leading-none ${getScoreColor(analysisB!.score)}`}>{analysisB!.score}</span>
                    <span className="text-xs text-muted-foreground font-semibold mt-1">/ 100</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    {analysisB!.factors.map((f, i) => {
                      const eff = f.inverted ? 100 - f.value : f.value;
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-foreground/70 w-28 truncate">{f.label.replace(" Access", "").replace(" Index", "")}</span>
                          <div className="flex-1 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-purple-600" style={{ width: `${eff}%` }} />
                          </div>
                          <span className="text-[11px] font-bold text-foreground/70 w-6 text-right">{eff}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comparative Bar Chart */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8">
            <h3 className="text-lg font-bold text-foreground mb-1">Metric Comparison</h3>
            <p className="text-sm text-muted-foreground mb-6">Side-by-side performance across all viability factors</p>

            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Skeleton className="w-full h-full rounded-xl" />
              </div>
            ) : (
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="currentColor" className="text-border/40" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: 'currentColor' }} className="text-muted-foreground" tickCount={5} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={130}
                      tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 600 }}
                      className="text-foreground/80"
                      axisLine={false}
                      tickLine={false}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: '12px', fontWeight: 700 }}
                      iconType="circle"
                      iconSize={8}
                    />
                    <Bar dataKey="Location A" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={14} animationDuration={1000} />
                    <Bar dataKey="Location B" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={14} animationDuration={1200} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Insights Row */}
          {!isLoading && analysisA && analysisB && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Location A Advantages */}
              <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={18} className="text-blue-500" />
                  <h4 className="font-bold text-sm text-foreground">Location A excels in</h4>
                </div>
                {insights.aWins.length > 0 ? (
                  <ul className="space-y-2.5">
                    {insights.aWins.map((metric, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm">
                        <CheckCircle2 size={15} className="text-blue-500 shrink-0" />
                        <span className="font-semibold text-foreground/80">{metric}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No clear advantages over Location B.</p>
                )}
              </div>

              {/* Location B Advantages */}
              <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={18} className="text-violet-500" />
                  <h4 className="font-bold text-sm text-foreground">Location B excels in</h4>
                </div>
                {insights.bWins.length > 0 ? (
                  <ul className="space-y-2.5">
                    {insights.bWins.map((metric, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm">
                        <CheckCircle2 size={15} className="text-violet-500 shrink-0" />
                        <span className="font-semibold text-foreground/80">{metric}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No clear advantages over Location A.</p>
                )}
              </div>
            </div>
          )}

          {/* Final Recommendation */}
          {!isLoading && analysisA && analysisB && (
            <div className="bg-gradient-to-r from-violet-500/5 to-blue-500/5 rounded-2xl border border-violet-200/50 dark:border-violet-900/30 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
                  <Zap size={20} className="text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Final Recommendation</h3>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {insights.winner === "A" && (
                  <>
                    <span className="font-black text-blue-600">Location A</span> is the stronger choice for a <span className="font-bold">{businessLabel}</span> with
                    an overall suitability score of <span className="font-black">{analysisA.score}/100</span> vs <span className="font-black">{analysisB.score}/100</span>.
                    {insights.aWins.length > 0 && ` It particularly excels in ${insights.aWins.join(", ")}.`}
                    {insights.bWins.length > 0 && ` However, Location B has an edge in ${insights.bWins.join(", ")}, which may matter depending on your priorities.`}
                  </>
                )}
                {insights.winner === "B" && (
                  <>
                    <span className="font-black text-violet-600">Location B</span> is the stronger choice for a <span className="font-bold">{businessLabel}</span> with
                    an overall suitability score of <span className="font-black">{analysisB.score}/100</span> vs <span className="font-black">{analysisA.score}/100</span>.
                    {insights.bWins.length > 0 && ` It particularly excels in ${insights.bWins.join(", ")}.`}
                    {insights.aWins.length > 0 && ` However, Location A has an edge in ${insights.aWins.join(", ")}, which may matter depending on your priorities.`}
                  </>
                )}
                {insights.winner === "Tie" && (
                  <>
                    Both locations scored equally at <span className="font-black">{analysisA.score}/100</span> for a <span className="font-bold">{businessLabel}</span>.
                    The decision should be based on which individual metrics matter more for your specific use case.
                    {insights.aWins.length > 0 && ` Location A leads in ${insights.aWins.join(", ")}`}
                    {insights.bWins.length > 0 && `, while Location B leads in ${insights.bWins.join(", ")}.`}
                  </>
                )}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
