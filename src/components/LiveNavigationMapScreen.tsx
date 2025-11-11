// Live Navigation Map Screen with Real-Time Hazard Alerts
import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { HazardData } from './HazardService';
import { getMarkerIcon, VehicleMarker } from './MapMarkerIcons';
import { createRoot } from 'react-dom/client';
import { X, AlertTriangle, Clock, Navigation as NavigationIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

// Mapbox access token — read from Vite environment variables
// Add to project root .env: VITE_MAPBOX_ACCESS_TOKEN=your_token_here
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'YOUR_MAPBOX_TOKEN_HERE';

interface LiveNavigationMapScreenProps {
  startLocation: [number, number]; // [longitude, latitude]
  destinationLocation: [number, number]; // [longitude, latitude]
  destinationName: string;
  hazards: HazardData[];
  onEndNavigation: () => void;
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

// Format distance for display
function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

export function LiveNavigationMapScreen({
  startLocation,
  destinationLocation,
  destinationName,
  hazards,
  onEndNavigation
}: LiveNavigationMapScreenProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number]>(startLocation);
  const [navigationRoute, setNavigationRoute] = useState<any>(null);
  const [routeHazards, setRouteHazards] = useState<HazardData[]>([]);
  const [proximityHazard, setProximityHazard] = useState<HazardData | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const [currentStreet, setCurrentStreet] = useState<string>('');
  const routeSourceId = useRef<string>('navigation-route');
  const warningHazards = useRef<Set<string>>(new Set());

  // Check if we have a valid Mapbox token
  const hasValidToken = MAPBOX_TOKEN && 
    MAPBOX_TOKEN !== 'YOUR_MAPBOX_TOKEN_HERE' && 
    !MAPBOX_TOKEN.includes('example') &&
    (MAPBOX_TOKEN.startsWith('pk.') || MAPBOX_TOKEN.startsWith('sk.'));

  // Track user's real-time position
  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newPos: [number, number] = [
            position.coords.longitude, 
            position.coords.latitude
          ];
          setUserLocation(newPos);
        },
        (error) => {
          console.log('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 1000,
          timeout: 5000
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Reverse geocode to get current street name
  useEffect(() => {
    const getStreetName = async () => {
      if (!hasValidToken || !userLocation) return;

      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${userLocation[0]},${userLocation[1]}.json?access_token=${MAPBOX_TOKEN}&types=address`
        );
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          const address = data.features[0];
          const street = address.text || '';
          const place = address.context?.find((c: any) => c.id.startsWith('place'))?.text || '';
          setCurrentStreet(street ? `${street}${place ? ', ' + place : ''}` : 'Navigating...');
        }
      } catch (error) {
        console.error('Error getting street name:', error);
      }
    };

    getStreetName();
    const interval = setInterval(getStreetName, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [userLocation, hasValidToken]);

  // Fetch navigation route
  const fetchRoute = useCallback(async () => {
    if (!hasValidToken) return;

    try {
      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${userLocation[0]},${userLocation[1]};${destinationLocation[0]},${destinationLocation[1]}?geometries=geojson&steps=true&access_token=${MAPBOX_TOKEN}`,
        { method: 'GET' }
      );
      const json = await query.json();
      
      if (json.routes && json.routes.length > 0) {
        const route = json.routes[0];
        setNavigationRoute(route);
        
        // Calculate route info
        const distance = formatDistance(route.distance);
        const duration = Math.round(route.duration / 60);
        setRouteInfo({ 
          distance, 
          duration: duration < 1 ? '<1 min' : `${duration} min` 
        });
        
        // Find hazards along the route (within 100m buffer)
        const routeCoordinates = route.geometry.coordinates;
        const hazardsOnRoute = hazards.filter(hazard => 
          isPointNearRoute(
            [hazard.location.longitude, hazard.location.latitude],
            routeCoordinates,
            100
          )
        );
        
        setRouteHazards(hazardsOnRoute);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      toast.error('Unable to calculate route');
    }
  }, [userLocation, destinationLocation, hasValidToken, hazards]);

  // Initialize route
  useEffect(() => {
    fetchRoute();
  }, [fetchRoute]);

  // Check proximity to hazards and show warnings
  useEffect(() => {
    const checkProximity = () => {
      let closestHazard: HazardData | null = null;
      let closestDistance = Infinity;

      // Only check hazards on the route
      routeHazards.forEach(hazard => {
        const distance = calculateDistance(
          userLocation[1], // latitude
          userLocation[0], // longitude
          hazard.location.latitude,
          hazard.location.longitude
        );

        // Check if within 1km and this is the closest
        if (distance < 1000 && distance < closestDistance) {
          closestDistance = distance;
          closestHazard = hazard;
        }

        // Warn if within 500 meters and haven't warned yet
        if (distance < 500 && !warningHazards.current.has(hazard.id)) {
          warningHazards.current.add(hazard.id);
          
          // Determine toast type based on severity
          const toastFn = hazard.severity === 'high' ? toast.error : toast.warning;
          const severityIcon = hazard.severity === 'high' ? '🚨' : '⚠️';
          
          // Show warning toast with more detail
          toastFn(`${severityIcon} ${hazard.type} Ahead!`, {
            description: `${Math.round(distance)}m ahead on ${hazard.locationName}`,
            duration: 8000,
            action: {
              label: 'View',
              onClick: () => {
                // Center map on hazard
                if (map.current) {
                  map.current.flyTo({
                    center: [hazard.location.longitude, hazard.location.latitude],
                    zoom: 17,
                    duration: 1000
                  });
                }
              }
            }
          });
        } else if (distance > 1500 && warningHazards.current.has(hazard.id)) {
          // Remove from warned set if moved far away
          warningHazards.current.delete(hazard.id);
        }
      });

      setProximityHazard(closestHazard);
    };

    checkProximity();
    const interval = setInterval(checkProximity, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [userLocation, routeHazards]);

  // Initialize Mapbox
  useEffect(() => {
    if (!hasValidToken || !mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11', // High-contrast dark theme
        center: userLocation,
        zoom: 15,
        pitch: 60, // 3D perspective
        bearing: 0,
        attributionControl: false,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    } catch (error) {
      console.error('Error initializing Mapbox:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [hasValidToken, userLocation]);

  // Update map center to follow user location
  useEffect(() => {
    if (map.current && userLocation) {
      map.current.flyTo({
        center: userLocation,
        zoom: 16,
        duration: 1000,
        essential: true
      });
    }
  }, [userLocation]);

  // Update navigation route on map
  useEffect(() => {
    if (!map.current || !navigationRoute) return;

    const updateRoute = () => {
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

      // Add route layer with VW blue color
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
          'line-width': 6,
          'line-opacity': 0.85
        }
      });
    };

    if (map.current.isStyleLoaded()) {
      updateRoute();
    } else {
      map.current.on('load', updateRoute);
    }
  }, [navigationRoute]);

  // Update markers when hazards or location change
  useEffect(() => {
    if (!map.current) return;

    // Remove old markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add user location marker (vehicle)
    const vehicleEl = document.createElement('div');
    const vehicleRoot = createRoot(vehicleEl);
    vehicleRoot.render(<VehicleMarker className="w-10 h-10" />);
    
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

    // Add destination marker
    const destEl = document.createElement('div');
    destEl.className = 'w-10 h-10 bg-[#0070E1] rounded-full border-4 border-white shadow-lg flex items-center justify-center';
    destEl.innerHTML = '<div class="w-3 h-3 bg-white rounded-full"></div>';
    
    try {
      const destMarker = new mapboxgl.Marker({ 
        element: destEl, 
        anchor: 'center'
      })
        .setLngLat(destinationLocation)
        .addTo(map.current);
      markersRef.current.push(destMarker);
    } catch (error) {
      console.error('Error adding destination marker:', error);
    }

    // Add hazard markers - show ALL hazards in the area, highlight those on route
    hazards.forEach((hazard) => {
      const el = document.createElement('div');
      el.className = 'hazard-marker cursor-pointer transition-transform hover:scale-110';
      
      const root = createRoot(el);
      const MarkerComponent = getMarkerIcon(hazard.severity, hazard.source, hazard.status);
      
      // Check if hazard is on route
      const isOnRoute = routeHazards.some(h => h.id === hazard.id);
      
      // Check if hazard is nearby
      const distance = calculateDistance(
        userLocation[1],
        userLocation[0],
        hazard.location.latitude,
        hazard.location.longitude
      );
      
      const isNearby = distance < 500;
      
      root.render(
        <div className={isNearby || isOnRoute ? 'animate-pulse' : ''}>
          {isOnRoute && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white z-10">
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping"></div>
            </div>
          )}
          <MarkerComponent className="w-10 h-10" />
        </div>
      );

      try {
        const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat([hazard.location.longitude, hazard.location.latitude])
          .addTo(map.current!);
        
        markersRef.current.push(marker);
      } catch (error) {
        console.error('Error adding hazard marker:', error);
      }
    });

  }, [hazards, userLocation, destinationLocation, routeHazards]);

  // Get severity color for UI
  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-yellow-500';
      default: return 'bg-slate-500';
    }
  };

  const getSeverityTextColor = (severity: string) => {
    switch(severity) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-amber-400';
      case 'low': return 'text-yellow-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950">
      {/* Full-screen Map */}
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 safe-area-top">
        <div className="bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-transparent backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-4">
            {/* End Navigation Button */}
            <Button
              onClick={onEndNavigation}
              variant="outline"
              size="sm"
              className="bg-slate-900/90 border-slate-700 text-white hover:bg-slate-800 flex-shrink-0"
            >
              <X className="w-4 h-4 mr-1" />
              End
            </Button>

            {/* Current Street / Next Turn */}
            <div className="flex-1 mx-2 text-center min-w-0">
              <p className="text-white text-sm truncate">{currentStreet || 'Navigating...'}</p>
              <p className="text-slate-400 text-xs truncate">to {destinationName}</p>
            </div>

            {/* Hazard Count Badge */}
            {routeHazards.length > 0 && (
              <Badge className="bg-red-500/90 text-white border-red-600 flex items-center gap-1 flex-shrink-0">
                <AlertTriangle className="w-3 h-3" />
                {routeHazards.length}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Hazard Alert Overlay - Appears when within proximity */}
      {proximityHazard && (
        <div className="absolute bottom-[140px] left-0 right-0 z-20 px-4">
          <div className={`${getSeverityColor(proximityHazard.severity)} rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4`}>
            <div className="bg-black/40 backdrop-blur-sm px-4 py-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-white text-base font-semibold">ALERT: {proximityHazard.type.toUpperCase()}</p>
                    <Badge className="bg-white/20 text-white text-xs">
                      {calculateDistance(
                        userLocation[1],
                        userLocation[0],
                        proximityHazard.location.latitude,
                        proximityHazard.location.longitude
                      ) < 1000 
                        ? `${Math.round(calculateDistance(
                            userLocation[1],
                            userLocation[0],
                            proximityHazard.location.latitude,
                            proximityHazard.location.longitude
                          ))}m ahead`
                        : `${(calculateDistance(
                            userLocation[1],
                            userLocation[0],
                            proximityHazard.location.latitude,
                            proximityHazard.location.longitude
                          ) / 1000).toFixed(1)}km ahead`
                      }
                    </Badge>
                  </div>
                  <p className="text-white/90 text-sm truncate">{proximityHazard.locationName}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge className={`${getSeverityColor(proximityHazard.severity)}/80 text-white text-xs`}>
                      {proximityHazard.severity} severity
                    </Badge>
                    {proximityHazard.source === 'v2x' && (
                      <span className="text-white/80 text-xs">📡 V2X Alert</span>
                    )}
                    {proximityHazard.source === 'your-car' && (
                      <span className="text-white/80 text-xs">🚗 Your Car</span>
                    )}
                    {proximityHazard.source === 'network' && (
                      <span className="text-white/80 text-xs">👥 Network</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Info Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-30 pb-[72px]">
        <div className="bg-gradient-to-t from-slate-900/95 via-slate-900/90 to-transparent backdrop-blur-sm">
          <div className="px-4 py-3">
            <div className="bg-slate-900/95 rounded-xl border border-slate-700/50 px-4 py-3 shadow-xl">
              <div className="flex items-center justify-around gap-3">
                {/* ETA */}
                {routeInfo && (
                  <>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Clock className="w-5 h-5 text-[#0070E1] flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-white text-sm truncate">{routeInfo.duration}</p>
                        <p className="text-slate-400 text-xs">ETA</p>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-10 w-px bg-slate-700 flex-shrink-0"></div>

                    {/* Distance */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <NavigationIcon className="w-5 h-5 text-[#0070E1] flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-white text-sm truncate">{routeInfo.distance}</p>
                        <p className="text-slate-400 text-xs">Distance</p>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-10 w-px bg-slate-700 flex-shrink-0"></div>
                  </>
                )}

                {/* Hazards on Route */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-white text-sm truncate">{routeHazards.length}</p>
                    <p className="text-slate-400 text-xs">Hazards</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Legend - Top Right */}
      <div className="absolute top-24 right-4 z-10">
        <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-lg px-3 py-2 space-y-1.5 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-sm" />
            <span className="text-white text-xs">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded-sm" />
            <span className="text-white text-xs">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-sm" />
            <span className="text-white text-xs">Medium</span>
          </div>
        </div>
      </div>
    </div>
  );
}
