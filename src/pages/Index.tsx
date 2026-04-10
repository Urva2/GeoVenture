import { useState, useCallback } from "react";
import MapPanel from "@/components/MapPanel";
import SidebarPanel from "@/components/SidebarPanel";

export default function Index() {
  const [clickedLocation, setClickedLocation] = useState<[number, number] | null>(null);
  const [betterLocation, setBetterLocation] = useState<[number, number] | null>(null);
  const [showBetter, setShowBetter] = useState(false);

  const handleLocationClick = useCallback((lat: number, lng: number) => {
    setClickedLocation([lat, lng]);
    setShowBetter(false);
    setBetterLocation(null);
  }, []);

  const handleJumpToLocation = useCallback((lat: number, lng: number) => {
    setBetterLocation([lat, lng]);
    setShowBetter(true);
    setClickedLocation([lat, lng]);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background animate-in fade-in duration-500">
      {/* Navbar */}
      <header className="h-16 shrink-0 bg-card flex items-center px-6 border-b border-border z-50 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-sm shrink-0">
            <span className="text-primary-foreground text-sm font-black tracking-tighter">GV</span>
          </div>
          <div className="flex flex-col justify-center">
            <span className="font-extrabold text-lg tracking-tight leading-none mb-0.5 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
              Geo<span className="text-primary">Venture</span>
            </span>
            <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground hidden sm:block">
              Find the best location for your business
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0 p-4 gap-6 bg-muted/20">
        {/* Map - 65% */}
        <div className="w-[65%] h-full rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-border overflow-hidden relative bg-card">
          <MapPanel
            onLocationClick={handleLocationClick}
            clickedLocation={clickedLocation}
            betterLocation={betterLocation}
            showBetter={showBetter}
          />
        </div>

        {/* Sidebar - 35% */}
        <div className="w-[35%] h-full rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-border overflow-hidden bg-card z-10 hover:-translate-y-0.5">
          <SidebarPanel clickedLocation={clickedLocation} />
        </div>
      </div>
    </div>
  );
}
