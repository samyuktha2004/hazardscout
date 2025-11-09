/**
 * V2V Auto-Pin Integration
 * Automatically pins hazards detected by nearby vehicles on the map
 * This component bridges LiveDetectionDemo, V2V Service, and MapboxMap
 */

import { useEffect, useCallback } from 'react';
import { useVehicleToVehicle } from './useVehicleToVehicle';
import { HazardData } from './HazardService';
import { toast } from 'sonner';

export interface V2VAutoPinProps {
  onHazardReceived: (hazard: HazardData) => void;
  enableNotifications?: boolean;
  enableAutoBroadcast?: boolean;
}

export function V2VAutoPinIntegration({
  onHazardReceived,
  enableNotifications = true,
  enableAutoBroadcast = true
}: V2VAutoPinProps) {
  
  const { broadcastHazard, isConnected, nearbyVehicles, getStats } = useVehicleToVehicle(
    useCallback((hazard: HazardData) => {
      // Received hazard from nearby vehicle
      console.log('📍 Auto-pinning hazard on map:', hazard);
      
      // Show notification
      if (enableNotifications) {
        toast.success('🚨 Hazard Alert from Nearby Vehicle', {
          description: `${hazard.type.toUpperCase()} detected at ${hazard.locationName}`,
          duration: 5000,
        });
      }

      // Auto-pin on map
      onHazardReceived(hazard);
    }, [onHazardReceived, enableNotifications])
  );

  // Broadcast connection status changes
  useEffect(() => {
    if (isConnected) {
      console.log('✅ V2V Network Connected');
      if (enableNotifications) {
        toast.success('V2V Network Connected', {
          description: `${nearbyVehicles.length} nearby vehicles detected`,
        });
      }
    } else {
      console.log('⚠️ V2V Network Disconnected');
    }
  }, [isConnected, enableNotifications, nearbyVehicles.length]);

  // Return broadcast function for external use
  return {
    broadcastHazard,
    isConnected,
    nearbyVehicles,
    stats: getStats()
  };
}

/**
 * Usage Example in App.tsx or Dashboard:
 * 
 * ```tsx
 * const [hazards, setHazards] = useState<HazardData[]>([]);
 * const { broadcastHazard } = V2VAutoPinIntegration({
 *   onHazardReceived: (hazard) => {
 *     setHazards(prev => [...prev, hazard]);
 *   }
 * });
 * 
 * // When detection occurs:
 * broadcastHazard('pothole', 0.92, 'Detected by YOLOv8', 'yolov8');
 * ```
 */
