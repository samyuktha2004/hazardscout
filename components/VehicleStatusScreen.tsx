import { Activity, MapPin, ShieldAlert, Circle, CheckCircle2, AlertTriangle, Navigation, Battery, Droplet, Settings, ChevronRight, Fuel } from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Progress } from "./ui/progress";
import { useState } from "react";
import { Vehicle } from "../types/vehicle";

interface VehicleStatusScreenProps {
  onNavigateToSettings: () => void;
  vehicle: Vehicle;
}

export function VehicleStatusScreen({ onNavigateToSettings, vehicle }: VehicleStatusScreenProps) {
  const [antiTheftEnabled, setAntiTheftEnabled] = useState(true);
  const [geofencingEnabled, setGeofencingEnabled] = useState(true);
  const [hazardScoutEnabled, setHazardScoutEnabled] = useState(true);

  return (
    <div className="min-h-screen bg-[#FDFAF9] dark:bg-slate-950 pb-20 sm:pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-white to-[#FDFAF9] dark:from-slate-900 dark:to-slate-950 px-4 pt-6 pb-4">
        <h1 className="text-[#1F2F57] dark:text-slate-100 text-xl mb-1">Vehicle Status</h1>
        <p className="text-[#484B6A] dark:text-slate-400 text-sm">VW {vehicle.model} • {vehicle.plateNumber}</p>
      </div>

      {/* Overall Health Score */}
      <div className="px-4 -mt-2">
        <Card className="bg-green-50 dark:bg-slate-900/90 border-green-200 dark:border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[#1F2F57] dark:text-slate-100 text-lg mb-1">Health Score</h3>
                <p className="text-[#484B6A] dark:text-slate-400 text-sm">All systems working normally</p>
              </div>
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-slate-300 dark:text-slate-700"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray="213.63"
                    strokeDashoffset="21.36"
                    className="text-green-600 dark:text-green-400"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 text-xl">90</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Road Impact Score */}
      <div className="px-4 mt-4">
        <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-300 dark:border-red-700/50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center animate-pulse">
                  <Activity className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-[#1F2F57] dark:text-slate-200 mb-1">Road Impact Score</p>
                  <p className="text-[#484B6A] dark:text-slate-400 text-xs">High severity hazards detected</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-red-600 dark:text-red-400">High Impact</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Health Report */}
      <div className="px-4 mt-6">
        <h3 className="text-[#9394a5] dark:text-slate-300 text-sm mb-3">System Checks</h3>
        <div className="space-y-3">
          {/* Tire Pressure */}
          <Card className="bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Circle className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-[#1F2F57] dark:text-slate-200 text-sm">Tire Pressure</p>
                    <p className="text-[#9394a5] dark:text-slate-400 text-xs">All tires are properly inflated</p>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                <div className="text-center">
                  <p className="text-[#9394a5] dark:text-slate-400 text-xs mb-1">FL</p>
                  <p className="text-[#1F2F57] dark:text-slate-200 text-sm">32 PSI</p>
                </div>
                <div className="text-center">
                  <p className="text-[#9394a5] dark:text-slate-400 text-xs mb-1">FR</p>
                  <p className="text-[#1F2F57] dark:text-slate-200 text-sm">32 PSI</p>
                </div>
                <div className="text-center">
                  <p className="text-[#9394a5] dark:text-slate-400 text-xs mb-1">RL</p>
                  <p className="text-[#1F2F57] dark:text-slate-200 text-sm">30 PSI</p>
                </div>
                <div className="text-center">
                  <p className="text-[#9394a5] dark:text-slate-400 text-xs mb-1">RR</p>
                  <p className="text-[#1F2F57] dark:text-slate-200 text-sm">30 PSI</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Oil Level - Only for ICE vehicles */}
          {vehicle.type !== 'electric' && (
            <Card className="bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Droplet className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-[#1F2F57] dark:text-slate-200 text-sm">Engine Oil</p>
                      <p className="text-[#9394a5] dark:text-slate-400 text-xs">Healthy - Change due in 3,200 km</p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </div>
                <div className="mt-3">
                  <Progress value={85} className="h-2 bg-slate-200 dark:bg-slate-800" />
                  <p className="text-[#9394a5] dark:text-slate-400 text-xs mt-1">85% life remaining</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fuel Level - Only for ICE vehicles */}
          {vehicle.type !== 'electric' && (
            <Card className="bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Fuel className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-[#1F2F57] dark:text-slate-200 text-sm">Fuel Level</p>
                      <p className="text-[#9394a5] dark:text-slate-400 text-xs">{vehicle.fuelLevel}% - ~{Math.round(vehicle.fuelLevel * 6)} km range</p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </div>
                <div className="mt-3">
                  <Progress value={vehicle.fuelLevel} className="h-2 bg-slate-200 dark:bg-slate-800" />
                  <p className="text-[#9394a5] dark:text-slate-400 text-xs mt-1">{vehicle.fuelLevel}% capacity</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* High Voltage Traction Battery - Only for EV */}
          {vehicle.type === 'electric' && (
            <Card className="bg-gradient-to-br from-[#0070E1]/10 to-blue-500/10 border-[#0070E1]/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0070E1]/20 flex items-center justify-center">
                      <Battery className="w-5 h-5 text-[#0070E1]" />
                    </div>
                    <div>
                      <p className="text-[#1F2F57] dark:text-slate-200 text-sm">High Voltage Battery</p>
                      <p className="text-[#9394a5] dark:text-slate-400 text-xs">{vehicle.fuelLevel}% - {vehicle.range} km range</p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </div>
                <div className="mb-3">
                  <Progress value={vehicle.fuelLevel} className="h-2 bg-slate-200 dark:bg-slate-800" />
                  <p className="text-[#9394a5] dark:text-slate-400 text-xs mt-1">{vehicle.fuelLevel}% charge</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-2 border border-slate-200 dark:border-slate-700/30">
                    <p className="text-[#9394a5] dark:text-slate-400 text-xs mb-0.5">Battery Temp</p>
                    <p className="text-[#1F2F57] dark:text-slate-200 text-sm">28°C</p>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-2 border border-slate-200 dark:border-slate-700/30">
                    <p className="text-[#9394a5] dark:text-slate-400 text-xs mb-0.5">Next Charge</p>
                    <p className="text-[#1F2F57] dark:text-slate-200 text-sm">11PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 12V Auxiliary Battery - Show for all vehicles */}
          <Card className="bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Battery className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-[#1F2F57] dark:text-slate-200 text-sm">12V Auxiliary Battery</p>
                    <p className="text-[#9394a5] dark:text-slate-400 text-xs">
                      {vehicle.type === 'electric' ? 'Powers accessories & electronics' : 'Powers starter & electronics'}
                    </p>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div className="mt-3">
                <Progress value={92} className="h-2 bg-slate-200 dark:bg-slate-800" />
                <p className="text-[#9394a5] dark:text-slate-400 text-xs mt-1">92% health • 12.4V</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Location Card */}
      <div className="px-4 mt-6">
        <h3 className="text-[#9394a5] dark:text-slate-300 text-sm mb-3">Vehicle Location</h3>
        <Card className="bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-700/50 overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 relative flex items-center justify-center">
            <MapPin className="w-12 h-12 text-[#0070E1]" />
            {/* Placeholder for map */}
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(0,112,225,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,112,225,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
          </div>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Navigation className="w-5 h-5 text-[#0070E1] mt-0.5" />
              <div className="flex-1">
                <p className="text-[#1F2F57] dark:text-slate-200 text-sm mb-1">Connaught Place Parking</p>
                <p className="text-[#9394a5] dark:text-slate-400 text-xs">New Delhi, India</p>
                <p className="text-[#A8A8A8] dark:text-slate-500 text-xs mt-2">Parked 2 hours ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Monitoring */}
      <div className="px-4 mt-6">
        <h3 className="text-[#9394a5] dark:text-slate-300 text-sm mb-3">Security & Alerts</h3>
        <div className="space-y-3">
          {/* Geo-fencing */}
          <Card className="bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0070E1]/20 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#0070E1]" />
                  </div>
                  <div>
                    <p className="text-[#1F2F57] dark:text-slate-200 text-sm">Location Alerts</p>
                    <p className="text-[#9394a5] dark:text-slate-400 text-xs">
                      {geofencingEnabled ? "Alert me if vehicle leaves area" : "Off"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={geofencingEnabled}
                  onCheckedChange={setGeofencingEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Anti-Theft Alarm */}
          <Card className="bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-[#1F2F57] dark:text-slate-200 text-sm">Theft Alerts</p>
                    <p className="text-[#9394a5] dark:text-slate-400 text-xs">
                      {antiTheftEnabled ? "Notify me of suspicious activity" : "Off"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={antiTheftEnabled}
                  onCheckedChange={setAntiTheftEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Hazard Scout Data Contribution */}
          <Card className="bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0070E1]/20 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 text-[#0070E1]" />
                  </div>
                  <div>
                    <p className="text-[#1F2F57] dark:text-slate-200 text-sm">Share Hazard Data</p>
                    <p className="text-[#9394a5] dark:text-slate-400 text-xs">
                      {hazardScoutEnabled ? "Helping other drivers" : "Paused"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={hazardScoutEnabled}
                  onCheckedChange={setHazardScoutEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Hazard Scout Settings Link */}
          <button 
            onClick={onNavigateToSettings}
            className="w-full"
          >
            <Card className="bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/90 hover:border-[#0070E1]/50 transition-all cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700/50 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-[#484B6A] dark:text-slate-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[#1F2F57] dark:text-slate-200 text-sm">Hazard Scout Settings</p>
                    <p className="text-[#9394a5] dark:text-slate-400 text-xs">Configure detection & alerts</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#A8A8A8] dark:text-slate-500" />
                </div>
              </CardContent>
            </Card>
          </button>
        </div>
      </div>


    </div>
  );
}