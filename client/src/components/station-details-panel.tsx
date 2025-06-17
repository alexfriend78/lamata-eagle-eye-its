import { X, Users, Clock, AlertTriangle, CheckCircle, MapPin, Video, Wifi, Shield, PlayCircle, VolumeX, Volume2, Camera, Activity } from "lucide-react";
import { useState, useEffect, useRef } from "react";
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
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentVideoSrc, setCurrentVideoSrc] = useState<string>("");
  const [lastStationId, setLastStationId] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sequential video system for routes 1-4 with expanded video collections
  const routeSpecificVideos: Record<number, string[]> = {
    1: [ // Route 1 - General mix passengers
      "/attached_assets/Secondary_school_passengers_202506171853_cjhf_1750183379795.mp4",
      "/attached_assets/Secondary_school_passengers_202506171853_oofa_1750183379796.mp4",
      "/attached_assets/Secondary_school_passengers_202506171853_zbgw_1750183379796.mp4",
      "/attached_assets/Secondary_school_passengers_202506171853_arnr_1750183379796.mp4",
      "/attached_assets/Random_mix_of_202506171853_rsy82_1750189040204.mp4",
      "/attached_assets/Random_mix_of_202506171853_jlal2_1750189040204.mp4",
      "/attached_assets/Random_mix_of_202506171853_zrvc7_1750189040204.mp4",
      "/attached_assets/Random_mix_of_202506171853_vbvma_1750189040204.mp4"
    ],
    2: [ // Route 2 - Family passengers
      "/attached_assets/Family_passengers_at_202506171853_hynd6_1750183379797.mp4",
      "/attached_assets/Family_passengers_at_202506171853_gy3pu_1750183379797.mp4",
      "/attached_assets/Family_passengers_at_202506171852_qws2a_1750183379797.mp4",
      "/attached_assets/Family_passengers_at_202506171852_vvrk4_1750183379797.mp4",
      "/attached_assets/Casually_dressed_family_202506172026_2iydu_1750189040202.mp4",
      "/attached_assets/Casually_dressed_family_202506172026_j11u8_1750189040202.mp4",
      "/attached_assets/Casually_dressed_family_202506172026_zbehd_1750189040202.mp4",
      "/attached_assets/Casually_dressed_family_202506172026_4528l_1750189040203.mp4"
    ],
    3: [ // Route 3 - Professionally dressed passengers
      "/attached_assets/Professionally_dressed_male_202506171852_mifo_1750183379797.mp4",
      "/attached_assets/Professionally_dressed_male_202506171852_ox4f_1750183379797.mp4",
      "/attached_assets/Professionally_dressed_female_202506171852_qt_1750183379798.mp4",
      "/attached_assets/Professionally_dressed_female_202506171852_05_1750183379798.mp4",
      "/attached_assets/Professionally_dressed_male_202506172027_n00c_1750189040201.mp4",
      "/attached_assets/Professionally_dressed_male_202506172027_fpfg_1750189040201.mp4",
      "/attached_assets/Professionally_dressed_male_202506172027_wzip_1750189040202.mp4",
      "/attached_assets/Professionally_dressed_male_202506172027_f0yz_1750189040202.mp4",
      "/attached_assets/Professionally_dressed_male_202506172027_2jk2_1750189040202.mp4",
      "/attached_assets/Professionally_dressed_female_202506172026_ha_1750189040203.mp4",
      "/attached_assets/Professionally_dressed_female_202506172026_wd_1750189040203.mp4",
      "/attached_assets/Professionally_dressed_male_202506172026_k5kj_1750189040203.mp4",
      "/attached_assets/Professionally_dressed_male_202506172026_acy3_1750189040203.mp4"
    ],
    4: [ // Route 4 - Orderly passengers
      "/attached_assets/Orderly_passengers_at_202506171851_6grag_1750183379799.mp4",
      "/attached_assets/Orderly_passengers_at_202506171852_bazkh_1750183379799.mp4",
      "/attached_assets/Orderly_professionally_dressed_202506171852_p_1750183379798.mp4",
      "/attached_assets/Orderly_professionally_dressed_202506171852_0_1750183379799.mp4"
    ]
  };

  // Fallback videos for routes 5+ (original videos)
  const fallbackVideos = [
    "/attached_assets/Delayed Bus_Passenger At Bus Stop_1750009404917.mp4",
    "/attached_assets/Passengers Queuing at BRT_Bus_Video_Generated_1750009404918.mp4"
  ];

  // Get video counter from localStorage to maintain sequential playback
  const getNextVideoIndex = () => {
    const currentIndex = parseInt(localStorage.getItem('busStopVideoIndex') || '0');
    const newIndex = currentIndex + 1;
    localStorage.setItem('busStopVideoIndex', newIndex.toString());
    return newIndex;
  };

  // Get the actual station object - stationDetails might be an array, so we need to handle this correctly
  const actualStation = Array.isArray(stationDetails) ? stationDetails[0] : stationDetails;
  
  // Use the routeId directly from the station data if available, otherwise fall back to ID mapping
  const getStationRoute = (station: any) => {
    // First try to use the routeId from the station data
    if (station.routeId) {
      return station.routeId;
    }
    
    // Fallback to ID-based mapping if routeId is not available
    const stationId = station.id;
    if (stationId >= 1 && stationId <= 17) return 1;
    if (stationId >= 18 && stationId <= 45) return 2;
    if (stationId >= 46 && stationId <= 65) return 3;
    if (stationId >= 66 && stationId <= 85) return 4;
    return 5;
  };

  // Only update video when station changes to prevent constant re-rendering
  useEffect(() => {
    if (actualStation && actualStation.id !== lastStationId) {
      const stationRoute = getStationRoute(actualStation);
      const routeVideos = routeSpecificVideos[stationRoute] || fallbackVideos;
      const videoIndex = getNextVideoIndex() % routeVideos.length;
      const newVideoSrc = routeVideos[videoIndex];
      
      console.log('Station changed:', {
        stationId: actualStation.id,
        stationName: actualStation.name,
        stationRoute,
        videoIndex,
        totalVideosForRoute: routeVideos.length,
        newVideoSrc,
        availableVideos: routeVideos
      });
      
      // Show which route this station belongs to
      const routeNames = {
        1: "Route 1 - Secondary School Passengers",
        2: "Route 2 - Family Passengers", 
        3: "Route 3 - Professional Passengers",
        4: "Route 4 - Orderly Passengers",
        5: "Route 5 - General Passengers"
      };
      const routeName = routeNames[stationRoute as 1 | 2 | 3 | 4 | 5] || 'Unknown Route';
      console.log(`🚌 Station belongs to: ${routeName}`);
      console.log(`📹 Playing video ${videoIndex + 1} of ${routeVideos.length} for this route`);
      console.log(`💡 TIP: Click on stations from different routes to see different passenger types!`);
      console.log(`   - Route 2 stations (IDs 18-45): Family passengers`);
      console.log(`   - Route 3 stations (IDs 46-65): Professional passengers`); 
      console.log(`   - Route 4 stations (IDs 66-85): Orderly passengers`);
      
      setCurrentVideoSrc(newVideoSrc);
      setLastStationId(actualStation.id);
      setIsVideoPlaying(true);
      
      // Auto-play video when it loads
      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play().catch(console.log);
      }
    }
  }, [actualStation?.id]);

  // Initial video setup
  useEffect(() => {
    if (!currentVideoSrc && actualStation) {
      const stationRoute = getStationRoute(actualStation);
      const routeVideos = routeSpecificVideos[stationRoute] || fallbackVideos;
      const videoIndex = getNextVideoIndex() % routeVideos.length;
      setCurrentVideoSrc(routeVideos[videoIndex]);
    }
  }, []);

  // Early return after all hooks are declared
  if (!isOpen || !stationDetails) return null;
  


  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      } else {
        videoRef.current.play().then(() => {
          setIsVideoPlaying(true);
        }).catch((error) => {
          console.error('Video play failed:', error);
          setIsVideoPlaying(false);
        });
      }
    }
  };

  const toggleVideoMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isVideoMuted;
      setIsVideoMuted(!isVideoMuted);
    }
  };

  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
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

  // Generate realistic upcoming arrivals for the station
  const generateUpcomingArrivals = () => {
    const routes = [
      { id: 1, number: "1", name: "Oshodi - Abule Egba", color: "#2563eb" },
      { id: 2, number: "2", name: "Mile 2 - Ketu", color: "#dc2626" },
      { id: 3, number: "3", name: "Ikorodu - TBS", color: "#059669" },
      { id: 4, number: "4", name: "Berger - Ajah", color: "#7c3aed" },
      { id: 5, number: "5", name: "Ikeja - Marina", color: "#ea580c" }
    ];
    
    const now = new Date();
    const arrivals = [];
    
    // Generate 3-4 upcoming buses with realistic ETAs
    for (let i = 0; i < 3 + Math.floor(Math.random() * 2); i++) {
      const route = routes[Math.floor(Math.random() * routes.length)];
      const etaMinutes = 2 + (i * 3) + Math.floor(Math.random() * 5); // 2-20 minutes
      const estimatedArrival = new Date(now.getTime() + etaMinutes * 60000);
      
      const busNumber = `BRT${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`;
      const statuses = ["approaching", "on route", "delayed"];
      const status = etaMinutes <= 3 ? "approaching" : statuses[Math.floor(Math.random() * statuses.length)];
      
      arrivals.push({
        id: i + 1,
        estimatedArrival,
        status,
        bus: { busNumber },
        route: route
      });
    }
    
    return arrivals.sort((a, b) => a.estimatedArrival.getTime() - b.estimatedArrival.getTime());
  };

  const mockUpcomingArrivals = generateUpcomingArrivals();

  return (
    <div 
      className="fixed w-[600px] bg-background border border-border shadow-lg z-50 flex flex-col"
      style={{
        top: Math.max(0, Math.min(position.y, window.innerHeight - 400)),
        left: Math.max(0, Math.min(position.x, window.innerWidth - 600)),
        height: 'calc(100vh - 40px)',
        maxHeight: '90vh'
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div 
        className="flex items-center justify-between p-4 border-b cursor-move bg-muted/30 hover:bg-muted/50 transition-colors"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚏</span>
          <h2 className="text-lg font-semibold">{actualStation.name}</h2>
          <Badge variant="outline" className="text-xs ml-2">Drag to move</Badge>
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
                <Badge variant="outline">{actualStation.passengerCount}</Badge>
              </div>
              
              {/* Crowd Level */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Crowd Level</span>
                </div>
                <Badge 
                  variant={
                    actualStation.passengerCount < 20 ? "outline" : 
                    actualStation.passengerCount < 40 ? "secondary" : "destructive"
                  }
                  className={
                    actualStation.passengerCount < 20 ? "bg-green-50 text-green-700" : 
                    actualStation.passengerCount < 40 ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"
                  }
                >
                  {actualStation.passengerCount < 20 ? "Light" : 
                   actualStation.passengerCount < 40 ? "Moderate" : "Heavy"}
                </Badge>
              </div>
              
              {/* Traffic Conditions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Traffic Conditions</span>
                </div>
                <Badge 
                  variant={
                    actualStation.id % 3 === 0 ? "destructive" : 
                    actualStation.id % 3 === 1 ? "secondary" : "outline"
                  }
                  className={
                    actualStation.id % 3 === 0 ? "bg-red-50 text-red-700" : 
                    actualStation.id % 3 === 1 ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-700"
                  }
                >
                  {actualStation.id % 3 === 0 ? "Heavy" : 
                   actualStation.id % 3 === 1 ? "Moderate" : "Light"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Zone</span>
                </div>
                <Badge variant="outline">Zone {actualStation.zone}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Traffic condition</span>
                </div>
                <Badge className={`text-white ${getTrafficBadgeColor(stationDetails!.trafficCondition)}`}>
                  {stationDetails!.trafficCondition}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Accessibility</span>
                </div>
                <Badge variant={stationDetails!.accessibility ? "default" : "secondary"}>
                  {stationDetails!.accessibility ? "Accessible" : "Limited"}
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


            </CardContent>
          </Card>

          {/* Live Video Feed */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Live Video Feed
                  <Badge variant="secondary" className="text-xs">Bus Stand CCTV</Badge>
                </div>
                <a 
                  href={currentVideoSrc} 
                  target="_blank" 
                  className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                  rel="noopener noreferrer"
                >
                  Open Video
                </a>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  key={actualStation.id}
                  src={currentVideoSrc}
                  autoPlay
                  loop
                  muted={isVideoMuted}
                  playsInline
                  controls
                  preload="metadata"
                  className="w-full h-64 object-cover"
                  style={{ minHeight: '256px' }}
                  onError={(e) => {
                    const video = e.target as HTMLVideoElement;
                    console.error('Video error:', {
                      src: video.src,
                      error: video.error,
                      networkState: video.networkState,
                      readyState: video.readyState
                    });
                  }}
                  onLoadStart={() => console.log('Video load started')}
                  onCanPlay={() => console.log('Video can play')}
                  onLoadedMetadata={() => console.log('Video metadata loaded')}
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                />
                
                <div className="absolute top-2 left-2">
                  <Badge variant="destructive" className="text-xs">
                    ● LIVE
                  </Badge>
                </div>
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
              </div>
              
              <div className="mt-2 text-xs text-muted-foreground">
                Bus Stop Security Camera - Real-time monitoring
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
              <div className="space-y-3">
                {mockUpcomingArrivals.map((arrival, index) => {
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
                              Route {arrival.route.number} - {arrival.bus.busNumber}
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
                            variant={arrival.status === "approaching" ? "default" : arrival.status === "delayed" ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {arrival.status}
                          </Badge>
                        </div>
                      </div>
                      {index < mockUpcomingArrivals.length - 1 && (
                        <Separator className="mt-3" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}