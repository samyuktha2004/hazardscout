import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Accept either key name to be tolerant of .env.example vs code references
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || import.meta.env.VITE_MAPBOX_TOKEN || '';

interface MapPreviewProps {
  className?: string;
  center?: [number, number];
  onClick?: () => void;
  showUser?: boolean;
}

export function MapPreview({ className = 'w-36 h-24 rounded-md overflow-hidden', center, onClick, showUser = true }: MapPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!MAPBOX_TOKEN) return; // don't initialize without token

    mapboxgl.accessToken = MAPBOX_TOKEN;

    try {
      // Use `as any` to avoid strict Mapbox type mismatches in this project setup.
      mapRef.current = new mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: center || [77.2090, 28.6139],
        zoom: 12,
        // interactive is the default when omitted; avoid strict type checks
        attributionControl: false,
      } as any);

      // Add a small zoom control (cast to any to avoid typing differences)
      (mapRef.current as any).addControl(new (mapboxgl as any).NavigationControl(), 'top-right');

      if (showUser && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const loc: [number, number] = [pos.coords.longitude, pos.coords.latitude];
          (mapRef.current as any)?.setCenter(loc);

          // add a small user marker
          const el = document.createElement('div');
          el.className = 'w-3 h-3 rounded-full bg-[#0070E1] border-2 border-white shadow';
          el.style.boxSizing = 'border-box';

          new (mapboxgl as any).Marker({ element: el }).setLngLat(loc).addTo(mapRef.current as any);
        });
      }
    } catch (err) {
      // fail silently if map can't be created
      console.error('MapPreview init error', err);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, showUser]);

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}
      className={`cursor-pointer ${className}`}
      ref={containerRef}
      aria-hidden
    />
  );
}
