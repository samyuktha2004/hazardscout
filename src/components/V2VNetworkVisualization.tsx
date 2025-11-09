/**
 * V2V Network Visualization Screen
 * 
 * Shows real-time Vehicle-to-Vehicle communication network
 * Displays nearby vehicles and hazard sharing status
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Radio, Car, MapPin, AlertTriangle, Network, Signal } from 'lucide-react';
import { v2vNetwork } from './V2VNetworkService';

interface NearbyVehicle {
  id: string;
  distance: number;
  bearing: string;
  lastSeen: number;
}

interface SharedHazard {
  id: string;
  type: string;
  distance: number;
  fromVehicle: string;
  timestamp: number;
  location?: string; // Chennai road name
}

export function V2VNetworkVisualization() {
  const [isConnected, setIsConnected] = useState(false);
  const [nearbyVehicles, setNearbyVehicles] = useState<NearbyVehicle[]>([]);
  const [sharedHazards, setSharedHazards] = useState<SharedHazard[]>([]);
  const [stats, setStats] = useState({
    totalVehiclesInRange: 0,
    hazardsBroadcasted: 0,
    hazardsReceived: 0,
    activeConnections: 0
  });

  useEffect(() => {
    // Monitor connection status
    v2vNetwork.onConnectionStatusChange((connected) => {
      setIsConnected(connected);
    });

    // Add initial Chennai road hazards for demo
    const chennaiHazards: SharedHazard[] = [
      {
        id: 'hazard_001',
        type: 'pothole',
        distance: 1.2,
        fromVehicle: 'VW_TN09_AB1234',
        timestamp: Date.now() - 120000, // 2 minutes ago
        location: 'Anna Salai, Mount Road'
      },
      {
        id: 'hazard_002',
        type: 'speedbump',
        distance: 2.5,
        fromVehicle: 'VW_TN01_CD5678',
        timestamp: Date.now() - 300000, // 5 minutes ago
        location: 'OMR (Old Mahabalipuram Road)'
      },
      {
        id: 'hazard_003',
        type: 'debris',
        distance: 0.8,
        fromVehicle: 'VW_TN22_EF9012',
        timestamp: Date.now() - 180000, // 3 minutes ago
        location: 'ECR (East Coast Road)'
      },
      {
        id: 'hazard_004',
        type: 'crack',
        distance: 3.2,
        fromVehicle: 'VW_TN07_GH3456',
        timestamp: Date.now() - 600000, // 10 minutes ago
        location: 'Porur-Poonamallee Road'
      },
      {
        id: 'hazard_005',
        type: 'pothole',
        distance: 1.8,
        fromVehicle: 'VW_TN33_IJ7890',
        timestamp: Date.now() - 420000, // 7 minutes ago
        location: 'GST Road, Guindy'
      }
    ];
    setSharedHazards(chennaiHazards);
    setStats(prev => ({
      ...prev,
      hazardsReceived: chennaiHazards.length
    }));

    // Listen for new hazard alerts
    v2vNetwork.onAlert((alert) => {
      // Add to shared hazards list
      setSharedHazards(prev => [
        {
          id: alert.id,
          type: alert.type,
          distance: 0, // Will be calculated based on GPS
          fromVehicle: alert.vehicleId,
          timestamp: alert.timestamp
        },
        ...prev
      ].slice(0, 10)); // Keep last 10

      // Update stats
      setStats(prev => ({
        ...prev,
        hazardsReceived: prev.hazardsReceived + 1
      }));
    });

    // Simulate nearby vehicles for visualization
    // In production, this would come from real V2V network
    const updateNearbyVehicles = () => {
      const vehicles: NearbyVehicle[] = [
        {
          id: 'VW_TN09_AB1234',
          distance: 1.2,
          bearing: 'N',
          lastSeen: Date.now()
        },
        {
          id: 'VW_TN01_CD5678',
          distance: 2.5,
          bearing: 'NE',
          lastSeen: Date.now() - 5000
        },
        {
          id: 'VW_TN22_EF9012',
          distance: 0.8,
          bearing: 'E',
          lastSeen: Date.now() - 2000
        },
        {
          id: 'VW_TN07_GH3456',
          distance: 3.2,
          bearing: 'S',
          lastSeen: Date.now() - 3000
        },
        {
          id: 'VW_TN33_IJ7890',
          distance: 4.1,
          bearing: 'SW',
          lastSeen: Date.now() - 8000
        }
      ];

      setNearbyVehicles(vehicles);
      setStats(prev => ({
        ...prev,
        totalVehiclesInRange: vehicles.length,
        activeConnections: vehicles.filter(v => Date.now() - v.lastSeen < 15000).length
      }));
    };

    // Initial check
    setIsConnected(v2vNetwork.getConnectionStatus());
    updateNearbyVehicles();

    // Update every 5 seconds
    const interval = setInterval(updateNearbyVehicles, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Network className="w-10 h-10 text-blue-500" />
              V2V Network Visualization
            </h1>
            <p className="text-slate-400">Vehicle-to-Vehicle Communication Network</p>
          </div>
          <Badge 
            variant={isConnected ? "default" : "destructive"} 
            className={`text-lg px-4 py-2 ${isConnected ? 'bg-green-600' : 'bg-red-600'}`}
          >
            <Signal className="w-5 h-5 mr-2" />
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-400">Vehicles in Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-500">{stats.totalVehiclesInRange}</div>
            <p className="text-xs text-slate-500 mt-1">Within 5km radius</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-400">Active Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-500">{stats.activeConnections}</div>
            <p className="text-xs text-slate-500 mt-1">Real-time links</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-400">Hazards Broadcasted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-purple-500">{stats.hazardsBroadcasted}</div>
            <p className="text-xs text-slate-500 mt-1">Shared with network</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-400">Hazards Received</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-orange-500">{stats.hazardsReceived}</div>
            <p className="text-xs text-slate-500 mt-1">From nearby vehicles</p>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nearby Vehicles */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-500" />
              Nearby Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nearbyVehicles.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Radio className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No vehicles in range</p>
                <p className="text-sm mt-2">Searching for V2V connections...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {nearbyVehicles.map((vehicle) => {
                  const isActive = Date.now() - vehicle.lastSeen < 15000;
                  return (
                    <div 
                      key={vehicle.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-700 hover:border-blue-500/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                        <div>
                          <div className="font-semibold">{vehicle.id}</div>
                          <div className="text-sm text-slate-400">
                            {vehicle.distance.toFixed(1)} km {vehicle.bearing}
                          </div>
                        </div>
                      </div>
                      <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
                        {isActive ? 'Active' : 'Idle'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shared Hazards */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Shared Hazards
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sharedHazards.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No hazards shared yet</p>
                <p className="text-sm mt-2">Listening for hazard alerts...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sharedHazards.map((hazard) => (
                  <div 
                    key={hazard.id}
                    className="flex items-start justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-700 hover:border-orange-500/50 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <AlertTriangle className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold capitalize text-white mb-1">{hazard.type}</div>
                        {hazard.location && (
                          <div className="text-sm text-blue-400 mb-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {hazard.location}
                          </div>
                        )}
                        <div className="text-xs text-slate-400">
                          From: {hazard.fromVehicle} • {hazard.distance.toFixed(1)} km away
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <div className="text-xs text-slate-400 mb-1">
                        {new Date(hazard.timestamp).toLocaleTimeString()}
                      </div>
                      <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30">
                        Auto-pinned
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Network Status Info */}
      <Card className="max-w-7xl mx-auto mt-6 bg-slate-800/30 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Network className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">How V2V Network Works</h3>
              <p className="text-sm text-slate-400 mb-3">
                When a vehicle detects a hazard (pothole, debris, etc.), it automatically broadcasts the alert 
                to all nearby vehicles within 5km radius. Received hazards are automatically marked on your map, 
                helping you avoid dangerous road conditions.
              </p>
              <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Real-time GPS tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>5km broadcast radius</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Automatic map marking</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <span>Proximity filtering</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
