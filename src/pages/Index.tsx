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
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {/* Navbar */}
      <header className="h-12 shrink-0 bg-navbar flex items-center justify-between px-5 border-b border-border z-50">
        <span className="text-foreground font-bold text-sm tracking-wide">◆ SiteIQ</span>
        <span className="text-muted-foreground text-xs hidden sm:block">AI-Powered Location Intelligence</span>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Map - 60% */}
        <div className="w-[60%] h-full">
          <MapPanel
            onLocationClick={handleLocationClick}
            clickedLocation={clickedLocation}
            betterLocation={betterLocation}
            showBetter={showBetter}
          />
        </div>

        {/* Sidebar - 40% */}
        <div className="w-[40%] h-full border-l border-border">
          <SidebarPanel
            clickedLocation={clickedLocation}
            onJumpToLocation={handleJumpToLocation}
          />
        </div>
      </div>
    </div>
  );
}
