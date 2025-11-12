import React from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, DirectionsRenderer } from '@react-google-maps/api';
import { toast } from 'sonner';
import { HazardData } from './HazardService';

const containerStyle = {
  width: '100%',
  height: '100%'
};

interface GoogleMapWrapperProps {
  hazards?: HazardData[];
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  markers?: {
    lat: number;
    lng: number;
  }[];
  onMapLoad?: (map: google.maps.Map) => void;
  onHazardClick?: (hazard: HazardData) => void;
  children?: React.ReactNode;
  // Navigation/Directions props
  showDirections?: boolean;
  directionsOrigin?: { lat: number; lng: number };
  directionsDestination?: { lat: number; lng: number };
  onRouteCalculated?: (distance: string, duration: string) => void;
}

const libraries: ('places' | 'geometry')[] = ['geometry'];

// Function to create custom marker with shape, color, and icon based on hazard properties
const getMarkerIcon = (hazard: HazardData): google.maps.Symbol | google.maps.Icon => {
  let color = '';
  let scale = 6; // Smaller default size

  // SEVERITY COLORS
  if (hazard.severity === 'high') {
    color = '#FF0000'; // Red
    scale = 7;
  } else if (hazard.severity === 'medium') {
    color = '#FFA500'; // Orange
    scale = 6;
  } else { // low
    color = '#FFFF00'; // Yellow
    scale = 5;
  }

  // SHAPE BASED ON SOURCE TYPE
  // Circle for network (community/scout network)
  if (hazard.source === 'network' || !hazard.source) {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 1.5,
      scale: scale,
    };
  }
  
  // Triangle for V2X sources
  if (hazard.source === 'v2x') {
    return {
      path: 'M 0,-4 L -3.5,3 L 3.5,3 Z', // Triangle pointing up
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 1.5,
      scale: scale / 4,
      anchor: new google.maps.Point(0, 0),
    };
  }
  
  // Square for your-car detections
  if (hazard.source === 'your-car') {
    return {
      path: 'M -3,-3 L 3,-3 L 3,3 L -3,3 Z', // Square
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 1.5,
      scale: scale / 6,
      anchor: new google.maps.Point(0, 0),
    };
  }

  // Default circle
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: '#FFFFFF',
    strokeWeight: 1.5,
    scale: scale,
  };
};

const GoogleMapWrapper: React.FC<GoogleMapWrapperProps> = ({ 
  hazards, 
  center, 
  zoom, 
  markers, 
  onMapLoad, 
  onHazardClick,
  children,
  showDirections,
  directionsOrigin,
  directionsDestination,
  onRouteCalculated
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [directions, setDirections] = React.useState<google.maps.DirectionsResult | null>(null);
  
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries,
  });

  // Calculate directions when navigation is requested
  React.useEffect(() => {
    if (!showDirections || !directionsOrigin || !directionsDestination || !isLoaded) {
      console.log('🗺️ Clearing directions - showDirections:', showDirections, 'origin:', directionsOrigin, 'dest:', directionsDestination, 'isLoaded:', isLoaded);
      setDirections(null);
      return;
    }

    if (typeof window === 'undefined' || !window.google) {
      console.warn('⚠️ Google Maps not available yet');
      return;
    }

    console.log('🗺️ Calculating directions from', directionsOrigin, 'to', directionsDestination);
    const directionsService = new google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: directionsOrigin,
        destination: directionsDestination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        console.log('📍 Directions response - Status:', status);
        if (status === google.maps.DirectionsStatus.OK && result) {
          console.log('✅ Directions calculated successfully:', result);
          setDirections(result);
          
          // Extract and pass distance/duration to parent
          if (result.routes[0]?.legs[0]) {
            const leg = result.routes[0].legs[0];
            const distance = leg.distance?.text || '';
            const duration = leg.duration?.text || '';
            console.log('📍 Route info:', { distance, duration });
            
            if (onRouteCalculated) {
              onRouteCalculated(distance, duration);
            }
          }
          
          const totalDistance = result.routes[0].legs.reduce((sum, leg) => sum + leg.distance?.value || 0, 0);
          toast.success('Route calculated', {
            description: `Distance: ${(totalDistance / 1000).toFixed(1)}km`,
            duration: 3000,
          });
        } else {
          console.error('❌ Directions request failed - Status:', status);
          
          let errorMsg = `Directions request failed: ${status}`;
          let description = '';
          
          if (status === 'NOT_FOUND') {
            description = 'One or both locations could not be found';
          } else if (status === 'ZERO_RESULTS') {
            description = 'No route found between start and destination';
          } else if (status === 'REQUEST_DENIED') {
            description = 'Check if Directions API is enabled in Google Cloud Console';
          } else if (status === 'OVER_QUERY_LIMIT') {
            description = 'API quota exceeded, please wait';
          }
          
          toast.error(errorMsg, {
            description: description || 'Please check browser console for details',
            duration: 5000,
          });
        }
      }
    );
  }, [showDirections, directionsOrigin?.lat, directionsOrigin?.lng, directionsDestination?.lat, directionsDestination?.lng, isLoaded]);

  const onLoad = React.useCallback(function callback(map: google.maps.Map) {
    if (onMapLoad) {
      onMapLoad(map);
    }
  }, [onMapLoad]);

  const onUnmount = React.useCallback(function callback(map: google.maps.Map) {
    // Any cleanup logic if needed
  }, []);

  // Debug: Log API key status (remove in production)
  React.useEffect(() => {
    console.log('Google Maps API Key present:', !!apiKey);
    console.log('Google Maps API Key (first 20 chars):', apiKey.substring(0, 20));
    if (loadError) {
      console.error('Google Maps Load Error:', loadError);
    }
  }, [apiKey, loadError]);

  if (!apiKey) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        background: '#1a1a2e',
        color: '#ff4444',
        padding: '20px',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '18px', marginBottom: '10px' }}>❌ Google Maps API Key Missing</p>
        <p style={{ fontSize: '14px', color: '#8b93a7' }}>
          Please add VITE_GOOGLE_MAPS_API_KEY to your .env file
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        background: '#1a1a2e',
        color: '#ff4444',
        padding: '20px',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '18px', marginBottom: '10px' }}>❌ Error Loading Google Maps</p>
        <p style={{ fontSize: '14px', color: '#8b93a7', marginBottom: '15px' }}>
          {loadError.message || 'Unknown error'}
        </p>
        <div style={{ 
          fontSize: '12px', 
          color: '#6b7785', 
          textAlign: 'left',
          background: '#0f1419',
          padding: '15px',
          borderRadius: '8px',
          maxWidth: '500px'
        }}>
          <p style={{ marginBottom: '8px', fontWeight: 'bold', color: '#8b93a7' }}>Common fixes:</p>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Enable "Maps JavaScript API" in Google Cloud Console</li>
            <li>Enable "Geometry API" in Google Cloud Console</li>
            <li>Check API key restrictions (HTTP referrers)</li>
            <li>Verify billing is enabled for your Google Cloud project</li>
            <li>Check browser console for detailed error message</li>
          </ul>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: '#1a1a2e',
        color: '#8b93a7'
      }}>
        <p>Loading Google Maps...</p>
      </div>
    );
  }

  return (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
            // Standard Google Maps controls for better UX
            disableDefaultUI: false, // Enable default UI controls
            zoomControl: true, // Show zoom buttons (+/-)
            mapTypeControl: true, // Show map/satellite toggle
            streetViewControl: true, // Show street view pegman
            fullscreenControl: true, // Show fullscreen button
            gestureHandling: 'greedy', // Smooth zoom with mouse/touch
            clickableIcons: false, // Disable POI popups
            // Remove dark mode styles for standard Google Maps appearance
            styles: []
        }}
      >
        {children}
        
        {/* Render Google Directions route if navigation is active */}
        {directions && showDirections && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: false,  // Show start/end markers
              polylineOptions: {
                strokeColor: '#0070E1',
                strokeWeight: 5,
                strokeOpacity: 0.8,
              },
              markerOptions: {
                visible: true,
              }
            }}
          />
        )}
        
        {/* Render hazard markers with custom icons and click handlers - ALWAYS show hazards */}
        {hazards && hazards.map((hazard) => (
          <MarkerF
            key={hazard.id}
            position={{ lat: hazard.location.latitude, lng: hazard.location.longitude }}
            icon={getMarkerIcon(hazard)}
            title={`${hazard.type} - ${hazard.severity}`}
            onClick={() => onHazardClick && onHazardClick(hazard)}
          />
        ))}
        
        {/* Render simple markers if provided (fallback) */}
        {!hazards && markers && markers.map((marker, index) => (
          <MarkerF key={index} position={marker} />
        ))}
      </GoogleMap>
  );
}

export default React.memo(GoogleMapWrapper);
