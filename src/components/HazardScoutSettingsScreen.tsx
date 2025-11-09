import { ArrowLeft, ShieldAlert, Volume2, Bell, Eye, Shield, Radio, BellRing, Moon, Check, X, Clock, Users } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { notificationService, NotificationSettings } from "./NotificationService";
import { hazardService, HazardServiceSettings } from "./HazardService";
import { testHazardNotification } from "./useHazardNotifications";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./ui/select";
import { toast } from "sonner";

interface HazardScoutSettingsScreenProps {
  onBack: () => void;
}

export function HazardScoutSettingsScreen({ onBack }: HazardScoutSettingsScreenProps) {
  const [dataContribution, setDataContribution] = useState(true);
  const [audioAlerts, setAudioAlerts] = useState(true);
  const [audioVolume, setAudioVolume] = useState([75]);
  const [v2xAlerts, setV2xAlerts] = useState(true);
  const [piiBlurConfirmation, setPiiBlurConfirmation] = useState(true);
  const [sensitivity, setSensitivity] = useState([2]); // 1=Low, 2=Medium, 3=High
  
  // Push Notification States
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(
    notificationService.getSettings()
  );
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );
  const [requestingPermission, setRequestingPermission] = useState(false);

  // Hazard Resolution States
  const [hazardSettings, setHazardSettings] = useState<HazardServiceSettings>(
    hazardService.getSettings()
  );

  // Load notification and hazard settings on mount
  useEffect(() => {
    setNotificationSettings(notificationService.getSettings());
    setHazardSettings(hazardService.getSettings());
  }, []);

  const getSensitivityLabel = (value: number) => {
    if (value === 1) return "Low";
    if (value === 2) return "Medium";
    return "High";
  };

  const handleRequestNotificationPermission = async () => {
    setRequestingPermission(true);
    const permission = await notificationService.requestPermission();
    setNotificationPermission(permission);
    setRequestingPermission(false);

    if (permission === 'granted') {
      // Enable notifications by default when permission is granted
      handleNotificationSettingChange({ enabled: true });
    }
  };

  const handleNotificationSettingChange = (updates: Partial<NotificationSettings>) => {
    const newSettings = { ...notificationSettings, ...updates };
    setNotificationSettings(newSettings);
    notificationService.updateSettings(updates);
  };

  const handleHazardSettingChange = (updates: Partial<HazardServiceSettings>) => {
    const newSettings = { ...hazardSettings, ...updates };
    setHazardSettings(newSettings);
    hazardService.updateSettings(updates);
  };

  const getProximityLabel = (meters: number) => {
    if (meters < 1000) return `${meters}m`;
    return `${meters / 1000}km`;
  };

  const handleTestNotification = async () => {
    if (notificationPermission !== 'granted') {
      toast.error('Please enable notifications first');
      return;
    }
    
    await testHazardNotification();
    toast.success('Test notification sent!');
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 px-4 pt-6 pb-4 sticky top-0 z-10">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0070E1] to-[#0050A1] flex items-center justify-center shadow-lg shadow-[#0070E1]/20">
            <ShieldAlert className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-slate-100 text-xl mb-1">Hazard Scout Settings</h1>
            <p className="text-slate-400 text-sm">Configure detection & alerts</p>
          </div>
        </div>
      </div>

      {/* Data Contribution */}
      <div className="px-4 mt-6">
        <h3 className="text-slate-300 text-sm mb-3">Data Sharing</h3>
        <Card className="bg-gradient-to-br from-[#0070E1]/10 to-blue-500/10 border-[#0070E1]/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0070E1]/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#0070E1]" />
                </div>
                <div>
                  <p className="text-slate-200 text-sm">Data Contribution</p>
                  <p className="text-slate-400 text-xs">
                    {dataContribution ? "Sharing hazard data" : "Contribution paused"}
                  </p>
                </div>
              </div>
              <Switch
                checked={dataContribution}
                onCheckedChange={setDataContribution}
              />
            </div>
            {dataContribution && (
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                <p className="text-slate-300 text-xs leading-relaxed">
                  Your vehicle helps other drivers by sharing detected road hazards. 
                  All data is anonymized and privacy-protected.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hazard Alert Sensitivity */}
      <div className="px-4 mt-6">
        <h3 className="text-slate-300 text-sm mb-3">Detection Sensitivity</h3>
        <Card className="bg-slate-900/90 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-slate-200 text-sm">Alert Sensitivity</p>
                  <p className="text-slate-400 text-xs">Impact threshold for hazards</p>
                </div>
              </div>
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                {getSensitivityLabel(sensitivity[0])}
              </Badge>
            </div>
            <div className="space-y-3">
              <Slider
                value={sensitivity}
                onValueChange={setSensitivity}
                min={1}
                max={3}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                <p className="text-slate-400 text-xs">
                  {sensitivity[0] === 1 && "Only critical hazards will trigger alerts"}
                  {sensitivity[0] === 2 && "Balanced - most hazards will trigger alerts"}
                  {sensitivity[0] === 3 && "All detected hazards will trigger alerts"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audio Alert Preferences */}
      <div className="px-4 mt-6">
        <h3 className="text-slate-300 text-sm mb-3">Audio Alerts</h3>
        <Card className="bg-slate-900/90 border-slate-700/50">
          <CardContent className="p-4 space-y-4">
            {/* Audio Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Volume2 className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-slate-200 text-sm">Audio Alerts</p>
                  <p className="text-slate-400 text-xs">
                    {audioAlerts ? "Sound enabled" : "Silent mode"}
                  </p>
                </div>
              </div>
              <Switch
                checked={audioAlerts}
                onCheckedChange={setAudioAlerts}
              />
            </div>

            {/* Volume Control */}
            {audioAlerts && (
              <div className="pt-4 border-t border-slate-700/30">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-slate-300 text-sm">Alert Volume</p>
                  <span className="text-slate-400 text-sm">{audioVolume[0]}%</span>
                </div>
                <Slider
                  value={audioVolume}
                  onValueChange={setAudioVolume}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* V2X Alert Preferences */}
      <div className="px-4 mt-6">
        <h3 className="text-slate-300 text-sm mb-3">Car2X Network</h3>
        <Card className="bg-slate-900/90 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Radio className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-slate-200 text-sm">VW Car2X Alerts</p>
                  <p className="text-slate-400 text-xs">
                    {v2xAlerts ? "Receiving V2X warnings" : "V2X alerts disabled"}
                  </p>
                </div>
              </div>
              <Switch
                checked={v2xAlerts}
                onCheckedChange={setV2xAlerts}
              />
            </div>
            <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
              <p className="text-purple-300 text-xs leading-relaxed">
                Car2X technology shares real-time safety warnings from VW's connected vehicle network.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Push Notifications */}
      <div className="px-4 mt-6">
        <h3 className="text-slate-300 text-sm mb-3">Push Notifications</h3>
        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
          <CardContent className="p-4 space-y-4">
            {/* Permission Status */}
            {notificationPermission !== 'granted' && (
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                <div className="flex items-start gap-3 mb-3">
                  <BellRing className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-slate-200 text-sm mb-1">Enable Critical Alerts</p>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Get notified about high-priority hazards near you, even when the app isn't open.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleRequestNotificationPermission}
                  disabled={requestingPermission || notificationPermission === 'denied'}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white h-10"
                >
                  {requestingPermission ? 'Requesting...' : 
                   notificationPermission === 'denied' ? 'Blocked in Browser Settings' : 
                   'Enable Notifications'}
                </Button>
                {notificationPermission === 'denied' && (
                  <p className="text-xs text-red-400 mt-2">
                    Please enable notifications in your browser settings to receive critical hazard alerts.
                  </p>
                )}
              </div>
            )}

            {/* Notification Toggle - Only show if permission granted */}
            {notificationPermission === 'granted' && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <BellRing className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-slate-200 text-sm">Critical Hazard Alerts</p>
                      <p className="text-slate-400 text-xs">
                        {notificationSettings.enabled ? "Push notifications enabled" : "Notifications disabled"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.enabled}
                    onCheckedChange={(checked) => handleNotificationSettingChange({ enabled: checked })}
                  />
                </div>

                {/* Notification Settings - Only show when enabled */}
                {notificationSettings.enabled && (
                  <>
                    {/* Proximity Threshold */}
                    <div className="pt-4 border-t border-slate-700/30">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-slate-300 text-sm">Alert Distance</p>
                          <p className="text-slate-400 text-xs">How far ahead to notify</p>
                        </div>
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                          {getProximityLabel(notificationSettings.proximityThreshold)}
                        </Badge>
                      </div>
                      <Select
                        value={notificationSettings.proximityThreshold.toString()}
                        onValueChange={(value) => handleNotificationSettingChange({ proximityThreshold: parseInt(value) })}
                      >
                        <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="500">500m - Very Close</SelectItem>
                          <SelectItem value="1000">1km - Recommended</SelectItem>
                          <SelectItem value="2000">2km - Early Warning</SelectItem>
                          <SelectItem value="3000">3km - Maximum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Critical Only Toggle */}
                    <div className="pt-4 border-t border-slate-700/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-200 text-sm">Critical Hazards Only</p>
                          <p className="text-slate-400 text-xs">
                            {notificationSettings.criticalOnly 
                              ? "High & medium severity (Tier 1/2)" 
                              : "All hazard types"}
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.criticalOnly}
                          onCheckedChange={(checked) => handleNotificationSettingChange({ criticalOnly: checked })}
                        />
                      </div>
                    </div>

                    {/* Do Not Disturb */}
                    <div className="pt-4 border-t border-slate-700/30">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <Moon className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-slate-200 text-sm">Do Not Disturb</p>
                            <p className="text-slate-400 text-xs">
                              {notificationSettings.doNotDisturb.enabled 
                                ? `${notificationSettings.doNotDisturb.startTime} - ${notificationSettings.doNotDisturb.endTime}`
                                : "Notifications at all times"}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={notificationSettings.doNotDisturb.enabled}
                          onCheckedChange={(checked) => 
                            handleNotificationSettingChange({ 
                              doNotDisturb: { ...notificationSettings.doNotDisturb, enabled: checked }
                            })
                          }
                        />
                      </div>
                      
                      {notificationSettings.doNotDisturb.enabled && (
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <div>
                            <label className="text-xs text-slate-400 mb-1 block">Start Time</label>
                            <input
                              type="time"
                              value={notificationSettings.doNotDisturb.startTime}
                              onChange={(e) => 
                                handleNotificationSettingChange({
                                  doNotDisturb: { 
                                    ...notificationSettings.doNotDisturb, 
                                    startTime: e.target.value 
                                  }
                                })
                              }
                              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-md px-3 py-2 text-slate-200 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-400 mb-1 block">End Time</label>
                            <input
                              type="time"
                              value={notificationSettings.doNotDisturb.endTime}
                              onChange={(e) => 
                                handleNotificationSettingChange({
                                  doNotDisturb: { 
                                    ...notificationSettings.doNotDisturb, 
                                    endTime: e.target.value 
                                  }
                                })
                              }
                              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-md px-3 py-2 text-slate-200 text-sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}

            {/* Info Banner */}
            <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/20">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <p className="text-orange-300 text-xs leading-relaxed">
                  Push notifications help keep you safe by alerting you to critical road hazards ahead, 
                  even when Hazard Scout isn't actively open.
                </p>
              </div>
            </div>

            {/* Test Notification Button */}
            {notificationPermission === 'granted' && notificationSettings.enabled && (
              <div className="pt-2">
                <Button
                  onClick={handleTestNotification}
                  variant="outline"
                  className="w-full border-orange-500/30 text-orange-400 hover:bg-orange-500/10 h-10"
                >
                  <BellRing className="w-4 h-4 mr-2" />
                  Send Test Notification
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hazard Resolution Settings */}
      <div className="px-4 mt-6">
        <h3 className="text-slate-300 text-sm mb-3">Hazard Resolution</h3>
        <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
          <CardContent className="p-4 space-y-4">
            {/* Auto-Resolution Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-slate-200 text-sm">Auto-Resolution</p>
                  <p className="text-slate-400 text-xs">
                    {hazardSettings.autoResolutionEnabled ? "Time-based cleanup enabled" : "Manual resolution only"}
                  </p>
                </div>
              </div>
              <Switch
                checked={hazardSettings.autoResolutionEnabled}
                onCheckedChange={(checked) => handleHazardSettingChange({ autoResolutionEnabled: checked })}
              />
            </div>

            {/* Auto-Resolve Hours */}
            {hazardSettings.autoResolutionEnabled && (
              <>
                <div className="pt-4 border-t border-slate-700/30">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-slate-300 text-sm">Auto-Resolve After</p>
                      <p className="text-slate-400 text-xs">Without new confirmations</p>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      {hazardSettings.defaultAutoResolveHours}h
                    </Badge>
                  </div>
                  <Select
                    value={hazardSettings.defaultAutoResolveHours.toString()}
                    onValueChange={(value) => handleHazardSettingChange({ defaultAutoResolveHours: parseInt(value) })}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 hours - Very Fast</SelectItem>
                      <SelectItem value="12">12 hours - Fast</SelectItem>
                      <SelectItem value="24">24 hours - Recommended</SelectItem>
                      <SelectItem value="48">48 hours - Conservative</SelectItem>
                      <SelectItem value="72">72 hours - Very Conservative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Confirmations Needed */}
                <div className="pt-4 border-t border-slate-700/30">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-slate-300 text-sm">Reports to Resolve</p>
                      <p className="text-slate-400 text-xs">"Hazard Gone" confirmations</p>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      {hazardSettings.confirmationsNeededToResolve}
                    </Badge>
                  </div>
                  <Select
                    value={hazardSettings.confirmationsNeededToResolve.toString()}
                    onValueChange={(value) => handleHazardSettingChange({ confirmationsNeededToResolve: parseInt(value) })}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 report - Quick</SelectItem>
                      <SelectItem value="2">2 reports - Fast</SelectItem>
                      <SelectItem value="3">3 reports - Recommended</SelectItem>
                      <SelectItem value="5">5 reports - Strict</SelectItem>
                      <SelectItem value="10">10 reports - Very Strict</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Show Resolved Toggle */}
                <div className="pt-4 border-t border-slate-700/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-200 text-sm">Show Resolved Hazards</p>
                      <p className="text-slate-400 text-xs">
                        Display recently cleared hazards
                      </p>
                    </div>
                    <Switch
                      checked={hazardSettings.showResolvedHazards}
                      onCheckedChange={(checked) => handleHazardSettingChange({ showResolvedHazards: checked })}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Info Banner */}
            <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                <p className="text-purple-300 text-xs leading-relaxed">
                  Community verification keeps the hazard map accurate. Hazards are resolved when multiple 
                  users report them as gone or after a set time without new detections.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Privacy Settings */}
      <div className="px-4 mt-6">
        <h3 className="text-slate-300 text-sm mb-3">Privacy</h3>
        <Card className="bg-slate-900/90 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-slate-200 text-sm">Show Privacy Status</p>
                  <p className="text-slate-400 text-xs">
                    Display blur confirmation icon
                  </p>
                </div>
              </div>
              <Switch
                checked={piiBlurConfirmation}
                onCheckedChange={setPiiBlurConfirmation}
              />
            </div>
            <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-green-300 text-xs leading-relaxed">
                  All captured data automatically blurs faces and license plates before sharing. 
                  Your privacy is always protected.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="px-4 mt-6 mb-6">
        <Button
          onClick={onBack}
          className="w-full bg-[#0070E1] hover:bg-[#0060C1] text-white h-12"
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
}
