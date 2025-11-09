import { HazardData, VehicleLocation } from './useHazardState';

/**
 * HazardSimulator - The "fake backend" / emitter
 * Simulates real-time hazard data and vehicle connectivity
 * This would typically connect to VW's real API endpoints
 */
export class HazardSimulator {
  private eventTarget: EventTarget;
  private isRunning: boolean = false;
  private intervalId: number | null = null;
  private vehicleIntervalId: number | null = null;

  // Chennai coordinates for realistic simulation
  private readonly CHENNAI_BOUNDS = {
    north: 13.1500,
    south: 12.8500,
    east: 80.3500,
    west: 80.1500
  };

  // Simulated vehicle route (Chennai city center)
  private vehicleRoutePoints = [
    { lat: 13.0827, lng: 80.2707 }, // Anna Salai
    { lat: 13.0878, lng: 80.2785 }, // Mount Road
    { lat: 13.0445, lng: 80.2299 }, // OMR
    { lat: 13.0569, lng: 80.2425 }, // ECR
    { lat: 13.0732, lng: 80.2609 }  // Marina Beach
  ];
  private currentRouteIndex = 0;

  constructor() {
    this.eventTarget = new EventTarget();
  }

  /**
   * Start the hazard simulation
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🚗 VW Hazard Simulator Started - Monitoring Chennai roads...');

    // Simulate new hazards every 30-60 seconds
    this.intervalId = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every interval
        this.generateRandomHazard();
      }
    }, 45000); // 45 seconds

    // Simulate vehicle movement every 5 seconds
    this.vehicleIntervalId = setInterval(() => {
      this.updateVehiclePosition();
    }, 5000);

    // Initial vehicle position
    this.updateVehiclePosition();
  }

  /**
   * Stop the hazard simulation
   */
  stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.vehicleIntervalId) {
      clearInterval(this.vehicleIntervalId);
      this.vehicleIntervalId = null;
    }
    console.log('🛑 VW Hazard Simulator Stopped');
  }

  /**
   * Subscribe to hazard events
   */
  onHazardDetected(callback: (hazard: HazardData) => void): () => void {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<HazardData>;
      callback(customEvent.detail);
    };

    this.eventTarget.addEventListener('hazard_detected', handler);
    
    return () => {
      this.eventTarget.removeEventListener('hazard_detected', handler);
    };
  }

  /**
   * Subscribe to vehicle location updates
   */
  onVehicleLocationUpdate(callback: (location: VehicleLocation) => void): () => void {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<VehicleLocation>;
      callback(customEvent.detail);
    };

    this.eventTarget.addEventListener('vehicle_location_update', handler);
    
    return () => {
      this.eventTarget.removeEventListener('vehicle_location_update', handler);
    };
  }

  /**
   * Manually trigger a hazard (for testing)
   */
  triggerHazard(type: HazardData['type'], severity: HazardData['severity'], description?: string): void {
    const hazard = this.createRandomHazard(type, severity, description);
    this.emitHazard(hazard);
  }

  /**
   * Generate a random hazard within Chennai bounds
   */
  private generateRandomHazard(): void {
    const hazardTypes: HazardData['type'][] = ['pothole', 'roadblock', 'accident', 'construction', 'weather', 'traffic'];
    const severityLevels: HazardData['severity'][] = ['low', 'medium', 'high', 'critical'];
    
    const type = hazardTypes[Math.floor(Math.random() * hazardTypes.length)];
    const severity = severityLevels[Math.floor(Math.random() * severityLevels.length)];
    
    const hazard = this.createRandomHazard(type, severity);
    this.emitHazard(hazard);
  }

  /**
   * Create a random hazard with realistic Chennai locations
   */
  private createRandomHazard(
    type: HazardData['type'], 
    severity: HazardData['severity'], 
    customDescription?: string
  ): HazardData {
    const lat = this.CHENNAI_BOUNDS.south + (this.CHENNAI_BOUNDS.north - this.CHENNAI_BOUNDS.south) * Math.random();
    const lng = this.CHENNAI_BOUNDS.west + (this.CHENNAI_BOUNDS.east - this.CHENNAI_BOUNDS.west) * Math.random();

    const descriptions = {
      pothole: [
        'Large pothole detected on main road',
        'Deep road cavity causing vehicle damage risk',
        'Multiple potholes in construction zone'
      ],
      roadblock: [
        'Temporary road closure for maintenance',
        'Police checkpoint causing traffic delay',
        'Fallen tree blocking traffic lane'
      ],
      accident: [
        'Minor collision reported on highway',
        'Multi-vehicle accident requiring emergency response',
        'Motorcycle accident near traffic signal'
      ],
      construction: [
        'Road widening work in progress',
        'Underground cable installation causing delays',
        'Bridge repair work limiting traffic flow'
      ],
      weather: [
        'Heavy rainfall causing waterlogging',
        'Dense fog reducing visibility to 50m',
        'Strong winds causing debris on road'
      ],
      traffic: [
        'Heavy congestion during peak hours',
        'Traffic signal malfunction causing delays',
        'Event-related traffic jam near venue'
      ]
    };

    const typeDescriptions = descriptions[type];
    const description = customDescription || typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)];

    return {
      id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      latitude: lat,
      longitude: lng,
      timestamp: Date.now(),
      reportedBy: `VW_SENSOR_${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      verifications: Math.floor(Math.random() * 5) + 1,
      description,
      status: 'active'
    };
  }

  /**
   * Emit hazard event
   */
  private emitHazard(hazard: HazardData): void {
    console.log(`🚨 New ${hazard.type} detected:`, hazard.description);
    const event = new CustomEvent('hazard_detected', { detail: hazard });
    this.eventTarget.dispatchEvent(event);
  }

  /**
   * Update simulated vehicle position along route
   */
  private updateVehiclePosition(): void {
    const currentPoint = this.vehicleRoutePoints[this.currentRouteIndex];
    const nextPoint = this.vehicleRoutePoints[(this.currentRouteIndex + 1) % this.vehicleRoutePoints.length];
    
    // Add some randomness to simulate realistic movement
    const noise = 0.001; // Small random offset
    const lat = currentPoint.lat + (Math.random() - 0.5) * noise;
    const lng = currentPoint.lng + (Math.random() - 0.5) * noise;
    
    // Calculate heading towards next point
    const heading = this.calculateBearing(currentPoint.lat, currentPoint.lng, nextPoint.lat, nextPoint.lng);
    
    const vehicleLocation: VehicleLocation = {
      latitude: lat,
      longitude: lng,
      heading: heading + (Math.random() - 0.5) * 20, // Add some heading variation
      speed: Math.random() * 60 + 20, // 20-80 km/h
      timestamp: Date.now()
    };

    // Move to next route point occasionally
    if (Math.random() < 0.1) { // 10% chance to move to next point
      this.currentRouteIndex = (this.currentRouteIndex + 1) % this.vehicleRoutePoints.length;
    }

    const event = new CustomEvent('vehicle_location_update', { detail: vehicleLocation });
    this.eventTarget.dispatchEvent(event);
  }

  /**
   * Calculate bearing between two points
   */
  private calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    
    const y = Math.sin(dLng) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
    
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  }

  /**
   * Get current simulation status
   */
  getStatus(): { isRunning: boolean; uptime?: number } {
    return {
      isRunning: this.isRunning,
      uptime: this.isRunning ? Date.now() - (this.intervalId ? Date.now() : 0) : undefined
    };
  }
}

// Export singleton instance
export const hazardSimulator = new HazardSimulator();
