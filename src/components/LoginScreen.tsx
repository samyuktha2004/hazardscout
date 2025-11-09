import { useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Lock, User, Car, ShieldAlert } from "lucide-react";

interface LoginScreenProps {
  onAuthenticate: () => void;
}

export function LoginScreen({ onAuthenticate }: LoginScreenProps) {
  const [driverId, setDriverId] = useState("");
  const [password, setPassword] = useState("");
  const [vehicleReg, setVehicleReg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (driverId && password && vehicleReg) {
      onAuthenticate();
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-200/20 via-transparent to-transparent dark:from-blue-950/20 dark:via-transparent dark:to-transparent" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Hazard Scout Logo & Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0070E1] to-[#0050A1] backdrop-blur-sm border border-[#0070E1]/30 flex items-center justify-center shadow-lg shadow-[#0070E1]/20">
              <ShieldAlert className="w-11 h-11 text-white" strokeWidth={2} />
            </div>
            {/* Pulse animation ring */}
            <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-[#0070E1]/20 animate-ping" style={{ animationDuration: '2s' }}></div>
          </div>
          <div className="text-center">
            <h1 className="text-3xl text-slate-900 dark:text-white mb-1 tracking-tight">Hazard Scout</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Road Safety Intelligence System</p>
          </div>
        </div>

        <Card className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border-slate-300 dark:border-slate-700/50 shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <h2 className="text-center text-slate-900 dark:text-slate-100">Secure Driver Authentication</h2>
            <p className="text-center text-slate-600 dark:text-slate-400 text-sm">Connect your vehicle to continue</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Driver ID */}
              <div className="space-y-2">
                <Label htmlFor="driverId" className="text-slate-900 dark:text-slate-200 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Driver ID
                </Label>
                <Input
                  id="driverId"
                  type="text"
                  placeholder="Enter your driver ID"
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#0070E1] focus:ring-[#0070E1]/30"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-900 dark:text-slate-200 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#0070E1] focus:ring-[#0070E1]/30"
                  required
                />
              </div>

              {/* Vehicle Registration */}
              <div className="space-y-2">
                <Label htmlFor="vehicleReg" className="text-slate-900 dark:text-slate-200 flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Vehicle Registration Number
                </Label>
                <Input
                  id="vehicleReg"
                  type="text"
                  placeholder="e.g., ABC-1234"
                  value={vehicleReg}
                  onChange={(e) => setVehicleReg(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#0070E1] focus:ring-[#0070E1]/30"
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-[#0070E1] hover:bg-[#0060C1] text-white shadow-lg shadow-[#0070E1]/20 transition-all duration-200 mt-6"
              >
                Authenticate & Drive
              </Button>
            </form>

            <p className="text-center text-slate-600 dark:text-slate-500 mt-6 text-sm">
              Vehicle linkage required for system access
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
