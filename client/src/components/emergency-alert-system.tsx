import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Phone, MapPin, Clock, User, Video, X, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { type AlertWithDetails, type BusWithRoute, type Station } from "@shared/schema";
import swordVideoPath from "@assets/Sword_Lagos_Bus_CCTV_Video_Ready (1)_1750007599619.mp4";
import knifeVideoPath from "@assets/knife_Lagos_Bus_CCTV_Video_Ready_1750007661394.mp4";
import gunVideoPath from "@assets/BRT_Bus_with_Machine_Gun_1750007661395.mp4";
import fightVideoPath from "@assets/Bus_Fight_Video_Generated_1750007661396.mp4";
import heartAttackVideoPath from "@assets/Video_Ready_Lagos_BRT_Heart_Attack_1750056149432.mp4";
import medicalEmergencyVideoPath from "@assets/Bus_Passenger_Medical_Emergency_Video_1750056149435.mp4";

interface EmergencyAlertSystemProps {
  buses: BusWithRoute[];
  stations: Station[];
  activeAlert: AlertWithDetails | null;
  onAlertDismiss: () => void;
  onAlertCreate: (alert: AlertWithDetails) => void;
}

type Priority = "P1" | "P2" | "P3" | "P4" | "P5";

const PRIORITY_COLORS = {
  P1: "rgba(252, 165, 165, 0.85)", // Light red with transparency
  P2: "rgba(254, 202, 202, 0.85)", // Very light red with transparency
  P3: "rgba(253, 230, 138, 0.85)", // Light amber with transparency
  P4: "rgba(254, 240, 138, 0.85)", // Very light amber with transparency
  P5: "rgba(209, 213, 219, 0.85)", // Light grey with transparency
};

const PRIORITY_TEXT_COLORS = {
  P1: "text-red-900",
  P2: "text-red-800", 
  P3: "text-amber-900",
  P4: "text-amber-800",
  P5: "text-gray-700",
};

// Video mapping for different alert types
const EMERGENCY_VIDEOS = {
  "weapon": swordVideoPath,
  "knife": knifeVideoPath, 
  "gun": gunVideoPath,
  "fight": fightVideoPath,
  "emergency": swordVideoPath, // Default for emergency alerts
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
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  const queryClient = useQueryClient();

  // Reset showTriage when a new alert arrives to ensure alerts show first
  useEffect(() => {
    if (activeAlert) {
      setShowTriage(false);
    }
  }, [activeAlert]);

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
      setShowTriage(false); // Show alert first, not triage
    },
  });

  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (alertId: number) => {
      console.log("Making acknowledge alert API call for alert:", alertId);
      const response = await fetch(`/api/alerts/${alertId}/acknowledge`, {
        method: "PATCH",
      });
      const result = await response.json();
      console.log("Acknowledge alert API response:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("Acknowledge alert mutation succeeded:", data);
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/buses'] });
      console.log("Calling onAlertDismiss to return to monitoring dashboard");
      onAlertDismiss(); // Return to monitoring dashboard
    },
    onError: (error) => {
      console.error("Acknowledge alert mutation failed:", error);
    },
  });

  const closeAlertMutation = useMutation({
    mutationFn: async (alertId: number) => {
      console.log("Making close alert API call for alert:", alertId);
      const response = await fetch(`/api/alerts/${alertId}/close`, {
        method: "PATCH",
      });
      const result = await response.json();
      console.log("Close alert API response:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("Close alert mutation succeeded:", data);
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/buses'] });
      console.log("Calling onAlertDismiss to close alert window");
      onAlertDismiss(); // Immediately close the alert window
    },
    onError: (error) => {
      console.error("Close alert mutation failed:", error);
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

  // Helper function to get video for P1 critical emergencies
  const getVideoForAlert = (alert: AlertWithDetails) => {
    // Only show videos for P1 critical emergencies
    if (alert.priority === 'P1') {
      // Check if it's a medical emergency
      if (alert.type === 'medical' || 
          alert.message.toLowerCase().includes('medical') ||
          alert.message.toLowerCase().includes('heart') ||
          alert.message.toLowerCase().includes('emergency')) {
        const p1MedicalVideos = [
          heartAttackVideoPath,      // Heart attack emergency
          medicalEmergencyVideoPath  // General medical emergency
        ];
        
        // Use alert ID as seed for consistent video selection per alert
        const videoIndex = alert.id % p1MedicalVideos.length;
        return p1MedicalVideos[videoIndex];
      }
      
      // Security/violence emergencies
      if (alert.type === 'emergency' || alert.type === 'security') {
        const p1SecurityVideos = [
          swordVideoPath,     // Sword attack
          knifeVideoPath,     // Knife threat
          gunVideoPath,       // Gun/machine gun
          fightVideoPath      // Bus fight
        ];
        
        // Use alert ID as seed for consistent video selection per alert
        const videoIndex = alert.id % p1SecurityVideos.length;
        return p1SecurityVideos[videoIndex];
      }
    }
    
    return null; // No video for non-P1 alerts
  };

  // Video player controls
  const toggleVideoPlayback = () => {
    const emergencyVideo = document.querySelector('#emergency-video') as HTMLVideoElement;
    const triageVideo = document.querySelector('#triage-video') as HTMLVideoElement;
    const video = emergencyVideo || triageVideo;
    
    if (video) {
      if (isVideoPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const toggleVideoMute = () => {
    const emergencyVideo = document.querySelector('#emergency-video') as HTMLVideoElement;
    const triageVideo = document.querySelector('#triage-video') as HTMLVideoElement;
    const video = emergencyVideo || triageVideo;
    
    if (video) {
      video.muted = !isVideoMuted;
      setIsVideoMuted(!isVideoMuted);
    }
  };

  // Full-screen overlay for active alerts
  if (activeAlert && !showTriage) {
    const overlayColor = PRIORITY_COLORS[activeAlert.priority as Priority] || PRIORITY_COLORS.P3;
    const textColor = PRIORITY_TEXT_COLORS[activeAlert.priority as Priority] || "text-white";
    const isPriorityOne = activeAlert.priority === 'P1';
    const videoSrc = getVideoForAlert(activeAlert);
    const hasVideo = videoSrc !== null;

    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-8"
        style={{ backgroundColor: overlayColor }}
      >
        <Card className={`w-full ${hasVideo ? 'max-w-6xl' : 'max-w-2xl'} bg-black/20 border-white/30 backdrop-blur-sm`}>
          <CardContent className="p-8">
            {hasVideo && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                {/* Video Feed for P1 Critical Security Alerts */}
                <div className="relative">
                  <div className="bg-black rounded-lg overflow-hidden">
                    <video
                      id="emergency-video"
                      src={videoSrc || ''}
                      autoPlay
                      loop
                      muted={isVideoMuted}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute bottom-2 right-2 flex gap-2">
                      <Button
                        onClick={toggleVideoPlayback}
                        size="sm"
                        variant="secondary"
                        className="bg-black/60 text-white hover:bg-black/80"
                      >
                        {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button
                        onClick={toggleVideoMute}
                        size="sm"
                        variant="secondary"
                        className="bg-black/60 text-white hover:bg-black/80"
                      >
                        {isVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <span className={`text-sm ${textColor} opacity-80`}>
                      LIVE CCTV FEED - Bus {activeAlert.bus?.busNumber || 'Unknown'}
                    </span>
                  </div>
                </div>

                {/* Alert Information */}
                <div className="text-center lg:text-left">
                  <div className="flex justify-center lg:justify-start mb-6">
                    <AlertTriangle className={`w-24 h-24 ${textColor}`} />
                  </div>
                  
                  <h1 className={`text-4xl font-bold mb-4 ${textColor}`}>
                    🚨 CRITICAL EMERGENCY 🚨
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
                </div>
              </div>
            )}

            {!hasVideo && (
              <div className="text-center">
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
              </div>
            )}
            
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => {
                  console.log("Acknowledge button clicked for alert:", activeAlert.id);
                  acknowledgeAlertMutation.mutate(activeAlert.id);
                }}
                variant="secondary"
                size="lg"
                className="bg-blue-600/80 text-white border-blue-400/30 hover:bg-blue-500/80"
                disabled={acknowledgeAlertMutation.isPending}
              >
                {acknowledgeAlertMutation.isPending ? "Acknowledging..." : "Acknowledge"}
              </Button>
              
              <Button
                onClick={() => {
                  console.log("Close Alert button clicked for alert:", activeAlert.id);
                  closeAlertMutation.mutate(activeAlert.id);
                }}
                variant="secondary"
                size="lg"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                disabled={closeAlertMutation.isPending}
              >
                {closeAlertMutation.isPending ? "Closing..." : "Close Alert"}
              </Button>
              
              <Button
                onClick={() => setShowTriage(true)}
                variant="secondary" 
                size="lg"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                <Video className="w-4 h-4 mr-2" />
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
    const isPriorityOne = activeAlert.priority === 'P1';
    const videoSrc = getVideoForAlert(activeAlert);
    const hasVideo = videoSrc !== null;

    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <Card className={`w-full ${isPriorityOne ? 'max-w-7xl' : 'max-w-4xl'} max-h-[90vh] overflow-auto bg-white dark:bg-gray-800`}>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

            {/* Live Video Feed Section for P1 Critical Security Alerts */}
            {hasVideo && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Live Video Feed
                </h3>
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    id="triage-video"
                    src={videoSrc || ''}
                    autoPlay
                    loop
                    muted={isVideoMuted}
                    className="w-full h-96 object-cover"
                    style={{ minHeight: '384px' }}
                  />
                  <div className="absolute bottom-2 right-2 flex gap-2">
                    <Button
                      onClick={toggleVideoPlayback}
                      size="sm"
                      variant="secondary"
                      className="bg-black/60 text-white hover:bg-black/80"
                    >
                      {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                      onClick={toggleVideoMute}
                      size="sm"
                      variant="secondary"
                      className="bg-black/60 text-white hover:bg-black/80"
                    >
                      {isVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                      LIVE FEED - Bus {bus?.busNumber || 'Unknown'}
                    </span>
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className="bg-black/60 text-white px-2 py-1 rounded text-xs">
                      CCTV Camera 1 - Interior
                    </span>
                  </div>
                </div>
              </div>
            )}

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