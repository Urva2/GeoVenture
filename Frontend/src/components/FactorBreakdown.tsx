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

function barBgColor(value: number) {
  if (value >= 70) return "bg-success/10";
  if (value >= 40) return "bg-warning/10";
  return "bg-destructive/10";
}

export default function FactorBreakdown({ factors }: { factors: Factor[] }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="bg-card rounded-xl border border-border p-6 card-hover animate-fade-up stagger-2 shadow-sm">
      <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-5">
        Location Factors
      </p>
      <div className="space-y-4">
        {factors.map((f, i) => (
          <div key={f.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-foreground flex items-center gap-2">
                <span>{f.icon}</span>
                <span className="font-medium">{f.label}</span>
              </span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ color: barColor(f.value), backgroundColor: `color-mix(in srgb, ${barColor(f.value)} 10%, transparent)` }}
              >
                {f.value}%
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: visible ? `${f.value}%` : "0%",
                  backgroundColor: barColor(f.value),
                  transitionDelay: `${i * 100}ms`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
