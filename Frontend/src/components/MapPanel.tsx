import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMapEvents, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import LocationSearch from "./LocationSearch";

interface MapPanelProps {
  onLocationClick: (lat: number, lng: number) => void;
  clickedLocation: [number, number] | null;
  betterLocation: [number, number] | null;
  showBetter: boolean;
}

function createPulseIcon() {
  return L.divIcon({
    className: "",
    html: `<div class="custom-marker-pulse"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function createRecommendedIcon() {
  return L.divIcon({
    className: "",
    html: `<div class="recommended-marker"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function PanTo({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13, { duration: 1.5 });
  }, [center, map]);
  return null;
}

const INDIA_BOUNDS: L.LatLngBoundsExpression = [
  [6.5, 68.1], // Southwest coordinates of India
  [35.5, 97.4] // Northeast coordinates of India
];

export default function MapPanel({ onLocationClick, clickedLocation, betterLocation, showBetter }: MapPanelProps) {
  const [showHint, setShowHint] = useState(true);
  const [panTarget, setPanTarget] = useState<[number, number] | null>(null);

  const handleClick = (lat: number, lng: number) => {
    setShowHint(false);
    onLocationClick(lat, lng);
  };

  const handleSearchSelect = (lat: number, lng: number) => {
    setPanTarget([lat, lng]);
    onLocationClick(lat, lng);
    setShowHint(false);
  };

  return (
    <div className="relative h-full w-full bg-[#f8fafc] group">
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        minZoom={5}
        maxBounds={INDIA_BOUNDS}
        maxBoundsViscosity={1.0}
        zoomControl={true}
        className="h-full w-full cursor-crosshair"
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        <ClickHandler onClick={handleClick} />
        {panTarget && <PanTo center={panTarget} />}

        {clickedLocation && (
          <Marker position={clickedLocation} icon={createPulseIcon()} />
        )}

        {showBetter && betterLocation && (
          <Marker position={betterLocation} icon={createRecommendedIcon()}>
            <Tooltip permanent direction="top" offset={[0, -14]} className="!bg-card !text-foreground !border-border !rounded-lg !text-xs !px-2 !py-1 !shadow-md">
              Recommended Location
            </Tooltip>
          </Marker>
        )}
      </MapContainer>

      {/* Map Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">

        <button
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setPanTarget([lat, lng]);
                onLocationClick(lat, lng);
                setShowHint(false);
              });
            }
          }}
          className="w-10 h-10 bg-card hover:bg-muted text-foreground border border-border shadow-sm rounded-xl flex items-center justify-center transition-all hover:scale-[1.05] active:scale-95"
          title="Use My Location"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>
        </button>
      </div>

      {/* Top Center Location Search */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] w-full px-4 sm:px-0 sm:w-auto">
        <LocationSearch onLocationSelect={handleSearchSelect} />
      </div>

      {showHint && (
        <div className="absolute top-[88px] left-1/2 -translate-x-1/2 z-[1000] bg-background/80 backdrop-blur-md rounded-full px-5 py-2.5 border border-border shadow-sm text-sm font-medium text-foreground text-center pointer-events-none transition-all duration-500 animate-in fade-in slide-in-from-top-4">
          Click anywhere on the map to analyze location
        </div>
      )}

      {clickedLocation && (
        <div className="absolute bottom-6 left-6 z-[1000] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl text-foreground px-4 py-3.5 rounded-2xl border border-border/50 shadow-xl flex items-center gap-3 transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-2">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
          </div>
          <div className="flex-1 pr-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5 leading-none">Selected Location</p>
            <p className="font-mono text-[13px] font-semibold text-foreground tracking-tight">{clickedLocation[0].toFixed(5)}, {clickedLocation[1].toFixed(5)}</p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${clickedLocation[0].toFixed(5)}, ${clickedLocation[1].toFixed(5)}`);
            }}
            className="w-8 h-8 rounded-lg bg-muted hover:bg-muted-foreground/20 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
            title="Copy Coordinates"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}
