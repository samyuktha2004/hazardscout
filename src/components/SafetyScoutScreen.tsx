import { Shield, MapPin, AlertTriangle, CheckCircle2, TrendingUp, Eye, EyeOff, Radio, Settings, ChevronRight, BellRing, ThumbsUp, ThumbsDown, Clock, Users, AlertCircle, Check, X, Navigation } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { MapPreview } from "./MapPreview";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { notificationService } from "./NotificationService";
import { hazardService, HazardData, formatTimeRemaining, getRelativeTime } from "./HazardService";
import { useHazardState } from "../logic/useHazardState";
import { hazardSimulator } from "../logic/HazardSimulator";
import { toast } from "sonner";
import { Progress } from "./ui/progress";
import GoogleMapWrapper from "./GoogleMapWrapper";

interface SafetyScoutScreenProps {
  onNavigateToSettings: () => void;
}

export function SafetyScoutScreen({ onNavigateToSettings }: SafetyScoutScreenProps) {
  const [scoutMonitoring, setScoutMonitoring] = useState(true);
  const [selectedHazard, setSelectedHazard] = useState<HazardData | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [hazards, setHazards] = useState<HazardData[]>([]);
  const [showResolved, setShowResolved] = useState(false);
  const [navigationActive, setNavigationActive] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const [liveNavigationActive, setLiveNavigationActive] = useState(false);
  const [navigationStart, setNavigationStart] = useState<[number, number] | null>(null);
  const [navigationDest, setNavigationDest] = useState<[number, number] | null>(null);
  const [navigationDestName, setNavigationDestName] = useState<string>('');
  const [mapModalOpen, setMapModalOpen] = useState(false);

  // Load hazards and check notification status
  useEffect(() => {
    const settings = notificationService.getSettings();
    const hasPermission = typeof Notification !== 'undefined' && Notification.permission === 'granted';
    setNotificationsEnabled(settings.enabled && hasPermission);

    loadHazards();

    // Refresh hazards every 10 seconds
    const interval = setInterval(loadHazards, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadHazards = () => {
    const allHazards = hazardService.getAllHazards();
    setHazards(allHazards);
  };

  const activeHazards = hazards.filter(h => h.status === 'active' || h.status === 'resolving');
  const resolvedHazards = hazards.filter(h => h.status === 'resolved').slice(0, 5);

  const handleConfirmStillThere = (hazardId: string) => {
    const success = hazardService.confirmHazardStillThere(hazardId);
    if (success) {
      toast.success("Thanks for confirming! Hazard status updated.", {
        description: "Other drivers will be alerted about this hazard.",
        duration: 3000,
      });
      loadHazards();
    } else {
      toast.info("You've already confirmed this hazard recently.", {
        description: "You can confirm again in 1 hour.",
        duration: 3000,
      });
    }
  };

  const handleReportGone = (hazardId: string) => {
    const success = hazardService.reportHazardGone(hazardId);
    if (success) {
      const progress = hazardService.getResolutionProgress(hazardId);
      const remaining = progress ? progress.confirmationsNeeded - progress.currentGoneReports : 0;
      
      if (remaining <= 0) {
        toast.success("Hazard marked as resolved!", {
          description: "Thanks for helping keep the map accurate.",
          duration: 3000,
        });
      } else {
        toast.success(`Report submitted. ${remaining} more needed to resolve.`, {
          description: "We verify reports to ensure accuracy.",
          duration: 3000,
        });
      }
      loadHazards();
      
      // Close the selected hazard if it's resolved
      if (remaining <= 0 && selectedHazard?.id === hazardId) {
        setSelectedHazard(null);
      }
    } else {
      toast.info("You've already reported this hazard recently.", {
        description: "You can report again in 1 hour.",
        duration: 3000,
      });
    }
  };

  const handleStartNavigation = (hazard: HazardData) => {
    setNavigationActive(true);
    setNavigatingTo(hazard.id);
    toast.success(`Navigation started to ${hazard.type}`, {
      description: hazard.locationName,
      duration: 3000,
    });
  };

  const handleStopNavigation = () => {
    setNavigationActive(false);
    setNavigatingTo(null);
    toast.info("Navigation stopped");
  };

  const handleStartLiveNavigation = (start: [number, number], dest: [number, number], destName: string) => {
    setNavigationStart(start);
    setNavigationDest(dest);
    setNavigationDestName(destName);
    setLiveNavigationActive(true);
  };

  const handleEndLiveNavigation = () => {
    setLiveNavigationActive(false);
    setNavigationStart(null);
    setNavigationDest(null);
    setNavigationDestName('');
    toast.info("Navigation ended");
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
      case 'low': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'resolving': return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
      case 'resolved': return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  const getSourceIcon = (source: string) => {
    if (source === 'v2x') return '📡';
    if (source === 'your-car') return '🚗';
    if (source === 'user-report') return '📝';
    return '👥';
  };

  const getSourceLabel = (source: string) => {
    if (source === 'v2x') return 'VW Car2X';
    if (source === 'your-car') return 'Your Car';
    if (source === 'user-report') return 'User Report';
    return 'Scout Network';
  };

  // Show simplified Live Navigation view when active (migrated)
  if (liveNavigationActive && navigationStart && navigationDest) {
    const navMarkers = [
      { lat: navigationStart[1], lng: navigationStart[0] },
      { lat: navigationDest[1], lng: navigationDest[0] },
    ];

    return (
      <div className="min-h-screen bg-[#FDFAF9] dark:bg-slate-950 flex flex-col pb-20 sm:pb-24">
        <div className="px-4 pt-6 pb-3 flex items-center justify-between">
          <Button onClick={handleEndLiveNavigation}>End Navigation</Button>
          <h2 className="text-lg">{navigationDestName || 'Live Navigation'}</h2>
          <div />
        </div>
        <div className="flex-1">
          <GoogleMapWrapper
            hazards={activeHazards}
            center={{ lat: navigationStart[1], lng: navigationStart[0] }}
            zoom={14}
            markers={navMarkers}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFAF9] dark:bg-slate-950 flex flex-col pb-20 sm:pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-white to-[#FDFAF9] dark:from-slate-900 dark:to-slate-950 px-4 pt-6 pb-3 flex-shrink-0">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h1 className="text-[#1F2F57] dark:text-slate-100 text-xl mb-1">Live Hazard Map</h1>
            <p className="text-[#484B6A] dark:text-slate-400 text-sm">Network-detected road hazards near you</p>
          </div>
          {notificationsEnabled && (
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs flex items-center gap-1 flex-shrink-0">
              <BellRing className="w-3 h-3" />
              Push Alerts
            </Badge>
          )}
        </div>
      </div>

      {/* Live Map - 2/3 of viewport */}
      <div className="flex-1 relative bg-slate-200 dark:bg-slate-900">
        <GoogleMapWrapper 
          hazards={activeHazards}
          center={{ lat: 28.6139, lng: 77.2090 }}
          zoom={13}
          onHazardClick={setSelectedHazard}
        />


        {/* Legend Overlay */}
        <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-300 dark:border-slate-700/50 rounded-lg p-3 space-y-2 z-10">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full border border-red-700" />
            <span className="text-[#484B6A] dark:text-slate-300 text-xs">Critical Hazard</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rounded-full border border-amber-700" />
            <span className="text-[#484B6A] dark:text-slate-300 text-xs">High Hazard</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#0070E1] rounded-full border border-blue-700" />
            <span className="text-[#484B6A] dark:text-slate-300 text-xs">V2X Official</span>
          </div>
        </div>

        {/* Selected Hazard Detail Card */}
        {selectedHazard && (
          <div className="absolute bottom-4 left-4 right-4 max-h-[50vh] overflow-y-auto z-20 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-slate-300 dark:border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getSeverityColor(selectedHazard.severity)}`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-[#1F2F57] dark:text-slate-200 text-sm">{selectedHazard.type}</p>
                        <Badge className={`text-xs ${getSeverityColor(selectedHazard.severity)}`}>
                          {selectedHazard.severity}
                        </Badge>
                        <Badge className={`text-xs ${getStatusColor(selectedHazard.status)}`}>
                          {selectedHazard.status}
                        </Badge>
                      </div>
                      <p className="text-[#9394a5] dark:text-slate-400 text-xs mb-1">{selectedHazard.locationName}</p>
                      <div className="flex items-center gap-3 text-xs flex-wrap">
                        {selectedHazard.distance && (
                          <>
                            <span className="text-[#0070E1]">{selectedHazard.distance} ahead</span>
                            <span className="text-[#A8A8A8] dark:text-slate-500">•</span>
                          </>
                        )}
                        <span className="text-[#A8A8A8] dark:text-slate-500">{getRelativeTime(selectedHazard.firstDetectedAt)}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="text-xs">{getSourceIcon(selectedHazard.source)}</span>
                        <span className="text-xs text-[#9394a5] dark:text-slate-400">
                          {getSourceLabel(selectedHazard.source)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedHazard(null)}
                    className="text-[#9394a5] hover:text-[#1F2F57] dark:text-slate-400 dark:hover:text-slate-200 flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>

                {/* Hazard Statistics */}
                <div className="grid grid-cols-3 gap-2 mb-3 pb-3 border-b border-slate-200 dark:border-slate-700/30">
                  <div className="text-center">
                    <p className="text-[#9394a5] dark:text-slate-400 text-[10px] mb-0.5">Detected</p>
                    <p className="text-[#1F2F57] dark:text-slate-200 text-sm">{selectedHazard.detectionCount}x</p>
                  </div>
                  <div className="text-center border-x border-slate-200 dark:border-slate-700/30">
                    <p className="text-[#9394a5] dark:text-slate-400 text-[10px] mb-0.5">Confirmed</p>
                    <p className="text-green-400 text-sm">{selectedHazard.confirmationCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[#9394a5] dark:text-slate-400 text-[10px] mb-0.5">Reported Gone</p>
                    <p className="text-amber-400 text-sm">{selectedHazard.reportedGoneCount}</p>
                  </div>
                </div>

                {/* Resolution Progress (if resolving) */}
                {selectedHazard.status === 'resolving' && (() => {
                  const progress = hazardService.getResolutionProgress(selectedHazard.id);
                  if (!progress) return null;
                  
                  return (
                    <div className="mb-3 pb-3 border-b border-slate-200 dark:border-slate-700/30">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-400" />
                          <span className="text-amber-400 text-xs">Pending Resolution</span>
                        </div>
                        <span className="text-[#9394a5] dark:text-slate-400 text-xs">
                          {progress.currentGoneReports}/{progress.confirmationsNeeded} reports
                        </span>
                      </div>
                      <Progress value={progress.percentageToResolution} className="h-2 mb-2" />
                      {progress.timeRemainingMs && (
                        <p className="text-[#A8A8A8] dark:text-slate-500 text-[10px]">
                          Auto-resolves in {formatTimeRemaining(progress.timeRemainingMs)} without confirmation
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* User Action Buttons */}
                {selectedHazard.status !== 'resolved' && (
                  <div className="space-y-2">
                    {/* Navigation Button */}
                    <Button
                      onClick={() => handleStartNavigation(selectedHazard)}
                      className="w-full bg-[#0070E1] hover:bg-[#0056b3] text-white h-auto py-3 flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-4 h-4" />
                      <span className="text-sm">Navigate to Hazard</span>
                    </Button>
                    
                    <p className="text-[#484B6A] dark:text-slate-300 text-xs mb-2">Help us verify this hazard:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => handleConfirmStillThere(selectedHazard.id)}
                        disabled={hazardService.hasUserConfirmed(selectedHazard.id, 'still-there')}
                        variant="outline"
                        className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10 h-auto py-2.5 flex flex-col items-center gap-1"
                      >
                        {hazardService.hasUserConfirmed(selectedHazard.id, 'still-there') ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span className="text-xs">Confirmed</span>
                          </>
                        ) : (
                          <>
                            <ThumbsUp className="w-4 h-4" />
                            <span className="text-xs">Still There</span>
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleReportGone(selectedHazard.id)}
                        disabled={hazardService.hasUserConfirmed(selectedHazard.id, 'gone')}
                        variant="outline"
                        className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 h-auto py-2.5 flex flex-col items-center gap-1"
                      >
                        {hazardService.hasUserConfirmed(selectedHazard.id, 'gone') ? (
                          <>
                            <X className="w-4 h-4" />
                            <span className="text-xs">Reported</span>
                          </>
                        ) : (
                          <>
                            <ThumbsDown className="w-4 h-4" />
                            <span className="text-xs">Hazard Gone</span>
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-2 border border-slate-200 dark:border-slate-700/30">
                      <p className="text-[#9394a5] dark:text-slate-400 text-[10px] leading-relaxed">
                        {selectedHazard.status === 'active' 
                          ? "Your feedback helps other drivers stay safe and keeps our map accurate."
                          : `${3 - selectedHazard.reportedGoneCount} more "gone" reports needed to resolve this hazard.`
                        }
                      </p>
                    </div>
                  </div>
                )}

                {/* Resolved message */}
                {selectedHazard.status === 'resolved' && (
                  <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/30">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <p className="text-green-400 text-xs">
                        This hazard has been resolved. Thanks to everyone who reported!
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Current Status Badge */}
        <div className="absolute bottom-3 left-3 right-3">
          <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-slate-300 dark:border-slate-700/50">
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Small interactive map preview. Click opens fullscreen map modal. */}
                  <MapPreview
                    className="w-20 h-12 sm:w-28 sm:h-16 rounded-md flex-shrink-0"
                    onClick={() => setMapModalOpen(true)}
                  />
                  <div className="flex items-center gap-2 min-w-0">
                    <Shield className="w-5 h-5 text-[#0070E1] flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[#1F2F57] dark:text-slate-200 text-sm truncate">Monitoring Active</p>
                      <p className="text-[#9394a5] dark:text-slate-400 text-xs truncate">{activeHazards.length} active hazards nearby</p>
                    </div>
                  </div>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs flex-shrink-0">
                  Live
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fullscreen map modal opened from preview */}
        {mapModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={() => setMapModalOpen(false)}>
            <div className="relative w-full max-w-4xl h-[80vh] mx-4" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setMapModalOpen(false)}
                className="absolute right-3 top-3 z-40 bg-white/90 dark:bg-slate-800/90 rounded-full p-2 shadow"
                aria-label="Close map"
              >
                ✕
              </button>
              <div className="w-full h-full rounded-lg overflow-hidden">
                <GoogleMapWrapper 
                  hazards={activeHazards}
                  center={{ lat: 28.6139, lng: 77.2090 }}
                  zoom={13}
                  onHazardClick={setSelectedHazard}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom 1/3 - Scrollable Cards */}
      <div className="flex-shrink-0 h-[40vh] bg-[#FDFAF9] dark:bg-slate-950 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="px-4 py-4 space-y-4">
            {/* Contribution Status Card */}
            <Card className="bg-gradient-to-br from-[#0070E1]/10 to-blue-500/10 border-[#0070E1]/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3 gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#0070E1]/20 flex items-center justify-center flex-shrink-0">
                      {scoutMonitoring ? (
                        <Eye className="w-5 h-5 text-[#0070E1]" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[#1F2F57] dark:text-slate-200 text-sm truncate">Hazard Detection</p>
                      <p className="text-[#9394a5] dark:text-slate-400 text-xs truncate">
                        {scoutMonitoring ? "Sharing hazard data with other drivers" : "Detection paused"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={scoutMonitoring}
                    onCheckedChange={setScoutMonitoring}
                    className="flex-shrink-0"
                  />
                </div>
                <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700/30">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <p className="text-[#484B6A] dark:text-slate-300 text-xs">Your privacy is protected - faces & plates are blurred</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Alerts List Card */}
            <Card className="bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[#1F2F57] dark:text-slate-200 text-sm">Active Hazards</h3>
                  <Badge variant="outline" className="border-slate-300 dark:border-slate-600 text-[#9394a5] dark:text-slate-400 text-xs">
                    {activeHazards.length} total
                  </Badge>
                </div>
                {activeHazards.length === 0 ? (
                  <div className="text-center py-6">
                    <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-2 opacity-50" />
                    <p className="text-[#9394a5] dark:text-slate-400 text-sm">No active hazards nearby</p>
                    <p className="text-[#A8A8A8] dark:text-slate-500 text-xs mt-1">Drive safe!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeHazards.map((hazard) => (
                      <div
                        key={hazard.id}
                        onClick={() => setSelectedHazard(hazard)}
                        className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-2 sm:p-3 border border-slate-200 dark:border-slate-700/30 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800/70 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getSeverityColor(hazard.severity)}`}>
                              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
                                <p className="text-[#1F2F57] dark:text-slate-200 text-xs sm:text-sm">{hazard.type}</p>
                                <Badge className={`text-[10px] sm:text-xs ${getSeverityColor(hazard.severity)}`}>
                                  {hazard.severity}
                                </Badge>
                                {hazard.status === 'resolving' && (
                                  <Badge className="text-[10px] sm:text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">
                                    <Clock className="w-2.5 h-2.5 mr-1" />
                                    Resolving
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[#9394a5] dark:text-slate-400 text-[10px] sm:text-xs mb-0.5 sm:mb-1 truncate">{hazard.locationName}</p>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] sm:text-xs">{getSourceIcon(hazard.source)}</span>
                                <span className="text-[#A8A8A8] dark:text-slate-500 text-[10px] sm:text-xs">{getSourceLabel(hazard.source)}</span>
                                <span className="text-[#D4D4D4] dark:text-slate-600 text-[10px]">•</span>
                                <p className="text-[#A8A8A8] dark:text-slate-500 text-[10px] sm:text-xs">{getRelativeTime(hazard.firstDetectedAt)}</p>
                              </div>
                              <div className="flex items-center gap-3 text-[10px]">
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleConfirmStillThere(hazard.id); }}
                                      disabled={hazardService.hasUserConfirmed(hazard.id, 'still-there')}
                                      className="inline-flex items-center gap-1 px-1 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/60 disabled:opacity-50"
                                      title="Confirm hazard still there"
                                    >
                                      <ThumbsUp className="w-2.5 h-2.5 text-green-400" />
                                      <span className="text-green-400 text-[11px]">{hazard.confirmationCount}</span>
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleReportGone(hazard.id); }}
                                      disabled={hazardService.hasUserConfirmed(hazard.id, 'gone')}
                                      className="inline-flex items-center gap-1 px-1 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/60 disabled:opacity-50"
                                      title="Report hazard gone"
                                    >
                                      <ThumbsDown className="w-2.5 h-2.5 text-red-400" />
                                      <span className="text-red-400 text-[11px]">{hazard.reportedGoneCount}</span>
                                    </button>
                                  </div>
                              </div>
                            </div>
                          </div>
                          {hazard.distance && (
                            <div className="text-right flex-shrink-0">
                              <p className="text-[#0070E1] text-xs sm:text-sm">{hazard.distance}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Verification Info Card */}
            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[#1F2F57] dark:text-slate-200 text-sm mb-1">Community Verification</p>
                    <p className="text-[#9394a5] dark:text-slate-400 text-xs leading-relaxed">
                      Help keep the hazard map accurate by confirming or reporting hazards as you drive. 
                      Your feedback directly impacts other drivers' safety.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-2.5 border border-slate-200 dark:border-slate-700/30 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <ThumbsUp className="w-3.5 h-3.5 text-green-400" />
                      <p className="text-[#484B6A] dark:text-slate-300 text-xs">Still There</p>
                    </div>
                    <p className="text-[#A8A8A8] dark:text-slate-500 text-[10px]">Extends alert</p>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-2.5 border border-slate-200 dark:border-slate-700/30 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <ThumbsDown className="w-3.5 h-3.5 text-red-400" />
                      <p className="text-[#484B6A] dark:text-slate-300 text-xs">Hazard Gone</p>
                    </div>
                    <p className="text-[#A8A8A8] dark:text-slate-500 text-[10px]">3 reports = resolved</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recently Resolved Card */}
            {resolvedHazards.length > 0 && (
              <Card className="bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-700/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[#1F2F57] dark:text-slate-200 text-sm">Recently Resolved</h3>
                    <Badge variant="outline" className="border-slate-300 dark:border-slate-600 text-[#9394a5] dark:text-slate-400 text-xs">
                      {resolvedHazards.length} cleared
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {resolvedHazards.map((hazard) => (
                      <div
                        key={hazard.id}
                        className="bg-slate-50 dark:bg-slate-800/30 rounded-lg p-3 border border-slate-200 dark:border-slate-700/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[#484B6A] dark:text-slate-300 text-xs mb-0.5">{hazard.type}</p>
                            <p className="text-[#A8A8A8] dark:text-slate-500 text-[10px] sm:text-xs truncate">{hazard.locationName}</p>
                          </div>
                          <p className="text-[#D4D4D4] dark:text-slate-600 text-[10px] flex-shrink-0">{getRelativeTime(hazard.lastUpdatedAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Settings Link Card */}
            <button 
              onClick={onNavigateToSettings}
              className="w-full"
            >
              <Card className="bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/90 hover:border-[#0070E1]/50 transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0070E1]/20 flex items-center justify-center">
                      <Settings className="w-5 h-5 text-[#0070E1]" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-[#1F2F57] dark:text-slate-200 text-sm">Hazard Scout Settings</p>
                      <p className="text-[#9394a5] dark:text-slate-400 text-xs">Configure alerts & resolution</p>
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