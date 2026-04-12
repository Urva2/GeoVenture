import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, AlertCircle, Trophy } from "lucide-react";
import { BUSINESS_TYPES, generateAnalysis } from "@/lib/analysis";

interface BusinessComparisonItem {
  name: string;
  score: number;
  isSearched?: boolean;
}

interface BusinessComparisonProps {
  searchedBusinessValue?: string;
  searchedScore?: number;
  location?: [number, number];
  alternatives?: { type: string; score: number }[];
}

export default function BusinessComparison({
  searchedBusinessValue = "",
  searchedScore = 0,
  location = [0, 0],
  alternatives = []
}: BusinessComparisonProps = {}) {
  
  const dynamicBusinesses = useMemo(() => {
    let allBusinesses: BusinessComparisonItem[] = [];

    if (alternatives && alternatives.length > 0) {
       allBusinesses = alternatives.map(alt => {
          const businessInfo = BUSINESS_TYPES.find(b => b.value === alt.type);
          return {
              name: businessInfo ? businessInfo.label : alt.type,
              score: alt.score,
              isSearched: alt.type === searchedBusinessValue
          };
       });
    } else {
        // Generate true, mathematically consistent scores for ALL business types at this location
        allBusinesses = BUSINESS_TYPES.map(b => {
          const isSearched = b.value === searchedBusinessValue;
          const score = (isSearched && searchedScore > 0) 
            ? searchedScore 
            : generateAnalysis(location[0], location[1], b.value).score;

          return {
            name: b.label,
            score,
            isSearched
          };
        });
    }

    // Sort all businesses by score descending
    allBusinesses.sort((a, b) => b.score - a.score);

    // Take top 5 for comparison
    let top5 = allBusinesses.slice(0, 5);

    // If the searched business didn't make the top 5, swap it in so the user can compare it
    const searchedInTop5 = top5.some(b => b.isSearched);
    if (!searchedInTop5 && searchedBusinessValue) {
      const searchedItem = allBusinesses.find(b => b.isSearched);
      if (searchedItem) {
        top5 = allBusinesses.slice(0, 4);
        top5.push(searchedItem);
        top5.sort((a, b) => b.score - a.score); // Resort with the swapped item
      }
    }

    return top5;
  }, [searchedBusinessValue, searchedScore, location, alternatives]);
  const getStatus = (score: number) => {
    if (score >= 80) return "Recommended";
    if (score >= 50) return "Moderate";
    return "Not Ideal";
  };

  const getStatusStyles = (score: number) => {
    if (score >= 80) {
      return {
        bg: "bg-emerald-50 dark:bg-emerald-950/20",
        border: "border-emerald-200 dark:border-emerald-900/50",
        text: "text-emerald-700 dark:text-emerald-400",
        bar: "from-emerald-400 to-green-500",
        badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
      };
    }
    if (score >= 50) {
      return {
        bg: "bg-amber-50 dark:bg-amber-950/20",
        border: "border-amber-200 dark:border-amber-900/50",
        text: "text-amber-700 dark:text-amber-400",
        bar: "from-amber-400 to-yellow-500",
        badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
        icon: <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500" />
      };
    }
    return {
      bg: "bg-rose-50 dark:bg-rose-950/20",
      border: "border-rose-200 dark:border-rose-900/50",
      text: "text-rose-700 dark:text-rose-400",
      bar: "from-rose-400 to-red-500",
      badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
      icon: <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-500" />
    };
  };

  return (
    <Card className="h-full flex flex-col bg-card border-border shadow-sm">
      {/* Header */}
      <div className="p-5 border-b border-border/50 bg-muted/20">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-bold text-foreground leading-tight">Business Comparison</h2>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Alternative business types ranked by suitability for this location
        </p>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        {/* Sticky Header Container */}
        <div className="sticky top-0 z-20 pt-4 px-4 pb-2 bg-card/95 backdrop-blur-md">
          {/* Actual Header Bar */}
          <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-muted rounded-md text-[11px] font-bold text-muted-foreground uppercase tracking-wider shadow-sm">
            <div className="col-span-5">Business Match</div>
            <div className="col-span-4 text-center">Suitability</div>
            <div className="col-span-3 text-right text-transparent sm:text-muted-foreground">Status</div>
          </div>
        </div>

        {/* Table Rows Container */}
        <div className="px-4 pb-4 space-y-2.5">
          {dynamicBusinesses.map((business, idx) => {
            const isBest = idx === 0;
            const styles = getStatusStyles(business.score);
            const statusLabel = getStatus(business.score);

            return (
              <div
                key={idx}
                className={`grid grid-cols-12 gap-3 px-4 py-4 rounded-xl border transition-all cursor-default ${styles.bg} ${styles.border} ${isBest ? "ring-2 ring-primary/20" : "hover:-translate-y-0.5 hover:shadow-sm"}`}
              >
                <div className="col-span-5 flex items-center gap-2 min-w-0">
                  {isBest && (
                    <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/40 rounded-full flex-shrink-0">
                      <Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
                    </div>
                  )}
                  <span className={`text-[14px] font-bold truncate ${isBest ? "text-foreground" : "text-foreground/80"}`}>
                    {business.name}
                  </span>
                </div>

                <div className="col-span-4 flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    {/* Made track darker using black/10 & thicker h-2 */}
                    <div className="flex-1 h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full bg-gradient-to-r ${styles.bar} rounded-full`}
                        style={{ width: `${business.score}%` }}
                      />
                    </div>
                    <span className={`text-sm font-black ${styles.text} w-7 text-right`}>
                      {business.score}
                    </span>
                  </div>
                </div>

                <div className="col-span-3 flex items-center justify-end">
                  <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${styles.badge}`}>
                    {styles.icon}
                    {statusLabel}
                  </div>
                  {/* Mobile fallback icon only */}
                  <div className="sm:hidden flex items-center justify-center">
                    <div className={`p-1.5 rounded-full ${styles.badge}`}>
                      {styles.icon}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </Card>
  );
}
