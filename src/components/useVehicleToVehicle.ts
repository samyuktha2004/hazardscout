/**
 * React Hook for Vehicle-to-Vehicle Communication
 * Automatically broadcasts detections and receives hazards from nearby vehicles
 */

import { useState, useEffect, useCallback } from 'react';
import { v2vService, V2VHazardBroadcast, NearbyVehicle } from './VehicleToVehicleService';
import { HazardData } from './HazardService';

export interface V2VStats {
  connectedVehicles: number;
  hazardsReceived: number;
  hazardsBroadcasted: number;
  isConnected: boolean;
}

export function useVehicleToVehicle(
  onHazardDetected?: (hazard: HazardData) => void
) {
  const [nearbyVehicles, setNearbyVehicles] = useState<NearbyVehicle[]>([]);
  const [receivedHazards, setReceivedHazards] = useState<V2VHazardBroadcast[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [broadcastCount, setBroadcastCount] = useState(0);

  // Initialize V2V service
  useEffect(() => {
    // Listen for received hazards
    v2vService.onHazardReceived((v2vHazard) => {
      console.log('🚨 V2V Hazard received:', v2vHazard);
      
      // Add to received hazards
      setReceivedHazards(prev => {
        if (prev.some(h => h.id === v2vHazard.id)) return prev;
        return [...prev, v2vHazard];
      });

      // Convert to map hazard and notify
      if (onHazardDetected) {
        const mapHazard = v2vService.convertToMapHazard(v2vHazard);
        onHazardDetected(mapHazard);
      }
    });

    // Listen for nearby vehicles
    v2vService.onVehicleNearby((vehicle) => {
      console.log('🚗 Nearby vehicle detected:', vehicle.vehicleId);
      setNearbyVehicles(prev => {
        const filtered = prev.filter(v => v.vehicleId !== vehicle.vehicleId);
        return [...filtered, vehicle];
      });
    });

    // Listen for connection changes
    v2vService.onConnectionChange((connected) => {
      console.log('📡 V2V connection:', connected ? 'Connected' : 'Disconnected');
      setIsConnected(connected);
    });

    // Update nearby vehicles every 5 seconds
    const interval = setInterval(() => {
      const vehicles = v2vService.getNearbyVehicles();
      setNearbyVehicles(vehicles);
    }, 5000);

    return () => {
      clearInterval(interval);
      v2vService.disconnect();
    };
  }, [onHazardDetected]);

  /**
   * Broadcast hazard detection to nearby vehicles
   */
  const broadcastHazard = useCallback((
    type: V2VHazardBroadcast['type'],
    confidence: number,
    description: string,
    detectionMethod: V2VHazardBroadcast['detectionMethod'] = 'yolov8'
  ) => {
    const hazard = v2vService.createHazardFromDetection(
      type,
      confidence,
      description,
      detectionMethod
    );

    if (hazard) {
      v2vService.broadcastHazard(hazard);
      setBroadcastCount(prev => prev + 1);
      console.log('📡 Broadcasted hazard to nearby vehicles');
      return hazard;
    }

    return null;
  }, []);

  /**
   * Get V2V statistics
   */
  const getStats = useCallback((): V2VStats => {
    return {
      connectedVehicles: nearbyVehicles.length,
      hazardsReceived: receivedHazards.length,
      hazardsBroadcasted: broadcastCount,
      isConnected
    };
  }, [nearbyVehicles, receivedHazards, broadcastCount, isConnected]);

  return {
    nearbyVehicles,
    receivedHazards,
    isConnected,
    broadcastHazard,
    getStats,
    vehicleId: v2vService.getVehicleId()
  };
}
