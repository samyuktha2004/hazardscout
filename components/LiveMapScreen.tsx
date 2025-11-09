import { useState, useEffect } from "react";
import { AlertTriangle, Wifi, Zap } from "lucide-react";
import { Badge } from "./ui/badge";
import { GoogleMapComponent } from "./GoogleMapComponent";

interface LiveMapScreenProps {
  onReportHazard: () => void;
}

export function LiveMapScreen({ onReportHazard }: LiveMapScreenProps) {
  const [latency, setLatency] = useState(1.8);

  useEffect(() => {
    // Simulate real-time latency updates
    const interval = setInterval(() => {
      setLatency(Math.random() * 0.5 + 1.5); // Random between 1.5-2.0
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-full bg-slate-950 flex flex-col overflow-hidden">
      {/* Top Status Bar */}
      <div className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 px-4 py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#0070E1] animate-pulse" />
          <span className="text-slate-300 text-sm">Driving Mode Active</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Zap className="w-4 h-4 text-[#0070E1]" />
            <span className="text-sm">{latency.toFixed(1)}s</span>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
            <Wifi className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <GoogleMapComponent onHazardClick={onReportHazard} />

        {/* Legend */}
        <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-lg p-3 space-y-2 z-10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-slate-300 text-xs">High Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full" />
            <span className="text-slate-300 text-xs">Medium Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#0070E1] rounded-full" />
            <span className="text-slate-300 text-xs">Your Vehicle</span>
          </div>
        </div>
      </div>

      {/* Critical Alert Banner */}
      <div className="bg-red-500 px-6 py-4 flex items-center justify-between z-20 shadow-2xl shadow-red-500/30 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <h3 className="text-white">HIGH SEVERITY POTHOLE AHEAD!</h3>
            <p className="text-red-100 text-sm">Distance: 150m</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-white text-sm">ETA</div>
          <div className="text-white">~12s</div>
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/50 px-4 py-2 flex items-center justify-between text-xs text-slate-400">
        <span>End-to-End Latency: {"<"}2s</span>
        <span>Real-time monitoring active</span>
      </div>
    </div>
  );
}
