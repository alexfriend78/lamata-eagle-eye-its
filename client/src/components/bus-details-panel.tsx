import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { X, Phone, User, Users, MapPin, Gauge, Camera, Play, Pause, Volume2, VolumeX, AlertTriangle, Navigation } from "lucide-react";
import { type BusWithRoute } from "@shared/schema";

// Import CCTV video feeds for buses
import driverVideoPath from "@assets/Delayed Bus_Passenger At Bus Stop_1750009404917.mp4";
import passengersVideoPath from "@assets/Passengers Queuing at BRT_Bus_Video_Generated_1750009404918.mp4";

interface BusDetailsPanelProps {
  bus: BusWithRoute;
  onClose: () => void;
}

export default function BusDetailsPanel({ bus, onClose }: BusDetailsPanelProps) {
  const [isDriverVideoPlaying, setIsDriverVideoPlaying] = useState(true);
  const [isPassengerVideoPlaying, setIsPassengerVideoPlaying] = useState(true);
  const [isDriverVideoMuted, setIsDriverVideoMuted] = useState(true);
  const [isPassengerVideoMuted, setIsPassengerVideoMuted] = useState(true);

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
            </div>
          )}

          {/* Live Video Feeds */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Driver View */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Driver View</h3>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  LIVE
                </Badge>
              </div>
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  id="driver-video"
                  src={driverVideoPath}
                  autoPlay
                  loop
                  muted={isDriverVideoMuted}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <Button
                    onClick={toggleDriverVideo}
                    size="sm"
                    variant="secondary"
                    className="bg-black/60 text-white hover:bg-black/80"
                  >
                    {isDriverVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    onClick={toggleDriverVideoMute}
                    size="sm"
                    variant="secondary"
                    className="bg-black/60 text-white hover:bg-black/80"
                  >
                    {isDriverVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Passenger View */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Passenger Area</h3>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  LIVE
                </Badge>
              </div>
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  id="passenger-video"
                  src={passengersVideoPath}
                  autoPlay
                  loop
                  muted={isPassengerVideoMuted}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <Button
                    onClick={togglePassengerVideo}
                    size="sm"
                    variant="secondary"
                    className="bg-black/60 text-white hover:bg-black/80"
                  >
                    {isPassengerVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    onClick={togglePassengerVideoMute}
                    size="sm"
                    variant="secondary"
                    className="bg-black/60 text-white hover:bg-black/80"
                  >
                    {isPassengerVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Bus Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Driver Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Driver Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-semibold">{busData.driverName}</p>
                  <p className="text-sm text-gray-600">License: {busData.driverLicense}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <p className="text-sm">{busData.phoneNumber}</p>
                </div>
              </CardContent>
            </Card>

            {/* Passenger Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Passenger Count
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Occupied:</span>
                    <span className="font-semibold">{busData.passengerCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available:</span>
                    <span className="font-semibold text-green-600">{availableSeats}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Capacity:</span>
                    <span className="font-semibold">{busData.maxCapacity}</span>
                  </div>
                  <Progress value={occupancyPercentage} className={`h-3 ${getOccupancyColor()}`} />
                  <p className="text-xs text-center">{occupancyPercentage.toFixed(1)}% occupied</p>
                </div>
              </CardContent>
            </Card>

            {/* Speed Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Gauge className="w-5 h-5" />
                  Speed Monitor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Current:</span>
                    <span className={`font-bold text-xl ${getSpeedColor()}`}>
                      {busData.currentSpeed.toFixed(0)} km/h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Speed:</span>
                    <span className="font-semibold">{busData.maxSpeed} km/h</span>
                  </div>
                  <Progress value={speedPercentage} className="h-3" />
                  <p className="text-xs text-center">{speedPercentage.toFixed(1)}% of max speed</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Bus Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location & Route */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location & Route
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Next Stop:</span>
                  <span className="font-semibold">{busData.nextStop}</span>
                </div>
                <div className="flex justify-between">
                  <span>ETA:</span>
                  <span className="font-semibold text-blue-600">{busData.estimatedArrival}</span>
                </div>
                <div className="flex justify-between">
                  <span>GPS Signal:</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {busData.gpsSignal}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Vehicle Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Engine:</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {busData.engineStatus}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Fuel Level:</span>
                  <span className="font-semibold">{busData.fuelLevel.toFixed(1)}%</span>
                </div>
                <Progress value={busData.fuelLevel} className="h-3" />
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {bus.status.toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}