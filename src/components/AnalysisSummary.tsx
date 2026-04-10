import React from "react";
import { Card } from "@/components/ui/card";
import { Activity, Briefcase } from "lucide-react";

interface AnalysisSummaryProps {
  businessType: string;
  score: number;
}

export default function AnalysisSummary({ businessType, score }: AnalysisSummaryProps) {
  let scoreColor = "text-emerald-500";
  let scoreGradient = "from-emerald-400 to-green-500";
  let bgGradient = "from-emerald-500/10 to-green-500/5";
  
  if (score < 50) {
    scoreColor = "text-rose-500";
    scoreGradient = "from-rose-400 to-red-500";
    bgGradient = "from-rose-500/10 to-red-500/5";
  } else if (score < 75) {
    scoreColor = "text-amber-500";
    scoreGradient = "from-amber-400 to-orange-500";
    bgGradient = "from-amber-500/10 to-orange-500/5";
  }

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <Card className="relative overflow-hidden bg-card border-border shrink-0 shadow-sm transition-all hover:shadow-md">
      {/* Decorative background glow */}
      <div className={`absolute -right-12 -top-12 w-40 h-40 bg-gradient-to-br ${bgGradient} rounded-full blur-3xl opacity-60 pointer-events-none`}></div>
      
      <div className="p-5 border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-md">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground leading-none">Analysis Summary</h2>
            <p className="text-[11px] text-muted-foreground mt-1">Overall readiness overview</p>
          </div>
        </div>
      </div>
      
      <div className="p-6 flex items-center justify-between gap-4 relative z-10">
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Target Domain</p>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-secondary rounded-lg shadow-sm border border-border/50">
              <Briefcase className="w-4 h-4 text-foreground/80" />
            </div>
            <p className="text-xl font-bold tracking-tight text-foreground capitalize">{businessType}</p>
          </div>
        </div>
        
        <div className="relative flex items-center justify-center">
          <svg className="w-[88px] h-[88px] transform -rotate-90 drop-shadow-sm">
            <circle
              cx="44"
              cy="44"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              className="text-muted/50"
            />
            <circle
              cx="44"
              cy="44"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={`${scoreColor} transition-all duration-1000 ease-out`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
             <span className={`text-2xl font-black bg-gradient-to-br ${scoreGradient} bg-clip-text text-transparent leading-none`}>
               {score}
             </span>
             <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
               Score
             </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
