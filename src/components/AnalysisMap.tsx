import React from "react";
import { Card } from "@/components/ui/card";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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

export default function AnalysisMap({ location, businessType }: AnalysisMapProps) {
  return (
    <Card className="h-full overflow-hidden border-border">
      <MapContainer
        center={[location[0], location[1]]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <Marker position={[location[0], location[1]]} icon={defaultIcon}>
          <Popup>
            <div className="text-xs">
              <p className="font-semibold">Analysis Location</p>
              <p className="capitalize">{businessType}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </Card>
  );
}
