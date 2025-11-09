import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { AlertTriangle, CheckCircle, XCircle, Camera, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";

interface HazardConfirmationScreenProps {
  onBack: () => void;
}

export function HazardConfirmationScreen({ onBack }: HazardConfirmationScreenProps) {
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleFeedback = (type: "confirm" | "resolved" | "false") => {
    // In a real app, this would send data to the backend
    setSubmitted(true);
    setTimeout(() => {
      onBack();
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="h-screen w-full bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-slate-100">Feedback Submitted</h2>
          <p className="text-slate-400">Thank you for contributing to our AI model training</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 px-4 py-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-slate-800/50 hover:bg-slate-700/50 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </button>
        <div>
          <h1 className="text-slate-100">Hazard Confirmation</h1>
          <p className="text-slate-400 text-sm">Help improve our AI detection</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Hazard Summary Card */}
        <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-700/50">
          <CardHeader className="pb-3">
            <h3 className="text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Detected Hazard Summary
            </h3>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-slate-500 text-sm">Hazard Type</p>
                <p className="text-slate-200">Pothole</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 text-sm">Severity Level</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <p className="text-red-400">High</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 text-sm">Distance</p>
                <p className="text-slate-200">150 meters</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 text-sm">Detection Time</p>
                <p className="text-slate-200">1.8s ago</p>
              </div>
            </div>
            
            <div className="pt-3 border-t border-slate-700/50">
              <p className="text-slate-500 text-sm mb-2">Location</p>
              <p className="text-slate-300 text-sm">Main Street, 0.3 km ahead on current route</p>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
              <p className="text-slate-400 text-xs mb-1">AI Model: YOLO-Nano v2.1</p>
              <p className="text-slate-400 text-xs">Confidence Score: 94.2%</p>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Options */}
        <div className="space-y-3">
          <h3 className="text-slate-200">Provide Feedback</h3>
          
          {/* Confirm Hazard */}
          <Button
            onClick={() => handleFeedback("confirm")}
            className="w-full bg-green-600 hover:bg-green-700 text-white h-auto py-4 flex items-center justify-start gap-4 shadow-lg shadow-green-600/20"
          >
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="text-left">
              <div>Confirm Hazard is Present</div>
              <div className="text-green-100 text-sm opacity-90">Hazard confirmed at this location</div>
            </div>
          </Button>

          {/* Hazard Resolved */}
          <Button
            onClick={() => handleFeedback("resolved")}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white h-auto py-4 flex items-center justify-start gap-4 shadow-lg shadow-amber-600/20"
          >
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="text-left">
              <div>Hazard Resolved / Safe</div>
              <div className="text-amber-100 text-sm opacity-90">Hazard no longer present or repaired</div>
            </div>
          </Button>

          {/* False Alert */}
          <Button
            onClick={() => handleFeedback("false")}
            variant="outline"
            className="w-full bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 border-slate-700 h-auto py-4 flex items-center justify-start gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-6 h-6" />
            </div>
            <div className="text-left">
              <div>False Alert (Dismiss)</div>
              <div className="text-slate-400 text-sm">No hazard detected at this location</div>
            </div>
          </Button>
        </div>

        {/* Optional Notes */}
        <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-700/50">
          <CardHeader className="pb-3">
            <Label htmlFor="notes" className="text-slate-200">
              Additional Notes or Photo Upload (Optional)
            </Label>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              id="notes"
              placeholder="Provide additional context about the hazard (e.g., size, exact location, road conditions)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 min-h-24 resize-none"
            />
            <Button
              variant="outline"
              className="w-full bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 border-slate-700"
            >
              <Camera className="w-4 h-4 mr-2" />
              Upload Photo Evidence
            </Button>
            <p className="text-slate-500 text-xs">
              Your feedback helps retrain our YOLO-Nano detection model for improved accuracy
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
