import { useEffect, useState } from "react";

interface Factor {
  label: string;
  icon: string;
  value: number;
  inverted?: boolean;
}

function barColor(value: number) {
  if (value >= 70) return "hsl(var(--success))";
  if (value >= 40) return "hsl(var(--warning))";
  return "hsl(var(--destructive))";
}

export default function FactorBreakdown({ factors }: { factors: Factor[] }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="bg-card rounded-xl border border-border p-6 card-hover animate-fade-up stagger-2">
      <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-5">
        Location Factors
      </p>
      <div className="space-y-4">
        {factors.map((f, i) => (
          <div key={f.label} className="flex items-center gap-3">
            <span className="text-sm w-44 shrink-0 flex items-center gap-2">
              <span>{f.icon}</span>
              <span className="text-foreground">{f.label}</span>
            </span>
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: visible ? `${f.value}%` : "0%",
                  backgroundColor: barColor(f.value),
                  transitionDelay: `${i * 100}ms`,
                }}
              />
            </div>
            <span className="text-xs font-mono text-muted-foreground w-10 text-right">
              {f.value}/100
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
