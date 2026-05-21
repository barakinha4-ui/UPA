'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { UapDocument } from '@/types/database';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { SlidersHorizontal, MapPin, Calendar, Eye, ShieldAlert, ChevronDown } from 'lucide-react';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

interface IncidentMapProps {
  documents: UapDocument[];
  locale: 'pt' | 'en';
}

const MAP_AGENCY_COLORS: Record<string, string> = {
  DOW: '#60a5fa', // blue-400
  FBI: '#fbbf24', // amber-400
  NASA: '#22d3ee', // cyan-400
  CIA: '#f43f5e', // rose-500
  ODNI: '#c084fc', // purple-400
  STATE: '#34d399', // emerald-400
  DOE: '#fb923c', // orange-400
  USAF: '#38bdf8', // sky-400
  USN: '#818cf8', // indigo-400
  OTHER: '#9ca3af', // gray-400
};

// Component to dynamically adjust map center/zoom based on filtered items
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function IncidentMap({ documents, locale }: IncidentMapProps) {
  const tDoc = useTranslations('document');
  const [selectedAgency, setSelectedAgency] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  // Map Filter Options
  const agencies = ['DOW', 'FBI', 'NASA', 'STATE', 'CIA', 'ODNI', 'DOE', 'OTHER'];
  const years = Array.from(
    new Set(documents.map((d) => d.incident_year).filter(Boolean) as number[])
  ).sort((a, b) => b - a);

  // Apply filters client-side for immediate map reactivity
  const filteredDocs = documents.filter((doc) => {
    if (selectedAgency && doc.agency !== selectedAgency) return false;
    if (selectedYear && doc.incident_year?.toString() !== selectedYear) return false;
    return true;
  });

  // Default focus (coordinates of United States or central Atlantic)
  const defaultCenter: [number, number] = [30, -40];
  const defaultZoom = 3;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem-64px)] relative w-full overflow-hidden">
      {/* Absolute Header Overlay with Filters */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-[#0a0a0f]/90 backdrop-blur-md border border-[#c8a96e]/20 p-4 rounded shadow-2xl">
        {/* Title */}
        <div className="flex items-center space-x-2 font-mono text-sm tracking-wider text-[#e8e8e0]">
          <ShieldAlert className="h-5 w-5 text-[#c8a96e] animate-pulse" />
          <span className="font-bold uppercase">Tactical Situation Map // PURSUE-MAP</span>
          <span className="text-[10px] bg-[#cc3333] text-white px-1.5 py-0.5 rounded font-bold">
            {filteredDocs.length} Pings
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch">
          {/* Agency Filter */}
          <div className="relative">
            <select
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
              className="w-full sm:w-44 font-mono text-xs bg-black/80 border border-[#e8e8e0]/10 hover:border-[#c8a96e]/30 rounded px-3 py-2 text-[#e8e8e0]/80 focus:border-[#c8a96e] focus:outline-none appearance-none cursor-pointer"
            >
              <option value="">{tDoc('agency')}: All</option>
              {agencies.map((agency) => (
                <option key={agency} value={agency}>
                  {agency}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 h-3.5 w-3.5 text-[#e8e8e0]/40 pointer-events-none" />
          </div>

          {/* Year Filter */}
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full sm:w-40 font-mono text-xs bg-black/80 border border-[#e8e8e0]/10 hover:border-[#c8a96e]/30 rounded px-3 py-2 text-[#e8e8e0]/80 focus:border-[#c8a96e] focus:outline-none appearance-none cursor-pointer"
            >
              <option value="">Year: All</option>
              {years.map((y) => (
                <option key={y} value={y.toString()}>
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 h-3.5 w-3.5 text-[#e8e8e0]/40 pointer-events-none" />
          </div>

          {/* Reset Filters */}
          {(selectedAgency || selectedYear) && (
            <button
              onClick={() => {
                setSelectedAgency('');
                setSelectedYear('');
              }}
              className="font-mono text-[10px] uppercase font-bold text-[#cc3333] border border-[#cc3333]/20 hover:border-[#cc3333]/40 bg-[#cc3333]/5 px-3 py-2 rounded transition-colors"
            >
              Reset Map
            </button>
          )}
        </div>
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        zoomControl={false}
        className="w-full h-full z-0 bg-[#07070a]"
      >
        <ChangeView center={defaultCenter} zoom={defaultZoom} />
        
        {/* Dark Map Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Map Cluster for grouped markers */}
        <MarkerClusterGroup
          chunkedLoading
          showCoverageOnHover={false}
          maxClusterRadius={40}
        >
          {filteredDocs.map((doc) => {
            if (doc.lat === null || doc.lng === null) return null;
            
            const color = MAP_AGENCY_COLORS[doc.agency] || MAP_AGENCY_COLORS.OTHER;
            const title = locale === 'pt' ? doc.title_pt : doc.title_en;

            return (
              <CircleMarker
                key={doc.id}
                center={[doc.lat, doc.lng]}
                radius={8}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.8,
                  color: color,
                  weight: 2,
                  opacity: 0.4,
                }}
              >
                {/* Tactical Radar Popup */}
                <Popup className="tactical-map-popup">
                  <div className="bg-[#0a0a0f] border border-[#c8a96e]/20 text-[#e8e8e0] rounded overflow-hidden shadow-2xl p-4 min-w-[240px] max-w-[280px]">
                    
                    {/* Visual header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[9px] font-bold tracking-widest text-[#c8a96e] border border-[#c8a96e]/20 px-1 py-0.5 rounded bg-[#c8a96e]/5 uppercase">
                        {doc.agency}
                      </span>
                      <span className="font-mono text-[9px] text-[#e8e8e0]/40">
                        {doc.official_id || 'UAP-CASE'}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="font-serif text-sm font-bold text-[#e8e8e0] mb-2 hover:text-[#c8a96e] leading-snug line-clamp-2">
                      {title}
                    </h4>

                    {/* Details list */}
                    <div className="space-y-1.5 mb-3.5 text-[10px] font-mono text-[#e8e8e0]/60">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="h-3 w-3 text-[#c8a96e]/70" />
                        <span className="truncate">{doc.location_name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="h-3 w-3 text-[#c8a96e]/70" />
                        <span>{doc.incident_date || doc.incident_year || 'Unknown'}</span>
                      </div>
                    </div>

                    {/* Link Button */}
                    <Link
                      href={`/documentos/${doc.slug}`}
                      className="w-full flex items-center justify-center font-mono text-[10px] uppercase font-bold text-center border border-[#c8a96e]/30 hover:border-[#c8a96e] hover:bg-[#c8a96e]/10 py-1.5 rounded transition-colors text-[#e8e8e0]"
                    >
                      Analyze Records &rarr;
                    </Link>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Styled custom CSS injection for Leaflet map styling */}
      <style jsx global>{`
        .leaflet-popup-content-wrapper,
        .leaflet-popup-tip {
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
          padding: 0 !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
        .leaflet-popup-close-button {
          color: #e8e8e0 !important;
          font-size: 14px !important;
          top: 8px !important;
          right: 8px !important;
        }
        /* Tactical marker clusters */
        .marker-cluster-small,
        .marker-cluster-medium,
        .marker-cluster-large {
          background-color: rgba(10, 10, 15, 0.6) !important;
          border: 1px solid rgba(200, 169, 110, 0.3) !important;
        }
        .marker-cluster-small div,
        .marker-cluster-medium div,
        .marker-cluster-large div {
          background-color: rgba(200, 169, 110, 0.15) !important;
          color: #e8e8e0 !important;
          font-family: monospace !important;
          font-weight: bold !important;
        }
      `}</style>
    </div>
  );
}
