/**
 * V2V Network Service - Production Ready
 * 
 * Handles real-time hazard alert sharing between vehicles
 * Automatically marks hazard locations on map for all nearby vehicles
 */

import { hazardService } from './HazardService';

// Network Configuration
const V2V_CONFIG = {
  WEBSOCKET_URL: 'ws://localhost:8080/v2v',  // Replace with your server
  BROADCAST_RADIUS_KM: 5,                     // Share with vehicles within 5km
  RECONNECT_INTERVAL: 5000,                   // Retry every 5 seconds
  HEARTBEAT_INTERVAL: 30000,                  // Send heartbeat every 30 seconds
};

// Types
export interface HazardAlert {
  id: string;
  vehicleId: string;
  type: 'pothole' | 'speedbump' | 'crack' | 'debris' | 'accident' | 'roadblock';
  severity: 'low' | 'medium' | 'high';
  location: {
    latitude: number;
    longitude: number;
  };
  confidence: number;
  timestamp: number;
  description: string;
  detectionMethod: 'yolov8' | 'gyroscope' | 'manual' | 'combined';
}

export interface VehiclePosition {
  vehicleId: string;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  timestamp: number;
}

// V2V Network Service Class
class V2VNetworkService {
  private ws: WebSocket | null = null;
  private vehicleId: string;
  private currentPosition: VehiclePosition | null = null;
  private isConnected: boolean = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  // Callbacks
  private onAlertReceived?: (alert: HazardAlert) => void;
  private onConnectionChange?: (connected: boolean) => void;

  constructor() {
    this.vehicleId = this.getOrCreateVehicleId();
    this.startGPSTracking();
    this.connect();
  }

  /**
   * Generate or retrieve vehicle ID
   */
  private getOrCreateVehicleId(): string {
    let id = localStorage.getItem('v2v_vehicle_id');
    if (!id) {
      id = `VW_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('v2v_vehicle_id', id);
    }
    return id;
  }

  /**
   * Connect to V2V WebSocket server
   */
  private connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      console.log('🚗 Connecting to V2V network...');
      
      this.ws = new WebSocket(V2V_CONFIG.WEBSOCKET_URL);
      
      this.ws.onopen = () => {
        console.log('✅ Connected to V2V network');
        this.isConnected = true;
        this.onConnectionChange?.(true);
        this.startHeartbeat();
        this.sendVehicleRegistration();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onclose = () => {
        console.log('⚠️ Disconnected from V2V network');
        this.isConnected = false;
        this.onConnectionChange?.(false);
        this.stopHeartbeat();
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('❌ V2V connection error:', error);
      };

    } catch (error) {
      console.error('Failed to connect to V2V network:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimeout) return;
    
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      console.log('🔄 Reconnecting to V2V network...');
      this.connect();
    }, V2V_CONFIG.RECONNECT_INTERVAL);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.currentPosition) {
        this.send({
          type: 'heartbeat',
          vehicleId: this.vehicleId,
          position: this.currentPosition,
          timestamp: Date.now()
        });
      }
    }, V2V_CONFIG.HEARTBEAT_INTERVAL);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case 'hazard_alert':
          this.handleHazardAlert(message.data);
          break;
        
        case 'vehicle_position':
          // Other vehicle positions can be tracked if needed
          break;
        
        case 'ack':
          console.log('✓ Message acknowledged by server');
          break;
        
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing V2V message:', error);
    }
  }

  /**
   * Handle received hazard alert
   * Automatically marks location on map
   */
  private handleHazardAlert(alert: HazardAlert): void {
    // Don't process our own alerts
    if (alert.vehicleId === this.vehicleId) return;

    // Check if alert is within our range
    if (!this.isWithinRange(alert.location)) {
      return;
    }

    console.log(`🚨 Hazard alert received: ${alert.type} from ${alert.vehicleId}`);

    // Automatically mark hazard on map
    this.markHazardOnMap(alert);

    // Notify application
    this.onAlertReceived?.(alert);
  }

  /**
   * Check if location is within broadcast range
   */
  private isWithinRange(location: { latitude: number; longitude: number }): boolean {
    if (!this.currentPosition) return false;

    const distance = this.calculateDistance(
      this.currentPosition.latitude,
      this.currentPosition.longitude,
      location.latitude,
      location.longitude
    );

    return distance <= V2V_CONFIG.BROADCAST_RADIUS_KM * 1000; // Convert to meters
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   * Returns distance in meters
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
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

  /**
   * Automatically mark hazard on map
   */
  private markHazardOnMap(alert: HazardAlert): void {
    try {
      // Add hazard to map via hazardService
      hazardService.addHazard({
        type: alert.type,
        severity: alert.severity,
        location: {
          latitude: alert.location.latitude,
          longitude: alert.location.longitude,
        },
        locationName: `${alert.type.toUpperCase()} - Shared via V2V`,
        source: 'v2x',
        autoResolveAfterHours: 24,
        requireConfirmationsForResolution: 3,
      });

      console.log(`📍 Hazard marked on map: ${alert.type} at (${alert.location.latitude}, ${alert.location.longitude})`);
    } catch (error) {
      console.error('Failed to mark hazard on map:', error);
    }
  }

  /**
   * Broadcast hazard alert to nearby vehicles
   * Automatically marks on sender's map too
   */
  public broadcastHazardAlert(
    type: HazardAlert['type'],
    latitude: number,
    longitude: number,
    confidence: number,
    description: string,
    severity: HazardAlert['severity'] = 'medium',
    detectionMethod: HazardAlert['detectionMethod'] = 'yolov8'
  ): void {
    const alert: HazardAlert = {
      id: `hazard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      vehicleId: this.vehicleId,
      type,
      severity,
      location: { latitude, longitude },
      confidence,
      timestamp: Date.now(),
      description,
      detectionMethod,
    };

    // Mark on our own map first
    this.markHazardOnMap(alert);

    // Broadcast to nearby vehicles
    this.send({
      type: 'hazard_alert',
      data: alert,
      broadcastRadius: V2V_CONFIG.BROADCAST_RADIUS_KM * 1000,
    });

    console.log(`📡 Broadcasting hazard alert: ${type} to nearby vehicles`);
  }

  /**
   * Send vehicle registration to server
   */
  private sendVehicleRegistration(): void {
    this.send({
      type: 'register',
      vehicleId: this.vehicleId,
      position: this.currentPosition,
      capabilities: ['hazard_detection', 'yolov8', 'gyroscope'],
      timestamp: Date.now(),
    });
  }

  /**
   * Send message through WebSocket
   */
  private send(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('Cannot send message: WebSocket not connected');
    }
  }

  /**
   * Start GPS tracking
   */
  private startGPSTracking(): void {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      return;
    }

    navigator.geolocation.watchPosition(
      (position) => {
        this.currentPosition = {
          vehicleId: this.vehicleId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          heading: position.coords.heading || 0,
          speed: position.coords.speed || 0,
          timestamp: Date.now(),
        };
      },
      (error) => {
        console.error('GPS error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }

  /**
   * Register callback for received alerts
   */
  public onAlert(callback: (alert: HazardAlert) => void): void {
    this.onAlertReceived = callback;
  }

  /**
   * Register callback for connection changes
   */
  public onConnectionStatusChange(callback: (connected: boolean) => void): void {
    this.onConnectionChange = callback;
  }

  /**
   * Get current connection status
   */
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get current vehicle position
   */
  public getCurrentPosition(): VehiclePosition | null {
    return this.currentPosition;
  }

  /**
   * Disconnect and cleanup
   */
  public disconnect(): void {
    this.stopHeartbeat();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}

// Export singleton instance
export const v2vNetwork = new V2VNetworkService();
export default V2VNetworkService;
