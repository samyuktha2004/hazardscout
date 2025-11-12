// Live Navigation Map Screen with Real-Time Hazard Alerts (Google Maps)
import { useEffect, useRef, useState } from 'react';
import { GoogleMap, Marker, Polyline, useJsApiLoader, InfoWindow } from '@react-google-maps/api';
import { HazardData } from './HazardService';
import { X, AlertTriangle, Clock, Navigation as NavigationIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

interface LiveNavigationMapScreenProps {
  startLocation: [number, number]; // [longitude, latitude]
  destinationLocation: [number, number]; // [longitude, latitude]
  destinationName: string;
  hazards: HazardData[];
  onEndNavigation: () => void;
}

// Calculate distance between two coordinates in meters
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Check if a point is near a route
function isPointNearRoute(
  point: [number, number],
  routeCoordinates: google.maps.LatLng[],
  bufferMeters: number = 100
): boolean {
  for (const routePoint of routeCoordinates) {
    const distance = calculateDistance(
      point[1], point[0],
      routePoint.lat(), routePoint.lng()
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

// Format duration in minutes
function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 1) return '< 1 min';
  if (minutes === 1) return '1 min';
  return `${minutes} min`;
}

export function LiveNavigationMapScreen({
  startLocation,
  destinationLocation,
  destinationName,
  hazards,
  onEndNavigation
}: LiveNavigationMapScreenProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral>({
    lat: startLocation[1],
    lng: startLocation[0]
  });
  const [navigationRoute, setNavigationRoute] = useState<google.maps.LatLng[] | null>(null);
  const [routeHazards, setRouteHazards] = useState<HazardData[]>([]);
  const [proximityHazard, setProximityHazard] = useState<HazardData | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const [selectedHazard, setSelectedHazard] = useState<HazardData | null>(null);
  const warningHazards = useRef<Set<string>>(new Set());

  // Track user's real-time position
  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
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

  // Fetch and display navigation route
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    directionsServiceRef.current = new google.maps.DirectionsService();

    const fetchRoute = async () => {
      try {
        const result = await directionsServiceRef.current!.route({
          origin: {
            lat: startLocation[1],
            lng: startLocation[0]
          },
          destination: {
            lat: destinationLocation[1],
            lng: destinationLocation[0]
          },
          travelMode: google.maps.TravelMode.DRIVING
        });

        if (result.routes && result.routes.length > 0) {
          const route = result.routes[0];
          const routeCoords = route.overview_path;

          setNavigationRoute(routeCoords);

          // Calculate distance and duration
          let totalDistance = 0;
          let totalDuration = 0;
          route.legs.forEach((leg) => {
            totalDistance += leg.distance?.value || 0;
            totalDuration += leg.duration?.value || 0;
          });

          setRouteInfo({
            distance: formatDistance(totalDistance),
            duration: formatDuration(totalDuration)
          });

          // Find hazards along the route
          const hazardsOnRoute = hazards.filter((hazard) =>
            isPointNearRoute(
              [hazard.location.longitude, hazard.location.latitude],
              routeCoords,
              100
            )
          );

          setRouteHazards(hazardsOnRoute);

          // Fit map to route
          const bounds = new google.maps.LatLngBounds();
          routeCoords.forEach((coord) => bounds.extend(coord));
          mapRef.current!.fitBounds(bounds);

          if (hazardsOnRoute.length > 0) {
            toast.warning(`⚠️ ${hazardsOnRoute.length} hazard${hazardsOnRoute.length > 1 ? 's' : ''} detected on route`, {
              duration: 3000
            });
          }
        }
      } catch (error) {
        console.error('Error fetching route:', error);
        toast.error('Unable to calculate route');
      }
    };

    fetchRoute();
  }, [isLoaded, startLocation, destinationLocation, hazards]);

  // Check proximity to hazards and show warnings
  useEffect(() => {
    const checkProximity = () => {
      let closestHazard: HazardData | null = null;
      let closestDistance = Infinity;

      routeHazards.forEach((hazard) => {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          hazard.location.latitude,
          hazard.location.longitude
        );

        if (distance < 1000 && distance < closestDistance) {
          closestDistance = distance;
          closestHazard = hazard;
        }

        if (distance < 500 && !warningHazards.current.has(hazard.id)) {
          warningHazards.current.add(hazard.id);

          const toastFn = hazard.severity === 'high' ? toast.error : toast.warning;
          const severityIcon = hazard.severity === 'high' ? '🚨' : '⚠️';

          toastFn(`${severityIcon} ${hazard.type} Ahead!`, {
            description: `${Math.round(distance)}m ahead on ${hazard.locationName}`,
            duration: 8000,
            action: {
              label: 'View',
              onClick: () => {
                setSelectedHazard(hazard);
              }
            }
          });
        } else if (distance > 1500 && warningHazards.current.has(hazard.id)) {
          warningHazards.current.delete(hazard.id);
        }
      });

      setProximityHazard(closestHazard);
    };

    checkProximity();
    const interval = setInterval(checkProximity, 5000);

    return () => clearInterval(interval);
  }, [userLocation, routeHazards]);

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Loading navigation...</p>
      </div>
    );
  }

  const getHazardColor = (severity: string): string => {
    switch (severity) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#eab308';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950">
      {/* Full-screen Map */}
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={userLocation}
        zoom={15}
        onLoad={(map) => {
          mapRef.current = map;
        }}
        options={{
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#1a2332' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
            { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] }
          ],
          zoomControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false
        }}
      >
        {/* User location marker */}
        <Marker
          position={userLocation}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#0070E1',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3
          }}
          title="Your location"
        />

        {/* Destination marker */}
        <Marker
          position={{
            lat: destinationLocation[1],
            lng: destinationLocation[0]
          }}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#10b981',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3
          }}
          title={destinationName}
        />

        {/* Route polyline */}
        {navigationRoute && (
          <Polyline
            path={navigationRoute}
            options={{
              strokeColor: '#0070E1',
              strokeOpacity: 0.8,
              strokeWeight: 6
            }}
          />
        )}

        {/* Hazard markers */}
        {hazards.map((hazard) => (
          <Marker
            key={hazard.id}
            position={{
              lat: hazard.location.latitude,
              lng: hazard.location.longitude
            }}
            onClick={() => setSelectedHazard(hazard)}
            title={hazard.locationName}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: hazard.severity === 'high' ? 10 : hazard.severity === 'medium' ? 8 : 6,
              fillColor: getHazardColor(hazard.severity),
              fillOpacity: routeHazards.some(h => h.id === hazard.id) ? 1 : 0.6,
              strokeColor: '#ffffff',
              strokeWeight: 2
            }}
          />
        ))}

        {/* Hazard info window */}
        {selectedHazard && (
          <InfoWindow
            position={{
              lat: selectedHazard.location.latitude,
              lng: selectedHazard.location.longitude
            }}
            onCloseClick={() => setSelectedHazard(null)}
          >
            <div className="bg-white rounded-lg p-3 max-w-xs">
              <h3 className="font-semibold text-slate-900 mb-1">{selectedHazard.type}</h3>
              <p className="text-sm text-slate-600 mb-2">{selectedHazard.locationName}</p>
              <div className="flex gap-2 flex-wrap mb-2">
                <Badge className={`text-xs ${
                  selectedHazard.severity === 'high' ? 'bg-red-500' :
                  selectedHazard.severity === 'medium' ? 'bg-amber-500' :
                  'bg-yellow-500'
                }`}>
                  {selectedHazard.severity}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {selectedHazard.confirmations.length} confirmations
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                {new Date(selectedHazard.lastUpdatedAt).toLocaleTimeString()}
              </p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 safe-area-top">
        <div className="bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-transparent backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-4">
            <Button
              onClick={onEndNavigation}
              variant="outline"
              size="sm"
              className="bg-slate-900/90 border-slate-700 text-white hover:bg-slate-800 flex-shrink-0"
            >
              <X className="w-4 h-4 mr-1" />
              End
            </Button>

            <div className="flex-1 mx-2 text-center min-w-0">
              <p className="text-white text-sm truncate font-semibold">to {destinationName}</p>
              <p className="text-slate-400 text-xs truncate">Navigating...</p>
            </div>

            {routeHazards.length > 0 && (
              <Badge className="bg-red-500/90 text-white border-red-600 flex items-center gap-1 flex-shrink-0">
                <AlertTriangle className="w-3 h-3" />
                {routeHazards.length}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Hazard Alert Overlay */}
      {proximityHazard && (
        <div className="absolute bottom-[140px] left-0 right-0 z-20 px-4">
          <div className={`${
            proximityHazard.severity === 'high' ? 'bg-red-500' :
            proximityHazard.severity === 'medium' ? 'bg-amber-500' :
            'bg-yellow-500'
          } rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4`}>
            <div className="bg-black/40 backdrop-blur-sm px-4 py-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-white text-base font-semibold">ALERT: {proximityHazard.type.toUpperCase()}</p>
                    <Badge className="bg-white/20 text-white text-xs">
                      {Math.round(calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        proximityHazard.location.latitude,
                        proximityHazard.location.longitude
                      ))}m ahead
                    </Badge>
                  </div>
                  <p className="text-white/90 text-sm truncate">{proximityHazard.locationName}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge className={`${
                      proximityHazard.severity === 'high' ? 'bg-red-500' :
                      proximityHazard.severity === 'medium' ? 'bg-amber-500' :
                      'bg-yellow-500'
                    }/80 text-white text-xs`}>
                      {proximityHazard.severity} severity
                    </Badge>
                    <span className="text-white/80 text-xs">{proximityHazard.confirmations.length} confirmations</span>
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
                {routeInfo && (
                  <>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Clock className="w-5 h-5 text-[#0070E1] flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-white text-sm truncate">{routeInfo.duration}</p>
                        <p className="text-slate-400 text-xs">ETA</p>
                      </div>
                    </div>

                    <div className="h-10 w-px bg-slate-700 flex-shrink-0"></div>

                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <NavigationIcon className="w-5 h-5 text-[#0070E1] flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-white text-sm truncate">{routeInfo.distance}</p>
                        <p className="text-slate-400 text-xs">Distance</p>
                      </div>
                    </div>

                    <div className="h-10 w-px bg-slate-700 flex-shrink-0"></div>
                  </>
                )}

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
    </div>
  );
}
