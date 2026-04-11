import { Activity, Target, Users, ShieldCheck } from "lucide-react";
import type { AnalysisResult } from "@/lib/analysis";

interface MiniDashboardProps {
  result: AnalysisResult;
}

export default function MiniDashboard({ result }: MiniDashboardProps) {
  const { factors } = result;
  const accessibility = factors.find(f => f.label === "Road & Transit Access")?.value ?? 0;
  const demand = factors.find(f => f.label === "Population Density")?.value ?? 0;
  const competition = factors.find(f => f.label === "Competition Index")?.value ?? 0;
  const risk = factors.find(f => f.label === "Risk Score")?.value ?? 0;

  const cards = [
    { label: "Accessibility", value: accessibility, icon: Activity, color: "text-primary", bg: "bg-primary/10" },
    { label: "Demand", value: demand, icon: Users, color: "text-success", bg: "bg-success/10" },
    { label: "Competition", value: 100 - competition, icon: Target, color: "text-warning", bg: "bg-warning/10" },
    { label: "Safety", value: 100 - risk, icon: ShieldCheck, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <div className="animate-fade-up stagger-4">
      <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-3">
        Quick Metrics
      </p>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="bg-card rounded-xl border border-border p-4 card-hover shadow-sm">
            <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center mb-2`}>
              <c.icon className={`w-4 h-4 ${c.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{c.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
