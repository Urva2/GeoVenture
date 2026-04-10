import React from "react";
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
      <div className="p-4 border-b border-border/50 bg-muted/20 shrink-0">
        <h2 className="text-base font-bold text-foreground leading-tight mb-0.5">Top Contributing Factors</h2>
        <p className="text-[11px] text-muted-foreground">Key metrics optimized for {businessType}</p>
      </div>

      <div className="flex-1 flex flex-col p-4 pb-2 min-h-0">
        <div className="flex-1 relative mt-3 mb-1">
          {/* Grid Background */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
            {[100, 75, 50, 25, 0].map((tick) => (
              <div key={tick} className="flex items-center w-full">
                <span className="text-[10px] font-medium text-muted-foreground w-8 text-right pr-2 -translate-y-1/2">
                  {tick}
                </span>
                <div className="flex-1 border-t border-dashed border-border/50" />
              </div>
            ))}
          </div>

          {/* Bars Container */}
          <div className="absolute inset-0 flex items-end justify-around pl-8 z-10 pb-[1px]">
            {factors.map((factor, idx) => {
              const isGood = factor.inverted ? factor.value <= 50 : factor.value >= 50;
              const barGradient = isGood 
                ? "bg-gradient-to-t from-emerald-500 to-emerald-400" 
                : "bg-gradient-to-t from-rose-500 to-rose-400";
              const labelColor = isGood ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400";
              
              return (
                <div 
                  key={idx} 
                  className="h-full flex flex-col justify-end w-[14%] max-w-[40px] group relative items-center"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-popover/95 backdrop-blur-sm text-popover-foreground border border-border/50 px-2.5 py-1.5 rounded-md shadow-lg z-20 flex flex-col items-center pointer-events-none min-w-[100px]">
                    <span className={`text-sm font-black ${labelColor}`}>{factor.value}%</span>
                    <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap mt-0.5">
                      {factor.label}
                    </span>
                  </div>
                  
                  {/* The Bar */}
                  <div 
                    className={`w-full rounded-t-[4px] border-x border-t border-black/10 dark:border-white/10 ${barGradient} shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition-all duration-700 ease-out group-hover:brightness-110 flex justify-center`}
                    style={{ height: `${Math.max(factor.value, 4)}%` }} 
                  >
                     <span className={`text-[10px] font-bold ${isGood ? 'text-emerald-950/60 dark:text-emerald-100/60' : 'text-rose-950/60 dark:text-rose-100/60'} mt-1 truncate px-1`}>
                       {factor.value}
                     </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* X Axis Labels */}
        <div className="flex justify-around pl-8 pt-2 h-[56px] border-t border-border/40 shrink-0">
          {factors.map((factor, idx) => (
            <div key={idx} className="flex flex-col items-center w-[18%] text-center gap-1.5 pt-2">
              <span className="text-sm drop-shadow-sm leading-none">{factor.icon}</span>
              <span className="text-[9px] sm:text-[10px] font-semibold leading-[1.1] text-muted-foreground line-clamp-2 px-0.5 max-w-full break-words">
                {factor.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
