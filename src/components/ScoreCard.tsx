import { useEffect, useState } from "react";

interface ScoreCardProps {
  score: number;
}

function getScoreLabel(score: number) {
  if (score >= 80) return "🟢 Excellent Site";
  if (score >= 60) return "🟡 Good Potential";
  if (score >= 40) return "🟠 Moderate Risk";
  return "🔴 Poor Location";
}

export default function ScoreCard({ score }: ScoreCardProps) {
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setBarWidth(score), 50);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <div className="bg-card rounded-xl border border-border p-6 card-hover animate-fade-up">
      <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-4">
        Site Readiness Score
      </p>
      <div className="text-center">
        <span className="text-7xl font-bold text-foreground">{score}</span>
        <p className="text-lg mt-2 text-muted-foreground">{getScoreLabel(score)}</p>
      </div>
      <div className="mt-6 h-3 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full animate-bar"
          style={{
            width: `${barWidth}%`,
            background: "linear-gradient(90deg, hsl(var(--destructive)), hsl(var(--warning)), hsl(var(--success)))",
          }}
        />
      </div>
    </div>
  );
}
