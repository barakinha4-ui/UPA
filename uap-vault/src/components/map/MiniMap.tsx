'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

interface MiniMapProps {
  lat: number;
  lng: number;
  locationName: string;
  agency: string;
}

const MINI_MAP_AGENCY_COLORS = {
  DOW: '#60a5fa',
  FBI: '#fbbf24',
  NASA: '#22d3ee',
  CIA: '#f43f5e',
  ODNI: '#c084fc',
  STATE: '#34d399',
  DOE: '#fb923c',
  OTHER: '#9ca3af',
};

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 8);
  }, [center, map]);
  return null;
}

export default function MiniMap({ lat, lng, locationName, agency }: MiniMapProps) {
  const center: [number, number] = [lat, lng];
  const color = MINI_MAP_AGENCY_COLORS[agency as keyof typeof MINI_MAP_AGENCY_COLORS] || MINI_MAP_AGENCY_COLORS.OTHER;

  return (
    <div className="w-full h-48 rounded overflow-hidden border border-[#c8a96e]/10 bg-[#07070a] relative z-0">
      <MapContainer
        center={center}
        zoom={8}
        zoomControl={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        dragging={false}
        className="w-full h-full"
      >
        <ChangeView center={center} />
        
        {/* Dark Map Tiles */}
        <TileLayer
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <CircleMarker
          center={center}
          radius={8}
          pathOptions={{
            fillColor: color,
            fillOpacity: 0.8,
            color: color,
            weight: 2,
            opacity: 0.4,
          }}
        />
      </MapContainer>
    </div>
  );
}
