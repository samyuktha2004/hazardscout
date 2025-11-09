import { Lock, Power, AlertCircle, Battery, Gauge, Unlock, Thermometer, Fuel, ChevronDown, Plus, ShieldAlert, BellRing, Clock, ThumbsUp, ThumbsDown } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { notificationService } from "./NotificationService";
import { hazardService, HazardData, getRelativeTime } from "./HazardService";
import { MapboxMap } from "./MapboxMap";
import { Vehicle } from "../types/vehicle";
import { toast } from "sonner";

interface DashboardScreenProps {
  onNavigateToScout: () => void;
  vehicles: Vehicle[];
  selectedVehicleId: string;
  onSelectVehicle: (id: string) => void;
}

// Live Map Widget Component (simplified for dashboard)
function LiveMapWidget({ hazards }: { hazards: HazardData[] }) {
  return (
    <MapboxMap 
      hazards={hazards.slice(0, 5)} 
      viewMode="widget"
      className="w-full h-full"
    />
  );
}

export function DashboardScreen({ onNavigateToScout, vehicles, selectedVehicleId, onSelectVehicle }: DashboardScreenProps) {
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [cabinTemp, setCabinTemp] = useState(22);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [nearestHazard, setNearestHazard] = useState<HazardData | null>(null);
  const [isRemoteStartActive, setIsRemoteStartActive] = useState(false);

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];
  const [isLocked, setIsLocked] = useState(selectedVehicle.isLocked);

  // Check notification status and load nearest hazard
  useEffect(() => {
    const settings = notificationService.getSettings();
    const hasPermission = typeof Notification !== 'undefined' && Notification.permission === 'granted';
    setNotificationsEnabled(settings.enabled && hasPermission);

    // Get nearest high-severity hazard
    const activeHazards = hazardService.getActiveHazards();
    const highSeverityHazards = activeHazards.filter(h => h.severity === 'high' || h.severity === 'medium');
    if (highSeverityHazards.length > 0) {
      setNearestHazard(highSeverityHazards[0]);
    }

    // Refresh hazards every 10 seconds
    const interval = setInterval(() => {
      const activeHazards = hazardService.getActiveHazards();
      const highSeverityHazards = activeHazards.filter(h => h.severity === 'high' || h.severity === 'medium');
      if (highSeverityHazards.length > 0) {
        setNearestHazard(highSeverityHazards[0]);
      } else {
        setNearestHazard(null);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleAddVehicle = () => {
    toast.info("Add New Vehicle", {
      description: "This feature will allow you to connect additional VW vehicles to your account.",
      duration: 3000,
    });
  };

  const handleClimateControl = () => {
    const newTemp = cabinTemp === 22 ? 24 : cabinTemp === 24 ? 18 : 22;
    setCabinTemp(newTemp);
    toast.success(`Climate set to ${newTemp}°C`, {
      description: "Pre-conditioning your vehicle cabin temperature.",
      duration: 3000,
    });
  };

  const handleRemoteStart = () => {
    setIsRemoteStartActive(!isRemoteStartActive);
    if (!isRemoteStartActive) {
      toast.success("Engine started remotely", {
        description: "Your vehicle is warming up. Climate control activated.",
        duration: 3000,
      });
    } else {
      toast.info("Engine stopped", {
        description: "Remote start deactivated.",
        duration: 3000,
      });
    }
  };

  const handleFindMyCar = () => {
    toast.success("Locating your vehicle", {
      description: "Your VW will flash its lights and honk the horn.",
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFAF9] dark:bg-slate-950 pb-20 sm:pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-white to-[#FDFAF9] dark:from-slate-900 dark:to-slate-950 px-3 sm:px-4 pt-6 sm:pt-8 pb-4 sm:pb-6">
        {/* Hazard Scout Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[#0070E1] to-[#0050A1] flex items-center justify-center shadow-lg shadow-[#0070E1]/20">
            <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[#1F2F57] dark:text-slate-100 text-base sm:text-lg truncate">Hazard Scout</h1>
            <p className="text-[#484B6A] dark:text-slate-400 text-[10px] sm:text-xs truncate">VW Connect Dashboard</p>
          </div>
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px] sm:text-xs">
              Connected
            </Badge>
            {notificationsEnabled && (
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[10px] sm:text-xs flex items-center gap-1">
                <BellRing className="w-3 h-3" />
                Alerts On
              </Badge>
            )}
          </div>
        </div>
        <p className="text-[#484B6A] dark:text-slate-400 text-xs sm:text-sm mb-1">Welcome back</p>
        
        {/* Vehicle Selector */}
        <div className="mt-4 relative">
          <button
            onClick={() => setShowVehicleSelector(!showVehicleSelector)}
            className="w-full bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 rounded-lg p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center">
                {selectedVehicle.type === 'electric' ? (
                  <Battery className="w-5 h-5 text-[#0070E1]" />
                ) : (
                  <Fuel className="w-5 h-5 text-[#0070E1]" />
                )}
              </div>
              <div className="text-left">
                <p className="text-[#1F2F57] dark:text-slate-200 text-sm">{selectedVehicle.name}</p>
                <p className="text-[#484B6A] dark:text-slate-400 text-xs">
                  VW {selectedVehicle.model} • {selectedVehicle.type.charAt(0).toUpperCase() + selectedVehicle.type.slice(1)}
                </p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showVehicleSelector ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showVehicleSelector && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800/95 backdrop-blur-xl border border-gray-200 dark:border-slate-700/50 rounded-lg overflow-hidden z-10 shadow-lg">
              {vehicles.map((vehicle) => (
                <button
                  key={vehicle.id}
                  onClick={() => {
                    onSelectVehicle(vehicle.id);
                    setIsLocked(vehicle.isLocked);
                    setShowVehicleSelector(false);
                  }}
                  className={`w-full p-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all ${
                    vehicle.id === selectedVehicleId ? 'bg-gray-100 dark:bg-slate-700/50' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center">
                    {vehicle.type === 'electric' ? (
                      <Battery className="w-5 h-5 text-[#0070E1]" />
                    ) : (
                      <Fuel className="w-5 h-5 text-[#0070E1]" />
                    )}
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-[#1F2F57] dark:text-slate-200 text-sm">{vehicle.name}</p>
                    <p className="text-[#484B6A] dark:text-slate-400 text-xs">
                      VW {vehicle.model} • {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}
                    </p>
                  </div>
                  {vehicle.id === selectedVehicleId && (
                    <div className="w-2 h-2 rounded-full bg-[#0070E1]"></div>
                  )}
                </button>
              ))}
              
              <button 
                onClick={handleAddVehicle}
                className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all border-t border-gray-200 dark:border-slate-700/50"
              >
                <div className="w-10 h-10 rounded-lg bg-[#0070E1]/20 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-[#0070E1]" />
                </div>
                <div className="text-left">
                  <p className="text-[#0070E1] text-sm">Add New Vehicle</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Hero Section */}
      <div className="px-4 -mt-2">
        <Card className="bg-gradient-to-br from-white to-white dark:from-slate-900/90 dark:to-slate-800/90 backdrop-blur-xl border-gray-200 dark:border-slate-700/50 overflow-hidden">
          <CardContent className="p-6">
            {/* Vehicle Image */}
            <div className="relative mb-4">
              <div className="bg-gradient-to-br from-[#E4E5F1] to-[#E4E5F1] dark:from-slate-800 dark:to-slate-900 rounded-lg p-8 flex items-center justify-center">
                <ImageWithFallback
                  src={selectedVehicle.imageUrl}
                  alt={`Volkswagen ${selectedVehicle.model}`}
                  className="w-full h-40 object-contain"
                />
              </div>
              <div className="absolute top-3 right-3">
                <Badge className="bg-[#0070E1]/20 text-[#0070E1] border-[#0070E1]/30">
                  Active
                </Badge>
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="text-center mb-4">
              <h2 className="text-[#1F2F57] dark:text-slate-100 text-xl mb-1">
                Volkswagen {selectedVehicle.model}
              </h2>
              <p className="text-[#484B6A] dark:text-slate-400 text-sm">{selectedVehicle.plateNumber}</p>
            </div>

            {/* Top Status Indicators */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#E4E5F1] dark:bg-slate-800/50 rounded-lg p-3 border border-transparent dark:border-slate-700/30">
                <div className="flex items-center gap-2 mb-1">
                  {selectedVehicle.type === 'electric' ? (
                    <>
                      <Battery className="w-4 h-4 text-green-400" />
                      <span className="text-[#484B6A] dark:text-slate-400 text-xs">Charge Level</span>
                    </>
                  ) : (
                    <>
                      <Fuel className="w-4 h-4 text-green-400" />
                      <span className="text-[#484B6A] dark:text-slate-400 text-xs">Fuel Level</span>
                    </>
                  )}
                </div>
                <p className="text-[#1F2F57] dark:text-slate-100 text-lg">{selectedVehicle.fuelLevel}%</p>
              </div>
              <div className="bg-[#E4E5F1] dark:bg-slate-800/50 rounded-lg p-3 border border-transparent dark:border-slate-700/30">
                <div className="flex items-center gap-2 mb-1">
                  <Gauge className="w-4 h-4 text-[#0070E1]" />
                  <span className="text-[#484B6A] dark:text-slate-400 text-xs">
                    {selectedVehicle.type === 'electric' ? 'Range' : 'Mileage'}
                  </span>
                </div>
                <p className="text-[#1F2F57] dark:text-slate-100 text-lg">
                  {selectedVehicle.type === 'electric' 
                    ? `${selectedVehicle.range} km` 
                    : `${selectedVehicle.mileage.toLocaleString()} km`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hazard Alert Banner - Interactive */}
      {nearestHazard && (
        <div className="px-3 sm:px-4 mt-3 sm:mt-4">
          <button 
            onClick={onNavigateToScout}
            className="w-full text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Card className={`backdrop-blur-xl hover:border-opacity-70 transition-colors cursor-pointer ${
              nearestHazard.severity === 'high' 
                ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 hover:border-red-500/50'
                : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 hover:border-amber-500/50'
            }`}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    nearestHazard.severity === 'high'
                      ? 'bg-red-100 dark:bg-red-500/20'
                      : 'bg-amber-100 dark:bg-amber-500/20'
                  }`}>
                    <AlertCircle className={`w-5 h-5 sm:w-6 sm:h-6 ${
                      nearestHazard.severity === 'high'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 sm:mb-1 flex-wrap">
                      <p className={`text-xs sm:text-sm ${
                        nearestHazard.severity === 'high'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {nearestHazard.severity === 'high' ? '⚠️' : '⚠'} {nearestHazard.type} Ahead!{nearestHazard.severity === 'high' ? ' SLOW DOWN' : ''}
                      </p>
                      {nearestHazard.status === 'resolving' && (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
                          <Clock className="w-2.5 h-2.5 mr-0.5" />
                          Resolving
                        </Badge>
                      )}
                    </div>
                    <p className="text-[#484B6A] dark:text-slate-300 text-[10px] sm:text-xs mb-1">
                      {nearestHazard.distance || 'Nearby'} • {nearestHazard.locationName}
                    </p>
                    <div className="flex items-center gap-3 text-[10px]">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-2.5 h-2.5 text-green-400" />
                        <span className="text-slate-400">{nearestHazard.confirmationCount}</span>
                      </div>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-500">{getRelativeTime(nearestHazard.firstDetectedAt)}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-[#001E50] dark:text-[#0070E1]">View on Map →</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </button>
        </div>
      )}

      {/* Primary Remote Actions */}
      <div className="px-3 sm:px-4 mt-4 sm:mt-6">
        <h3 className="text-[#484B6A] dark:text-slate-300 text-xs sm:text-sm mb-2 sm:mb-3">Quick Controls</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Lock/Unlock */}
          <button
            onClick={() => setIsLocked(!isLocked)}
            className="bg-white dark:bg-slate-900/90 backdrop-blur-xl border border-gray-200 dark:border-slate-700/50 rounded-xl p-6 hover:bg-gray-50 dark:hover:bg-slate-800/90 transition-all active:scale-95"
          >
            <div className="flex flex-col items-center gap-3">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                isLocked ? "bg-green-100 dark:bg-green-500/20" : "bg-amber-100 dark:bg-amber-500/20"
              }`}>
                {isLocked ? (
                  <Lock className="w-7 h-7 text-green-600 dark:text-green-400" />
                ) : (
                  <Unlock className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                )}
              </div>
              <div className="text-center">
                <p className="text-[#1F2F57] dark:text-slate-200 text-sm mb-0.5">Doors</p>
                <p className={`text-xs ${isLocked ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
                  {isLocked ? "Locked" : "Unlocked"}
                </p>
              </div>
            </div>
          </button>

          {/* Remote Start/Climate */}
          <button 
            onClick={handleClimateControl}
            className="bg-white dark:bg-slate-900/90 backdrop-blur-xl border border-gray-200 dark:border-slate-700/50 rounded-xl p-6 hover:bg-gray-50 dark:hover:bg-slate-800/90 transition-all active:scale-95"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-[#0070E1]/20 flex items-center justify-center">
                <Thermometer className="w-7 h-7 text-[#001E50] dark:text-[#0070E1]" />
              </div>
              <div className="text-center">
                <p className="text-[#1F2F57] dark:text-slate-200 text-sm mb-0.5">Climate</p>
                <p className="text-[#001E50] dark:text-[#0070E1] text-xs">{cabinTemp}°C</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Contribution Status Indicator */}
      <div className="px-3 sm:px-4 mt-4 sm:mt-6">
        <Card className="bg-green-50 dark:bg-slate-800/80 border-green-200 dark:border-slate-700">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#1F2F57] dark:text-slate-200 text-xs sm:text-sm mb-0.5">Scout Monitoring</p>
                <p className="text-green-600 dark:text-green-400 text-[10px] sm:text-xs truncate">Active • Privacy Protected</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-600 dark:bg-green-400 animate-pulse"></div>
                <span className="text-green-600 dark:text-green-400 text-[10px] sm:text-xs">ON</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Alerts Widget */}
      <div className="px-3 sm:px-4 mt-4 sm:mt-6">
        <h3 className="text-[#484B6A] dark:text-slate-300 text-xs sm:text-sm mb-2 sm:mb-3">Recent Alerts</h3>
        <Card className="bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-[#1F2F57] dark:text-slate-200 text-sm mb-1">Service Due Soon</p>
                <p className="text-[#484B6A] dark:text-slate-400 text-xs">Recommended service in 5,000 km</p>
                <p className="text-amber-600 dark:text-amber-400 text-xs mt-2">2 days ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Map Widget */}
      <div className="px-3 sm:px-4 mt-4 sm:mt-6">
        <h3 className="text-[#484B6A] dark:text-slate-300 text-xs sm:text-sm mb-2 sm:mb-3">Live Hazard Map</h3>
        <button 
          onClick={onNavigateToScout}
          className="w-full transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <Card className="bg-white dark:bg-slate-900/90 border-gray-200 dark:border-slate-700/50 backdrop-blur-xl overflow-hidden cursor-pointer hover:border-[#001E50] dark:hover:border-[#0070E1]/50 transition-all">
            <div className="h-32 sm:h-40 relative">
              <LiveMapWidget hazards={hazardService.getActiveHazards()} />
            </div>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[#1F2F57] dark:text-slate-200 text-xs sm:text-sm mb-0.5 sm:mb-1 truncate">
                    {hazardService.getActiveHazards().length} Hazards Nearby
                  </p>
                  <p className="text-[#484B6A] dark:text-slate-400 text-[10px] sm:text-xs truncate">Tap to view Safety Scout map</p>
                </div>
                <Badge className="bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30 text-[10px] sm:text-xs flex-shrink-0">
                  Alert
                </Badge>
              </div>
            </CardContent>
          </Card>
        </button>
      </div>

      {/* Additional Quick Actions */}
      <div className="px-3 sm:px-4 mt-4 sm:mt-6">
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleRemoteStart}
            variant="outline"
            className={`bg-white dark:bg-slate-900/50 border-gray-200 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-[#001E50] dark:hover:text-slate-200 ${
              isRemoteStartActive 
                ? 'text-green-600 dark:text-green-400 border-green-500/30' 
                : 'text-[#1F2F57] dark:text-slate-300'
            }`}
          >
            <Power className="w-4 h-4 mr-2" />
            {isRemoteStartActive ? 'Stop Engine' : 'Remote Start'}
          </Button>
          <Button
            onClick={handleFindMyCar}
            variant="outline"
            className="bg-white dark:bg-slate-900/50 border-gray-200 dark:border-slate-700/50 text-[#1F2F57] dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-[#001E50] dark:hover:text-slate-200"
          >
            Find My Car
          </Button>
        </div>
      </div>
    </div>
  );
}
