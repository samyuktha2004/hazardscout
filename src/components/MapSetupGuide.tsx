import { Card, CardContent, CardHeader } from "./ui/card";
import { AlertCircle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

export function MapSetupGuide() {
  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <Alert className="bg-amber-500/10 border-amber-500/30 text-amber-400">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Google Maps API key required. Follow the steps below to set up your API key.
        </AlertDescription>
      </Alert>

      <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <h3 className="text-slate-100">Google Maps API Setup</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-slate-300 text-sm">
            <div>
              <p className="mb-2">
                <strong className="text-slate-200">Step 1:</strong> Get a Google Maps API key
              </p>
              <a
                href="https://developers.google.com/maps/documentation/javascript/get-api-key"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#0070E1] hover:underline"
              >
                Visit Google Maps Platform
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div>
              <p className="mb-2">
                <strong className="text-slate-200">Step 2:</strong> Enable these APIs
              </p>
              <ul className="list-disc list-inside ml-2 space-y-1 text-slate-400">
                <li>Maps JavaScript API</li>
                <li>Geometry API (optional)</li>
              </ul>
            </div>

            <div>
              <p className="mb-2">
                <strong className="text-slate-200">Step 3:</strong> Update the code
              </p>
              <div className="bg-slate-950/50 p-3 rounded border border-slate-700/30 font-mono text-xs overflow-x-auto">
                <p className="text-slate-400">// In /components/GoogleMapComponent.tsx, line 102:</p>
                <p className="text-amber-400 mt-1">
                  script.src = `https://maps.googleapis.com/maps/api/js?key=
                  <span className="text-green-400">YOUR_API_KEY_HERE</span>
                  &libraries=geometry`;
                </p>
              </div>
              <p className="text-slate-400 mt-2 text-xs">
                Replace <code className="bg-slate-800 px-1 py-0.5 rounded">YOUR_API_KEY_HERE</code> with your actual API key
              </p>
            </div>

            <div>
              <p className="mb-2">
                <strong className="text-slate-200">Step 4:</strong> Set API restrictions (recommended)
              </p>
              <ul className="list-disc list-inside ml-2 space-y-1 text-slate-400">
                <li>Application restrictions: HTTP referrers</li>
                <li>API restrictions: Limit to Maps JavaScript API</li>
              </ul>
            </div>
          </div>

          <Alert className="bg-blue-500/10 border-blue-500/30">
            <AlertCircle className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-slate-300 text-xs">
              Note: Google Maps Platform offers a $200 monthly credit. Most development and small-scale production use falls within this free tier.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
