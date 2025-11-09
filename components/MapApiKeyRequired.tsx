import { Card, CardContent, CardHeader } from "./ui/card";
import { AlertCircle, ExternalLink, Copy, Check } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { useState } from "react";

export function MapApiKeyRequired() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("https://developers.google.com/maps/documentation/javascript/get-api-key");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute inset-0 bg-slate-950 flex items-center justify-center p-4 z-50">
      <div className="max-w-2xl w-full space-y-4">
        <Alert className="bg-amber-500/10 border-amber-500/30 text-amber-400">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Google Maps API key is required to display the map
          </AlertDescription>
        </Alert>

        <Card className="bg-slate-900/95 backdrop-blur-xl border-slate-700/50 shadow-2xl">
          <CardHeader>
            <h2 className="text-slate-100">Setup Google Maps API</h2>
            <p className="text-slate-400 text-sm">Follow these steps to enable the map view</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#0070E1] flex items-center justify-center text-white text-sm">
                    1
                  </div>
                  <h3 className="text-slate-200">Get an API Key</h3>
                </div>
                <p className="text-slate-400 text-sm ml-8">
                  Visit Google Cloud Console to create a new API key
                </p>
                <div className="ml-8 flex gap-2">
                  <a
                    href="https://developers.google.com/maps/documentation/javascript/get-api-key"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex"
                  >
                    <Button className="bg-[#0070E1] hover:bg-[#0060C1] text-white">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Get API Key
                    </Button>
                  </a>
                  <Button
                    variant="outline"
                    onClick={handleCopy}
                    className="bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 border-slate-700"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#0070E1] flex items-center justify-center text-white text-sm">
                    2
                  </div>
                  <h3 className="text-slate-200">Enable Required APIs</h3>
                </div>
                <div className="ml-8 space-y-1">
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0070E1]" />
                    Maps JavaScript API
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0070E1]" />
                    Marker Library (included)
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    Geometry API (optional)
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#0070E1] flex items-center justify-center text-white text-sm">
                    3
                  </div>
                  <h3 className="text-slate-200">Update the Code</h3>
                </div>
                <p className="text-slate-400 text-sm ml-8">
                  Open <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-400">/components/GoogleMapComponent.tsx</code>
                </p>
                <div className="ml-8 bg-slate-950/80 p-4 rounded-lg border border-slate-700/50 font-mono text-xs overflow-x-auto">
                  <p className="text-slate-500 mb-2">// Line ~119:</p>
                  <p className="text-slate-300">
                    script.src = `https://maps.googleapis.com/maps/api/js?key=
                    <span className="text-green-400">YOUR_ACTUAL_API_KEY</span>
                    &libraries=marker,geometry&loading=async`;
                  </p>
                </div>
                <p className="text-slate-500 text-xs ml-8 mt-2">
                  Replace <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-400">YOUR_API_KEY_HERE</code> with your actual key
                </p>
              </div>
            </div>

            {/* Pricing Info */}
            <div className="pt-4 border-t border-slate-700/50">
              <Alert className="bg-blue-500/10 border-blue-500/30">
                <AlertCircle className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-slate-300 text-xs">
                  <strong className="text-blue-400">Free Tier Available:</strong> Google Maps Platform includes $200 monthly credit, 
                  covering ~28,000 map loads/month for most applications.
                </AlertDescription>
              </Alert>
            </div>

            {/* Help */}
            <div className="pt-2">
              <p className="text-slate-500 text-xs">
                Need help? Check the{" "}
                <a
                  href="/GOOGLE_MAPS_SETUP.md"
                  className="text-[#0070E1] hover:underline"
                >
                  detailed setup guide
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
