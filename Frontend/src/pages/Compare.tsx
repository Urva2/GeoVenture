import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend, Cell
} from "recharts";
import {
  ArrowLeft, Users, Car, Building2, Waves, Route,
  Check, Plus, ArrowLeftRight, Crown,
  Zap, TrendingUp
} from "lucide-react";
import { type AnalysisResult, generateAnalysis, BUSINESS_TYPES } from "@/lib/analysis";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ScoreGradient = ({ score, children }: { score: number, children: React.ReactNode }) => {
  const gradientClass = score >= 70 
    ? "from-orange-400 to-orange-600" 
    : score >= 40 
      ? "from-amber-400 to-amber-600" 
      : "from-rose-400 to-rose-600";
  return (
    <span className={cn("bg-clip-text text-transparent bg-gradient-to-br font-black", gradientClass)}>
      {children}
    </span>
  );
};

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`animate-pulse bg-muted rounded-md ${className}`} {...props} />;
}

const InsightCard = ({
  title,
  description,
  metrics,
  colorClass,
  icon: Icon
}: {
  title: string;
  description: string;
  metrics: string[];
  colorClass: string;
  icon: any;
}) => (
  <div className="bg-white/70 backdrop-blur-md rounded-xl border border-gray-200/60 p-4 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-300 flex flex-col h-full group">
    <div className="flex items-center gap-2.5 mb-2">
      <div className={cn("p-2 rounded-lg transition-colors", colorClass)}>
        <Icon className="w-5 h-5" />
      </div>
      <h4 className="font-extrabold text-sm text-slate-800 tracking-wide uppercase">{title}</h4>
    </div>
    <p className="text-xs text-slate-500 mb-3 ml-0.5 font-medium leading-relaxed">{description}</p>
    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 mt-auto">
      {metrics.length > 0 ? metrics.map((m, i) => (
        <Badge
          key={i}
          variant="secondary"
          className="px-3.5 py-1.5 bg-gray-200/60 text-slate-600 border-none rounded-full text-xs font-bold uppercase tracking-wider transition-all hover:bg-gray-300 cursor-default"
        >
          {m}
        </Badge>
      )) : (
        <p className="text-xs text-slate-400 italic font-medium py-1">No specific advantages identified yet.</p>
      )}
    </div>
  </div>
);

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

  const businessLabel = BUSINESS_TYPES.find(b => b.value === state.businessType)?.label || state.businessType;
  const locALabel = state ? `${state.locationA[0].toFixed(2)}, ${state.locationA[1].toFixed(2)}` : "";
  const locBLabel = state ? `${state.locationB[0].toFixed(2)}, ${state.locationB[1].toFixed(2)}` : "";

  const chartData = useMemo(() => {
    if (!analysisA || !analysisB) return [];
    return analysisA.factors.map((fA, i) => {
      const fB = analysisB.factors[i];
      const effA = fA.inverted ? 100 - fA.value : fA.value;
      const effB = fB.inverted ? 100 - fB.value : fB.value;
      const label = fA.label.replace(" Access", "").replace(" Index", "");
      return {
        name: label,
        "Location A": effA,
        "Location B": effB,
      };
    });
  }, [analysisA, analysisB]);

  const insights = useMemo(() => {
    if (!analysisA || !analysisB || chartData.length === 0) return { aWins: [], bWins: [], winner: "" };
    const aWins: string[] = [];
    const bWins: string[] = [];
    chartData.forEach((d: any) => {
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
    if (score >= 70) return "bg-white border-emerald-100 ring-1 ring-emerald-50";
    if (score >= 40) return "bg-white border-amber-100 ring-1 ring-amber-50";
    return "bg-white border-rose-100 ring-1 ring-rose-50";
  };

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

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col selection:bg-blue-500/20 overflow-hidden">
      {/* Header */}
      <header className="h-14 shrink-0 bg-white flex items-center px-6 border-b border-gray-200 shadow-sm z-[100]">
        <button
          onClick={() => navigate("/")}
          className="mr-4 w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-all active:scale-90 group"
        >
          <ArrowLeft size={16} className="text-foreground group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <ArrowLeftRight size={16} className="text-white" />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="font-black text-lg tracking-tight leading-none mb-0.5 text-foreground">
              Comparison
            </h1>
            <p className="text-[9px] uppercase font-bold tracking-[0.1em] text-muted-foreground flex items-center gap-1">
              <Zap size={8} className="text-blue-500" />
              {businessLabel}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col min-h-0 overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-4 h-full flex flex-col w-full min-h-0">

          {/* Top Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0 h-[40%]">
            {/* Location A Card */}
            <div className={`relative rounded-xl border p-4 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-300 ${isLoading ? 'bg-white border-gray-200' : getScoreBg(analysisA?.score || 0)
              } ${!isLoading && insights.winner === 'A' ? 'ring-2 ring-emerald-400/30' : ''}`}>
              {!isLoading && insights.winner === 'A' && (
                <div className="absolute -top-2.5 left-6 bg-green-100 text-green-700 text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-2 shadow-sm ring-1 ring-green-300">
                  <Crown className="w-3 h-3" /> Best Pick
                </div>
              )}
              <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-2">
                <div>
                  <p className="text-sm font-black text-slate-800 uppercase tracking-widest leading-none">Location A</p>
                  <p className="text-xs text-slate-400 font-mono mt-1.5">{locALabel}</p>
                </div>
              </div>
              {isLoading ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <Skeleton className="w-20 h-4" />
                </div>
              ) : (
                <div className="flex items-center gap-6 mt-2 h-[calc(100%-4rem)]">
                  <div className="flex flex-col items-center justify-center text-center min-w-[80px]">
                    <ScoreGradient score={analysisA!.score}>
                      <span className="text-5xl tracking-tighter">{analysisA!.score}</span>
                    </ScoreGradient>
                    <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest leading-none opacity-60">/ 100</span>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-3 pl-6 border-l border-slate-100">
                    {analysisA!.factors.map((f, i) => {
                      const eff = f.inverted ? 100 - f.value : f.value;
                      return (
                        <div key={i} className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-xs font-bold text-slate-500 truncate uppercase tracking-tight">{f.label.replace(" Access", "").replace(" Index", "")}</span>
                            <span className="text-[11px] font-black text-slate-700 tabular-nums shrink-0">{eff}</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden w-full">
                            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-1000 ease-out" style={{ width: `${eff}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Location B Card */}
            <div className={`relative rounded-xl border p-4 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-300 ${isLoading ? 'bg-white border-gray-200' : getScoreBg(analysisB?.score || 0)
              } ${!isLoading && insights.winner === 'B' ? 'ring-2 ring-emerald-400/30' : ''}`}>
              {!isLoading && insights.winner === 'B' && (
                <div className="absolute -top-2.5 left-6 bg-green-100 text-green-700 text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-2 shadow-sm ring-1 ring-green-300">
                  <Crown className="w-3 h-3" /> Best Pick
                </div>
              )}
              <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-2">
                <div>
                  <p className="text-sm font-black text-slate-800 uppercase tracking-widest leading-none">Location B</p>
                  <p className="text-xs text-slate-400 font-mono mt-1.5">{locBLabel}</p>
                </div>
              </div>
              {isLoading ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <Skeleton className="w-20 h-4" />
                </div>
              ) : (
                <div className="flex items-center gap-6 mt-2 h-[calc(100%-4rem)]">
                  <div className="flex flex-col items-center justify-center text-center min-w-[80px]">
                    <ScoreGradient score={analysisB!.score}>
                      <span className="text-5xl tracking-tighter">{analysisB!.score}</span>
                    </ScoreGradient>
                    <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest leading-none opacity-60">/ 100</span>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-3 pl-6 border-l border-slate-100">
                    {analysisB!.factors.map((f, i) => {
                      const eff = f.inverted ? 100 - f.value : f.value;
                      return (
                        <div key={i} className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-xs font-bold text-slate-500 truncate uppercase tracking-tight">{f.label.replace(" Access", "").replace(" Index", "")}</span>
                            <span className="text-[11px] font-black text-slate-700 tabular-nums shrink-0">{eff}</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden w-full">
                            <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-1000 ease-out" style={{ width: `${eff}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Analytics Grid: Chart + Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[60%] min-h-0">
            {/* Chart Column (70%) */}
            <div className="lg:col-span-2 bg-white/70 backdrop-blur-md rounded-xl border border-gray-200/60 shadow-sm flex flex-col min-h-0">
              <div className="px-5 py-2.5 border-b border-gray-200/60 shrink-0">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.12em]">Metric Performance</h3>
              </div>

              <div className="flex-1 p-3 pb-0 overflow-hidden min-h-0">
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }} barSize={36} barGap={6} barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/10" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 700 }}
                        interval={0}
                        dy={8}
                      />
                      <YAxis
                        domain={[0, 100]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 600 }}
                      />
                      <RechartsTooltip
                        cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-popover shadow-xl rounded-xl p-3 border border-border animate-in zoom-in-95 duration-200">
                                <p className="font-black text-[9px] uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
                                <div className="space-y-1.5">
                                  {payload.map((p: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between gap-4">
                                      <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
                                        <span className="text-[9px] font-bold text-foreground">{p.name}</span>
                                      </div>
                                      <span className="font-black text-[10px]" style={{ color: p.fill }}>
                                        {p.value}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ paddingBottom: 10, fontSize: 8, fontWeight: 800, textTransform: 'uppercase' }}
                      />
                      <Bar name="A" dataKey="Location A" fill="#3b82f6" radius={[4, 4, 0, 0]} animationDuration={1000} animationEasing="ease-out">
                        {chartData.map((_entry, index) => (
                          <Cell key={`cell-a-${index}`} className="hover:opacity-80 transition-opacity cursor-pointer duration-300" />
                        ))}
                      </Bar>
                      <Bar name="B" dataKey="Location B" fill="#8b5cf6" radius={[4, 4, 0, 0]} animationDuration={1000} animationEasing="ease-out" animationBegin={200}>
                        {chartData.map((_entry, index) => (
                          <Cell key={`cell-b-${index}`} className="hover:opacity-80 transition-opacity cursor-pointer duration-300" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Insights Column (30%) */}
            <div className="flex flex-col gap-3 shrink-0">
               <InsightCard 
                  title="Location A Wins" 
                  description="Metrics where Location A outperforms in competitiveness and accessibility."
                  metrics={insights.aWins} 
                  colorClass="bg-blue-50 text-blue-600"
                  icon={TrendingUp}
               />
               <InsightCard 
                  title="Location B Wins" 
                  description="Metrics where Location B shows superior performance and potential."
                  metrics={insights.bWins} 
                  colorClass="bg-purple-50 text-purple-600"
                  icon={TrendingUp}
               />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

interface CompareState {
  locationA: [number, number];
  locationB: [number, number];
  businessType: string;
}
