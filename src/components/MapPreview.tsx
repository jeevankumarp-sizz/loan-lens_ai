'use client';
import React, { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

interface MapPreviewProps {
  lat: number;
  lng: number;
  locationName?: string;
}

export default function MapPreview({ lat, lng, locationName = 'Nashik, Maharashtra' }: MapPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    // Dynamically import leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }

      // Fix default icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        center: [lat, lng],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      const customIcon = L.divIcon({
        html: `<div style="background:var(--primary,#2563eb);width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        className: '',
      });

      L.marker([lat, lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`<b>Asset Location</b><br/>${locationName}<br/><small>${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E</small>`)
        .openPopup();

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, locationName]);

  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
      {/* Map header */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b"
        style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}
      >
        <MapPin size={13} style={{ color: 'var(--accent)' }} />
        <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>
          {locationName}
        </span>
        <span className="ml-auto text-[10px] tabular-nums" style={{ color: 'var(--muted-foreground)' }}>
          {lat.toFixed(4)}°N, {lng.toFixed(4)}°E
        </span>
      </div>
      {/* Map container */}
      <div ref={mapRef} style={{ height: '180px', width: '100%' }} />
      {/* Leaflet CSS */}
      <style>{`
        @import url('https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css');
        .leaflet-container { font-family: inherit; }
        .leaflet-popup-content-wrapper { border-radius: 12px; font-size: 12px; }
      `}</style>
    </div>
  );
}
