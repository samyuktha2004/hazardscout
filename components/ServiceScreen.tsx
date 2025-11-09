import { Calendar, MapPin, Phone, BookOpen, Calculator, CreditCard, CheckCircle2, Clock, AlertCircle, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Vehicle } from "../types/vehicle";
import { toast } from "sonner";

interface ServiceScreenProps {
  vehicle: Vehicle;
}

export function ServiceScreen({ vehicle }: ServiceScreenProps) {
  const handleBookService = () => {
    toast.success("Opening Service Booking", {
      description: "Loading available appointments at nearby VW service centers.",
      duration: 3000,
    });
  };

  const handleFindDealer = () => {
    toast.info("Finding Nearest Dealers", {
      description: "Searching for authorized VW service centers near you.",
      duration: 3000,
    });
  };

  const handleRoadsideAssist = () => {
    toast.success("Roadside Assistance", {
      description: "Connecting you to 24/7 VW emergency support.",
      duration: 4000,
    });
  };

  const handleScheduleUrgent = () => {
    toast.success("Scheduling Urgent Service", {
      description: "Priority booking for suspension check. We'll contact you shortly.",
      duration: 3000,
    });
  };

  const handleOpenManual = () => {
    toast.info("Owner's Manual", {
      description: "Opening digital manual for your VW " + vehicle.model,
      duration: 3000,
    });
  };

  const handleServiceCostCalculator = () => {
    toast.info("Service Cost Calculator", {
      description: "Estimate maintenance costs for your vehicle.",
      duration: 3000,
    });
  };

  const handleEMICalculator = () => {
    toast.info("EMI Calculator", {
      description: "Calculate financing options for your service.",
      duration: 3000,
    });
  };

  const handleEmergencyCall = () => {
    toast.error("Emergency Roadside Assistance", {
      description: "Calling VW 24/7 support: 1-800-VW-ASSIST",
      duration: 5000,
    });
  };

  const serviceHistory = [
    {
      id: 1,
      date: "Oct 15, 2024",
      type: "Annual Service",
      dealer: "VW Service Center, Connaught Place",
      status: "completed",
      cost: "₹12,500"
    },
    {
      id: 2,
      date: "Jun 20, 2024",
      type: "Oil Change & Filter",
      dealer: "VW Service Center, Connaught Place",
      status: "completed",
      cost: "₹4,200"
    },
    {
      id: 3,
      date: "Mar 10, 2024",
      type: "Tire Rotation",
      dealer: "VW Service Center, Saket",
      status: "completed",
      cost: "₹2,800"
    }
  ];

  const upcomingMaintenance = [
    {
      service: "Suspension Check Recommended",
      due: "Soon",
      priority: "high",
      reason: "High Impact Events Logged"
    },
    {
      service: "Annual Service",
      due: "In 5,000 km",
      priority: "medium"
    },
    {
      service: "Brake Inspection",
      due: "In 8,000 km",
      priority: "low"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFAF9] dark:bg-slate-950 pb-20 sm:pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-white to-[#FDFAF9] dark:from-slate-900 dark:to-slate-950 px-4 pt-6 pb-4">
        <h1 className="text-[#1F2F57] dark:text-slate-100 text-xl mb-1">Service & Maintenance</h1>
        <p className="text-[#484B6A] dark:text-slate-400 text-sm">VW {vehicle.model} • {vehicle.mileage.toLocaleString()} km</p>
      </div>

      {/* Upcoming Maintenance Alert */}
      <div className="px-4 -mt-2">
        <Card className="bg-gradient-to-br from-red-50 to-amber-50 dark:from-red-900/20 dark:to-amber-900/20 border-red-300 dark:border-red-700/50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-[#1F2F57] dark:text-slate-200 mb-1">⚠️ Predictive Maintenance Alert</p>
                <p className="text-[#484B6A] dark:text-slate-400 text-xs mb-2">
                  <strong>Suspension Check Recommended</strong> - High Impact Events Logged
                </p>
                <p className="text-[#9394a5] dark:text-slate-400 text-xs">
                  Your vehicle has encountered multiple high-severity road hazards. Schedule a suspension inspection to prevent damage.
                </p>
                <Button 
                  onClick={handleScheduleUrgent}
                  size="sm" 
                  className="bg-red-600 hover:bg-red-700 text-white mt-3"
                >
                  Schedule Service Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Primary Action Buttons */}
      <div className="px-4 mt-6">
        <div className="grid gap-3">
          <Button 
            onClick={handleBookService}
            className="bg-[#0070E1] hover:bg-[#0060C1] text-white h-auto py-4 justify-start"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm">Book Service Appointment</p>
                <p className="text-xs text-blue-100">Schedule your next visit</p>
              </div>
            </div>
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleFindDealer}
              variant="outline"
              className="bg-white dark:bg-slate-900/50 border-slate-300 dark:border-slate-700/50 text-[#484B6A] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 h-auto py-3 flex-col gap-2"
            >
              <MapPin className="w-5 h-5 text-[#0070E1]" />
              <span className="text-xs">Find Dealer</span>
            </Button>
            <Button
              onClick={handleRoadsideAssist}
              variant="outline"
              className="bg-white dark:bg-slate-900/50 border-slate-300 dark:border-slate-700/50 text-[#484B6A] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 h-auto py-3 flex-col gap-2"
            >
              <Phone className="w-5 h-5 text-red-400" />
              <span className="text-xs">Roadside Assist</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Recommended Maintenance */}
      <div className="px-4 mt-6">
        <h3 className="text-[#9394a5] dark:text-slate-300 text-sm mb-3">Upcoming Maintenance</h3>
        <div className="space-y-2">
          {upcomingMaintenance.map((item, index) => (
            <Card 
              key={index} 
              className={`backdrop-blur-xl ${
                item.priority === "high" 
                  ? "bg-amber-500/10 border-amber-500/30" 
                  : "bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-700/50"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      item.priority === "high" ? "bg-amber-400" :
                      item.priority === "medium" ? "bg-amber-400" : "bg-slate-500"
                    }`} />
                    <div className="flex-1">
                      <p className="text-[#1F2F57] dark:text-slate-200 text-sm mb-1">{item.service}</p>
                      {item.reason && (
                        <p className="text-[#9394a5] dark:text-slate-400 text-xs mb-2">{item.reason}</p>
                      )}
                      <p className="text-[#9394a5] dark:text-slate-400 text-xs">{item.due}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        item.priority === "high" 
                          ? "border-amber-500/50 text-amber-400" 
                          : "border-slate-600 text-slate-400"
                      }`}
                    >
                      {item.priority === "high" ? "Urgent" : item.priority === "medium" ? "Soon" : "Later"}
                    </Badge>
                    {item.priority === "high" && (
                      <Button 
                        onClick={handleScheduleUrgent}
                        size="sm" 
                        className="bg-[#0070E1] hover:bg-[#0060C1] text-white h-7 text-xs"
                      >
                        Schedule
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Service History */}
      <div className="px-4 mt-6">
        <h3 className="text-[#9394a5] dark:text-slate-300 text-sm mb-3">Service History</h3>
        <div className="space-y-3">
          {serviceHistory.map((service) => (
            <Card key={service.id} className="bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-700/50 backdrop-blur-xl">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-[#1F2F57] dark:text-slate-200 text-sm mb-1">{service.type}</p>
                      <p className="text-[#9394a5] dark:text-slate-400 text-xs mb-1">{service.dealer}</p>
                      <div className="flex items-center gap-2 text-[#A8A8A8] dark:text-slate-500 text-xs">
                        <Clock className="w-3 h-3" />
                        {service.date}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs mb-1">
                      {service.status}
                    </Badge>
                    <p className="text-[#484B6A] dark:text-slate-300 text-sm">{service.cost}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Digital Tools */}
      <div className="px-4 mt-6">
        <h3 className="text-slate-300 text-sm mb-3">Helpful Tools</h3>
        <div className="space-y-3">
          {/* Owner's Manual */}
          <Card className="bg-slate-900/90 border-slate-700/50 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0070E1]/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#0070E1]" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-200 text-sm">Digital Owner's Manual</p>
                  <p className="text-slate-400 text-xs">Access your vehicle manual</p>
                </div>
                <Button
                  onClick={handleOpenManual}
                  variant="ghost"
                  size="sm"
                  className="text-[#0070E1] hover:text-[#0060C1] hover:bg-[#0070E1]/10"
                >
                  Open
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Financial Tools */}
          <div className="grid grid-cols-2 gap-3">
            <Card 
              onClick={handleServiceCostCalculator}
              className="bg-slate-900/90 border-slate-700/50 backdrop-blur-xl cursor-pointer hover:bg-slate-800/90 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-slate-200 text-sm">Service Cost</p>
                    <p className="text-slate-400 text-xs">Calculator</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              onClick={handleEMICalculator}
              className="bg-slate-900/90 border-slate-700/50 backdrop-blur-xl cursor-pointer hover:bg-slate-800/90 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-slate-200 text-sm">EMI</p>
                    <p className="text-slate-400 text-xs">Calculator</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <div className="px-4 mt-6 mb-6">
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-slate-300 text-sm mb-3">Need help right now?</p>
              <Button 
                onClick={handleEmergencyCall}
                className="bg-red-500 hover:bg-red-600 text-white w-full"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Emergency Roadside Assistance
              </Button>
              <p className="text-slate-500 text-xs mt-2">24/7 support</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}