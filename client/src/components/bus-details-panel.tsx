import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { X, Phone, User, Users, MapPin, Gauge, Camera, Play, Pause, Volume2, VolumeX, AlertTriangle, Navigation, CheckCircle, AlertOctagon } from "lucide-react";
import { type BusWithRoute, type AlertWithDetails } from "@shared/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Import CCTV video feeds for buses
import driverVideoPath from "@assets/knife_Lagos_Bus_CCTV_Video_Ready_1750007661394.mp4";
import passengersVideoPath from "@assets/Bus_Fight_Video_Generated_1750007661396.mp4";
import emergencyVideoPath from "@assets/Bus_Passenger_Medical_Emergency_Video_1750056149435.mp4";
import machineGunVideoPath from "@assets/BRT_Bus_with_Machine_Gun_1750007661395.mp4";

interface BusDetailsPanelProps {
  bus: BusWithRoute;
  onClose: () => void;
}

// Helper function to generate next stops for a bus based on its route
function getNextStopsForBus(bus: BusWithRoute) {
  const routeStops = {
    1: [
      { name: "Bolade", distance: "0.8 km", eta: "12:35 PM", status: "on-time", delay: 0 },
      { name: "Oshodi Interchange", distance: "2.1 km", eta: "12:42 PM", status: "on-time", delay: 0 },
      { name: "PWD", distance: "3.4 km", eta: "12:51 PM", status: "delayed", delay: 3 }
    ],
    2: [
      { name: "Ikeja Terminal", distance: "1.2 km", eta: "12:38 PM", status: "on-time", delay: 0 },
      { name: "Allen Avenue", distance: "2.8 km", eta: "12:46 PM", status: "on-time", delay: 0 },
      { name: "Computer Village", distance: "4.1 km", eta: "12:55 PM", status: "delayed", delay: 2 }
    ],
    3: [
      { name: "Mile 12", distance: "1.5 km", eta: "12:40 PM", status: "on-time", delay: 0 },
      { name: "Ketu", distance: "3.2 km", eta: "12:48 PM", status: "delayed", delay: 1 },
      { name: "Ojota", distance: "5.7 km", eta: "1:02 PM", status: "delayed", delay: 4 }
    ],
    4: [
      { name: "Maryland", distance: "0.9 km", eta: "12:33 PM", status: "on-time", delay: 0 },
      { name: "Palmgrove", distance: "2.3 km", eta: "12:41 PM", status: "on-time", delay: 0 },
      { name: "Yaba", distance: "4.8 km", eta: "12:56 PM", status: "delayed", delay: 5 }
    ],
    5: [
      { name: "Costain", distance: "1.1 km", eta: "12:36 PM", status: "on-time", delay: 0 },
      { name: "National Theatre", distance: "2.9 km", eta: "12:44 PM", status: "on-time", delay: 0 },
      { name: "Marina", distance: "5.2 km", eta: "1:01 PM", status: "delayed", delay: 2 }
    ]
  };

  const routeId = bus.route.id;
  return routeStops[routeId as keyof typeof routeStops] || [
    { name: "Next Station", distance: "1.0 km", eta: "12:35 PM", status: "on-time", delay: 0 },
    { name: "Terminal", distance: "2.5 km", eta: "12:45 PM", status: "on-time", delay: 0 },
    { name: "Final Stop", distance: "4.0 km", eta: "12:58 PM", status: "delayed", delay: 1 }
  ];
}

export default function BusDetailsPanel({ bus, onClose }: BusDetailsPanelProps) {
  const [isDriverVideoPlaying, setIsDriverVideoPlaying] = useState(true);
  const [isPassengerVideoPlaying, setIsPassengerVideoPlaying] = useState(true);
  const [isDriverVideoMuted, setIsDriverVideoMuted] = useState(true);
  const [isPassengerVideoMuted, setIsPassengerVideoMuted] = useState(true);
  const [isEscalated, setIsEscalated] = useState(false);

  const queryClient = useQueryClient();

  // Fetch active alerts for this bus
  const { data: alerts = [] } = useQuery<AlertWithDetails[]>({
    queryKey: ['/api/alerts'],
    refetchInterval: 2000
  });

  // Filter alerts for this specific bus
  const busAlerts = alerts.filter(alert => alert.busId === bus.id && alert.isActive);
  const hasEmergencyAlerts = busAlerts.length > 0;

  // Mutation to clear alert
  const clearAlertMutation = useMutation({
    mutationFn: (alertId: number) => apiRequest("PATCH", `/api/alerts/${alertId}/clear`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/buses'] });
    }
  });

  // Mutation to escalate alert
  const escalateAlertMutation = useMutation({
    mutationFn: (alertId: number) => apiRequest("PATCH", `/api/alerts/${alertId}/escalate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/buses'] });
    }
  });

  // Mutation to acknowledge alert
  const acknowledgeAlertMutation = useMutation({
    mutationFn: (alertId: number) => apiRequest("PATCH", `/api/alerts/${alertId}/acknowledge`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/buses'] });
    }
  });

  // Mutation to close alert
  const closeAlertMutation = useMutation({
    mutationFn: (alertId: number) => apiRequest("PATCH", `/api/alerts/${alertId}/close`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/buses'] });
    }
  });

  // Simulate real-time bus data
  const [busData, setBusData] = useState({
    currentSpeed: 45,
    maxSpeed: 60,
    passengerCount: 42,
    maxCapacity: 75,
    driverName: "Adebayo Johnson",
    driverLicense: "DL-LG-2024-00156",
    phoneNumber: "+234-803-567-8901",
    nextStop: "Maryland Terminal",
    estimatedArrival: "3 mins",
    fuelLevel: 78,
    engineStatus: "Normal",
    gpsSignal: "Strong"
  });

  // Update bus data every 3 seconds to simulate real-time changes
  useEffect(() => {
    const interval = setInterval(() => {
      setBusData(prev => ({
        ...prev,
        currentSpeed: Math.max(0, Math.min(prev.maxSpeed, prev.currentSpeed + (Math.random() - 0.5) * 8)),
        passengerCount: Math.max(0, Math.min(prev.maxCapacity, prev.passengerCount + Math.floor((Math.random() - 0.5) * 4))),
        fuelLevel: Math.max(15, prev.fuelLevel - Math.random() * 0.2)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const speedPercentage = (busData.currentSpeed / busData.maxSpeed) * 100;
  const occupancyPercentage = (busData.passengerCount / busData.maxCapacity) * 100;
  const availableSeats = busData.maxCapacity - busData.passengerCount;

  const getSpeedColor = () => {
    if (speedPercentage > 85) return "text-red-600";
    if (speedPercentage > 70) return "text-yellow-600";
    return "text-green-600";
  };

  const getOccupancyColor = () => {
    if (occupancyPercentage > 90) return "bg-red-500";
    if (occupancyPercentage > 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const toggleDriverVideo = () => {
    const video = document.querySelector('#driver-video') as HTMLVideoElement;
    if (video) {
      if (isDriverVideoPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsDriverVideoPlaying(!isDriverVideoPlaying);
    }
  };

  const togglePassengerVideo = () => {
    const video = document.querySelector('#passenger-video') as HTMLVideoElement;
    if (video) {
      if (isPassengerVideoPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPassengerVideoPlaying(!isPassengerVideoPlaying);
    }
  };

  const toggleDriverVideoMute = () => {
    const video = document.querySelector('#driver-video') as HTMLVideoElement;
    if (video) {
      video.muted = !isDriverVideoMuted;
      setIsDriverVideoMuted(!isDriverVideoMuted);
    }
  };

  const togglePassengerVideoMute = () => {
    const video = document.querySelector('#passenger-video') as HTMLVideoElement;
    if (video) {
      video.muted = !isPassengerVideoMuted;
      setIsPassengerVideoMuted(!isPassengerVideoMuted);
    }
  };

  // Select appropriate video feeds based on bus status and conditions
  const getDriverVideoSrc = () => {
    if (bus.status === "off-route" || bus.status === "alert") {
      return driverVideoPath; // Shows knife incident
    }
    return emergencyVideoPath; // Normal operations
  };

  const getPassengerVideoSrc = () => {
    if (busData.passengerCount > 50) {
      return passengersVideoPath; // Shows fight incident when crowded
    }
    if (bus.status === "alert") {
      return machineGunVideoPath; // Emergency situations
    }
    return emergencyVideoPath; // Normal passenger activity
  };

  // Get route points for the designed path
  const getDesignedRoutePoints = (routeId: number) => {
    const routePaths: Record<number, { x: number; y: number }[]> = {
      1: [
        { x: 0.37, y: 0.67 }, { x: 0.35, y: 0.65 }, { x: 0.33, y: 0.63 },
        { x: 0.31, y: 0.61 }, { x: 0.29, y: 0.59 }, { x: 0.27, y: 0.57 },
        { x: 0.25, y: 0.55 }, { x: 0.23, y: 0.53 }, { x: 0.21, y: 0.51 },
        { x: 0.19, y: 0.49 }, { x: 0.17, y: 0.47 }, { x: 0.15, y: 0.45 },
        { x: 0.13, y: 0.43 }, { x: 0.11, y: 0.41 }, { x: 0.09, y: 0.39 },
        { x: 0.07, y: 0.37 }, { x: 0.05, y: 0.35 }
      ],
      2: [
        { x: 0.18, y: 0.28 }, { x: 0.22, y: 0.32 }, { x: 0.26, y: 0.36 },
        { x: 0.30, y: 0.40 }, { x: 0.34, y: 0.44 }, { x: 0.38, y: 0.48 },
        { x: 0.42, y: 0.52 }, { x: 0.46, y: 0.56 }, { x: 0.50, y: 0.60 }
      ],
      3: [
        { x: 0.15, y: 0.85 }, { x: 0.20, y: 0.82 }, { x: 0.25, y: 0.79 },
        { x: 0.30, y: 0.76 }, { x: 0.35, y: 0.73 }, { x: 0.40, y: 0.70 }
      ],
      4: [
        { x: 0.60, y: 0.30 }, { x: 0.65, y: 0.35 }, { x: 0.70, y: 0.40 },
        { x: 0.75, y: 0.45 }, { x: 0.80, y: 0.50 }, { x: 0.85, y: 0.55 }
      ],
      5: [
        { x: 0.45, y: 0.15 }, { x: 0.50, y: 0.20 }, { x: 0.55, y: 0.25 },
        { x: 0.60, y: 0.30 }, { x: 0.65, y: 0.35 }, { x: 0.70, y: 0.40 }
      ]
    };
    return routePaths[routeId] || [];
  };

  // Generate simulated off-route path for visualization
  const getOffRoutePath = () => {
    if (bus.status !== "off-route") return [];
    
    // Simulate a deviation from the designed path
    const designedPath = getDesignedRoutePoints(bus.routeId);
    if (designedPath.length === 0) return [];
    
    const currentIndex = Math.floor(designedPath.length * 0.3); // Assume 30% through route
    const deviationPath = [];
    
    // Add points showing where bus went off-route
    for (let i = 0; i <= currentIndex && i < designedPath.length; i++) {
      deviationPath.push(designedPath[i]);
    }
    
    // Add deviation points if we have a valid last point
    if (designedPath[currentIndex]) {
      const lastPoint = designedPath[currentIndex];
      deviationPath.push(
        { x: lastPoint.x + 0.05, y: lastPoint.y + 0.03 },
        { x: lastPoint.x + 0.08, y: lastPoint.y + 0.06 },
        { x: bus.currentX || lastPoint.x + 0.1, y: bus.currentY || lastPoint.y + 0.08 }
      );
    }
    
    return deviationPath;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl bg-white dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Bus Details - {bus.busNumber}</CardTitle>
            <p className="text-gray-600 dark:text-gray-300">Route {bus.route.routeNumber}: {bus.route.name}</p>
          </div>
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }} 
            variant="ghost" 
            size="sm"
            className="hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Off-Route Alert and Route Map */}
          {bus.status === "off-route" && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-400">
                  GEOFENCING VIOLATION - Bus Off Designated Route
                </h3>
              </div>
              
              {/* Route Comparison Map */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
                <div className="flex items-center gap-2 mb-3">
                  <Navigation className="w-4 h-4" />
                  <h4 className="font-medium">Route Comparison View</h4>
                </div>
                
                <div className="relative bg-gray-100 dark:bg-gray-700 rounded h-64 overflow-hidden">
                  <svg width="100%" height="100%" viewBox="0 0 400 300" className="absolute inset-0">
                    {/* Designed Route Path - Blue */}
                    <polyline
                      points={getDesignedRoutePoints(bus.routeId)
                        .map(point => `${point.x * 400},${point.y * 300}`)
                        .join(' ')}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      strokeDasharray="none"
                    />
                    
                    {/* Actual Path Taken - Red */}
                    <polyline
                      points={getOffRoutePath()
                        .map(point => `${point.x * 400},${point.y * 300}`)
                        .join(' ')}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="3"
                      strokeDasharray="5,5"
                    />
                    
                    {/* Current Bus Position */}
                    {bus.currentX !== undefined && bus.currentY !== undefined && (
                      <circle
                        cx={bus.currentX * 400}
                        cy={bus.currentY * 300}
                        r="6"
                        fill="#ef4444"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    )}
                    
                    {/* Route stations */}
                    {getDesignedRoutePoints(bus.routeId).map((point, index) => (
                      <circle
                        key={index}
                        cx={point.x * 400}
                        cy={point.y * 300}
                        r="3"
                        fill="#3b82f6"
                        opacity="0.7"
                      />
                    ))}
                  </svg>
                  
                  {/* Legend */}
                  <div className="absolute bottom-2 left-2 bg-white dark:bg-gray-800 p-2 rounded shadow text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-0.5 bg-blue-500"></div>
                      <span>Designed Route</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-0.5 bg-red-500 border-dashed"></div>
                      <span>Actual Path</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Current Position</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Alert Action Buttons */}
              <div className="mt-4 flex gap-3 justify-center">
                {!isEscalated ? (
                  <>
                    <Button
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/buses/${bus.id}/return-to-route`, {
                            method: 'POST'
                          });
                          if (response.ok) {
                            // Close the panel after successful clear
                            onClose();
                          }
                        } catch (error) {
                          console.error('Failed to clear alert:', error);
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Clear Alert
                    </Button>
                    <Button
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/alerts`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                              type: 'escalated_geofencing',
                              message: `ESCALATED: Bus ${bus.busNumber} has been off-route for extended period. Immediate intervention required.`,
                              busId: bus.id,
                              routeId: bus.routeId,
                              priority: 'critical',
                              severity: 'high'
                            })
                          });
                          if (response.ok) {
                            setIsEscalated(true);
                          }
                        } catch (error) {
                          console.error('Failed to escalate alert:', error);
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 flex items-center gap-2"
                    >
                      <AlertOctagon className="w-4 h-4" />
                      Escalate
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-800 dark:text-green-200">Security Team Alerted</span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Critical alert has been escalated to security personnel. Response team has been notified.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={async () => {
                          try {
                            const response = await fetch(`/api/buses/${bus.id}/return-to-route`, {
                              method: 'POST'
                            });
                            if (response.ok) {
                              // Close the panel after successful clear
                              onClose();
                            }
                          } catch (error) {
                            console.error('Failed to clear alert:', error);
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Clear Alert
                      </Button>
                      <Button
                        onClick={onClose}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Close Panel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Emergency Alerts Section */}
          {hasEmergencyAlerts && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Emergency Alerts</h3>
                <Badge variant="destructive" className="animate-pulse">
                  {busAlerts.length} ACTIVE
                </Badge>
              </div>
              
              {busAlerts.map((alert, index) => (
                <div key={alert.id} className="mb-4 last:mb-0">
                  <div className="bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="destructive" 
                          className={`
                            ${alert.priority === 'critical' ? 'bg-red-600' : 
                              alert.priority === 'high' ? 'bg-orange-600' : 
                              alert.priority === 'medium' ? 'bg-yellow-600' : 'bg-blue-600'}
                          `}
                        >
                          {alert.priority?.toUpperCase() || 'MEDIUM'} PRIORITY
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-800 dark:text-gray-200 mb-3 font-medium">
                      {alert.message}
                    </p>
                    
                    {alert.driverName && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Driver: {alert.driverName}
                      </p>
                    )}
                    
                    <div className="flex gap-3">
                      <Button
                        onClick={() => acknowledgeAlertMutation.mutate(alert.id)}
                        disabled={acknowledgeAlertMutation.isPending}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {acknowledgeAlertMutation.isPending ? 'Acknowledging...' : 'Acknowledge'}
                      </Button>
                      <Button
                        onClick={() => escalateAlertMutation.mutate(alert.id)}
                        disabled={escalateAlertMutation.isPending}
                        className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                      >
                        <AlertOctagon className="w-4 h-4" />
                        {escalateAlertMutation.isPending ? 'Escalating...' : 'Escalate'}
                      </Button>
                      <Button
                        onClick={() => closeAlertMutation.mutate(alert.id)}
                        disabled={closeAlertMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        {closeAlertMutation.isPending ? 'Closing...' : 'Close'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Alert Management Section - Show only if there are emergency alerts */}
          {hasEmergencyAlerts && (
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
                  <AlertTriangle className="w-5 h-5" />
                  Alert Management - {busAlerts.length} Active Alert{busAlerts.length > 1 ? 's' : ''}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {busAlerts.map((alert) => (
                  <div key={alert.id} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-4 last:mb-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Badge variant="destructive" className="mb-2">
                          {alert.priority?.toUpperCase() || 'HIGH'} PRIORITY
                        </Badge>
                        <p className="font-medium text-red-800 dark:text-red-200">
                          {alert.message}
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      <Button
                        onClick={() => acknowledgeAlertMutation.mutate(alert.id)}
                        disabled={acknowledgeAlertMutation.isPending}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center gap-2"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {acknowledgeAlertMutation.isPending ? 'Acknowledging...' : 'Acknowledge'}
                      </Button>
                      <Button
                        onClick={() => escalateAlertMutation.mutate(alert.id)}
                        disabled={escalateAlertMutation.isPending}
                        className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                        size="sm"
                      >
                        <AlertOctagon className="w-4 h-4" />
                        {escalateAlertMutation.isPending ? 'Escalating...' : 'Escalate'}
                      </Button>
                      <Button
                        onClick={() => closeAlertMutation.mutate(alert.id)}
                        disabled={closeAlertMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                        size="sm"
                      >
                        <X className="w-4 h-4" />
                        {closeAlertMutation.isPending ? 'Closing...' : 'Close Alert'}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Bus Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Driver Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Driver Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Name:</span>
                  <span className="font-semibold">{bus.driverName || 'Not assigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Telephone:</span>
                  <Button variant="ghost" size="sm" className="h-auto p-0 font-semibold text-blue-600">
                    <Phone className="w-4 h-4 mr-1" />
                    {bus.driverPhone || '+234-8000-000-000'}
                  </Button>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Shift Start:</span>
                  <span className="font-semibold">06:00 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Hours Today:</span>
                  <span className="font-semibold">
                    {Math.floor((Date.now() - new Date().setHours(6, 0, 0, 0)) / (1000 * 60 * 60))}h {Math.floor(((Date.now() - new Date().setHours(6, 0, 0, 0)) % (1000 * 60 * 60)) / (1000 * 60))}m
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Basic Bus Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Bus Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Bus Number:</span>
                  <span className="font-semibold">{bus.busNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Route:</span>
                  <span className="font-semibold">Route {bus.route.routeNumber}: {bus.route.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <Badge 
                    className={`
                      ${bus.status === 'in-service' ? 'bg-green-500' : 
                        bus.status === 'off-route' ? 'bg-red-500' : 
                        bus.status === 'maintenance' ? 'bg-yellow-500' : 'bg-gray-500'}
                    `}
                  >
                    {bus.status?.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Vehicle ID:</span>
                  <span className="font-semibold">VH-{bus.id.toString().padStart(4, '0')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Fleet Type:</span>
                  <span className="font-semibold">BRT Standard</span>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="w-5 h-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Passenger Load:</span>
                    <span className="font-semibold">
                      {bus.currentPassengers || 32}/{bus.capacity || 50}
                    </span>
                  </div>
                  <Progress 
                    value={((bus.currentPassengers || 32) / (bus.capacity || 50)) * 100} 
                    className="h-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round(((bus.currentPassengers || 32) / (bus.capacity || 50)) * 100)}% capacity
                  </p>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">On-Time Performance:</span>
                  <span className={`font-semibold ${(bus.onTimePercentage || 87) >= 85 ? 'text-green-600' : (bus.onTimePercentage || 87) >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {bus.onTimePercentage || 87}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Trips Completed:</span>
                  <span className="font-semibold">{bus.tripsToday || 8}/12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Current Speed:</span>
                  <span className="font-semibold">
                    {bus.currentSpeed || 42} km/h
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Next Stops Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="w-5 h-5" />
                Next 3 Stops Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getNextStopsForBus(bus).map((stop, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        stop.status === 'on-time' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="font-semibold">{stop.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Stop {index + 1} • {stop.distance}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{stop.eta}</p>
                      <div className="flex items-center gap-1">
                        {stop.status === 'on-time' ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                            On Time
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            +{stop.delay}min delay
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CCTV Feeds */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Live CCTV Feeds
                {hasEmergencyAlerts && (
                  <Badge variant="destructive" className="animate-pulse ml-2">
                    EMERGENCY MONITORING
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Driver Area Feed */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Driver Area</h4>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsDriverVideoPlaying(!isDriverVideoPlaying)}
                      >
                        {isDriverVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsDriverVideoMuted(!isDriverVideoMuted)}
                      >
                        {isDriverVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      src={driverVideoPath}
                      className="w-full h-48 object-cover"
                      autoPlay={isDriverVideoPlaying}
                      muted={isDriverVideoMuted}
                      loop
                      controls={false}
                    />
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      CAM-01 • DRIVER
                    </div>
                  </div>
                </div>

                {/* Passenger Area Feed */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Passenger Area</h4>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsPassengerVideoPlaying(!isPassengerVideoPlaying)}
                      >
                        {isPassengerVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsPassengerVideoMuted(!isPassengerVideoMuted)}
                      >
                        {isPassengerVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      src={hasEmergencyAlerts ? emergencyVideoPath : passengersVideoPath}
                      className="w-full h-48 object-cover"
                      autoPlay={isPassengerVideoPlaying}
                      muted={isPassengerVideoMuted}
                      loop
                      controls={false}
                    />
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      CAM-02 • PASSENGERS
                    </div>
                    {hasEmergencyAlerts && (
                      <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs animate-pulse">
                        EMERGENCY DETECTED
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}