import React from "react";
import { AlertCircle, TrendingUp } from "lucide-react";
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
    <Card className="h-full flex flex-col bg-card border-border">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-bold text-foreground mb-1">Top Contributing Factors</h2>
        <p className="text-xs text-muted-foreground">Key metrics for {businessType}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {factors.map((factor, idx) => {
          const isGood = factor.inverted ? factor.value < 50 : factor.value > 50;
          const bgColor = isGood ? "bg-green-500/10" : "bg-red-500/10";
          const textColor = isGood ? "text-green-700" : "text-red-700";
          const borderColor = isGood ? "border-green-200" : "border-red-200";

          return (
            <div
              key={idx}
              className={`p-4 rounded-lg border ${borderColor} ${bgColor} cursor-pointer hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{factor.icon}</span>
                    <p className="text-sm font-medium text-foreground">{factor.label}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-green-500"
                        style={{ width: `${factor.value}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold ${textColor}`}>{factor.value}%</span>
                  </div>
                </div>
                {isGood && <TrendingUp className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-start gap-2 text-xs">
          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <p className="text-muted-foreground">
            Factors are weighted based on business type suitability and location characteristics.
          </p>
        </div>
      </div>
    </Card>
  );
}
