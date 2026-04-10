import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle } from "lucide-react";

interface TechnicalParam {
  name: string;
  cooling: number;
  heating: number;
  airside: number;
  status?: "critical" | "warning" | "normal";
}

const MOCK_PARAMETERS: TechnicalParam[] = [
  { name: "Blackburn", cooling: 2, heating: 6, airside: 11, status: "critical" },
  { name: "Bowen", cooling: 1, heating: 1, airside: 1, status: "normal" },
  { name: "Busch", cooling: 9, heating: 5, airside: 5, status: "warning" },
  { name: "Curl", cooling: 9, heating: 5, airside: 5, status: "warning" },
  { name: "North Rec House", cooling: 3, heating: 4, airside: 7, status: "normal" },
];

export default function TechnicalParametersTable() {
  const criticalCount = useMemo(() => {
    return MOCK_PARAMETERS.filter((p) => p.status === "critical").length;
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "critical":
        return "border-red-200 bg-red-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      default:
        return "border-green-200 bg-green-50";
    }
  };

  const getStatusIcon = (status?: string) => {
    if (status === "critical") {
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    }
    return <CheckCircle2 className="w-4 h-4 text-green-600" />;
  };

  return (
    <Card className="h-full flex flex-col bg-card border-border">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-foreground">Technical Parameters</h2>
          {criticalCount > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {criticalCount} Critical
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Performance metrics for identified buildings
        </p>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-2">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-muted rounded-lg sticky top-0 text-xs font-semibold text-muted-foreground uppercase">
            <div className="col-span-4">Property</div>
            <div className="col-span-2 text-center">Cooling</div>
            <div className="col-span-2 text-center">Heating</div>
            <div className="col-span-2 text-center">Airside</div>
            <div className="col-span-2 text-right">Status</div>
          </div>

          {/* Table Rows */}
          <div className="space-y-1">
            {MOCK_PARAMETERS.map((param, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-12 gap-2 px-3 py-3 rounded-lg border transition-colors cursor-pointer hover:shadow-sm ${getStatusColor(param.status)}`}
              >
                <div className="col-span-4">
                  <p className="text-sm font-medium text-foreground">{param.name}</p>
                </div>
                <div className="col-span-2 text-center">
                  <div className="flex items-center justify-center">
                    <div className="w-16 h-2 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-green-600"
                        style={{ width: `${(param.cooling / 11) * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{param.cooling}</p>
                </div>
                <div className="col-span-2 text-center">
                  <div className="flex items-center justify-center">
                    <div className="w-16 h-2 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600"
                        style={{ width: `${(param.heating / 11) * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{param.heating}</p>
                </div>
                <div className="col-span-2 text-center">
                  <div className="flex items-center justify-center">
                    <div className="w-16 h-2 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-400 to-orange-600"
                        style={{ width: `${(param.airside / 11) * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{param.airside}</p>
                </div>
                <div className="col-span-2 flex items-center justify-end">
                  {getStatusIcon(param.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-border bg-muted/30 text-xs text-muted-foreground">
        <p>Showing top 5 properties with detected anomalies</p>
      </div>
    </Card>
  );
}
