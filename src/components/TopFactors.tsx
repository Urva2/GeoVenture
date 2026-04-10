import React from "react";
import { AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Factor {
  label: string;
  icon: string;
  value: number;
  inverted?: boolean;
}

interface TopFactorsProps {
  factors: Factor[];
  businessType: string;
}

export default function TopFactors({ factors, businessType }: TopFactorsProps) {
  return (
    <Card className="h-full flex flex-col bg-card border-border shadow-sm">
      <div className="p-5 border-b border-border/50 bg-muted/20">
        <h2 className="text-base font-bold text-foreground leading-tight mb-1">Top Contributing Factors</h2>
        <p className="text-[11px] text-muted-foreground">Key metrics optimized for {businessType}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {factors.map((factor, idx) => {
          // If inverted, a lower value is better
          const isGood = factor.inverted ? factor.value <= 50 : factor.value >= 50;
          
          const bgClass = isGood 
            ? "bg-gradient-to-br from-emerald-50 to-green-100/50 dark:from-emerald-950/20 dark:to-green-900/10 border-emerald-200/60 dark:border-emerald-900/50" 
            : "bg-gradient-to-br from-rose-50 to-red-100/50 dark:from-rose-950/20 dark:to-red-900/10 border-rose-200/60 dark:border-rose-900/50";
            
          const textColor = isGood ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400";
          const barGradient = isGood ? "from-emerald-400 to-green-500" : "from-rose-400 to-red-500";
          const IconComponent = isGood ? TrendingUp : TrendingDown;

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${bgClass} cursor-default hover:-translate-y-0.5 hover:shadow-md transition-all duration-200`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="text-xl drop-shadow-sm">{factor.icon}</span>
                    <p className="text-[14px] font-bold text-foreground/90">{factor.label}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden shadow-inner flex items-center">
                      <div
                        className={`h-full bg-gradient-to-r ${barGradient} rounded-full`}
                        style={{ width: `${factor.value}%` }}
                      />
                    </div>
                    <span className={`text-sm font-black ${textColor} tracking-tight w-8 text-right`}>
                      {factor.value}%
                    </span>
                  </div>
                </div>
                <div className={`p-1.5 rounded-md bg-background/40 ${textColor} shadow-sm border border-background/20 mt-0.5`}>
                   <IconComponent className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </Card>
  );
}
