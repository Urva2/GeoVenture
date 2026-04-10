import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Skeleton } from "@/components/ui/skeleton";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface AnalysisMapProps {
  location: [number, number];
  businessType: string;
}

// Fix default markers
const defaultIcon = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to handle smooth zooming and map resize invalidation
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    // Invalidate size guarantees the map renders correctly even if container was resizing
    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
      // Smoothly fly to the target location
      map.flyTo(center, zoom, {
        animate: true,
        duration: 1.5,
      });
    }, 100);

    return () => clearTimeout(resizeTimer);
  }, [center, zoom, map]);

  return null;
}

export default function AnalysisMap({ location, businessType }: AnalysisMapProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Prevent grey map chunks by delaying render slightly and showing skeleton
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400); // Small delay to let the container size settle
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="h-full w-full overflow-hidden border-border relative">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-card">
          <Skeleton className="h-full w-full absolute inset-0 rounded-none" />
          <div className="relative z-10 animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {location && !isLoading && (
        <MapContainer
          // Start slightly zoomed out (e.g. India's center, or just same location with wider zoom)
          // so the user actually sees the flyTo animation. We'll start at the location but zoom=7
          center={[location[0], location[1]]}
          zoom={7}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <MapController center={[location[0], location[1]]} zoom={15} />
          
          <Marker position={[location[0], location[1]]} icon={defaultIcon}>
            <Popup>
              <div className="text-xs">
                <p className="font-semibold text-foreground">Selected Location</p>
                <p className="capitalize text-muted-foreground">{businessType}</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      )}
    </Card>
  );
}
