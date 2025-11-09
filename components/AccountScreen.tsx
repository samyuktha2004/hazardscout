import { User, Settings, Bell, HelpCircle, FileText, LogOut, ChevronRight, ShieldAlert, Sun, Moon, Type, Zap, Contrast } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Switch } from "./ui/switch";
import { useTheme } from "./ThemeProvider";
import { useState } from "react";
import { Vehicle } from "../types/vehicle";
import { toast } from "sonner";

interface AccountScreenProps {
  onLogout: () => void;
  onNavigateToSettings: () => void;
  vehicles: Vehicle[];
}

export function AccountScreen({ onLogout, onNavigateToSettings, vehicles }: AccountScreenProps) {
  const { theme, toggleTheme, accessibility, updateAccessibility } = useTheme();

  const handleProfileSettings = () => {
    toast.info("Profile Settings", {
      description: "Edit your personal information, email, and account details.",
      duration: 3000,
    });
  };

  const handleNotifications = () => {
    toast.info("Notification Preferences", {
      description: "Manage email, push, and in-app notification settings.",
      duration: 3000,
    });
  };

  const handleHelpSupport = () => {
    toast.info("Help & Support", {
      description: "Access FAQs, contact support, or schedule a callback.",
      duration: 3000,
    });
  };

  const handlePrivacyPolicy = () => {
    toast.info("Privacy Policy", {
      description: "Review how we protect and use your data.",
      duration: 3000,
    });
  };

  const menuItems = [
    { icon: User, label: "Profile Settings", color: "text-[#0070E1]", bg: "bg-[#0070E1]/20", action: handleProfileSettings },
    { icon: ShieldAlert, label: "Hazard Scout Settings", color: "text-[#0070E1]", bg: "bg-[#0070E1]/20", action: onNavigateToSettings },
    { icon: Bell, label: "Notifications", color: "text-amber-400", bg: "bg-amber-500/20", action: handleNotifications },
    { icon: HelpCircle, label: "Help & Support", color: "text-green-400", bg: "bg-green-500/20", action: handleHelpSupport },
    { icon: FileText, label: "Privacy Policy", color: "text-slate-400", bg: "bg-slate-400/20 dark:bg-slate-700/50", action: handlePrivacyPolicy },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-950 px-4 pt-6 pb-4">
        <h1 className="text-slate-900 dark:text-slate-100 text-xl mb-1">Account Settings</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">Manage your profile and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="px-4 -mt-2">
        <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900/90 dark:to-slate-800/90 backdrop-blur-xl border-slate-200 dark:border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-[#0070E1]">
                <AvatarFallback className="bg-[#0070E1] text-white text-xl">
                  DR
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-slate-900 dark:text-slate-100 text-lg mb-1">Driver Account</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">driver@vwconnect.com</p>
                <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">{vehicles.length} {vehicles.length === 1 ? 'Vehicle' : 'Vehicles'} • Member since Jan 2024</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Theme Settings */}
      <div className="px-4 mt-6">
        <h3 className="text-slate-700 dark:text-slate-300 text-sm mb-3">Appearance</h3>
        <Card className="bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-700/50">
          <CardContent className="p-4">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center">
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-[#0070E1]" />
                  ) : (
                    <Sun className="w-5 h-5 text-[#0070E1]" />
                  )}
                </div>
                <div>
                  <p className="text-slate-900 dark:text-slate-200 text-sm">
                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    Switch between themes
                  </p>
                </div>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accessibility Settings */}
      <div className="px-4 mt-6">
        <h3 className="text-slate-700 dark:text-slate-300 text-sm mb-3">Accessibility Options</h3>
        <Card className="bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-700/50">
          <CardContent className="p-4 space-y-4">
              {/* Text Size */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center">
                    <Type className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-900 dark:text-slate-200 text-sm">Text Size</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                      {accessibility.textSize === 'normal' ? 'Normal' : accessibility.textSize === 'large' ? 'Large' : 'Extra Large'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 ml-13">
                  <Button
                    variant={accessibility.textSize === 'normal' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateAccessibility({ textSize: 'normal' })}
                    className={accessibility.textSize === 'normal' ? 'bg-[#0070E1]' : ''}
                  >
                    A
                  </Button>
                  <Button
                    variant={accessibility.textSize === 'large' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateAccessibility({ textSize: 'large' })}
                    className={accessibility.textSize === 'large' ? 'bg-[#0070E1] text-lg' : 'text-lg'}
                  >
                    A
                  </Button>
                  <Button
                    variant={accessibility.textSize === 'xlarge' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateAccessibility({ textSize: 'xlarge' })}
                    className={accessibility.textSize === 'xlarge' ? 'bg-[#0070E1] text-xl' : 'text-xl'}
                  >
                    A
                  </Button>
                </div>
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-slate-900 dark:text-slate-200 text-sm">Reduce Motion</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Less animation effects</p>
                  </div>
                </div>
                <Switch
                  checked={accessibility.reducedMotion}
                  onCheckedChange={(checked) => updateAccessibility({ reducedMotion: checked })}
                />
              </div>

              {/* High Contrast */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center">
                    <Contrast className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-slate-900 dark:text-slate-200 text-sm">High Contrast</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Stronger color differences</p>
                  </div>
                </div>
                <Switch
                  checked={accessibility.highContrast}
                  onCheckedChange={(checked) => updateAccessibility({ highContrast: checked })}
                />
              </div>
            </CardContent>
          </Card>
      </div>

      {/* Menu Items */}
      <div className="px-4 mt-6">
        <h3 className="text-slate-700 dark:text-slate-300 text-sm mb-3">Settings</h3>
        <div className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card
                key={index}
                onClick={item.action || undefined}
                className="bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-700/50 backdrop-blur-xl hover:bg-slate-50 dark:hover:bg-slate-800/90 transition-colors cursor-pointer"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <span className="text-slate-900 dark:text-slate-200 text-sm flex-1">{item.label}</span>
                    <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* App Version */}
      <div className="px-4 mt-6">
        <Card className="bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/30">
          <CardContent className="p-4 text-center">
            <p className="text-slate-600 dark:text-slate-500 text-xs">App Version</p>
            <p className="text-slate-700 dark:text-slate-400 text-sm mt-1">2.5.0</p>
          </CardContent>
        </Card>
      </div>

      {/* Logout Button */}
      <div className="px-4 mt-6 mb-6">
        <Button
          onClick={onLogout}
          variant="outline"
          className="w-full bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 h-12"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
