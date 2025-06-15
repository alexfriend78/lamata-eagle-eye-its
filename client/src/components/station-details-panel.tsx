import { X, Users, Clock, AlertTriangle, CheckCircle, MapPin, Video, Wifi, Shield, PlayCircle, VolumeX, Volume2, Camera, Activity } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { StationDetails } from "@shared/schema";

interface StationDetailsPanelProps {
  stationDetails: StationDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function StationDetailsPanel({ stationDetails, isOpen, onClose }: StationDetailsPanelProps) {
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);

  if (!isOpen || !stationDetails) return null;

  // Station Live Feed - using station-specific video feed
  const getStationVideoSrc = () => {
    // Use station ID as seed for consistent video selection
    const videoFiles = [
      '/src/assets/BRT_Bus_with_Machine_Gun_1750007661395.mp4',
      '/src/assets/Bus_Fight_Video_Generated_1750007661396.mp4',
      '/src/assets/Sword_Lagos_Bus_CCTV_Video_Ready (1)_1750007599619.mp4',
      '/src/assets/knife_Lagos_Bus_CCTV_Video_Ready_1750007661394.mp4',
      '/src/assets/Delayed Bus_Passenger At Bus Stop_1750009404917.mp4',
      '/src/assets/Passengers Queuing at BRT_Bus_Video_Generated_1750009404918.mp4'
    ];
    
    const selectedIndex = stationDetails.id % videoFiles.length;
    return videoFiles[selectedIndex];
  };

  const toggleVideoPlayback = () => {
    const video = document.getElementById('station-video') as HTMLVideoElement;
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
    setIsVideoMuted(!isVideoMuted);
  };

  const getTrafficBadgeColor = (condition: string) => {
    switch (condition) {
      case "light": return "bg-green-500";
      case "normal": return "bg-yellow-500";
      case "heavy": return "bg-orange-500";
      case "severe": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMinutesUntilArrival = (estimatedArrival: Date) => {
    const now = new Date();
    const diff = new Date(estimatedArrival).getTime() - now.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    return minutes;
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-background border-l border-border shadow-lg z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚏</span>
          <h2 className="text-lg font-semibold">{stationDetails.name}</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Bus Stop Overview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Bus Stop Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Passengers waiting</span>
                </div>
                <Badge variant="outline">{stationDetails.passengerCount}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Zone</span>
                </div>
                <Badge variant="outline">Zone {stationDetails.zone}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Traffic condition</span>
                </div>
                <Badge className={`text-white ${getTrafficBadgeColor(stationDetails.trafficCondition)}`}>
                  {stationDetails.trafficCondition}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Accessibility</span>
                </div>
                <Badge variant={stationDetails.accessibility ? "default" : "secondary"}>
                  {stationDetails.accessibility ? "Accessible" : "Limited"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">WiFi Available</span>
                </div>
                <Badge variant="default" className="bg-green-600">
                  Active
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Security Status</span>
                </div>
                <Badge variant="default" className="bg-blue-600">
                  Monitored
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Crowd Level</span>
                </div>
                <Badge variant={stationDetails.passengerCount > 15 ? "destructive" : stationDetails.passengerCount > 8 ? "secondary" : "default"}>
                  {stationDetails.passengerCount > 15 ? "High" : stationDetails.passengerCount > 8 ? "Medium" : "Low"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Live Video Feed */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Live Video Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  id="station-video"
                  src={getStationVideoSrc()}
                  autoPlay
                  loop
                  muted={isVideoMuted}
                  className="w-full h-48 object-cover"
                  style={{ minHeight: '192px' }}
                />
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <Button
                    onClick={toggleVideoPlayback}
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70"
                  >
                    {isVideoPlaying ? (
                      <div className="w-2 h-2 bg-white" />
                    ) : (
                      <PlayCircle className="h-4 w-4 text-white" />
                    )}
                  </Button>
                  <Button
                    onClick={toggleVideoMute}
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70"
                  >
                    {isVideoMuted ? (
                      <VolumeX className="h-4 w-4 text-white" />
                    ) : (
                      <Volume2 className="h-4 w-4 text-white" />
                    )}
                  </Button>
                </div>
                <div className="absolute top-2 left-2">
                  <Badge variant="destructive" className="text-xs">
                    ● LIVE
                  </Badge>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Bus Stop Security Camera - Real-time monitoring
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {stationDetails.amenities && Array.isArray(stationDetails.amenities) && stationDetails.amenities.length > 0 ? (
                  stationDetails.amenities.map((amenity, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No amenities listed</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Routes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stationDetails.activeRoutes && stationDetails.activeRoutes.length > 0 ? (
                  stationDetails.activeRoutes.map((route, index) => (
                    <div key={route.id} className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: route.color }}
                      />
                      <div>
                        <div className="text-sm font-medium">Route {route.routeNumber}</div>
                        <div className="text-xs text-muted-foreground">{route.name}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No active routes</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Arrivals */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Upcoming Arrivals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stationDetails.upcomingArrivals && stationDetails.upcomingArrivals.length > 0 ? (
                <div className="space-y-3">
                  {stationDetails.upcomingArrivals.map((arrival, index) => {
                    const minutesUntil = getMinutesUntilArrival(arrival.estimatedArrival);
                    return (
                      <div key={arrival.id}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: arrival.route.color }}
                            />
                            <div>
                              <div className="text-sm font-medium">
                                Route {arrival.route.routeNumber} - {arrival.bus.busNumber}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {arrival.route.name}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {minutesUntil <= 0 ? "Arriving" : `${minutesUntil}m`}
                            </div>
                            <Badge 
                              variant={arrival.status === "approaching" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {arrival.status}
                            </Badge>
                          </div>
                        </div>
                        {index < stationDetails.upcomingArrivals.length - 1 && (
                          <Separator className="mt-3" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No upcoming arrivals
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}