import { useEffect, useState } from "react";

interface ScoreCardProps {
  score: number;
}

function getScoreColor(score: number) {
  if (score >= 80) return "hsl(var(--success))";
  if (score >= 60) return "hsl(var(--warning))";
  return "hsl(var(--destructive))";
}

function getScoreLabel(score: number) {
  if (score >= 80) return "Excellent Site";
  if (score >= 60) return "Good Potential";
  if (score >= 40) return "Moderate Risk";
  return "Poor Location";
}

function getScoreBadgeClass(score: number) {
  if (score >= 80) return "bg-success/10 text-success";
  if (score >= 60) return "bg-warning/10 text-warning";
  return "bg-destructive/10 text-destructive";
}

export default function ScoreCard({ score }: ScoreCardProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      if (current > score) {
        clearInterval(interval);
        return;
      }
      setAnimatedScore(current);
    }, 15);
    return () => clearInterval(interval);
  }, [score]);

  return (
    <div className="bg-card rounded-xl border border-border p-6 card-hover animate-fade-up shadow-sm">
      <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-5">
        Site Readiness Score
      </p>
      <div className="flex items-center gap-6">
        {/* Circular Gauge */}
        <div className="relative w-28 h-28 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth="8"
            />
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke={getScoreColor(score)}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground">{animatedScore}</span>
            <span className="text-[10px] text-muted-foreground">/100</span>
          </div>
        </div>
        {/* Score Info */}
        <div className="flex-1 min-w-0">
          <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-2 ${getScoreBadgeClass(score)}`}>
            {getScoreLabel(score)}
          </span>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This location scores <span className="font-semibold text-foreground">{score}/100</span> for site readiness based on population, accessibility, and market analysis.
          </p>
        </div>
      </div>
    </div>
  );
}
