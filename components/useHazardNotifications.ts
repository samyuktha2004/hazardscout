import { useEffect, useRef } from 'react';
import { notificationService, HazardNotificationData } from './NotificationService';

interface HazardData {
  id: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  distance: string; // e.g., "300m", "1.2km"
  location: string;
  latitude?: number;
  longitude?: number;
}

// Convert distance string to meters
function parseDistanceToMeters(distance: string): number {
  const match = distance.match(/^([\d.]+)(m|km)$/);
  if (!match) return 0;
  
  const value = parseFloat(match[1]);
  const unit = match[2];
  
  return unit === 'km' ? value * 1000 : value;
}

// Convert HazardData to HazardNotificationData
function convertToNotificationData(hazard: HazardData): HazardNotificationData {
  return {
    id: hazard.id,
    type: hazard.type,
    severity: hazard.severity,
    distance: parseDistanceToMeters(hazard.distance),
    location: hazard.location,
    latitude: hazard.latitude,
    longitude: hazard.longitude,
  };
}

export function useHazardNotifications(hazards: HazardData[]) {
  const previousHazardsRef = useRef<Set<string>>(new Set());
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check hazards immediately
    checkHazardsForNotifications();

    // Set up periodic checking (every 5 seconds)
    checkIntervalRef.current = setInterval(() => {
      checkHazardsForNotifications();
    }, 5000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [hazards]);

  const checkHazardsForNotifications = async () => {
    const currentHazardIds = new Set(hazards.map(h => h.id));
    
    // Check for new or updated hazards
    const notificationData = hazards.map(convertToNotificationData);
    await notificationService.checkHazards(notificationData);

    // Clean up notified hazards that no longer exist (resolved)
    previousHazardsRef.current.forEach(hazardId => {
      if (!currentHazardIds.has(hazardId)) {
        notificationService.clearNotifiedHazard(hazardId);
      }
    });

    previousHazardsRef.current = currentHazardIds;
  };
}

// Test notification function for settings screen
export async function testHazardNotification(): Promise<void> {
  const testHazard: HazardNotificationData = {
    id: 'test-' + Date.now(),
    type: 'Pothole',
    severity: 'high',
    distance: 500, // 500m
    location: 'Test Road, Downtown',
  };

  await notificationService.notifyHazard(testHazard);
}
