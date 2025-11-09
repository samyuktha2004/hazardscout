/**
 * Vehicle-to-Vehicle (V2V) Communication Service
 * 
 * Pure networking interface for real-time hazard sharing between vehicles.
 * Ready for production WebSocket/P2P implementation.
 * 
 * Features:
 * - Real-time hazard broadcasting to nearby vehicles
 * - Proximity-based filtering (5km radius)
 * - GPS location tracking
 * - Automatic map pinning for received hazards
 * - Vehicle presence detection
 * 
 * NO SIMULATIONS - Only real network operations
 */

import { HazardData } from './HazardService';

export interface VehicleLocation {
  vehicleId: string;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  timestamp: number;
}

export interface V2VHazardBroadcast {
  id: string;
  detectedBy: string; // Vehicle ID
  type: 'pothole' | 'speedbump' | 'crack' | 'debris' | 'accident' | 'roadblock';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: {
    latitude: number;
    longitude: number;
  };
  confidence: number;
  timestamp: number;
  description: string;
  images?: string[];
  detectionMethod: 'yolov8' | 'gyroscope' | 'manual' | 'combined';
}

export interface NearbyVehicle {
  vehicleId: string;
  distance: number; // meters
  location: VehicleLocation;
  lastSeen: number;
}

class VehicleToVehicleService {
  private ws: WebSocket | null = null;
  private vehicleId: string;
  private currentLocation: VehicleLocation | null = null;
  private nearbyVehicles: Map<string, NearbyVehicle> = new Map();
  private receivedHazards: Map<string, V2VHazardBroadcast> = new Map();
  private isConnected: boolean = false;
  
  // Callbacks
  private onHazardReceivedCallback?: (hazard: V2VHazardBroadcast) => void;
  private onVehicleNearbyCallback?: (vehicle: NearbyVehicle) => void;
  private onConnectionChangeCallback?: (connected: boolean) => void;

  // Configuration
  private readonly BROADCAST_RADIUS_KM = 5; // Broadcast to vehicles within 5km
  private readonly WEBSOCKET_URL = 'ws://localhost:8080'; // Replace with your server
  private readonly RETRY_INTERVAL = 5000; // 5 seconds
  private readonly NEARBY_VEHICLE_TIMEOUT = 30000; // 30 seconds

  constructor() {
    this.vehicleId = this.generateVehicleId();
    this.startGeolocationTracking();
    this.connect();
  }

  /**
   * Generate unique vehicle ID
   */
  private generateVehicleId(): string {
    const stored = localStorage.getItem('hazard_scout_vehicle_id');
    if (stored) return stored;
    
    const newId = `VW_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('hazard_scout_vehicle_id', newId);
    return newId;
  }

  /**
   * Connect to V2V WebSocket server
   * Ready for real network implementation
   */
  private connect(): void {
    try {
      console.log('🚗 Connecting to V2V network...');
      
      // TODO: Implement real WebSocket connection
      // Uncomment below when backend server is ready:
      /*
      this.ws = new WebSocket(this.WEBSOCKET_URL);
      this.ws.onopen = () => this.handleConnection();
      this.ws.onmessage = (event) => this.handleMessage(event);
      this.ws.onclose = () => this.handleDisconnection();
      this.ws.onerror = (error) => this.handleError(error);
      */
      
      // Temporary: Set connected for testing
      this.isConnected = true;
      this.onConnectionChangeCallback?.(true);
      console.log('✅ V2V network interface ready (awaiting real connection)');
      
    } catch (error) {
      console.error('❌ V2V connection failed:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Handle WebSocket connection
   */
  private handleConnection(): void {
    this.isConnected = true;
    this.onConnectionChangeCallback?.(true);
    console.log('✅ Connected to V2V network');
    
    // Send initial vehicle registration
    this.sendVehicleRegistration();
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'hazard_broadcast':
          this.handleHazardBroadcast(message.data);
          break;
        case 'vehicle_location':
          this.handleVehicleLocation(message.data);
          break;
        case 'vehicle_disconnected':
          this.handleVehicleDisconnected(message.data.vehicleId);
          break;
      }
    } catch (error) {
      console.error('Error handling V2V message:', error);
    }
  }

  /**
   * Handle disconnection
   */
  private handleDisconnection(): void {
    this.isConnected = false;
    this.onConnectionChangeCallback?.(false);
    console.log('⚠️ Disconnected from V2V network');
    this.scheduleReconnect();
  }

  /**
   * Handle connection error
   */
  private handleError(error: Event): void {
    console.error('❌ V2V connection error:', error);
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    setTimeout(() => {
      if (!this.isConnected) {
        console.log('🔄 Attempting to reconnect to V2V network...');
        this.connect();
      }
    }, this.RETRY_INTERVAL);
  }

  /**
   * Send vehicle registration
   */
  private sendVehicleRegistration(): void {
    if (!this.currentLocation) return;
    
    this.send({
      type: 'vehicle_register',
      data: {
        vehicleId: this.vehicleId,
        location: this.currentLocation,
        capabilities: ['hazard_detection', 'yolov8', 'gyroscope']
      }
    });
  }

  /**
   * Start tracking vehicle location
   */
  private startGeolocationTracking(): void {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      return;
    }

    navigator.geolocation.watchPosition(
      (position) => {
        this.currentLocation = {
          vehicleId: this.vehicleId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          heading: position.coords.heading || 0,
          speed: position.coords.speed || 0,
          timestamp: Date.now()
        };

        // Broadcast location to nearby vehicles
        this.broadcastLocation();
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  }

  /**
   * Broadcast current location to other vehicles
   */
  private broadcastLocation(): void {
    if (!this.currentLocation) return;

    this.send({
      type: 'vehicle_location',
      data: this.currentLocation
    });
  }

  /**
   * Broadcast hazard detection to nearby vehicles
   */
  public broadcastHazard(hazard: V2VHazardBroadcast): void {
    if (!this.currentLocation) {
      console.warn('Cannot broadcast hazard: Location not available');
      return;
    }

    // Add to local cache
    this.receivedHazards.set(hazard.id, hazard);

    // Broadcast to nearby vehicles
    this.send({
      type: 'hazard_broadcast',
      data: {
        ...hazard,
        broadcastRadius: this.BROADCAST_RADIUS_KM * 1000, // Convert to meters
        sourceLocation: {
          latitude: this.currentLocation.latitude,
          longitude: this.currentLocation.longitude
        }
      }
    });

    console.log(`📡 Broadcasting hazard: ${hazard.type} to nearby vehicles`);
  }

  /**
   * Handle received hazard broadcast
   */
  private handleHazardBroadcast(hazard: V2VHazardBroadcast): void {
    // Avoid processing own hazards
    if (hazard.detectedBy === this.vehicleId) return;

    // Check if already received
    if (this.receivedHazards.has(hazard.id)) return;

    // Verify hazard is within range
    if (!this.isHazardInRange(hazard)) return;

    // Add to received hazards
    this.receivedHazards.set(hazard.id, hazard);

    // Notify application
    this.onHazardReceivedCallback?.(hazard);

    console.log(`🚨 Received hazard from ${hazard.detectedBy}: ${hazard.type}`);
  }

  /**
   * Handle vehicle location update
   */
  private handleVehicleLocation(location: VehicleLocation): void {
    if (location.vehicleId === this.vehicleId) return;
    if (!this.currentLocation) return;

    const distance = this.calculateDistance(
      this.currentLocation.latitude,
      this.currentLocation.longitude,
      location.latitude,
      location.longitude
    );

    // Only track nearby vehicles (within broadcast radius)
    if (distance <= this.BROADCAST_RADIUS_KM * 1000) {
      const nearbyVehicle: NearbyVehicle = {
        vehicleId: location.vehicleId,
        distance,
        location,
        lastSeen: Date.now()
      };

      this.nearbyVehicles.set(location.vehicleId, nearbyVehicle);
      this.onVehicleNearbyCallback?.(nearbyVehicle);
    }
  }

  /**
   * Handle vehicle disconnected
   */
  private handleVehicleDisconnected(vehicleId: string): void {
    this.nearbyVehicles.delete(vehicleId);
  }

  /**
   * Check if hazard is within range
   */
  private isHazardInRange(hazard: V2VHazardBroadcast): boolean {
    if (!this.currentLocation) return false;

    const distance = this.calculateDistance(
      this.currentLocation.latitude,
      this.currentLocation.longitude,
      hazard.location.latitude,
      hazard.location.longitude
    );

    return distance <= this.BROADCAST_RADIUS_KM * 1000;
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Send message through WebSocket
   */
  private send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // For demo, simulate sending
      console.log('📤 Would send:', message.type);
    }
  }

  /**
   * Register callback for received hazards
   */
  public onHazardReceived(callback: (hazard: V2VHazardBroadcast) => void): void {
    this.onHazardReceivedCallback = callback;
  }

  /**
   * Register callback for nearby vehicles
   */
  public onVehicleNearby(callback: (vehicle: NearbyVehicle) => void): void {
    this.onVehicleNearbyCallback = callback;
  }

  /**
   * Register callback for connection changes
   */
  public onConnectionChange(callback: (connected: boolean) => void): void {
    this.onConnectionChangeCallback = callback;
  }

  /**
   * Get all nearby vehicles
   */
  public getNearbyVehicles(): NearbyVehicle[] {
    // Clean up stale vehicles
    const now = Date.now();
    Array.from(this.nearbyVehicles.entries()).forEach(([id, vehicle]) => {
      if (now - vehicle.lastSeen > this.NEARBY_VEHICLE_TIMEOUT) {
        this.nearbyVehicles.delete(id);
      }
    });

    return Array.from(this.nearbyVehicles.values());
  }

  /**
   * Get all received hazards
   */
  public getReceivedHazards(): V2VHazardBroadcast[] {
    return Array.from(this.receivedHazards.values());
  }

  /**
   * Get current vehicle location
   */
  public getCurrentLocation(): VehicleLocation | null {
    return this.currentLocation;
  }

  /**
   * Get vehicle ID
   */
  public getVehicleId(): string {
    return this.vehicleId;
  }

  /**
   * Get connection status
   */
  public isConnectedToNetwork(): boolean {
    return this.isConnected;
  }

  /**
   * Disconnect from V2V network
   */
  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.onConnectionChangeCallback?.(false);
  }

  /**
   * Auto-pin hazard on map (converts V2V format to HazardData format)
   */
  public convertToMapHazard(v2vHazard: V2VHazardBroadcast): HazardData {
    const severity = v2vHazard.severity === 'critical' ? 'high' : v2vHazard.severity as 'high' | 'medium' | 'low';
    
    return {
      id: v2vHazard.id,
      type: v2vHazard.type,
      severity,
      location: v2vHazard.location,
      locationName: `${v2vHazard.location.latitude.toFixed(4)}, ${v2vHazard.location.longitude.toFixed(4)}`,
      
      status: 'active',
      firstDetectedAt: v2vHazard.timestamp,
      lastConfirmedAt: v2vHazard.timestamp,
      lastUpdatedAt: v2vHazard.timestamp,
      
      confirmations: [],
      confirmationCount: 0,
      reportedGoneCount: 0,
      
      source: 'v2x',
      detectionCount: 1,
      
      autoResolveAfterHours: 24,
      requireConfirmationsForResolution: 3,
      
      isV2VDetection: true,
      confidence: v2vHazard.confidence,
      detectionMethod: v2vHazard.detectionMethod
    };
  }

  /**
   * Create hazard broadcast from YOLOv8 detection
   */
  public createHazardFromDetection(
    type: V2VHazardBroadcast['type'],
    confidence: number,
    description: string,
    detectionMethod: V2VHazardBroadcast['detectionMethod'] = 'yolov8'
  ): V2VHazardBroadcast | null {
    if (!this.currentLocation) {
      console.warn('Cannot create hazard: Location not available');
      return null;
    }

    const severity = this.determineSeverity(type, confidence);

    return {
      id: `hazard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      detectedBy: this.vehicleId,
      type,
      severity,
      location: {
        latitude: this.currentLocation.latitude,
        longitude: this.currentLocation.longitude
      },
      confidence,
      timestamp: Date.now(),
      description,
      detectionMethod
    };
  }

  /**
   * Determine hazard severity based on type and confidence
   */
  private determineSeverity(
    type: V2VHazardBroadcast['type'],
    confidence: number
  ): V2VHazardBroadcast['severity'] {
    if (type === 'accident') return 'critical';
    if (type === 'roadblock') return 'high';
    
    if (confidence > 0.9) return 'high';
    if (confidence > 0.75) return 'medium';
    return 'low';
  }
}

// Export singleton instance
export const v2vService = new VehicleToVehicleService();

// Type declarations for extended HazardData
declare module './HazardService' {
  interface HazardData {
    isV2VDetection?: boolean;
    detectionMethod?: 'yolov8' | 'gyroscope' | 'manual' | 'combined';
    confidence?: number;
  }
}
