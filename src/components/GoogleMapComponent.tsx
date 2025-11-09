import { useEffect, useRef, useState } from "react";
import { MapApiKeyRequired } from "./MapApiKeyRequired";

interface Hazard {
  id: string;
  lat: number;
  lng: number;
  severity: "high" | "medium";
  type: string;
}

interface GoogleMapComponentProps {
  onHazardClick: () => void;
}

// Dark mode map styling
const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8b93a7" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#a1a9b8" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6f7785" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#1e3a2e" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#5a7d6b" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#2a2d3e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2233" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#2e3447" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2233" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#b8bdc7" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#1f2233" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6f7785" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0f1621" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4a5568" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#0f1621" }],
  },
];

export function GoogleMapComponent({ onHazardClick }: GoogleMapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [needsApiKey, setNeedsApiKey] = useState(false);

  // Sample hazards - in a real app, these would come from your backend
  const hazards: Hazard[] = [
    { id: "1", lat: 37.7749, lng: -122.4194, severity: "high", type: "Pothole" },
    { id: "2", lat: 37.7779, lng: -122.4194, severity: "medium", type: "Debris" },
    { id: "3", lat: 37.7809, lng: -122.4194, severity: "high", type: "Pothole" },
  ];

  const centerPosition = { lat: 37.7759, lng: -122.4194 }; // San Francisco

  useEffect(() => {
    // Load Google Maps script
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
        return;
      }

      const API_KEY = "YOUR_API_KEY_HERE";
      
      // Check if API key needs to be configured
      if (API_KEY === "YOUR_API_KEY_HERE") {
        setNeedsApiKey(true);
        return;
      }

      const script = document.createElement("script");
      // ⚠️ IMPORTANT: Replace YOUR_API_KEY_HERE with your actual Google Maps API key
      // Get your API key from: https://developers.google.com/maps/documentation/javascript/get-api-key
      // Enable the following APIs: Maps JavaScript API, Geometry API
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=marker,geometry&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Add a small delay to ensure libraries are loaded
        setTimeout(() => setIsLoaded(true), 100);
      };
      script.onerror = () => {
        console.error("Failed to load Google Maps. Please check your API key.");
        setHasError(true);
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();

    // Listen for Google Maps errors
    const errorHandler = (e: ErrorEvent) => {
      if (e.message && e.message.includes("Google Maps")) {
        setHasError(true);
      }
    };
    window.addEventListener("error", errorHandler);

    return () => {
      window.removeEventListener("error", errorHandler);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || map) return;

    // Initialize map
    const newMap = new google.maps.Map(mapRef.current, {
      center: centerPosition,
      zoom: 14,
      styles: darkMapStyles,
      disableDefaultUI: true,
      zoomControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    setMap(newMap);

    // Create custom overlay for vehicle (no deprecated Marker API)
    const vehicleOverlay = document.createElement("div");
    vehicleOverlay.className = "vehicle-marker";
    vehicleOverlay.innerHTML = `
      <div style="position: relative; width: 48px; height: 48px;">
        <div style="
          position: absolute;
          width: 48px;
          height: 48px;
          background: #0070E1;
          border-radius: 50%;
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          opacity: 0.3;
        "></div>
        <div style="
          position: relative;
          width: 32px;
          height: 32px;
          background: #0070E1;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 15px -3px rgba(0, 112, 225, 0.5);
          margin: 8px;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
            <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
          </svg>
        </div>
      </div>
    `;

    const vehicleOverlayInstance = new google.maps.OverlayView();
    vehicleOverlayInstance.onAdd = function () {
      const panes = this.getPanes();
      panes?.overlayMouseTarget.appendChild(vehicleOverlay);
    };
    vehicleOverlayInstance.draw = function () {
      const projection = this.getProjection();
      const position = projection.fromLatLngToDivPixel(centerPosition);
      if (position) {
        vehicleOverlay.style.left = position.x - 24 + "px";
        vehicleOverlay.style.top = position.y - 24 + "px";
        vehicleOverlay.style.position = "absolute";
      }
    };
    vehicleOverlayInstance.setMap(newMap);

    // Add hazard markers
    hazards.forEach((hazard) => {
      const markerDiv = document.createElement("div");
      markerDiv.style.cursor = "pointer";
      
      const color = hazard.severity === "high" ? "#EF4444" : "#F59E0B";
      const pulseAnimation = hazard.severity === "high" ? "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" : "none";
      
      markerDiv.innerHTML = `
        <div style="position: relative; width: 40px; height: 40px;">
          ${hazard.severity === "high" ? `
            <div style="
              position: absolute;
              width: 40px;
              height: 40px;
              background: ${color};
              border-radius: 50%;
              animation: ${pulseAnimation};
              opacity: 0.4;
            "></div>
          ` : ''}
          <div style="
            position: relative;
            width: 24px;
            height: 24px;
            background: ${color};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
            border: 2px solid white;
            margin: 8px;
          ">
            ${hazard.severity === "high" ? `
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            ` : `
              <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
            `}
          </div>
        </div>
      `;

      markerDiv.addEventListener("click", () => {
        if (hazard.id === "1") {
          onHazardClick();
        }
      });

      const overlay = new google.maps.OverlayView();
      overlay.onAdd = function () {
        const panes = this.getPanes();
        panes?.overlayMouseTarget.appendChild(markerDiv);
      };
      overlay.draw = function () {
        const projection = this.getProjection();
        const position = projection.fromLatLngToDivPixel({ lat: hazard.lat, lng: hazard.lng });
        if (position) {
          markerDiv.style.left = position.x - 20 + "px";
          markerDiv.style.top = position.y - 20 + "px";
          markerDiv.style.position = "absolute";
        }
      };
      overlay.setMap(newMap);
    });

    // Draw route polyline
    const routePath = [
      centerPosition,
      { lat: 37.7779, lng: -122.4194 },
      { lat: 37.7809, lng: -122.4194 },
    ];

    new google.maps.Polyline({
      path: routePath,
      geodesic: true,
      strokeColor: "#0070E1",
      strokeOpacity: 0.6,
      strokeWeight: 4,
      map: newMap,
    });
  }, [isLoaded, map, onHazardClick]);

  // Show API key setup guide if needed
  if (needsApiKey) {
    return <MapApiKeyRequired />;
  }

  // Show error message if map failed to load
  if (hasError) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-2 p-4">
          <div className="text-red-400">Failed to load Google Maps</div>
          <div className="text-slate-400 text-sm">Please check your API key and try again</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-slate-400">Loading map...</div>
        </div>
      )}
      <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
