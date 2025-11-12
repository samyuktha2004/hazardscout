import React from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, DirectionsRenderer } from '@react-google-maps/api';
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
}

const libraries: ('places' | 'geometry')[] = ['geometry'];

// Function to determine the custom marker icon based on hazard severity and type
const getMarkerIcon = (hazard: HazardData): google.maps.Symbol => {
  let color = '';
  let scale = 8;

  // Color based on severity
  if (hazard.severity === 'high') {
    color = '#FF0000'; // Red
    scale = 10;
  } else if (hazard.severity === 'medium') {
    color = '#FFD700'; // Yellow
    scale = 8;
  } else if (hazard.severity === 'low') {
    color = '#808080'; // Grey
    scale = 7;
  } else {
    color = '#808080'; // Default grey
    scale = 7;
  }

  // V2X hazards get larger markers
  if (hazard.source === 'v2x') {
    scale += 2;
  }

  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 0.9,
    strokeColor: '#FFFFFF',
    strokeWeight: 2,
    scale,
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
  directionsDestination
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
    if (showDirections && directionsOrigin && directionsDestination && isLoaded && window.google) {
      console.log('Calculating directions from', directionsOrigin, 'to', directionsDestination);
      const directionsService = new google.maps.DirectionsService();
      
      directionsService.route(
        {
          origin: directionsOrigin,
          destination: directionsDestination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          console.log('Directions response - Status:', status);
          if (status === google.maps.DirectionsStatus.OK && result) {
            console.log('Directions calculated successfully:', result);
            setDirections(result);
          } else {
            console.error('Directions request failed:', status, result);
            alert(`Directions request failed: ${status}. Please check if the Directions API is enabled in Google Cloud Console.`);
          }
        }
      );
    } else {
      console.log('Clearing directions - showDirections:', showDirections, 'origin:', directionsOrigin, 'dest:', directionsDestination, 'isLoaded:', isLoaded);
      setDirections(null);
    }
  }, [showDirections, directionsOrigin, directionsDestination, isLoaded]);

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
            // mapId: "a7357a4128815498", // Optional: for custom map styling from Google Cloud
            disableDefaultUI: true,
            zoomControl: true,
            clickableIcons: false, // Disables clicking on default POIs
            styles: [ // Dark mode styles
              { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
              { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
              { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
              {
                featureType: "administrative.locality",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
              },
              {
                featureType: "poi",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
              },
              {
                featureType: "poi.park",
                elementType: "geometry",
                stylers: [{ color: "#263c3f" }],
              },
              {
                featureType: "poi.park",
                elementType: "labels.text.fill",
                stylers: [{ color: "#6b9a76" }],
              },
              {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#38414e" }],
              },
              {
                featureType: "road",
                elementType: "geometry.stroke",
                stylers: [{ color: "#212a37" }],
              },
              {
                featureType: "road",
                elementType: "labels.text.fill",
                stylers: [{ color: "#9ca5b3" }],
              },
              {
                featureType: "road.highway",
                elementType: "geometry",
                stylers: [{ color: "#746855" }],
              },
              {
                featureType: "road.highway",
                elementType: "geometry.stroke",
                stylers: [{ color: "#1f2835" }],
              },
              {
                featureType: "road.highway",
                elementType: "labels.text.fill",
                stylers: [{ color: "#f3d19c" }],
              },
              {
                featureType: "transit",
                elementType: "geometry",
                stylers: [{ color: "#2f3948" }],
              },
              {
                featureType: "transit.station",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
              },
              {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#17263c" }],
              },
              {
                featureType: "water",
                elementType: "labels.text.fill",
                stylers: [{ color: "#515c6d" }],
              },
              {
                featureType: "water",
                elementType: "labels.text.stroke",
                stylers: [{ color: "#17263c" }],
              },
            ]
        }}
      >
        {children}
        
        {/* Render Google Directions route if navigation is active */}
        {directions && showDirections && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: false,
              polylineOptions: {
                strokeColor: '#0070E1',
                strokeWeight: 5,
                strokeOpacity: 0.8,
              },
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
