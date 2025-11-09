/**
 * V2V Network Integration Example
 * 
 * Shows how to use the V2VNetworkService to:
 * 1. Share hazard alerts with nearby vehicles
 * 2. Automatically mark received hazards on map
 */

import { v2vNetwork } from './V2VNetworkService';
import { toast } from 'sonner';

// ============================================
// SETUP: Initialize V2V Network
// ============================================

// The v2vNetwork is already initialized as a singleton
// It automatically:
// - Connects to WebSocket server
// - Starts GPS tracking
// - Handles reconnection
// - Sends heartbeats

// ============================================
// STEP 1: Listen for incoming hazard alerts
// ============================================

v2vNetwork.onAlert((alert) => {
  // This callback is triggered when a nearby vehicle shares a hazard
  // The hazard is AUTOMATICALLY marked on the map
  
  console.log('🚨 Received hazard alert from nearby vehicle:', alert);
  
  // Show notification to driver
  toast.error(`Hazard Alert: ${alert.type.toUpperCase()}`, {
    description: `${alert.description} (${(alert.confidence * 100).toFixed(0)}% confidence)`,
    duration: 5000,
  });
});

// ============================================
// STEP 2: Monitor connection status
// ============================================

v2vNetwork.onConnectionStatusChange((connected) => {
  if (connected) {
    console.log('✅ Connected to V2V network');
    toast.success('V2V Network Connected', {
      description: 'Now sharing hazards with nearby vehicles',
    });
  } else {
    console.log('⚠️ Disconnected from V2V network');
    toast.warning('V2V Network Disconnected', {
      description: 'Attempting to reconnect...',
    });
  }
});

// ============================================
// STEP 3: Broadcast hazard when detected
// ============================================

/**
 * Call this function when YOLOv8 detects a hazard
 */
export function shareHazardDetection(
  type: 'pothole' | 'speedbump' | 'crack' | 'debris',
  latitude: number,
  longitude: number,
  confidence: number
): void {
  // Determine severity based on type and confidence
  let severity: 'low' | 'medium' | 'high' = 'medium';
  
  if (type === 'pothole' && confidence > 0.85) {
    severity = 'high';
  } else if (confidence < 0.75) {
    severity = 'low';
  }
  
  // Broadcast to nearby vehicles
  // This will also automatically mark it on our own map
  v2vNetwork.broadcastHazardAlert(
    type,
    latitude,
    longitude,
    confidence,
    `${type.toUpperCase()} detected by YOLOv8`,
    severity,
    'yolov8'
  );
  
  console.log(`📡 Shared ${type} detection with nearby vehicles`);
}

// ============================================
// INTEGRATION EXAMPLE: YOLOv8 Detection
// ============================================

/**
 * Example: When YOLOv8 detects a hazard
 */
export function onYOLOv8Detection(
  detectionType: string,
  confidence: number,
  boundingBox: { x: number; y: number; width: number; height: number }
): void {
  // Only share high-confidence detections
  if (confidence < 0.75) {
    return;
  }
  
  // Get current GPS position
  const position = v2vNetwork.getCurrentPosition();
  if (!position) {
    console.warn('Cannot share detection: GPS position not available');
    return;
  }
  
  // Map detection type to hazard type
  const hazardType = mapDetectionToHazardType(detectionType);
  if (!hazardType) {
    return; // Unknown detection type
  }
  
  // Share with nearby vehicles
  shareHazardDetection(
    hazardType,
    position.latitude,
    position.longitude,
    confidence
  );
}

/**
 * Helper: Map YOLOv8 detection class to hazard type
 */
function mapDetectionToHazardType(
  detectionClass: string
): 'pothole' | 'speedbump' | 'crack' | 'debris' | null {
  const mapping: Record<string, 'pothole' | 'speedbump' | 'crack' | 'debris'> = {
    'pothole': 'pothole',
    'pot_hole': 'pothole',
    'hole': 'pothole',
    'speedbump': 'speedbump',
    'speed_bump': 'speedbump',
    'bump': 'speedbump',
    'crack': 'crack',
    'road_crack': 'crack',
    'debris': 'debris',
    'obstacle': 'debris',
    'object': 'debris',
  };
  
  return mapping[detectionClass.toLowerCase()] || null;
}

// ============================================
// USAGE EXAMPLES
// ============================================

/*

// Example 1: Share a pothole detection
shareHazardDetection(
  'pothole',
  13.0827,  // latitude
  80.2707,  // longitude
  0.92      // 92% confidence
);

// Example 2: Share a speedbump detection
shareHazardDetection(
  'speedbump',
  13.0830,
  80.2710,
  0.87
);

// Example 3: Integrate with YOLOv8
// When your YOLO model detects something:
onYOLOv8Detection('pothole', 0.94, { x: 100, y: 200, width: 50, height: 40 });

// Example 4: Check connection status
if (v2vNetwork.getConnectionStatus()) {
  console.log('V2V network is connected');
} else {
  console.log('V2V network is disconnected');
}

// Example 5: Get current vehicle position
const position = v2vNetwork.getCurrentPosition();
if (position) {
  console.log(`Vehicle at: ${position.latitude}, ${position.longitude}`);
  console.log(`Speed: ${position.speed} m/s`);
  console.log(`Heading: ${position.heading}°`);
}

*/

// ============================================
// CLEANUP
// ============================================

/**
 * Call this when app is closing/unmounting
 */
export function disconnectV2V(): void {
  v2vNetwork.disconnect();
  console.log('V2V network disconnected');
}

// Export for use in React components
export { v2vNetwork };
