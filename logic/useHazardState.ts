import { useState, useEffect, useCallback } from 'react';

export interface HazardData {
  id: string;
  type: 'pothole' | 'roadblock' | 'accident' | 'construction' | 'weather' | 'traffic';
  severity: 'low' | 'medium' | 'high' | 'critical';
  latitude: number;
  longitude: number;
  timestamp: number;
  reportedBy: string;
  verifications: number;
  description: string;
  status: 'active' | 'resolved' | 'investigating';
  estimatedResolutionTime?: number;
  images?: string[];
}

export interface VehicleLocation {
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  timestamp: number;
}

interface HazardState {
  hazards: HazardData[];
  vehicleLocation: VehicleLocation | null;
  isConnected: boolean;
  notifications: Array<{
    id: string;
    message: string;
    type: 'warning' | 'info' | 'success' | 'error';
    timestamp: number;
  }>;
}

/**
 * Custom hook for managing hazard state and real-time updates
 * This is the "brain" of the Hazard Scout system
 */
export const useHazardState = () => {
  const [state, setState] = useState<HazardState>({
    hazards: [],
    vehicleLocation: null,
    isConnected: false,
    notifications: []
  });

  // Initialize with some sample hazards around Chennai
  useEffect(() => {
    const initialHazards: HazardData[] = [
      {
        id: '1',
        type: 'pothole',
        severity: 'high',
        latitude: 13.0827,
        longitude: 80.2707,
        timestamp: Date.now() - 3600000, // 1 hour ago
        reportedBy: 'VW_USER_001',
        verifications: 3,
        description: 'Large pothole on Anna Salai near Landmark',
        status: 'active'
      },
      {
        id: '2',
        type: 'construction',
        severity: 'medium',
        latitude: 13.0878,
        longitude: 80.2785,
        timestamp: Date.now() - 7200000, // 2 hours ago
        reportedBy: 'VW_USER_002',
        verifications: 5,
        description: 'Road construction work blocking right lane',
        status: 'active',
        estimatedResolutionTime: Date.now() + 86400000 // 1 day from now
      },
      {
        id: '3',
        type: 'accident',
        severity: 'critical',
        latitude: 13.0445,
        longitude: 80.2299,
        timestamp: Date.now() - 1800000, // 30 minutes ago
        reportedBy: 'EMERGENCY_SERVICE',
        verifications: 8,
        description: 'Multi-vehicle accident on OMR - Emergency services on site',
        status: 'investigating'
      }
    ];

    setState(prev => ({ ...prev, hazards: initialHazards, isConnected: true }));
  }, []);

  // Add new hazard
  const addHazard = useCallback((hazard: Omit<HazardData, 'id' | 'timestamp' | 'verifications' | 'status'>) => {
    const newHazard: HazardData = {
      ...hazard,
      id: `hazard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      verifications: 1,
      status: 'active'
    };

    setState(prev => ({
      ...prev,
      hazards: [...prev.hazards, newHazard],
      notifications: [...prev.notifications, {
        id: `notif_${Date.now()}`,
        message: `New ${hazard.type} reported near your location`,
        type: 'warning',
        timestamp: Date.now()
      }]
    }));

    return newHazard.id;
  }, []);

  // Verify hazard (increase verification count)
  const verifyHazard = useCallback((hazardId: string) => {
    setState(prev => ({
      ...prev,
      hazards: prev.hazards.map(hazard =>
        hazard.id === hazardId
          ? { ...hazard, verifications: hazard.verifications + 1 }
          : hazard
      ),
      notifications: [...prev.notifications, {
        id: `notif_${Date.now()}`,
        message: 'Thank you for verifying the hazard!',
        type: 'success',
        timestamp: Date.now()
      }]
    }));
  }, []);

  // Update vehicle location
  const updateVehicleLocation = useCallback((location: VehicleLocation) => {
    setState(prev => ({ ...prev, vehicleLocation: location }));
  }, []);

  // Resolve hazard
  const resolveHazard = useCallback((hazardId: string) => {
    setState(prev => ({
      ...prev,
      hazards: prev.hazards.map(hazard =>
        hazard.id === hazardId
          ? { ...hazard, status: 'resolved' as const }
          : hazard
      ),
      notifications: [...prev.notifications, {
        id: `notif_${Date.now()}`,
        message: 'Hazard has been resolved!',
        type: 'success',
        timestamp: Date.now()
      }]
    }));
  }, []);

  // Clear old notifications
  const clearNotification = useCallback((notificationId: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== notificationId)
    }));
  }, []);

  // Get hazards within radius of current location
  const getHazardsNearLocation = useCallback((lat: number, lng: number, radiusKm: number = 5): HazardData[] => {
    return state.hazards.filter(hazard => {
      const distance = calculateDistance(lat, lng, hazard.latitude, hazard.longitude);
      return distance <= radiusKm && hazard.status === 'active';
    });
  }, [state.hazards]);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return {
    // State
    hazards: state.hazards,
    vehicleLocation: state.vehicleLocation,
    isConnected: state.isConnected,
    notifications: state.notifications,
    
    // Actions
    addHazard,
    verifyHazard,
    resolveHazard,
    updateVehicleLocation,
    clearNotification,
    getHazardsNearLocation,
    calculateDistance
  };
};
