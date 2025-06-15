import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Phone, MapPin, Clock, User, Video, X } from "lucide-react";
import { type AlertWithDetails, type BusWithRoute, type Station } from "@shared/schema";

interface EmergencyAlertSystemProps {
  buses: BusWithRoute[];
  stations: Station[];
  activeAlert: AlertWithDetails | null;
  onAlertDismiss: () => void;
  onAlertCreate: (alert: AlertWithDetails) => void;
}

type Priority = "P1" | "P2" | "P3" | "P4" | "P5";

const PRIORITY_COLORS = {
  P1: "rgba(239, 68, 68, 0.95)", // Red
  P2: "rgba(248, 113, 113, 0.95)", // Lighter red
  P3: "rgba(245, 158, 11, 0.95)", // Amber
  P4: "rgba(251, 191, 36, 0.95)", // Lighter amber
  P5: "rgba(107, 114, 128, 0.95)", // Grey
};

const PRIORITY_TEXT_COLORS = {
  P1: "text-white",
  P2: "text-white", 
  P3: "text-white",
  P4: "text-black",
  P5: "text-white",
};

export default function EmergencyAlertSystem({ 
  buses, 
  stations, 
  activeAlert, 
  onAlertDismiss, 
  onAlertCreate 
}: EmergencyAlertSystemProps) {
  const [showSimulator, setShowSimulator] = useState(false);
  const [showTriage, setShowTriage] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<Priority>("P3");
  const [selectedBus, setSelectedBus] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("emergency");

  const queryClient = useQueryClient();

  const createAlertMutation = useMutation({
    mutationFn: async (alertData: any) => {
      const response = await fetch("/api/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(alertData),
      });
      return response.json();
    },
    onSuccess: (newAlert) => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      onAlertCreate(newAlert);
      setShowSimulator(false);
    },
  });

  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (alertId: number) => {
      const response = await fetch(`/api/alerts/${alertId}/acknowledge`, {
        method: "PATCH",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      onAlertDismiss();
    },
  });

  const handleSimulateAlert = () => {
    const bus = buses.find(b => b.id === parseInt(selectedBus));
    if (!bus || !alertMessage) return;

    const alertData = {
      type: alertType,
      message: alertMessage,
      priority: selectedPriority,
      busId: bus.id,
      routeId: bus.routeId,
      severity: selectedPriority === "P1" ? "critical" : selectedPriority === "P2" ? "high" : "medium",
      driverName: "John Adebayo",
      driverNumber: "+234-8012-345-678",
      lastStopId: 1,
      nextStopId: 2,
      zoneNumber: `Zone ${bus.routeId}`,
    };

    createAlertMutation.mutate(alertData);
  };

  const getBusInfo = (busId: number | null) => {
    if (!busId) return null;
    return buses.find(b => b.id === busId);
  };

  const getStationInfo = (stationId: number | null) => {
    if (!stationId) return null;
    return stations.find(s => s.id === stationId);
  };

  // Full-screen overlay for active alerts
  if (activeAlert && !showTriage) {
    const overlayColor = PRIORITY_COLORS[activeAlert.priority as Priority] || PRIORITY_COLORS.P3;
    const textColor = PRIORITY_TEXT_COLORS[activeAlert.priority as Priority] || "text-white";

    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-8"
        style={{ backgroundColor: overlayColor }}
      >
        <Card className="w-full max-w-2xl bg-black/20 border-white/30 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <AlertTriangle className={`w-24 h-24 ${textColor}`} />
            </div>
            
            <h1 className={`text-4xl font-bold mb-4 ${textColor}`}>
              EMERGENCY ALERT
            </h1>
            
            <div className={`text-2xl font-semibold mb-2 ${textColor}`}>
              PRIORITY: {activeAlert.priority}
            </div>
            
            <div className={`text-xl mb-6 ${textColor}`}>
              {activeAlert.message}
            </div>
            
            <div className={`text-lg mb-8 ${textColor} opacity-80`}>
              Alert Type: {activeAlert.type.toUpperCase()}
            </div>
            
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => acknowledgeAlertMutation.mutate(activeAlert.id)}
                variant="secondary"
                size="lg"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                disabled={acknowledgeAlertMutation.isPending}
              >
                Acknowledge Alert
              </Button>
              
              <Button
                onClick={() => setShowTriage(true)}
                variant="secondary" 
                size="lg"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                Triage Alert
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Triage interface
  if (showTriage && activeAlert) {
    const bus = getBusInfo(activeAlert.busId);
    const lastStop = getStationInfo(activeAlert.lastStopId);
    const nextStop = getStationInfo(activeAlert.nextStopId);

    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
                EMERGENCY TRIAGE - {activeAlert.priority}
              </h2>
              <Button
                onClick={() => setShowTriage(false)}
                variant="ghost"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Alert Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-3">Alert Details</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span className="font-medium">Priority:</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      activeAlert.priority === 'P1' ? 'bg-red-600 text-white' :
                      activeAlert.priority === 'P2' ? 'bg-red-400 text-white' :
                      activeAlert.priority === 'P3' ? 'bg-amber-500 text-white' :
                      activeAlert.priority === 'P4' ? 'bg-amber-300 text-black' :
                      'bg-gray-500 text-white'
                    }`}>
                      {activeAlert.priority}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium">Message:</span>
                    <p className="mt-1 text-sm">{activeAlert.message}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium">Type:</span>
                    <span className="ml-2 capitalize">{activeAlert.type}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium">Time:</span>
                    <span className="ml-2">{new Date(activeAlert.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Bus and Route Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-3">Vehicle Information</h3>
                
                {bus && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🚌</span>
                      <div>
                        <div className="font-medium">Bus #{bus.busNumber}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Route {bus.route.routeNumber}: {bus.route.name}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">Current Location:</span>
                      <span className="text-sm">({bus.currentX.toFixed(3)}, {bus.currentY.toFixed(3)})</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Direction:</span>
                      <span className="capitalize">{bus.direction}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Zone:</span>
                      <span>{activeAlert.zoneNumber || 'N/A'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Driver Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-3">Driver Information</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium">Name:</span>
                    <span>{activeAlert.driverName || 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span className="font-medium">Phone:</span>
                    <span>{activeAlert.driverNumber || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Station Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-3">Station Information</h3>
                
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Last Stop:</span>
                    <span className="ml-2">{lastStop?.name || 'N/A'}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium">Next Stop:</span>
                    <span className="ml-2">{nextStop?.name || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Video Feed Placeholder */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Live Video Feed</h3>
              <div className="bg-gray-900 rounded-lg p-8 text-center">
                <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-400">Live video feed from Bus #{bus?.busNumber}</p>
                <p className="text-sm text-gray-500 mt-2">Camera feed would be integrated here</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-4 justify-end">
              <Button
                onClick={() => acknowledgeAlertMutation.mutate(activeAlert.id)}
                variant="outline"
                disabled={acknowledgeAlertMutation.isPending}
              >
                Acknowledge & Close
              </Button>
              
              <Button
                onClick={() => setShowTriage(false)}
                variant="secondary"
              >
                Back to Alert
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Simulator interface
  if (showSimulator) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Simulate Emergency Alert</h3>
              <Button
                onClick={() => setShowSimulator(false)}
                variant="ghost"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Priority Level</label>
                <Select value={selectedPriority} onValueChange={(value: Priority) => setSelectedPriority(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="P1">P1 - Critical (Red)</SelectItem>
                    <SelectItem value="P2">P2 - High (Light Red)</SelectItem>
                    <SelectItem value="P3">P3 - Medium (Amber)</SelectItem>
                    <SelectItem value="P4">P4 - Low (Light Amber)</SelectItem>
                    <SelectItem value="P5">P5 - Info (Grey)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bus</label>
                <Select value={selectedBus} onValueChange={setSelectedBus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a bus" />
                  </SelectTrigger>
                  <SelectContent>
                    {buses.map((bus) => (
                      <SelectItem key={bus.id} value={bus.id.toString()}>
                        {bus.busNumber} - Route {bus.route.routeNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Alert Type</label>
                <Select value={alertType} onValueChange={setAlertType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="breakdown">Breakdown</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="fire">Fire</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Alert Message</label>
                <Input
                  value={alertMessage}
                  onChange={(e) => setAlertMessage(e.target.value)}
                  placeholder="Enter alert message..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSimulateAlert}
                  disabled={!selectedBus || !alertMessage || createAlertMutation.isPending}
                  className="flex-1"
                >
                  Create Alert
                </Button>
                <Button
                  onClick={() => setShowSimulator(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Simulate button
  return (
    <Button
      onClick={() => setShowSimulator(true)}
      variant="destructive"
      size="sm"
      className="fixed bottom-4 right-4 z-40"
    >
      <AlertTriangle className="w-4 h-4 mr-2" />
      Simulate Emergency
    </Button>
  );
}