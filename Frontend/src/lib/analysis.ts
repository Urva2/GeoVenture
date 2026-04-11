export interface AnalysisResult {
  score: number;
  factors: {
    label: string;
    icon: string;
    value: number;
    inverted?: boolean;
  }[];
  bestBusiness: {
    type: string;
    icon: string;
    reasons: string[];
  };
  betterLocation: {
    lat: number;
    lng: number;
    score: number;
  };
  riskFlags: string[];
}

const BUSINESS_TYPES = [
  { value: "accomodation", label: "Accomodation", icon: "" },
  { value: "culture", label: "Culture & Arts", icon: "" },
  { value: "education", label: "Education", icon: "" },
  { value: "finance", label: "Finance & Banking", icon: "" },
  { value: "food", label: "Food & Beverage", icon: "" },
  { value: "health", label: "Health & Medical", icon: "" },
  { value: "infra", label: "Infrastructure", icon: "" },
  { value: "other", label: "Other", icon: "" },
  { value: "outdoor", label: "Outdoor & Recreation", icon: "" },
  { value: "public_service", label: "Public Service", icon: "" },
  { value: "retail", label: "Retail", icon: "" },
  { value: "sports", label: "Sports Facilities", icon: "" },
  { value: "transport", label: "Transport & Logistics", icon: "" },
  { value: "utility", label: "Utilities", icon: "" },
];

export { BUSINESS_TYPES };

function pseudoRandom(seed: number): number {
  return ((Math.sin(seed * 127.1 + 311.7) * 43758.5453) % 1 + 1) % 1;
}

export function generateAnalysis(lat: number, lng: number, businessType: string): AnalysisResult {
  const seed1 = lat * 1000 + lng * 100;
  const seed2 = seed1 + businessType.length * 17;

  const pop = Math.floor(pseudoRandom(seed1) * 60 + 30);
  const transit = Math.floor(pseudoRandom(seed1 + 1) * 50 + 40);
  const competition = Math.floor(pseudoRandom(seed2) * 70 + 15);
  const risk = Math.floor(pseudoRandom(seed2 + 1) * 60 + 10);
  const purchasing = Math.floor(pseudoRandom(seed1 + 2) * 55 + 35);

  const factors = [
    { label: "Population Density", icon: "", value: pop },
    { label: "Road & Transit Access", icon: "", value: transit },
    { label: "Competition Index", icon: "", value: competition, inverted: true },
    { label: "Water Ways", icon: "", value: risk, inverted: true },
    { label: "Transportation", icon: "", value: purchasing },
  ];

  const effectiveScores = factors.map(f => f.inverted ? 100 - f.value : f.value);
  const score = Math.floor(effectiveScores.reduce((a, b) => a + b, 0) / effectiveScores.length);

  const bestOptions = BUSINESS_TYPES.filter(b => b.value !== businessType);
  const bestIdx = Math.floor(pseudoRandom(seed2 + 3) * bestOptions.length);
  const best = bestOptions[bestIdx];

  const reasonsPool = [
    `Low competition within 1km radius`,
    `High transit footfall nearby`,
    `Strong residential density supports demand`,
    `Above-average purchasing power in area`,
    `Underserved market segment detected`,
  ];

  const betterLat = lat + (pseudoRandom(seed1 + 5) - 0.5) * 0.02;
  const betterLng = lng + (pseudoRandom(seed1 + 6) - 0.5) * 0.02;
  const betterScore = Math.min(99, score + Math.floor(pseudoRandom(seed1 + 7) * 15 + 5));

  const riskFlags: string[] = [];
  if (competition > 60) riskFlags.push("High competition detected in a 500m radius");
  if (risk > 60) riskFlags.push("Elevated environmental or zoning risk in this area");
  if (pop < 40) riskFlags.push("Low population density may limit foot traffic");

  return {
    score,
    factors,
    bestBusiness: {
      type: best.label,
      icon: best.icon,
      reasons: reasonsPool.slice(0, 3),
    },
    betterLocation: { lat: betterLat, lng: betterLng, score: betterScore },
    riskFlags,
  };
}
