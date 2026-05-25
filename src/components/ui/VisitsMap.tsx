'use client';

import { useEffect, useRef } from 'react';

type VisitPin = {
  id: string;
  lat: number;
  lng: number;
  retailerName: string;
  agentName: string;
  visitedAt: string;
};

interface VisitsMapProps {
  pins: VisitPin[];
}

export function VisitsMap({ pins }: VisitsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamic import — Leaflet must never run on the server
    import('leaflet').then((L) => {
      // Fix default marker icon paths broken by webpack/Next.js bundling
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const defaultCenter: [number, number] =
        pins.length > 0
          ? [pins[0].lat, pins[0].lng]
          : [20.5937, 78.9629]; // Centre of India

      const map = L.map(mapRef.current!).setView(
        defaultCenter,
        pins.length > 0 ? 13 : 5
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      pins.forEach((pin) => {
        const time = new Date(pin.visitedAt).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        });
        L.marker([pin.lat, pin.lng])
          .addTo(map)
          .bindPopup(
            `<div style="font-family:system-ui;font-size:13px;line-height:1.6">
              <strong style="color:#1e293b;font-size:14px">${pin.retailerName}</strong><br/>
              <span style="color:#475569">Agent: ${pin.agentName}</span><br/>
              <span style="color:#64748b">&#128205; ${pin.lat.toFixed(4)}, ${pin.lng.toFixed(4)}</span><br/>
              <span style="color:#64748b">&#128336; ${time}</span>
            </div>`
          );
      });

      mapInstanceRef.current = map;
    });

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  // Re-run only when pins change (deep equality not needed — parent re-renders pass new array)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative">
      {/* Leaflet CSS loaded inline to avoid Next.js global CSS restrictions on client components */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <div
        ref={mapRef}
        className="w-full rounded-xl border border-slate-800"
        style={{ height: '480px' }}
        aria-label="Field visits map"
        role="region"
      />
      {pins.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/85 rounded-xl gap-2">
          <svg
            className="h-8 w-8 text-slate-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
            />
          </svg>
          <p className="text-slate-400 text-sm">
            No GPS coordinates for selected filters
          </p>
        </div>
      )}
    </div>
  );
}
