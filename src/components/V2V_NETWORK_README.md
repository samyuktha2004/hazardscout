# V2V Network Service - Hazard Alert Sharing

## 📡 Overview

Production-ready Vehicle-to-Vehicle (V2V) communication system that:
- ✅ **Broadcasts hazard alerts** to nearby vehicles (5km radius)
- ✅ **Automatically marks hazards** on map when received
- ✅ **Real GPS tracking** for location-based filtering
- ✅ **WebSocket connection** with auto-reconnect
- ✅ **Proximity filtering** using Haversine formula

## 🚀 Quick Start

### 1. Import the service

```typescript
import { v2vNetwork, shareHazardDetection } from './V2VNetworkIntegration';
```

### 2. Share a hazard detection

```typescript
// When YOLOv8 detects a pothole:
shareHazardDetection(
  'pothole',      // type
  13.0827,        // latitude
  80.2707,        // longitude
  0.92            // confidence (92%)
);
```

### 3. Receive alerts automatically

```typescript
v2vNetwork.onAlert((alert) => {
  // Hazard is ALREADY marked on map automatically
  console.log('Received:', alert.type, alert.location);
  
  // Show notification to driver
  showNotification(`⚠️ ${alert.type} ahead!`);
});
```

## 📋 API Reference

### Broadcast Hazard Alert

```typescript
v2vNetwork.broadcastHazardAlert(
  type,         // 'pothole' | 'speedbump' | 'crack' | 'debris'
  latitude,     // number
  longitude,    // number
  confidence,   // number (0-1)
  description,  // string
  severity,     // 'low' | 'medium' | 'high' (optional)
  detectionMethod // 'yolov8' | 'gyroscope' | 'manual' (optional)
);
```

**What happens:**
1. Hazard is marked on YOUR map
2. Alert is broadcast to all vehicles within 5km
3. Those vehicles automatically mark it on THEIR maps

### Listen for Alerts

```typescript
v2vNetwork.onAlert((alert: HazardAlert) => {
  // Callback when nearby vehicle shares a hazard
  // Alert structure:
  // {
  //   id: string
  //   vehicleId: string
  //   type: 'pothole' | 'speedbump' | 'crack' | 'debris'
  //   location: { latitude: number, longitude: number }
  //   confidence: number
  //   severity: 'low' | 'medium' | 'high'
  //   timestamp: number
  //   description: string
  //   detectionMethod: 'yolov8' | 'gyroscope' | 'manual'
  // }
});
```

### Monitor Connection

```typescript
v2vNetwork.onConnectionStatusChange((connected: boolean) => {
  if (connected) {
    console.log('✅ V2V network online');
  } else {
    console.log('⚠️ V2V network offline');
  }
});
```

### Get Status

```typescript
// Check if connected
const isConnected = v2vNetwork.getConnectionStatus();

// Get current GPS position
const position = v2vNetwork.getCurrentPosition();
// Returns: { vehicleId, latitude, longitude, heading, speed, timestamp }
```

## 🔌 Backend Server Setup

The service connects to a WebSocket server at `ws://localhost:8080/v2v`

### Server Requirements:

1. **Accept WebSocket connections**
2. **Handle message types:**
   - `register` - Vehicle registration
   - `hazard_alert` - Broadcast hazard to nearby vehicles
   - `heartbeat` - Keep connection alive

### Example Server Message Flow:

```javascript
// Client → Server: Vehicle registers
{
  type: 'register',
  vehicleId: 'VW_12345',
  position: { latitude: 13.0827, longitude: 80.2707, ... },
  capabilities: ['hazard_detection', 'yolov8', 'gyroscope']
}

// Client → Server: Broadcast hazard
{
  type: 'hazard_alert',
  data: {
    id: 'hazard_123',
    vehicleId: 'VW_12345',
    type: 'pothole',
    location: { latitude: 13.0827, longitude: 80.2707 },
    confidence: 0.92,
    ...
  },
  broadcastRadius: 5000  // meters
}

// Server → Client: Forward alert to nearby vehicles
{
  type: 'hazard_alert',
  data: { ...hazard alert... }
}
```

### Simple Node.js Server Example:

```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const vehicles = new Map(); // vehicleId -> { ws, position }

wss.on('connection', (ws) => {
  let vehicleId = null;
  
  ws.on('message', (data) => {
    const message = JSON.parse(data);
    
    if (message.type === 'register') {
      vehicleId = message.vehicleId;
      vehicles.set(vehicleId, { ws, position: message.position });
    }
    
    if (message.type === 'hazard_alert') {
      // Broadcast to vehicles within radius
      const alert = message.data;
      vehicles.forEach((vehicle, id) => {
        if (id !== vehicleId && isWithinRadius(vehicle.position, alert.location)) {
          vehicle.ws.send(JSON.stringify(message));
        }
      });
    }
  });
  
  ws.on('close', () => {
    if (vehicleId) vehicles.delete(vehicleId);
  });
});
```

## 🔧 Configuration

Edit `V2VNetworkService.ts` to change settings:

```typescript
const V2V_CONFIG = {
  WEBSOCKET_URL: 'ws://your-server.com/v2v',  // Your WebSocket server
  BROADCAST_RADIUS_KM: 5,                      // Share within 5km
  RECONNECT_INTERVAL: 5000,                    // Retry every 5 seconds
  HEARTBEAT_INTERVAL: 30000,                   // Heartbeat every 30 seconds
};
```

## 📍 Automatic Map Marking

When a hazard alert is received, it's **automatically** added to the map via `HazardService`:

```typescript
hazardService.addHazard({
  type: 'pothole',
  severity: 'high',
  location: { latitude: 13.0827, longitude: 80.2707 },
  locationName: 'POTHOLE - Shared via V2V',
  source: 'v2x',
  autoResolveAfterHours: 24,
  requireConfirmationsForResolution: 3,
});
```

Drivers will see:
- 📍 Marker on map
- 🔔 Toast notification
- ℹ️ Hazard details in list

## 🎯 Integration with YOLOv8

```typescript
import { onYOLOv8Detection } from './V2VNetworkIntegration';

// When YOLO detects something:
const detections = await yoloModel.detect(frame);

detections.forEach(det => {
  if (det.confidence > 0.75) {
    onYOLOv8Detection(
      det.class,        // 'pothole', 'speedbump', etc.
      det.confidence,   // 0.92
      det.bbox          // { x, y, width, height }
    );
  }
});
```

## ⚡ Features

### ✅ Real-Time Communication
- WebSocket connection with auto-reconnect
- Heartbeat mechanism keeps connection alive
- Handles network interruptions gracefully

### ✅ Location-Based Filtering
- GPS tracking via browser Geolocation API
- Haversine formula for accurate distance calculation
- Only receives alerts from vehicles within 5km

### ✅ Automatic Map Integration
- Received hazards auto-marked on map
- Broadcast hazards marked on sender's map too
- Uses existing `HazardService` infrastructure

### ✅ Production Ready
- TypeScript with full type safety
- Singleton pattern (one instance per app)
- Error handling and logging
- Clean separation of concerns

## 🧪 Testing Without Server

For testing without a backend server, the service will:
- ✅ Show "V2V network interface ready"
- ✅ Track GPS location
- ✅ Allow broadcasting (logged locally)
- ❌ Won't receive alerts from other vehicles

You can still test:
- Sharing detections (will mark on map)
- GPS position tracking
- Connection status monitoring

## 📊 Status Information

Check current status:

```typescript
console.log('Connected:', v2vNetwork.getConnectionStatus());
console.log('Position:', v2vNetwork.getCurrentPosition());
```

## 🔐 Security Considerations

**For Production:**
1. Use WSS (WebSocket Secure) instead of WS
2. Implement authentication for vehicle registration
3. Validate hazard data on server side
4. Rate limit broadcasts to prevent spam
5. Encrypt sensitive location data

## 📝 Summary

**One line summary:** Share hazard detections with nearby vehicles and automatically mark received hazards on map.

**Three steps to use:**
1. Import `shareHazardDetection`
2. Call it when YOLOv8 detects a hazard
3. Receive and display alerts automatically

**Zero configuration needed** - Works out of the box with test mode!

---

**Ready to share hazards!** 🚗💨
