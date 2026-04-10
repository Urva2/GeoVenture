import { useState, useCallback } from "react";
import MapPanel from "@/components/MapPanel";
import SidebarPanel from "@/components/SidebarPanel";
import UserDropdown from "@/components/UserDropdown";

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
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      {/* Navbar */}
      <header className="h-12 shrink-0 bg-card flex items-center justify-between px-5 border-b border-border z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">S</span>
          </div>
          <span className="text-foreground font-bold text-sm tracking-wide">SiteIQ</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground text-xs hidden sm:block">AI-Powered Location Intelligence</span>
          <UserDropdown />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Map - 65% */}
        <div className="w-[65%] h-full">
          <MapPanel
            onLocationClick={handleLocationClick}
            clickedLocation={clickedLocation}
            betterLocation={betterLocation}
            showBetter={showBetter}
          />
        </div>

        {/* Sidebar - 35% */}
        <div className="w-[35%] h-full border-l border-border">
          <SidebarPanel
            clickedLocation={clickedLocation}
            onJumpToLocation={handleJumpToLocation}
          />
        </div>
      </div>
    </div>
  );
}
