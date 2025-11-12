import React from 'react';
import GoogleMapWrapper from './GoogleMapWrapper';

interface MapPreviewProps {
  className?: string;
  center?: [number, number];
  onClick?: () => void;
  showUser?: boolean;
}

export function MapPreview({ className = 'w-36 h-24 rounded-md overflow-hidden', center, onClick, showUser = true }: MapPreviewProps) {
  const mapCenter = center 
    ? { lat: center[1], lng: center[0] } 
    : { lat: 28.6139, lng: 77.2090 };

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}
      className={`cursor-pointer ${className}`}
      aria-hidden
    >
      <GoogleMapWrapper 
        center={mapCenter}
        zoom={12}
        markers={[]}
      />
    </div>
  );
}

