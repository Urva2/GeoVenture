import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMapEvents, Marker, Tooltip, useMap, GeoJSON, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import LocationSearch from "./LocationSearch";
import { Loader2 } from "lucide-react";
import { booleanPointInPolygon, point } from "@turf/turf";
import { useToast } from "@/hooks/use-toast";

const defaultIcon = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapPanelProps {
  onLocationClick: (lat: number, lng: number, name?: string) => void;
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

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number, name?: string) => void }) {
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
  const [panTarget, setPanTarget] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [indiaGeoJson, setIndiaGeoJson] = useState<any>(null);
  const [invalidClick, setInvalidClick] = useState<[number, number] | null>(null);
  const { toast } = useToast();

  const handleInvalidLocation = (lat: number, lng: number) => {
    toast({
      title: "Invalid Location",
      description: "Please select a location within India's borders.",
      variant: "destructive",
      duration: 3000,
    });
    setInvalidClick([lat, lng]);
    setTimeout(() => setInvalidClick(null), 1500); // Remove red highlight after 1.5s
  };

  useEffect(() => {
    // Load heavy boundaries asynchronously from public folder 
    // to prevent freezing the main React UI bundle compilation
    fetch('/data/india.geojson')
      .then(res => res.json())
      .then(data => setIndiaGeoJson(data))
      .catch(err => console.error("Error loading boundary overlay:", err));
  }, []);

  const isInsideIndia = (lat: number, lng: number) => {
    if (!indiaGeoJson) return true; // Fail open if boundaries haven't loaded yet
    
    // Turf requires standard [longitude, latitude] array order
    const clickPt = point([lng, lat]);
    
    // Check if the clicked point intersects with ANY state polygon
    for (const feature of indiaGeoJson.features) {
      try {
        if (booleanPointInPolygon(clickPt, feature)) {
          return true;
        }
      } catch (err) {
        // Specifically catch MultiPolygon topological edge-case failures without crashing map
        console.warn("Boundary validation warning for feature", err);
      }
    }
    
    return false;
  };

  const handleClick = (lat: number, lng: number) => {
    if (!isInsideIndia(lat, lng)) {
      handleInvalidLocation(lat, lng);
      return; // Ignore the click
    }
    onLocationClick(lat, lng);
  };

  const handleSearchSelect = (lat: number, lng: number, name: string) => {
    if (!isInsideIndia(lat, lng)) {
      handleInvalidLocation(lat, lng);
      return;
    }
    setPanTarget([lat, lng]);
    onLocationClick(lat, lng, name);
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

        {indiaGeoJson && (
          <GeoJSON 
            data={indiaGeoJson}
            style={{
              color: '#2563EB', // exact requested blue border
              weight: 1.5,      // small narrow border
              fillOpacity: 0.05 // primarily transparent fill so map is clearly seen
            }}
          />
        )}

        {invalidClick && (
          <CircleMarker 
            center={invalidClick} 
            radius={25} 
            pathOptions={{ color: '#ef4444', weight: 2, fillColor: '#ef4444', fillOpacity: 0.3 }} 
          />
        )}

        {clickedLocation && (
          <Marker position={clickedLocation} icon={defaultIcon}>
            <Tooltip permanent direction="top" offset={[0, -42]} className="!bg-card !text-foreground !border-border !rounded-lg !text-xs !px-2 !py-1 !shadow-md font-semibold">
              Selected Location
            </Tooltip>
          </Marker>
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
              setIsLocating(true);
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  const lat = pos.coords.latitude;
                  const lng = pos.coords.longitude;
                  
                  if (!isInsideIndia(lat, lng)) {
                    handleInvalidLocation(lat, lng);
                    setIsLocating(false);
                    return;
                  }
                  
                  setPanTarget([lat, lng]);
                  onLocationClick(lat, lng);
                  setIsLocating(false);
                },
                (error) => {
                  console.error("Error fetching location", error);
                  setIsLocating(false);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
              );
            }
          }}
          disabled={isLocating}
          className="w-10 h-10 bg-card hover:bg-muted text-foreground border border-border shadow-sm rounded-xl flex items-center justify-center transition-all hover:scale-[1.05] active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:hover:scale-100"
          title="Use My Location"
        >
          {isLocating ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>
          )}
        </button>
      </div>

      {/* Top Center Location Search */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] w-full px-4 sm:px-0 sm:w-auto">
        <LocationSearch onLocationSelect={handleSearchSelect} />
      </div>


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
