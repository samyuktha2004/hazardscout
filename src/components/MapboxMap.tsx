// Mapbox GL Integration for Hazard Scout with Navigation & Real-time Warnings
import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { HazardData } from './HazardService';
import { getMarkerIcon, VehicleMarker } from './MapMarkerIcons';
import { createRoot } from 'react-dom/client';
import { Navigation, X, AlertTriangle, MapPin, Locate, Search, Route as RouteIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';

// Mapbox access token - REPLACE WITH YOUR ACTUAL TOKEN
// Get your token at: https://account.mapbox.com/access-tokens/
const MAPBOX_TOKEN = 'pk.eyJ1IjoiaGFyaXNzaCIsImEiOiJjbWhseDllNTkwaGIxMmlxa3FmM3VwbHl2In0.XUjNuUn7OSsR_35T2i6Frg';

interface MapboxMapProps {
  hazards: HazardData[];
  onHazardClick?: (hazard: HazardData) => void;
  viewMode?: 'widget' | 'fullscreen';
  className?: string;
  enableNavigation?: boolean;
  enableProximityWarnings?: boolean;
  onStartLiveNavigation?: (start: [number, number], dest: [number, number], destName: string) => void;
}

interface LocationSuggestion {
  id: string;
  place_name: string;
  center: [number, number];
}

// Calculate distance between two coordinates in meters
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Check if a point is near a route (within buffer distance)
function isPointNearRoute(
  point: [number, number],
  routeCoordinates: [number, number][],
  bufferMeters: number = 100
): boolean {
  for (const routePoint of routeCoordinates) {
    const distance = calculateDistance(
      point[1], point[0],
      routePoint[1], routePoint[0]
    );
    if (distance <= bufferMeters) {
      return true;
    }
  }
  return false;
}

export function MapboxMap({ 
  hazards, 
  onHazardClick, 
  viewMode = 'fullscreen',
  className = '',
  enableNavigation = true,
  enableProximityWarnings = true,
  onStartLiveNavigation
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [navigationRoute, setNavigationRoute] = useState<any>(null);
  const [navigationDestination, setNavigationDestination] = useState<HazardData | null>(null);
  const [warningHazards, setWarningHazards] = useState<Set<string>>(new Set());
  const routeSourceId = useRef<string>('route');
  
  // Location search states
  const [startLocation, setStartLocation] = useState<string>('');
  const [destinationLocation, setDestinationLocation] = useState<string>('');
  const [startCoords, setStartCoords] = useState<[number, number] | null>(null);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
  const [startSuggestions, setStartSuggestions] = useState<LocationSuggestion[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<LocationSuggestion[]>([]);
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [isSearchingRoute, setIsSearchingRoute] = useState(false);
  const [routeHazards, setRouteHazards] = useState<HazardData[]>([]);
  
  // Default center (Delhi coordinates)
  const defaultCenter: [number, number] = [77.2090, 28.6139];
  
  // Check if we have a valid Mapbox token
  const hasValidToken = MAPBOX_TOKEN && 
    MAPBOX_TOKEN !== 'YOUR_MAPBOX_TOKEN_HERE' && 
    !MAPBOX_TOKEN.includes('example') &&
    (MAPBOX_TOKEN.startsWith('pk.') || MAPBOX_TOKEN.startsWith('sk.'));
  
  // Get user's current location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos: [number, number] = [
            position.coords.longitude, 
            position.coords.latitude
          ];
          setUserLocation(userPos);
          setStartCoords(userPos);
          setStartLocation('Current Location');
        },
        (error) => {
          console.log('Geolocation not available, using default location');
        }
      );

      // Watch position for real-time updates
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const userPos: [number, number] = [
            position.coords.longitude, 
            position.coords.latitude
          ];
          setUserLocation(userPos);
          // Update start coords if still using current location
          if (startLocation === 'Current Location') {
            setStartCoords(userPos);
          }
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [startLocation]);

  // Geocoding: Search for location using Mapbox Geocoding API
  const searchLocation = useCallback(async (query: string, isStart: boolean) => {
    if (!query || query.length < 3 || !hasValidToken) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=5`
      );
      const data = await response.json();
      
      if (data.features) {
        const suggestions: LocationSuggestion[] = data.features.map((feature: any) => ({
          id: feature.id,
          place_name: feature.place_name,
          center: feature.center
        }));
        
        if (isStart) {
          setStartSuggestions(suggestions);
          setShowStartSuggestions(true);
        } else {
          setDestSuggestions(suggestions);
          setShowDestSuggestions(true);
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  }, [hasValidToken]);

  // Debounced search for start location
  useEffect(() => {
    if (startLocation && startLocation !== 'Current Location') {
      const timer = setTimeout(() => {
        searchLocation(startLocation, true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [startLocation, searchLocation]);

  // Debounced search for destination
  useEffect(() => {
    if (destinationLocation) {
      const timer = setTimeout(() => {
        searchLocation(destinationLocation, false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [destinationLocation, searchLocation]);

  // Use current location as start
  const useCurrentLocation = useCallback(() => {
    if (userLocation) {
      setStartCoords(userLocation);
      setStartLocation('Current Location');
      setShowStartSuggestions(false);
      toast.success('Using current location');
    } else {
      toast.error('Location not available. Please enable location services.');
    }
  }, [userLocation]);

  // Select suggestion
  const selectSuggestion = useCallback((suggestion: LocationSuggestion, isStart: boolean) => {
    if (isStart) {
      setStartLocation(suggestion.place_name);
      setStartCoords(suggestion.center);
      setShowStartSuggestions(false);
    } else {
      setDestinationLocation(suggestion.place_name);
      setDestCoords(suggestion.center);
      setShowDestSuggestions(false);
    }
  }, []);

  // Fetch route between start and destination
  const fetchRouteWithHazards = useCallback(async () => {
    if (!startCoords || !destCoords || !hasValidToken) {
      if (!startCoords) toast.error('Please select a start location');
      if (!destCoords) toast.error('Please select a destination');
      return;
    }

    setIsSearchingRoute(true);
    
    try {
      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoords[0]},${startCoords[1]};${destCoords[0]},${destCoords[1]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`,
        { method: 'GET' }
      );
      const json = await query.json();
      
      if (json.routes && json.routes.length > 0) {
        const route = json.routes[0];
        
        // If onStartLiveNavigation is provided, start live navigation instead of showing route preview
        if (onStartLiveNavigation) {
          onStartLiveNavigation(startCoords, destCoords, destinationLocation);
          setIsSearchingRoute(false);
          return;
        }
        
        setNavigationRoute(route);
        
        // Find hazards along the route
        const routeCoordinates = route.geometry.coordinates;
        const hazardsOnRoute = hazards.filter(hazard => 
          isPointNearRoute(
            [hazard.location.longitude, hazard.location.latitude],
            routeCoordinates,
            100 // 100m buffer
          )
        );
        
        setRouteHazards(hazardsOnRoute);
        
        // Show route info
        const distance = (route.distance / 1000).toFixed(1);
        const duration = Math.round(route.duration / 60);
        const hazardCount = hazardsOnRoute.length;
        
        toast.success(`Route found: ${distance} km, ${duration} min`, {
          description: hazardCount > 0 
            ? `⚠️ ${hazardCount} hazard${hazardCount > 1 ? 's' : ''} detected on route`
            : '✓ No hazards detected on route',
          duration: 5000,
        });

        // Fit map to show the entire route
        if (map.current) {
          const coordinates = routeCoordinates;
          const bounds = coordinates.reduce((bounds: any, coord: any) => {
            return bounds.extend(coord);
          }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
          
          map.current.fitBounds(bounds, {
            padding: { top: 100, bottom: 100, left: 50, right: 50 }
          });
        }
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      toast.error('Unable to calculate route');
    } finally {
      setIsSearchingRoute(false);
    }
  }, [startCoords, destCoords, hasValidToken, hazards, onStartLiveNavigation, destinationLocation]);

  // Check proximity to hazards and show warnings
  useEffect(() => {
    if (!enableProximityWarnings || !userLocation) return;

    const checkProximity = () => {
      hazards.forEach(hazard => {
        const distance = calculateDistance(
          userLocation[1], // latitude
          userLocation[0], // longitude
          hazard.location.latitude,
          hazard.location.longitude
        );

        // Warn if within 500 meters and haven't warned yet
        if (distance < 500 && !warningHazards.has(hazard.id)) {
          setWarningHazards(prev => new Set(prev).add(hazard.id));
          
          // Show warning toast
          toast.warning(`Hazard Ahead: ${hazard.type}`, {
            description: `${Math.round(distance)}m ahead - ${hazard.locationName}`,
            duration: 5000,
            action: {
              label: 'View',
              onClick: () => onHazardClick?.(hazard),
            },
          });
        } else if (distance > 1000 && warningHazards.has(hazard.id)) {
          // Remove from warned set if moved far away
          setWarningHazards(prev => {
            const newSet = new Set(prev);
            newSet.delete(hazard.id);
            return newSet;
          });
        }
      });
    };

    checkProximity();
    const interval = setInterval(checkProximity, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [userLocation, hazards, enableProximityWarnings, warningHazards, onHazardClick]);

  // Handle navigation to hazard
  const navigateToHazard = useCallback((hazard: HazardData) => {
    const destination: [number, number] = [hazard.location.longitude, hazard.location.latitude];
    setNavigationDestination(hazard);
    setDestCoords(destination);
    setDestinationLocation(hazard.locationName);
    
    if (startCoords) {
      fetchRouteWithHazards();
    }
  }, [startCoords, fetchRouteWithHazards]);

  // Clear navigation
  const clearNavigation = useCallback(() => {
    setNavigationRoute(null);
    setNavigationDestination(null);
    setRouteHazards([]);
    setStartLocation('');
    setDestinationLocation('');
    setStartCoords(null);
    setDestCoords(null);
    
    // Remove route layer from map
    if (map.current && map.current.getLayer('route')) {
      map.current.removeLayer('route');
    }
    if (map.current && map.current.getSource(routeSourceId.current)) {
      map.current.removeSource(routeSourceId.current);
    }
    
    toast.info('Navigation cleared');
  }, []);

  // Initialize Mapbox
  useEffect(() => {
    // If no valid token, use fallback immediately
    if (!hasValidToken) {
      setUseFallback(true);
      console.warn('⚠️ Valid Mapbox token required. Please add your token to enable real-time maps.');
      return;
    }

    if (!mapContainer.current) return;

    // Initialize map with valid token
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    try {
      const center = userLocation || defaultCenter;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: center,
        zoom: viewMode === 'widget' ? 12 : 13,
        pitch: viewMode === 'fullscreen' ? 45 : 0,
        bearing: 0,
        attributionControl: false,
      });

      // Add navigation controls for fullscreen mode
      if (viewMode === 'fullscreen') {
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        // Add geolocate control only if geolocation is actually working
        if ('geolocation' in navigator) {
          // Test if geolocation actually works before adding control
          navigator.geolocation.getCurrentPosition(
            () => {
              // Geolocation works, add the control with warning suppression
              const originalWarn = console.warn;
              const originalError = console.error;
              
              // Suppress Mapbox geolocation warnings
              console.warn = (...args: any[]) => {
                const message = args[0]?.toString() || '';
                if (!message.includes('Geolocation') && !message.includes('geolocation')) {
                  originalWarn.apply(console, args);
                }
              };
              console.error = (...args: any[]) => {
                const message = args[0]?.toString() || '';
                if (!message.includes('Geolocation') && !message.includes('geolocation')) {
                  originalError.apply(console, args);
                }
              };
              
              try {
                if (map.current) {
                  const geolocateControl = new mapboxgl.GeolocateControl({
                    positionOptions: {
                      enableHighAccuracy: true
                    },
                    trackUserLocation: true,
                    showUserHeading: true
                  });
                  map.current.addControl(geolocateControl, 'top-right');
                }
              } catch (error) {
                // Silently handle any errors
              }
              
              // Keep suppression active for 1 second to catch async warnings
              setTimeout(() => {
                console.warn = originalWarn;
                console.error = originalError;
              }, 1000);
            },
            () => {
              // Geolocation not available or denied, skip the control silently
            },
            { timeout: 5000 }
          );
        }
      }

      // Disable map interactions for widget mode
      if (viewMode === 'widget') {
        map.current.scrollZoom.disable();
        map.current.boxZoom.disable();
        map.current.dragRotate.disable();
        map.current.dragPan.disable();
        map.current.keyboard.disable();
        map.current.doubleClickZoom.disable();
        map.current.touchZoomRotate.disable();
      }

      // Handle errors - fall back to static map
      map.current.on('error', () => {
        setUseFallback(true);
      });

    } catch (error) {
      console.error('Error initializing Mapbox:', error);
      setUseFallback(true);
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [viewMode, hasValidToken]);

  // Update map center when user location changes
  useEffect(() => {
    if (map.current && userLocation && !useFallback && !navigationRoute) {
      map.current.flyTo({
        center: userLocation,
        zoom: 14,
        duration: 1500
      });
    }
  }, [userLocation, useFallback, navigationRoute]);

  // Update navigation route on map
  useEffect(() => {
    if (!map.current || !navigationRoute || useFallback) return;

    map.current.on('load', () => {
      if (!map.current) return;

      // Remove existing route if any
      if (map.current.getLayer('route')) {
        map.current.removeLayer('route');
      }
      if (map.current.getSource(routeSourceId.current)) {
        map.current.removeSource(routeSourceId.current);
      }

      // Add route source
      map.current.addSource(routeSourceId.current, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: navigationRoute.geometry
        }
      });

      // Add route layer
      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: routeSourceId.current,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#0070E1',
          'line-width': 5,
          'line-opacity': 0.8
        }
      });
    });

    // If map already loaded, add route immediately
    if (map.current.isStyleLoaded()) {
      // Remove existing route if any
      if (map.current.getLayer('route')) {
        map.current.removeLayer('route');
      }
      if (map.current.getSource(routeSourceId.current)) {
        map.current.removeSource(routeSourceId.current);
      }

      // Add route source
      map.current.addSource(routeSourceId.current, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: navigationRoute.geometry
        }
      });

      // Add route layer
      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: routeSourceId.current,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#0070E1',
          'line-width': 5,
          'line-opacity': 0.8
        }
      });
    }
  }, [navigationRoute, useFallback]);

  // Update markers when hazards change
  useEffect(() => {
    if (!map.current || useFallback) return;

    // Remove old markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const center = userLocation || defaultCenter;

    // Add user location marker
    if (userLocation) {
      const vehicleEl = document.createElement('div');
      const vehicleRoot = createRoot(vehicleEl);
      vehicleRoot.render(<VehicleMarker className="w-8 h-8" />);
      
      try {
        const vehicleMarker = new mapboxgl.Marker({ 
          element: vehicleEl, 
          anchor: 'center',
          rotationAlignment: 'map'
        })
          .setLngLat(userLocation)
          .addTo(map.current);
        markersRef.current.push(vehicleMarker);
      } catch (error) {
        console.error('Error adding vehicle marker:', error);
      }
    }

    // Add destination marker if exists
    if (destCoords && !navigationDestination) {
      const destEl = document.createElement('div');
      destEl.className = 'w-8 h-8 bg-[#0070E1] rounded-full border-4 border-white shadow-lg';
      
      try {
        const destMarker = new mapboxgl.Marker({ 
          element: destEl, 
          anchor: 'center'
        })
          .setLngLat(destCoords)
          .addTo(map.current);
        markersRef.current.push(destMarker);
      } catch (error) {
        console.error('Error adding destination marker:', error);
      }
    }

    // Add hazard markers
    hazards.forEach((hazard, index) => {
      const el = document.createElement('div');
      el.className = 'hazard-marker cursor-pointer hover:scale-110 transition-transform';
      
      const root = createRoot(el);
      const MarkerComponent = getMarkerComponent(hazard);
      
      // Check if hazard is on route
      const isOnRoute = routeHazards.some(h => h.id === hazard.id);
      
      // Pulse animation for nearby hazards or hazards on route
      const distance = userLocation ? calculateDistance(
        userLocation[1],
        userLocation[0],
        hazard.location.latitude,
        hazard.location.longitude
      ) : Infinity;
      
      const isNearby = distance < 500;
      
      root.render(
        <div className={isNearby || isOnRoute ? 'animate-pulse' : ''}>
          {isOnRoute && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></div>
          )}
          <MarkerComponent className={viewMode === 'widget' ? 'w-4 h-4' : 'w-8 h-8'} />
        </div>
      );

      // Add click handler
      el.addEventListener('click', () => {
        if (onHazardClick) {
          onHazardClick(hazard);
        }
      });

      try {
        const marker = new mapboxgl.Marker({ 
          element: el, 
          anchor: 'bottom'
        })
          .setLngLat([hazard.location.longitude, hazard.location.latitude])
          .addTo(map.current!);
        
        markersRef.current.push(marker);
      } catch (error) {
        console.error('Error adding hazard marker:', error);
      }
    });

  }, [hazards, useFallback, onHazardClick, viewMode, userLocation, destCoords, navigationDestination, routeHazards]);

  // Fallback static map view (shown when Mapbox isn't available)
  const FallbackMap = () => (
    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(0,112,225,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,112,225,0.1)_1px,transparent_1px)] bg-[size:30px_30px]" />
      
      {/* Simulated road network */}
      <svg className="absolute inset-0 w-full h-full opacity-30">
        <line x1="0" y1="40%" x2="100%" y2="40%" stroke="#475569" strokeWidth="2" />
        <line x1="0" y1="60%" x2="100%" y2="60%" stroke="#475569" strokeWidth="2" />
        <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#475569" strokeWidth="2" />
        <line x1="70%" y1="0" x2="70%" y2="100%" stroke="#475569" strokeWidth="2" />
      </svg>

      {/* Vehicle marker at center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <VehicleMarker className={viewMode === 'widget' ? 'w-6 h-6' : 'w-10 h-10'} />
      </div>

      {/* Hazard markers */}
      {hazards.slice(0, viewMode === 'widget' ? 3 : 10).map((hazard, index) => {
        const MarkerComponent = getMarkerComponent(hazard);
        // Position hazards in a circle around the vehicle
        const angle = (index / Math.min(hazards.length, 10)) * Math.PI * 2;
        const radius = viewMode === 'widget' ? 35 : 30;
        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);
        
        return (
          <div
            key={hazard.id}
            onClick={(e) => {
              if (viewMode === 'fullscreen' && onHazardClick) {
                e.stopPropagation();
                onHazardClick(hazard);
              }
            }}
            className={`absolute transition-transform ${
              viewMode === 'fullscreen' ? 'hover:scale-110 cursor-pointer' : 'pointer-events-none'
            }`}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <MarkerComponent className={viewMode === 'widget' ? 'w-5 h-5' : 'w-8 h-8'} />
          </div>
        );
      })}

      {/* Distance circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-48 sm:h-48 border border-[#0070E1]/20 rounded-full pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-72 sm:h-72 border border-[#0070E1]/10 rounded-full pointer-events-none"></div>
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      {useFallback ? (
        <FallbackMap />
      ) : (
        <>
          {/* Location Search Panel - Only show in fullscreen mode */}
          {viewMode === 'fullscreen' && (
            <div className="absolute top-4 left-4 right-4 z-40">
              <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-[#0070E1]/30">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Start Location */}
                    <div className="relative">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-[#0070E1] flex-shrink-0" />
                        <Input
                          placeholder="Start location"
                          value={startLocation}
                          onChange={(e) => setStartLocation(e.target.value)}
                          onFocus={() => setShowStartSuggestions(true)}
                          className="flex-1 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500"
                        />
                        <Button
                          onClick={useCurrentLocation}
                          variant="outline"
                          size="sm"
                          className="flex-shrink-0"
                        >
                          <Locate className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Start Suggestions */}
                      {showStartSuggestions && startSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 max-h-48 overflow-y-auto z-50">
                          {startSuggestions.map((suggestion) => (
                            <button
                              key={suggestion.id}
                              onClick={() => selectSuggestion(suggestion, true)}
                              className="w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 text-sm text-[#1F2F57] dark:text-slate-200"
                            >
                              {suggestion.place_name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Destination Location */}
                    <div className="relative">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <Input
                          placeholder="Destination"
                          value={destinationLocation}
                          onChange={(e) => setDestinationLocation(e.target.value)}
                          onFocus={() => setShowDestSuggestions(true)}
                          className="flex-1 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500"
                        />
                        <Button
                          onClick={fetchRouteWithHazards}
                          disabled={!startCoords || !destCoords || isSearchingRoute}
                          className="flex-shrink-0 bg-[#0070E1] hover:bg-[#0070E1]/90"
                        >
                          <RouteIcon className="w-4 h-4 mr-2" />
                          {isSearchingRoute ? 'Finding...' : 'Go'}
                        </Button>
                      </div>
                      
                      {/* Destination Suggestions */}
                      {showDestSuggestions && destSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 max-h-48 overflow-y-auto z-50">
                          {destSuggestions.map((suggestion) => (
                            <button
                              key={suggestion.id}
                              onClick={() => selectSuggestion(suggestion, false)}
                              className="w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 text-sm text-[#1F2F57] dark:text-slate-200"
                            >
                              {suggestion.place_name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div ref={mapContainer} className="w-full h-full" />
          
          {/* Route Info Banner */}
          {navigationRoute && (
            <div className={`absolute ${viewMode === 'fullscreen' ? 'top-44' : 'top-4'} left-4 right-4 z-30`}>
              <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-[#0070E1]/50">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#0070E1]/20 flex items-center justify-center flex-shrink-0">
                        <Navigation className="w-5 h-5 text-[#0070E1]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#1F2F57] dark:text-slate-200 text-sm mb-0.5 truncate">
                          {navigationRoute.distance ? `${(navigationRoute.distance / 1000).toFixed(1)} km` : ''} 
                          {navigationRoute.duration ? ` • ${Math.round(navigationRoute.duration / 60)} min` : ''}
                        </p>
                        <p className="text-[#9394a5] dark:text-slate-400 text-xs truncate">
                          {routeHazards.length > 0 ? (
                            <span className="text-amber-500">
                              ⚠️ {routeHazards.length} hazard{routeHazards.length > 1 ? 's' : ''} on route
                            </span>
                          ) : (
                            <span className="text-green-500">✓ No hazards detected</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={clearNavigation}
                      variant="ghost"
                      size="sm"
                      className="flex-shrink-0 h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Token Setup Warning */}
          {!hasValidToken && (
            <div className="absolute bottom-4 left-4 right-4 z-30">
              <Card className="bg-amber-500/10 border-amber-500/30">
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-amber-400 text-xs mb-1">Mapbox Token Required</p>
                      <p className="text-[#9394a5] dark:text-slate-400 text-[10px] leading-relaxed">
                        Add your Mapbox token to enable real-time maps, navigation, and proximity warnings. See MAPBOX_SETUP_GUIDE.md for instructions.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function getMarkerComponent(hazard: HazardData) {
  return getMarkerIcon(hazard.severity, hazard.source, hazard.status);
}