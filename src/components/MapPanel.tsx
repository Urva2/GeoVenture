import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMapEvents, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
    map.flyTo(center, 14, { duration: 1 });
  }, [center, map]);
  return null;
}

export default function MapPanel({ onLocationClick, clickedLocation, betterLocation, showBetter }: MapPanelProps) {
  const [showHint, setShowHint] = useState(true);
  const [panTarget, setPanTarget] = useState<[number, number] | null>(null);

  const handleClick = (lat: number, lng: number) => {
    setShowHint(false);
    onLocationClick(lat, lng);
  };

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        zoomControl={true}
        className="h-full w-full"
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
              ✦ Recommended Location
            </Tooltip>
          </Marker>
        )}
      </MapContainer>

      {showHint && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-card/95 backdrop-blur-sm text-muted-foreground text-sm px-4 py-2 rounded-lg border border-border shadow-md">
          Click anywhere to analyze
        </div>
      )}

      {clickedLocation && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-card/95 backdrop-blur-sm text-foreground text-xs font-mono px-3 py-2 rounded-lg border border-border shadow-sm">
          📍 {clickedLocation[0].toFixed(4)}, {clickedLocation[1].toFixed(4)}
        </div>
      )}
    </div>
  );
}
