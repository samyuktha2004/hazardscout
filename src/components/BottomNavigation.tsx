import { Home, ShieldCheck, Wrench, User, Shield } from "lucide-react";

interface BottomNavigationProps {
  activeTab: "home" | "status" | "scout" | "service" | "account";
  onTabChange: (tab: "home" | "status" | "scout" | "service" | "account") => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: "home" as const, icon: Home, label: "Home", shortLabel: "Home" },
    { id: "status" as const, icon: ShieldCheck, label: "Vehicle Status", shortLabel: "Status" },
    { id: "scout" as const, icon: Shield, label: "Scout", shortLabel: "Scout" },
    { id: "service" as const, icon: Wrench, label: "Service", shortLabel: "Service" },
    { id: "account" as const, icon: User, label: "Account", shortLabel: "Account" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700/50 z-50">
      <div className="flex items-center justify-around max-w-md mx-auto px-1 sm:px-2 py-2 sm:py-3 safe-area-inset-bottom">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-0.5 sm:gap-1 px-1 sm:px-2 py-1.5 sm:py-2 rounded-lg transition-all flex-1 min-w-0 ${
                isActive
                  ? "text-[#0070E1]"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 ${isActive ? "fill-[#0070E1]/20" : ""}`} />
              <span className="text-[10px] sm:text-xs truncate w-full text-center leading-tight">
                {tab.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
