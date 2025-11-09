// Map Legend Component - Explains marker shapes and colors
import { Card, CardContent } from "./ui/card";
import { 
  V2XMarkerHigh, 
  V2XMarkerMedium, 
  V2XMarkerLow,
  YourCarMarkerHigh,
  YourCarMarkerMedium,
  YourCarMarkerLow,
  NetworkMarkerHigh,
  NetworkMarkerMedium,
  NetworkMarkerLow
} from "./MapMarkerIcons";

interface MapLegendProps {
  compact?: boolean;
}

export function MapLegend({ compact = false }: MapLegendProps) {
  if (compact) {
    return (
      <Card className="bg-slate-900/95 border-slate-700/50 backdrop-blur-sm">
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-xs">Sources:</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <V2XMarkerMedium className="w-4 h-4" />
                  <span className="text-slate-400 text-xs">V2X</span>
                </div>
                <div className="flex items-center gap-1">
                  <YourCarMarkerMedium className="w-4 h-4" />
                  <span className="text-slate-400 text-xs">Your Car</span>
                </div>
                <div className="flex items-center gap-1">
                  <NetworkMarkerMedium className="w-4 h-4" />
                  <span className="text-slate-400 text-xs">Network</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-xs">Severity:</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-red-600"></div>
                  <span className="text-slate-400 text-xs">High</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-amber-500"></div>
                  <span className="text-slate-400 text-xs">Med</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-yellow-500"></div>
                  <span className="text-slate-400 text-xs">Low</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/95 border-slate-700/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <h3 className="text-slate-200 text-sm mb-3">Map Legend</h3>
        
        {/* Source Types */}
        <div className="mb-4">
          <p className="text-slate-400 text-xs mb-2">Hazard Sources (Shapes)</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <V2XMarkerMedium className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-slate-200 text-xs">Square - V2X</p>
                <p className="text-slate-500 text-[10px]">Infrastructure systems</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <YourCarMarkerMedium className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-slate-200 text-xs">Circle - Your Car</p>
                <p className="text-slate-500 text-[10px]">Your vehicle sensors</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NetworkMarkerMedium className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-slate-200 text-xs">Triangle - Network</p>
                <p className="text-slate-500 text-[10px]">Other VW vehicles</p>
              </div>
            </div>
          </div>
        </div>

        {/* Severity Levels */}
        <div>
          <p className="text-slate-400 text-xs mb-2">Severity Levels (Colors)</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex gap-1 flex-shrink-0">
                <V2XMarkerHigh className="w-4 h-4" />
                <YourCarMarkerHigh className="w-4 h-4" />
                <NetworkMarkerHigh className="w-4 h-4" />
              </div>
              <div>
                <p className="text-slate-200 text-xs">Red - High Severity</p>
                <p className="text-slate-500 text-[10px]">Immediate attention needed</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1 flex-shrink-0">
                <V2XMarkerMedium className="w-4 h-4" />
                <YourCarMarkerMedium className="w-4 h-4" />
                <NetworkMarkerMedium className="w-4 h-4" />
              </div>
              <div>
                <p className="text-slate-200 text-xs">Amber - Medium Severity</p>
                <p className="text-slate-500 text-[10px]">Exercise caution</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1 flex-shrink-0">
                <V2XMarkerLow className="w-4 h-4" />
                <YourCarMarkerLow className="w-4 h-4" />
                <NetworkMarkerLow className="w-4 h-4" />
              </div>
              <div>
                <p className="text-slate-200 text-xs">Yellow - Low Severity</p>
                <p className="text-slate-500 text-[10px]">Minor awareness</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
