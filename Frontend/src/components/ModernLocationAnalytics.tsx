import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  Home, Navigation, Store, AlertTriangle, DollarSign,
  BarChart2, Focus, ChevronDown, ChevronUp, CheckCircle2, Info,
  Waves,
  Truck,
  Route,
  MapPin
} from 'lucide-react';

import { type AnalysisResult } from "@/lib/analysis";

// Types
export interface MetricData {
  name: string;
  value: number;
  icon: React.ElementType;
  description: string;
  inverted?: boolean;
}

// Dummy Data
const MOCK_METRICS: MetricData[] = [
  { name: 'Population Density', value: 85, icon: Home, description: 'High concentration of residential units within a 2km radius.' },
  { name: 'Road & Transit', value: 72, icon: Navigation, description: 'Good connectivity to major roads and public transport lines.' },
  { name: 'Purchasing Power', value: 92, icon: DollarSign, description: 'Affluent neighborhood with high average disposable income.' },
  { name: 'Risk Score', value: 55, icon: AlertTriangle, description: 'Moderate risk factors based on zoning stability and area history.', inverted: true },
  { name: 'Competition', value: 35, icon: Store, description: 'Saturated local market with several established competitors nearby.', inverted: true },
];

export default function ModernLocationAnalytics({
  data = MOCK_METRICS,
  analysisResult,
  locationName
}: {
  data?: MetricData[],
  analysisResult?: AnalysisResult,
  locationName?: string
}) {
  const [viewType, setViewType] = useState<'bar' | 'radar'>('radar');
  const [sortMode, setSortMode] = useState<'default' | 'worst' | 'best'>('default');
  const [expanded, setExpanded] = useState(false);

  const activeData = useMemo(() => {
    if (analysisResult) {
      return analysisResult.factors.map(f => {
        let icon = Home;
        let description = 'Metric analysis for the area.';
        if (f.label.includes("Population")) { icon = Home; description = "Concentration of residential units and foot traffic potential."; }
        else if (f.label.includes("Road")) { icon = Route; description = "Connectivity to major roads and public transit lines."; }
        else if (f.label.includes("Competition")) { icon = Store; description = "Market saturation and density of similar local businesses."; }
        else if (f.label.includes("Risk") || f.label.includes("Water")) { icon = Waves; description = "Environmental, zoning, or localized risk factors."; }
        else if (f.label.includes("Purchasing") || f.label.includes("Transport")) { icon = Truck; description = "Logistics or average disposable income and spending power."; }

        return {
          name: f.label.replace(" Access", "").replace(" Index", ""), // Simplify labels for charts
          value: f.value,
          plotValue: f.inverted ? 100 - f.value : f.value,
          icon,
          description,
          inverted: f.inverted
        };
      });
    }
    return data.map(d => ({
      ...d,
      plotValue: d.inverted ? 100 - d.value : d.value
    }));
  }, [analysisResult, data]);

  // Helper functions
  const getColor = (effScore: number) => {
    if (effScore >= 70) return '#10b981'; // Emerald 500 (Good)
    if (effScore >= 40) return '#f59e0b'; // Amber 500 (Moderate)
    return '#f43f5e'; // Rose 500 (Bad)
  };

  const getLabel = (effScore: number) => {
    if (effScore >= 70) return 'Good';
    if (effScore >= 40) return 'Moderate';
    return 'Poor';
  };

  const overallScore = useMemo(() => {
    if (analysisResult) return analysisResult.score;
    const sum = activeData.reduce((acc, curr) => acc + curr.plotValue, 0);
    return Math.round(sum / activeData.length);
  }, [analysisResult, activeData]);

  const sortedData = useMemo(() => {
    let sorted = [...activeData];
    if (sortMode === 'worst') sorted.sort((a, b) => a.plotValue - b.plotValue);
    if (sortMode === 'best') sorted.sort((a, b) => b.plotValue - a.plotValue);
    return sorted;
  }, [activeData, sortMode]);

  const strengths = activeData.filter(d => d.plotValue >= 70).map(d => d.name);
  const weaknesses = activeData.filter(d => d.plotValue < 40).map(d => d.name);

  const radarData = sortedData;

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const metric = activeData.find(d => d.name === payload[0].payload.name);
      if (!metric) return null;

      const val = metric.plotValue;
      const color = getColor(val);

      return (
        <div className="bg-popover backdrop-blur-md border border-border shadow-xl rounded-xl p-3 max-w-[220px] animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2 mb-1.5">
            <metric.icon size={16} style={{ color }} />
            <p className="font-semibold text-sm text-foreground">{metric.name}</p>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-black" style={{ color }}>{val}</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted/50 border border-border/50 text-muted-foreground uppercase tracking-wide">
              {getLabel(val)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{metric.description}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl bg-card border border-border shadow-sm overflow-hidden flex flex-col font-sans transition-all duration-300">

      {/* Header & Score Section */}
      <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/40 bg-gradient-to-r from-card to-muted/10">
        <div className="space-y-1.5">
          <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 mb-1">
            <span className="text-[9px] font-black text-primary uppercase tracking-widest">AI Analysis Report</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-sm">
                <MapPin size={22} className="opacity-80" />
             </div>
             <h2 className="text-3xl font-black tracking-tight text-foreground leading-none">
               {locationName || "Location Profile"}
             </h2>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-background p-4 rounded-xl border border-border/60 shadow-sm shrink-0">
          <div className="text-right">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Overall Score</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-foreground leading-none">{overallScore}</span>
              <span className="text-sm font-medium text-muted-foreground">/ 100</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-100 dark:bg-emerald-950/30">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Insight Summary Panel */}
      <div className="px-6 md:px-8 py-5 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-border/40">
        <div className="flex items-start gap-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/20 shadow-sm">
          <div className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">Strong In</p>
            <p className="text-sm text-foreground/85 font-medium">
              {strengths.length > 0 ? strengths.join(', ') : 'No prominent strengths.'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-900/20 shadow-sm">
          <div className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-400">
            <AlertTriangle size={18} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 mb-1">Needs Attention</p>
            <p className="text-sm text-foreground/85 font-medium">
              {weaknesses.length > 0 ? weaknesses.join(', ') : 'No critical weaknesses found.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Controls & Chart Area */}
      <div className="p-6 md:p-8 flex flex-col min-h-[400px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-bold text-foreground">Interactive Metrics</h3>

          <div className="flex items-center gap-2">
            {/* Sort Toggle */}
            <select
              className="px-3 py-1.5 text-xs font-medium bg-muted/40 hover:bg-muted border border-border rounded-lg outline-none cursor-pointer transition-colors"
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as any)}
            >
              <option value="default">Default View</option>
              <option value="best">Best to Worst</option>
              <option value="worst">Worst to Best</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center p-1 bg-muted/40 border border-border rounded-lg">
              <button
                onClick={() => setViewType('radar')}
                className={`p-1.5 rounded-md transition-all ${viewType === 'radar'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
                title="Radar Chart View"
              >
                <Focus size={16} />
              </button>
              <button
                onClick={() => setViewType('bar')}
                className={`p-1.5 rounded-md transition-all ${viewType === 'bar'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
                title="Bar Chart View"
              >
                <BarChart2 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Chart Container */}
        <div className="flex-1 w-full relative min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {viewType === 'radar' ? (
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="currentColor" className="text-border" strokeDasharray="3 3" />
                <PolarAngleAxis
                  dataKey="name"
                  tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 500 }}
                  className="text-foreground/80"
                />
                {/* <PolarRadiusAxis angle={414} domain={[0, 100]} tick={{ fill: 'currentColor' }} className="text-muted-foreground/60" tickCount={6} /> */}
                <RechartsTooltip content={<CustomTooltip />} />
                <Radar
                  name="Metrics"
                  dataKey="plotValue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="#60a5fa"
                  fillOpacity={0.15}
                  animationDuration={1000}
                  animationEasing="ease-out"
                />
              </RadarChart>
            ) : (
              <BarChart data={radarData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="currentColor" className="text-border/40" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: 'currentColor' }} className="text-muted-foreground" tickCount={5} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={130}
                  tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 500 }}
                  className="text-foreground/80"
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'currentColor', opacity: 0.05 }} />
                <Bar dataKey="plotValue" radius={[0, 4, 4, 0]} barSize={28} animationDuration={1000}>
                  {radarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColor(entry.plotValue)} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>

          {/* Threshold Indicator Overlay for Bar Chart */}
          {viewType === 'bar' && (
            <div className="absolute top-0 bottom-0 left-[130px] w-[calc(100%-160px)] pointer-events-none overflow-hidden">
              {/* 70% mark line */}
              <div className="absolute top-0 bottom-0 left-[70%] border-l-2 border-dashed border-emerald-500/40 z-0">
                <span className="absolute -top-4 left-1 text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest hidden sm:block">Ideal ≥ 70</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expandable Drill-down Data */}
      <div className="border-t border-border/50">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-4 px-6 md:px-8 hover:bg-muted/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Info size={16} className="text-muted-foreground" />
            <span className="font-semibold text-sm text-foreground">Detailed Metric Breakdown</span>
          </div>
          {expanded ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
        </button>

        {expanded && (
          <div className="px-6 md:px-8 pb-6 pt-2 animate-in slide-in-from-top-2 duration-300">
            <div className="grid gap-3">
              {activeData.map((metric, i) => (
                <div key={i} className="flex items-start sm:items-center gap-4 bg-background p-3 rounded-lg border border-border shadow-sm">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border"
                    style={{ backgroundColor: `${getColor(metric.plotValue)}15`, borderColor: `${getColor(metric.plotValue)}30`, color: getColor(metric.plotValue) }}
                  >
                    <metric.icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="font-semibold text-sm text-foreground truncate">{metric.name}</p>
                      <span className="font-bold text-sm" style={{ color: getColor(metric.plotValue) }}>{metric.plotValue}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{metric.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>


    </div>
  );
}
