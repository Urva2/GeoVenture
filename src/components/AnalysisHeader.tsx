import React from "react";
import { Card } from "@/components/ui/card";
import { MapPin, ArrowLeft, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AnalysisHeaderProps {
  location: [number, number];
  businessType: string;
  score: number;
}

export default function AnalysisHeader({ location, businessType, score }: AnalysisHeaderProps) {
  const navigate = useNavigate();

  return (
    <Card className="flex items-center justify-between p-4 bg-card border-border">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="hover:bg-secondary"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Location Analysis</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {location[0].toFixed(4)}, {location[1].toFixed(4)}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Overall Score</p>
          <p className="text-2xl font-bold text-foreground">{score}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Business Type</p>
          <p className="text-sm font-semibold text-foreground capitalize">{businessType}</p>
        </div>
      </div>
    </Card>
  );
}
