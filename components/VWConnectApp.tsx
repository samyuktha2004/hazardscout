import { useState, useEffect } from "react";
import { DashboardScreen } from "./DashboardScreen";
import { VehicleStatusScreen } from "./VehicleStatusScreen";
import { SafetyScoutScreen } from "./SafetyScoutScreen";
import { ServiceScreen } from "./ServiceScreen";
import { AccountScreen } from "./AccountScreen";
import { HazardScoutSettingsScreen } from "./HazardScoutSettingsScreen";
import { BottomNavigation } from "./BottomNavigation";
import { useHazardNotifications } from "./useHazardNotifications";
import { hazardService } from "./HazardService";
import { Vehicle } from "../types/vehicle";

type Tab = "home" | "status" | "scout" | "service" | "account";
type Screen = Tab | "hazard-settings";

interface VWConnectAppProps {
  onLogout: () => void;
}

export function VWConnectApp({ onLogout }: VWConnectAppProps) {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");

  // Centralized vehicle state
  const [vehicles] = useState<Vehicle[]>([
    {
      id: '1',
      name: 'My Electric',
      model: 'ID.4',
      plateNumber: 'DL 01 AB 1234',
      type: 'electric',
      fuelLevel: 85,
      mileage: 8450,
      range: 340,
      imageUrl: 'https://assets.volkswagen.com/is/image/volkswagenag/ID4-banner1-1920x1080?Zml0PWNyb3AsMSZmbXQ9d2VicCZxbHQ9Nzkmd2lkPTE5MjAmaGVpPTEwODAmYWxpZ249MC4wMCwwLjAwJmJmYz1vZmYmM2E1Nw==',
      isLocked: true
    },
    {
      id: '2',
      name: 'Family Sedan',
      model: 'Virtus',
      plateNumber: 'DL 02 CD 5678',
      type: 'petrol',
      fuelLevel: 72,
      mileage: 12450,
      imageUrl: 'https://assets.volkswagen.com/is/image/volkswagenag/exterior-integrator-led-lamps?Zml0PWNyb3AsMSZmbXQ9d2VicCZxbHQ9Nzkmd2lkPTk2MCZhbGlnbj0wLjAwLDAuMDAmYmZjPW9mZiZhZTFl',
      isLocked: true
    },
    {
      id: '3',
      name: 'Weekend SUV',
      model: 'Tiguan',
      plateNumber: 'DL 03 EF 9012',
      type: 'diesel',
      fuelLevel: 68,
      mileage: 24680,
      imageUrl: 'https://assets.volkswagen.com/is/image/volkswagenag/beyond-bolder-1?Zml0PWNyb3AsMSZmbXQ9d2VicCZxbHQ9Nzkmd2lkPTE5MjAmYWxpZ249MC4wMCwwLjAwJmJmYz1vZmYmNzgwOQ==',
      isLocked: false
    }
  ]);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('1');

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  // Initialize sample hazards on first load
  useEffect(() => {
    const existingHazards = hazardService.getActiveHazards();
    
    // Only add sample hazards if none exist
    if (existingHazards.length === 0) {
      // **DEMO-READY HAZARDS** - Strategically placed for controlled demonstration
      const demoHazards = [
        // **Scene 1: Circle Marker (Your Car) - For Resolution Demo**
        {
          type: 'Pothole',
          severity: 'high' as const,
          location: { latitude: 12.9650, longitude: 80.2250 },
          locationName: 'Madipakkam Main Road Junction',
          distance: '800m',
          source: 'your-car' as const, // CIRCLE MARKER
          autoResolveAfterHours: 24,
          requireConfirmationsForResolution: 3
        },
        
        // **Scene 2: Triangle Marker (Network) - For Proximity Alert & Resolution**
        {
          type: 'Debris',
          severity: 'medium' as const,
          location: { latitude: 12.9620, longitude: 80.2300 },
          locationName: 'Velachery Bypass Road',
          distance: '1.2km',
          source: 'network' as const, // TRIANGLE MARKER
          autoResolveAfterHours: 24,
          requireConfirmationsForResolution: 3
        },
        
        // **Scene 4: Square Marker (V2X) - For Network Proof**
        {
          type: 'Road Work',
          severity: 'high' as const,
          location: { latitude: 12.9595, longitude: 80.2370 },
          locationName: 'OMR - Velachery Bypass',
          distance: '2.0km',
          source: 'v2x' as const, // SQUARE MARKER
          autoResolveAfterHours: 48,
          requireConfirmationsForResolution: 3
        },
        
        // Additional hazards along Chennai route for navigation demo
        {
          type: 'Speed Bump',
          severity: 'low' as const,
          location: { latitude: 12.9612, longitude: 80.2429 },
          locationName: 'Perungudi Industrial Estate',
          distance: '2.5km',
          source: 'network' as const,
          autoResolveAfterHours: 24,
          requireConfirmationsForResolution: 3
        },
        {
          type: 'Uneven Surface',
          severity: 'medium' as const,
          location: { latitude: 12.9750, longitude: 80.1950 },
          locationName: 'Pallavaram - Inner Ring Road Junction',
          distance: '3.5km',
          source: 'your-car' as const,
          autoResolveAfterHours: 24,
          requireConfirmationsForResolution: 3
        }
      ];

      demoHazards.forEach(hazard => {
        hazardService.addHazard(hazard);
      });

      // **Pre-simulate some confirmations for realism**
      const hazards = hazardService.getActiveHazards();
      if (hazards.length > 0) {
        // Simulate detection count increases on first hazard (Your Car)
        hazardService.incrementDetectionCount(hazards[0].id);
        hazardService.incrementDetectionCount(hazards[0].id);
        
        // Add 1 "gone" report to Triangle marker for demo progression (2/3 needed)
        if (hazards.length > 1) {
          hazardService.reportHazardGone(hazards[1].id);
        }
      }
    }
  }, []);

  // Get active hazards for notification monitoring
  const activeHazards = hazardService.getActiveHazards().map(h => ({
    id: h.id,
    type: h.type,
    severity: h.severity,
    distance: h.distance || '0m',
    location: h.locationName,
    latitude: h.location.latitude,
    longitude: h.location.longitude,
  }));

  // Monitor hazards and trigger notifications when appropriate
  useHazardNotifications(activeHazards);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setCurrentScreen(tab);
  };

  const navigateToHazardSettings = () => {
    setCurrentScreen("hazard-settings");
  };

  const navigateBack = () => {
    setCurrentScreen(activeTab);
  };

  const showBottomNav = currentScreen !== "hazard-settings";

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Content */}
      <div className="relative">
        {currentScreen === "home" && (
          <DashboardScreen 
            onNavigateToScout={() => handleTabChange("scout")}
            vehicles={vehicles}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={setSelectedVehicleId}
          />
        )}
        {currentScreen === "status" && (
          <VehicleStatusScreen 
            onNavigateToSettings={navigateToHazardSettings}
            vehicle={selectedVehicle}
          />
        )}
        {currentScreen === "scout" && <SafetyScoutScreen onNavigateToSettings={navigateToHazardSettings} />}
        {currentScreen === "service" && (
          <ServiceScreen 
            vehicle={selectedVehicle}
          />
        )}
        {currentScreen === "account" && (
          <AccountScreen 
            onLogout={onLogout} 
            onNavigateToSettings={navigateToHazardSettings}
            vehicles={vehicles}
          />
        )}
        {currentScreen === "hazard-settings" && <HazardScoutSettingsScreen onBack={navigateBack} />}
      </div>

      {/* Bottom Navigation */}
      {showBottomNav && <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />}
    </div>
  );
}