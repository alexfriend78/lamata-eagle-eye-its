import { useState, useEffect } from "react";
import { type BusWithRoute, type Route, type Station, type AlertWithDetails } from "@shared/schema";
import BusIcon from "./bus-icon";
import BusDetailsPanel from "./bus-details-panel";
import WeatherOverlay from "./weather-overlay";
import { useRouteStations } from "@/hooks/use-route-stations";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";

interface MapContainerProps {
  buses: BusWithRoute[];
  routes: Route[];
  stations: Station[];
  selectedRoutes: number[];
  theme: "light" | "dark";
  selectedZone: number | null;
  onZoneSelect: (zone: number | null) => void;
  showMap: boolean;
  showStationNames: boolean;
  onStationClick: (station: Station) => void;
  onStationHover?: (station: Station | null) => void;
  onBusHover?: (bus: BusWithRoute | null) => void;
  showLiveFeed: boolean;
  showRoutes: boolean;
  showStations: boolean;
  showBuses: boolean;
  showBackgroundMap: boolean;
}

export default function MapContainer({ buses, routes, stations, selectedRoutes, theme, selectedZone, onZoneSelect, showMap, showStationNames, onStationClick, onStationHover, onBusHover, showLiveFeed, showRoutes, showStations, showBuses, showBackgroundMap }: MapContainerProps) {
  const [selectedBus, setSelectedBus] = useState<BusWithRoute | null>(null);
  const [geofencingAlert, setGeofencingAlert] = useState<{busId: number, busNumber: string} | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<number>>(new Set());
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showWeather, setShowWeather] = useState(false);

  // Fetch active alerts to determine which buses have emergency alerts
  const { data: alerts = [] } = useQuery<AlertWithDetails[]>({
    queryKey: ['/api/alerts'],
    refetchInterval: 2000
  });

  // Check for off-route buses and show geofencing alerts
  useEffect(() => {
    const offRouteBuses = buses.filter(bus => bus.status === "off-route");
    const availableOffRouteBuses = offRouteBuses.filter(bus => !dismissedAlerts.has(bus.id));
    
    if (availableOffRouteBuses.length > 0 && !geofencingAlert) {
      const offRouteBus = availableOffRouteBuses[0];
      setGeofencingAlert({ busId: offRouteBus.id, busNumber: offRouteBus.busNumber });
    } else if (offRouteBuses.length === 0 && geofencingAlert) {
      setGeofencingAlert(null);
    }
  }, [buses]);

  // Handle bus click - dismiss geofencing alert when viewing bus details
  const handleBusClick = (bus: BusWithRoute) => {
    setSelectedBus(bus);
    if (geofencingAlert && geofencingAlert.busId === bus.id) {
      setGeofencingAlert(null);
    }
  };

  // Handle closing bus details panel
  const handleCloseBusDetails = () => {
    setSelectedBus(null);
  };

  // Handle dismissing geofencing alert
  const handleDismissAlert = () => {
    if (geofencingAlert) {
      setDismissedAlerts(prev => new Set(prev).add(geofencingAlert.busId));
      setGeofencingAlert(null);
    }
  };

  // Handle return bus to route
  const handleReturnBusToRoute = async () => {
    if (selectedBus) {
      try {
        await fetch(`/api/buses/${selectedBus.id}/return-to-route`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        setShowReturnDialog(false);
        setSelectedBus(null);
      } catch (error) {
        console.error('Failed to return bus to route:', error);
      }
    }
  };

  // Calculate distance from route for off-route glow intensity
  const getOffRouteGlowIntensity = (bus: BusWithRoute): number => {
    // Check for emergency alerts first - give maximum intensity
    const hasEmergencyAlert = alerts.some(alert => 
      alert.busId === bus.id && alert.isActive && 
      (alert.type === 'emergency' || alert.type === 'geofencing' || alert.type === 'escalated_geofencing' || alert.severity === 'high' || alert.priority === 'critical')
    );
    
    if (hasEmergencyAlert) return 1.0; // Maximum glow for emergency alerts
    
    if (bus.status !== "off-route") return 0;
    
    const routePoints = getRoutePoints(bus.routeId);
    if (routePoints.length === 0) return 0;

    // Find closest route point
    let minDistance = Infinity;
    routePoints.forEach(point => {
      const normalizedPointX = point.x / mapWidth;
      const normalizedPointY = point.y / mapHeight;
      const distance = Math.sqrt(
        Math.pow(normalizedPointX - bus.currentX, 2) + 
        Math.pow(normalizedPointY - bus.currentY, 2)
      );
      minDistance = Math.min(minDistance, distance);
    });

    // Convert distance to glow intensity (0-1, where 1 is maximum glow)
    const maxDistance = 0.2; // Maximum distance for full glow
    return Math.min(minDistance / maxDistance, 1);
  };
  
  // Dynamic screen dimensions accounting for header
  const mapWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const mapHeight = typeof window !== 'undefined' ? window.innerHeight - 64 : 1016; // Subtract header height
  
  // Fetch stations for selected routes
  const { data: routeStations = [] } = useRouteStations(selectedRoutes);
  
  const getRoutePoints = (routeId: number) => {
    
    // Fallback to hardcoded paths if no station data available
    const routePaths: Record<number, { x: number; y: number }[]> = {
      1: [ // Route 1: Oshodi - Abule-Egba (right side of stations)
        { x: mapWidth * 0.385, y: mapHeight * 0.67 }, // Right of Oshodi Terminal 2
        { x: mapWidth * 0.365, y: mapHeight * 0.65 }, // Right of Bolade
        { x: mapWidth * 0.345, y: mapHeight * 0.63 }, // Right of Ladipo
        { x: mapWidth * 0.325, y: mapHeight * 0.61 }, // Right of Shogunle
        { x: mapWidth * 0.305, y: mapHeight * 0.59 }, // Right of PWD
        { x: mapWidth * 0.285, y: mapHeight * 0.57 }, // Right of Airport Junction
        { x: mapWidth * 0.265, y: mapHeight * 0.55 }, // Right of Ikeja Along
        { x: mapWidth * 0.245, y: mapHeight * 0.53 }, // Right of Ile Zik
        { x: mapWidth * 0.225, y: mapHeight * 0.51 }, // Right of Mangoro
        { x: mapWidth * 0.205, y: mapHeight * 0.49 }, // Right of Cement
        { x: mapWidth * 0.185, y: mapHeight * 0.47 }, // Right of Iyana Dopemu
        { x: mapWidth * 0.165, y: mapHeight * 0.45 }, // Right of Adealu
        { x: mapWidth * 0.145, y: mapHeight * 0.43 }, // Right of Iyana Ipaja Bus stop
        { x: mapWidth * 0.125, y: mapHeight * 0.41 }, // Right of Pleasure
        { x: mapWidth * 0.105, y: mapHeight * 0.39 }, // Right of Ile Epo
        { x: mapWidth * 0.085, y: mapHeight * 0.37 }, // Right of Super
        { x: mapWidth * 0.065, y: mapHeight * 0.35 }  // Right of Abule Egba
      ],
      2: [ // Route 2: Multi-segment zigzag route with 7 distinct segments
        // Segment 1: Northwest diagonal
        { x: mapWidth * 0.18, y: mapHeight * 0.28 }, 
        { x: mapWidth * 0.25, y: mapHeight * 0.22 },
        
        // Segment 2: Northeast diagonal  
        { x: mapWidth * 0.35, y: mapHeight * 0.28 },
        
        // Segment 3: Straight east
        { x: mapWidth * 0.50, y: mapHeight * 0.28 },
        
        // Segment 4: Southeast diagonal
        { x: mapWidth * 0.60, y: mapHeight * 0.38 },
        
        // Segment 5: Southwest diagonal
        { x: mapWidth * 0.50, y: mapHeight * 0.50 },
        
        // Segment 6: Southeast diagonal again
        { x: mapWidth * 0.70, y: mapHeight * 0.65 },
        
        // Segment 7: Final east stretch
        { x: mapWidth * 0.90, y: mapHeight * 0.65 }
      ],
      3: [ // Route 3: Lagos Metro Express - 4 Smooth Diagonal Segments
        // Segment 1: Southwest to northeast diagonal
        { x: mapWidth * 0.15, y: mapHeight * 0.70 },
        { x: mapWidth * 0.40, y: mapHeight * 0.35 },
        
        // Segment 2: Northwest to southeast diagonal
        { x: mapWidth * 0.30, y: mapHeight * 0.15 },
        
        // Segment 3: Southwest to northeast diagonal
        { x: mapWidth * 0.65, y: mapHeight * 0.25 },
        
        // Segment 4: Northwest to southeast diagonal to end
        { x: mapWidth * 0.85, y: mapHeight * 0.60 }
      ],
      4: [ // Route 4: Realistic Lagos BRT - Ikorodu to Victoria Island
        // Segment 1: Northeast from Ikorodu towards Mile 12
        { x: mapWidth * 0.15, y: mapHeight * 0.85 },
        { x: mapWidth * 0.30, y: mapHeight * 0.70 },
        
        // Segment 2: East through Ketu-Maryland corridor
        { x: mapWidth * 0.45, y: mapHeight * 0.65 },
        
        // Segment 3: Northeast through Yaba-Surulere
        { x: mapWidth * 0.60, y: mapHeight * 0.50 },
        
        // Segment 4: East through Lagos Island
        { x: mapWidth * 0.75, y: mapHeight * 0.45 },
        
        // Segment 5: Southeast to Victoria Island
        { x: mapWidth * 0.85, y: mapHeight * 0.35 }
      ],
      5: [ // Route 5: Lagos Orbital Express - Non-crossing Arc
        // Segment 1: Start northwest
        { x: mapWidth * 0.15, y: mapHeight * 0.25 },
        
        // Segment 2: Curve northeast
        { x: mapWidth * 0.35, y: mapHeight * 0.15 },
        
        // Segment 3: Continue northeast
        { x: mapWidth * 0.60, y: mapHeight * 0.10 },
        
        // Segment 4: Turn southeast
        { x: mapWidth * 0.80, y: mapHeight * 0.25 },
        
        // Segment 5: End southwest
        { x: mapWidth * 0.85, y: mapHeight * 0.40 }
      ]
    };
    return routePaths[routeId] || [];
  };

  const calculatePerpendicularOffset = (p1: {x: number, y: number}, p2: {x: number, y: number}, offset: number) => {
    // Calculate direction vector
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return { x: p1.x, y: p1.y };
    
    // Normalize and get perpendicular vector
    const perpX = -dy / length;
    const perpY = dx / length;
    
    return {
      x: p1.x + perpX * offset,
      y: p1.y + perpY * offset
    };
  };

  const renderRouteLine = (route: Route, routeIndex: number) => {
    const points = getRoutePoints(route.id);
    const isHighlighted = selectedRoutes.includes(route.id);
    
    if (points.length < 2) return null;
    


    // Simple offset calculation - no complex positioning
    const offsetDistance = (routeIndex % 5 - 2) * 8; // -16, -8, 0, 8, 16 pixel offset
    
    // Apply minimal offset to separate overlapping routes
    const offsetPoints = points.map((point) => {
      return {
        x: point.x + offsetDistance,
        y: point.y
      };
    });

    // Use straight lines connecting all stations without curve offsets
    const straightPoints = offsetPoints;





    return (
      <svg
        key={route.id}
        className="absolute inset-0 pointer-events-none"
        width="100%"
        height="100%"
        viewBox={`0 0 ${mapWidth} ${mapHeight}`}
        preserveAspectRatio="xMidYMid slice"
        style={{ zIndex: 10 + routeIndex }}
      >
        {/* Create gradients and filters for aesthetic effects */}
        <defs>
          {(route.pattern === "gradient" && route.gradientEnd) && (
            <linearGradient id={`gradient-${route.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={route.color} />
              <stop offset="100%" stopColor={route.gradientEnd} />
            </linearGradient>
          )}
          {route.glowColor && (
            <filter id={`glow-${route.id}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/> 
              </feMerge>
            </filter>
          )}
        </defs>

        {/* Build stroke pattern based on line style */}
        {(() => {
          const getStrokePattern = () => {
            switch (route.lineStyle || "solid") {
              case "dashed": return "12,6";
              case "dotted": return "3,4";
              default: return undefined;
            }
          };

          const getAnimationClass = () => {
            switch (route.animation || "none") {
              case "flow": return "animate-pulse";
              case "pulse": return "animate-bounce";
              case "glow": return "animate-pulse";
              default: return isHighlighted ? "animate-pulse" : "";
            }
          };

          const strokeColor = (route.pattern === "gradient" && route.gradientEnd) 
            ? `url(#gradient-${route.id})` 
            : route.color;

          const lineWidth = route.lineWidth || 6;
          

          const opacity = route.opacity || (isHighlighted ? 1 : 0.9);

          return (
            <>
              {/* Shadow effect */}
              <polyline
                points={straightPoints.map(p => `${p.x + 2},${p.y + 2}`).join(' ')}
                fill="none"
                stroke="rgba(0,0,0,0.3)"
                strokeWidth={isHighlighted ? lineWidth + 2 : lineWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Double line background effect */}
              {route.lineStyle === "double" && (
                <polyline
                  points={straightPoints.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke={route.color}
                  strokeWidth={lineWidth + 4}
                  strokeOpacity={opacity * 0.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Main route line */}
              <polyline
                points={straightPoints.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke={strokeColor}
                strokeWidth={lineWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={getStrokePattern()}
                className={getAnimationClass()}
                opacity={opacity}
                filter={route.glowColor ? `url(#glow-${route.id})` : undefined}
              />

              {/* Pattern overlays */}
              {route.pattern === "arrows" && straightPoints.map((point, index) => {
                if (index === 0 || index % 4 !== 0) return null;
                const prevPoint = straightPoints[index - 1];
                const angle = Math.atan2(point.y - prevPoint.y, point.x - prevPoint.x) * 180 / Math.PI;
                
                return (
                  <polygon
                    key={`arrow-${index}`}
                    points="0,0 -10,-4 -10,4"
                    fill={route.color}
                    opacity={opacity}
                    transform={`translate(${point.x}, ${point.y}) rotate(${angle})`}
                  />
                );
              })}

              {route.pattern === "dots" && straightPoints.map((point, index) => {
                if (index % 6 !== 0) return null;
                return (
                  <circle
                    key={`dot-${index}`}
                    cx={point.x}
                    cy={point.y}
                    r="3"
                    fill={route.color}
                    opacity={opacity}
                  />
                );
              })}
            </>
          );
        })()}
        
        {/* Route number label at multiple points */}
        {offsetPoints.length > 4 && [
          Math.floor(offsetPoints.length * 0.3),
          Math.floor(offsetPoints.length * 0.7)
        ].map((pointIndex, labelIndex) => (
          <text
            key={labelIndex}
            x={offsetPoints[pointIndex].x}
            y={offsetPoints[pointIndex].y - 8}
            fill="white"
            fontSize="11"
            fontWeight="bold"
            textAnchor="middle"
            style={{
              filter: "drop-shadow(0px 1px 3px rgba(0,0,0,0.9))"
            }}
          >
            {route.routeNumber}
          </text>
        ))}
      </svg>
    );
  };

  // Calculate zoom transform for selected zone
  const getZoomTransform = () => {
    if (!selectedZone) return 'scale(1) translate(0px, 0px)';
    
    // Zone layout: 4x4 grid (zones 1-16)
    const row = Math.floor((selectedZone - 1) / 4);
    const col = (selectedZone - 1) % 4;
    
    // Each zone is 320x180 pixels (1280/4 x 720/4)
    const zoneWidth = 320;
    const zoneHeight = 180;
    
    // Calculate center of the selected zone
    const zoneCenterX = col * zoneWidth + zoneWidth / 2;
    const zoneCenterY = row * zoneHeight + zoneHeight / 2;
    
    // Zoom scale and translation to center the zone
    const scale = 2.5;
    const translateX = (640 - zoneCenterX); // 640 is half of 1280
    const translateY = (360 - zoneCenterY); // 360 is half of 720
    
    return `scale(${scale}) translate(${translateX / scale}px, ${translateY / scale}px)`;
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-white dark:bg-gray-900"
         style={{ minWidth: mapWidth, minHeight: mapHeight }}>
      
      {/* Flashing Geofencing Alert */}
      {geofencingAlert && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-pulse">
          <div className="bg-blue-800 text-white px-6 py-3 rounded-lg shadow-lg border-2 border-blue-900 flex items-center gap-3"
               style={{
                 boxShadow: '0 0 25px rgba(30, 64, 175, 0.6), 0 0 40px rgba(23, 37, 84, 0.4)',
                 background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)'
               }}>
            <AlertTriangle className="h-5 w-5 animate-bounce" />
            <span className="font-semibold">
              GEOFENCING ALERT: Bus {geofencingAlert.busNumber} has deviated from designated route
            </span>
            <Button
              onClick={handleDismissAlert}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-blue-900 ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Return to Route Dialog */}
      {showReturnDialog && selectedBus && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              <h3 className="text-lg font-semibold">Return Bus to Route</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Bus {selectedBus.busNumber} is currently off its designated route. 
              Would you like to return it to the proper path?
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowReturnDialog(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReturnBusToRoute}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Return to Route
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Grid zones overlay */}
      <div className="absolute inset-0 pointer-events-none z-40">
        {Array.from({ length: 16 }, (_, i) => {
          const row = Math.floor(i / 4);
          const col = i % 4;
          const zoneNumber = i + 1;
          
          return (
            <div
              key={zoneNumber}
              className={`absolute border-2 transition-all duration-200 ${
                selectedZone === zoneNumber 
                  ? 'border-blue-500 bg-blue-500/20' 
                  : 'border-gray-400/30 hover:border-blue-400/50 hover:bg-blue-400/10'
              }`}
              style={{
                left: `${col * 25}%`,
                top: `${row * 25}%`,
                width: '25%',
                height: '25%',
                pointerEvents: 'none'
              }}
              title={`Zone ${zoneNumber}`}
            >
              <div className={`absolute top-1 left-1 text-xs font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                {zoneNumber}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main map content */}
      <div 
        className="relative transition-all duration-500 ease-in-out"
        style={{ 
          width: `${mapWidth}px`,
          height: `${mapHeight}px`,
          transform: getZoomTransform(),
          transformOrigin: 'center center'
        }}
      >
        {/* Background Map Layer */}
      {showBackgroundMap && (
        <svg width={mapWidth} height={mapHeight} className="absolute inset-0" style={{ zIndex: 1 }}>
          <g opacity="0.15">
            {/* Lagos State outline */}
            <path
              d="M100,150 L200,120 L350,140 L450,160 L500,200 L480,300 L420,350 L300,380 L200,360 L150,300 L100,250 Z"
              fill="none"
              stroke={theme === 'dark' ? '#6b7280' : '#9ca3af'}
              strokeWidth="2"
            />
            
            {/* Lagos Island */}
            <ellipse
              cx="1000"
              cy="400"
              rx="80"
              ry="40"
              fill={theme === 'dark' ? '#374151' : '#f3f4f6'}
              stroke={theme === 'dark' ? '#6b7280' : '#9ca3af'}
              strokeWidth="1"
              opacity="0.3"
            />
            
            {/* Victoria Island */}
            <ellipse
              cx="1050"
              cy="450"
              rx="60"
              ry="30"
              fill={theme === 'dark' ? '#374151' : '#f3f4f6'}
              stroke={theme === 'dark' ? '#6b7280' : '#9ca3af'}
              strokeWidth="1"
              opacity="0.3"
            />
            
            {/* Major waterways - Lagos Lagoon */}
            <path
              d="M600,350 Q750,370 900,360 Q1000,350 1100,380"
              fill="none"
              stroke={theme === 'dark' ? '#1e40af' : '#3b82f6'}
              strokeWidth="8"
              opacity="0.3"
            />
            
            {/* Road network grid */}
            {Array.from({length: 15}, (_, i) => (
              <line
                key={`h-${i}`}
                x1="0"
                y1={50 + i * 40}
                x2={mapWidth}
                y2={50 + i * 40}
                stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
                strokeWidth="0.5"
                opacity="0.4"
              />
            ))}
            {Array.from({length: 25}, (_, i) => (
              <line
                key={`v-${i}`}
                x1={i * 50}
                y1="0"
                x2={i * 50}
                y2={mapHeight}
                stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
                strokeWidth="0.5"
                opacity="0.4"
              />
            ))}
            
            {/* Major highways */}
            <path
              d="M0,300 L400,280 L800,300 L1200,320"
              fill="none"
              stroke={theme === 'dark' ? '#6b7280' : '#9ca3af'}
              strokeWidth="3"
              opacity="0.6"
            />
            <path
              d="M200,100 Q400,200 600,300 Q800,400 1000,500"
              fill="none"
              stroke={theme === 'dark' ? '#6b7280' : '#9ca3af'}
              strokeWidth="3"
              opacity="0.6"
            />
          </g>
        </svg>
      )}

        {/* Area Labels and Features */}
        {showMap && (
          <div 
            className="absolute inset-0"
            style={{
              zIndex: 1,
              backgroundColor: theme === 'dark' ? '#0f172a' : '#e2e8f0',
              border: `2px solid ${theme === 'dark' ? '#1e293b' : '#cbd5e1'}`,
            }}
          >
            {/* Clear visual indicator that map is active */}
            <div className="absolute top-4 left-4">
              <div className={`px-3 py-1 rounded ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'} text-sm font-medium`}>
                MAP VIEW ACTIVE
              </div>
            </div>
            
            {/* Lagos geographical features */}
            <div className="w-full h-full relative">
              {/* Water bodies */}
              <div 
                className="absolute"
                style={{
                  left: '600px',
                  top: '300px',
                  width: '400px',
                  height: '200px',
                  backgroundColor: theme === 'dark' ? '#1e40af' : '#3b82f6',
                  opacity: 0.3,
                  borderRadius: '50%',
                  transform: 'rotate(-15deg)'
                }}
              />
              <div 
                className="absolute"
                style={{
                  left: '1000px',
                  top: '500px',
                  width: '280px',
                  height: '220px',
                  backgroundColor: theme === 'dark' ? '#1e40af' : '#3b82f6',
                  opacity: 0.2,
                }}
              />
              
              {/* Land masses */}
              <div 
                className="absolute"
                style={{
                  left: '50px',
                  top: '200px',
                  width: '500px',
                  height: '300px',
                  backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                  opacity: 0.4,
                  borderRadius: '30px',
                  transform: 'rotate(5deg)'
                }}
              />
              
              {/* Area labels with clear backgrounds */}
              <div className="absolute" style={{ left: '250px', top: '220px' }}>
                <div className={`px-2 py-1 rounded text-sm font-bold ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                  IKEJA
                </div>
              </div>
              <div className="absolute" style={{ left: '150px', top: '470px' }}>
                <div className={`px-2 py-1 rounded text-sm font-bold ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                  IKORODU
                </div>
              </div>
              <div className="absolute" style={{ left: '1050px', top: '370px' }}>
                <div className={`px-2 py-1 rounded text-sm font-bold ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                  LAGOS ISLAND
                </div>
              </div>
              <div className="absolute" style={{ left: '1100px', top: '520px' }}>
                <div className={`px-2 py-1 rounded text-xs font-bold ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                  VICTORIA ISLAND
                </div>
              </div>
              <div className="absolute" style={{ left: '750px', top: '390px' }}>
                <div className={`px-2 py-1 rounded text-xs italic ${theme === 'dark' ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                  Lagos Lagoon
                </div>
              </div>
              
              {/* Roads */}
              <div 
                className="absolute"
                style={{
                  left: '0px',
                  top: '200px',
                  width: '1200px',
                  height: '4px',
                  backgroundColor: theme === 'dark' ? '#6b7280' : '#9ca3af',
                  opacity: 0.6,
                  transform: 'rotate(2deg)'
                }}
              />
              <div 
                className="absolute"
                style={{
                  left: '100px',
                  top: '400px',
                  width: '1000px',
                  height: '4px',
                  backgroundColor: theme === 'dark' ? '#6b7280' : '#9ca3af',
                  opacity: 0.6,
                  transform: 'rotate(1deg)'
                }}
              />
            </div>
            
            {/* Bottom right label */}
            <div className="absolute bottom-4 right-4">
              <div className={`px-3 py-2 rounded text-lg font-bold ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                LAGOS, NIGERIA
              </div>
            </div>
          </div>
        )}

        {/* Background grid */}
        <svg
          width={mapWidth}
          height={mapHeight}
          className="absolute inset-0"
          style={{ background: theme === "dark" ? "#1f2937" : "#f9fafb" }}
        >
          <defs>
            <pattern id="grid" width="80" height="45" patternUnits="userSpaceOnUse">
              <path 
                d="M 80 0 L 0 0 0 45" 
                fill="none" 
                stroke={theme === "dark" ? "#374151" : "#d1d5db"} 
                strokeWidth="0.5"
                opacity="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Route Lines - separate layer above stations */}
        <svg
          width={mapWidth}
          height={mapHeight}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 30 }}
        >
          {showRoutes && routes
            .filter(route => selectedRoutes.length === 0 || selectedRoutes.includes(route.id))
            .map((route, index) => renderRouteLine(route, index))}
        </svg>



        {/* Major Interchange Stations - London Underground style */}
        {(() => {
          const interchanges = [
            // Oshodi - Major central hub connecting Routes 1, 2, and 5
            { x: mapWidth * 0.50, y: mapHeight * 0.60, routes: [1, 2, 5], name: "Oshodi Terminal" },
            // Anthony - Key interchange for Routes 2, 3, 4, and 5
            { x: mapWidth * 0.49, y: mapHeight * 0.51, routes: [2, 3, 4, 5], name: "Anthony" },
            // Abule Egba - Northern terminus for Routes 1 and 2
            { x: mapWidth * 0.18, y: mapHeight * 0.28, routes: [1, 2], name: "Abule Egba" },
            // Ikorodu - Southern terminus for Routes 3, 4, and 5
            { x: mapWidth * 0.15, y: mapHeight * 0.85, routes: [3, 4, 5], name: "Ikorodu Terminal" },
            // Fadeyi - Connection point for Routes 3 and 4
            { x: mapWidth * 0.57, y: mapHeight * 0.43, routes: [3, 4], name: "Fadeyi" },
            // Maryland - Shared station for Routes 3, 4, and 5
            { x: mapWidth * 0.45, y: mapHeight * 0.55, routes: [3, 4, 5], name: "Maryland" },
            // Ikeja Along - Airport connection on Routes 1 and 2
            { x: mapWidth * 0.38, y: mapHeight * 0.48, routes: [1, 2], name: "Ikeja Along" }
          ];

          return interchanges
            .filter(interchange => {
              // Show only if at least one route is selected or no routes selected
              if (selectedRoutes.length === 0) return true;
              return interchange.routes.some(routeId => selectedRoutes.includes(routeId));
            })
            .map((interchange, index) => (
              <div
                key={`interchange-${index}`}
                className="absolute z-30"
                style={{
                  left: `${interchange.x - 8}px`,
                  top: `${interchange.y - 8}px`,
                }}
              >
                {/* Interchange circle */}
                <div className={`w-4 h-4 rounded-full border-3 ${
                  theme === 'dark' 
                    ? 'bg-white border-gray-900 shadow-lg' 
                    : 'bg-gray-900 border-white shadow-lg'
                }`} />
                
                {/* Route count indicator */}
                <div 
                  className={`absolute -top-1 -right-1 w-3 h-3 rounded-full text-xs flex items-center justify-center ${
                    theme === 'dark' 
                      ? 'bg-blue-400 text-white' 
                      : 'bg-blue-600 text-white'
                  }`}
                  style={{ fontSize: '8px' }}
                >
                  {interchange.routes.filter(routeId => 
                    selectedRoutes.length === 0 || selectedRoutes.includes(routeId)
                  ).length}
                </div>

                {/* Station name on hover */}
                <div 
                  className={`absolute top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity ${
                    theme === 'dark' 
                      ? 'bg-gray-800 text-white border border-gray-600' 
                      : 'bg-white text-gray-900 border border-gray-300'
                  }`}
                  style={{
                    whiteSpace: 'nowrap',
                    fontSize: '9px',
                    filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.3))'
                  }}
                >
                  {interchange.name}
                </div>
              </div>
            ));
        })()}
        
        {/* Bus Stations - only show if stations visibility is enabled and route is selected */}
        {showStations && stations
          .filter(station => selectedRoutes.length === 0 || selectedRoutes.includes(station.routeId))
          .map((station) => {
          const stationPixelX = station.x * mapWidth;
          const stationPixelY = station.y * mapHeight;
          
          return (
            <div 
              key={station.id}
              className="absolute z-20 cursor-pointer"
              style={{ 
                top: `${stationPixelY - 8}px`, 
                left: `${stationPixelX - 8}px` 
              }}
              onDoubleClick={() => {
                console.log('🎯 Station clicked:', { id: station.id, name: station.name });
                onStationClick && onStationClick(station);
              }}
            >
            {/* Bus Stop Icon - Unicode */}
            <div className="relative">
              <span 
                className={`text-2xl ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} hover:scale-110 transition-transform select-none`}
                style={{ 
                  filter: theme === 'dark' ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                }}
              >
                🚏
              </span>
              
              {/* Station indicator dot */}
              <div 
                className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 ${
                  theme === 'dark' 
                    ? 'bg-yellow-400 border-gray-800' 
                    : 'bg-yellow-500 border-white'
                }`}
              />

              {/* Live feed indicator */}
              {showLiveFeed && (
                <div 
                  className={`absolute -bottom-1 -left-1 w-2 h-2 rounded-full ${
                    station.id % 2 === 0 ? 'bg-green-500' : 'bg-red-500'
                  } animate-pulse`}
                />
              )}
            </div>

            {/* Station name label */}
            {showStationNames && (
              <div 
                className={`absolute top-5 left-1/2 transform -translate-x-1/2 text-xs font-medium px-2 py-1 rounded ${
                  theme === 'dark' 
                    ? 'bg-gray-800 text-white border border-gray-600' 
                    : 'bg-white text-gray-900 border border-gray-300'
                }`}
                style={{
                  whiteSpace: 'nowrap',
                  fontSize: '10px',
                  filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.3))'
                }}
              >
                {station.name}
              </div>
            )}
            </div>
          );
        })}

        {/* Bus Icons with Animations - only show if buses visibility is enabled */}
        {showBuses && buses
          .filter(bus => selectedRoutes.length === 0 || selectedRoutes.includes(bus.routeId))
          .map((bus) => {
            const isOffRoute = bus.status === "off-route";
            const hasEmergencyAlert = alerts.some(alert => 
              alert.busId === bus.id && alert.isActive && 
              (alert.type === 'emergency' || alert.type === 'security' || alert.type === 'geofencing' || alert.type === 'escalated_geofencing' || alert.severity === 'high' || alert.priority === 'critical' || alert.priority === 'P1')
            );
            // Apply glow intensity for both off-route and emergency alerts
            const glowIntensity = (isOffRoute || hasEmergencyAlert) ? getOffRouteGlowIntensity(bus) : 0;
            
            return (
              <div
                key={bus.id}
                style={{
                  position: 'absolute',
                  top: `${(bus.currentY * mapHeight) - 12}px`,
                  left: `${(bus.currentX * mapWidth) - 12}px`,
                  zIndex: 30
                }}
                onMouseEnter={() => onBusHover?.(bus)}
                onMouseLeave={() => onBusHover?.(null)}
                onClick={() => handleBusClick(bus)}
                className="cursor-pointer hover:scale-110 transition-transform"
              >
                {/* Deep blue pulsing glow effect for emergency alerts and off-route buses */}
                {(isOffRoute || hasEmergencyAlert) && (
                  <>
                    {/* Main blue glow - positioned behind bus icon */}
                    <div
                      className="absolute animate-pulse pointer-events-none"
                      style={{
                        top: '-20px',
                        left: '-20px',
                        right: '-20px',
                        bottom: '-20px',
                        background: `radial-gradient(circle, rgba(30, 64, 175, ${0.8 + glowIntensity * 0.2}) 0%, rgba(30, 64, 175, ${0.6 + glowIntensity * 0.3}) 30%, rgba(30, 64, 175, ${0.4 + glowIntensity * 0.4}) 60%, rgba(30, 64, 175, 0) 100%)`,
                        boxShadow: `
                          0 0 ${25 + glowIntensity * 50}px ${20 + glowIntensity * 30}px rgba(30, 64, 175, ${0.6 + glowIntensity * 0.4}),
                          0 0 ${40 + glowIntensity * 70}px ${30 + glowIntensity * 45}px rgba(23, 37, 84, ${0.4 + glowIntensity * 0.3}),
                          0 0 ${60 + glowIntensity * 90}px ${40 + glowIntensity * 60}px rgba(17, 24, 39, ${0.2 + glowIntensity * 0.2})
                        `,
                        transform: `scale(${2.2 + glowIntensity * 1.0})`,
                        zIndex: 0,
                        borderRadius: '50%',
                        animationDuration: `${1.5 - glowIntensity * 0.5}s`
                      }}
                    />
                    {/* Inner intense blue core */}
                    <div
                      className="absolute animate-pulse pointer-events-none"
                      style={{
                        top: '-10px',
                        left: '-10px',
                        right: '-10px',
                        bottom: '-10px',
                        background: `radial-gradient(circle, rgba(59, 130, 246, ${0.9 + glowIntensity * 0.1}) 0%, rgba(30, 64, 175, ${0.7 + glowIntensity * 0.2}) 50%, rgba(30, 64, 175, 0) 100%)`,
                        transform: `scale(${1.5 + glowIntensity * 0.5})`,
                        zIndex: 1,
                        borderRadius: '50%',
                        animationDuration: `${1.2 - glowIntensity * 0.3}s`
                      }}
                    />
                  </>
                )}
                
                <div style={{ position: 'relative', zIndex: 10 }}>
                  <BusIcon
                    bus={bus}
                    alerts={alerts}
                    style={{
                      filter: (isOffRoute || hasEmergencyAlert) ? `drop-shadow(0 0 12px rgba(30, 64, 175, ${0.7 + glowIntensity * 0.3}))` : undefined
                    }}
                  />
                </div>
              </div>
            );
          })}
      </div>

      {/* Weather Overlay */}
      <WeatherOverlay 
        isVisible={showWeather}
        onToggle={setShowWeather}
      />

      {/* Bus Details Panel */}
      {selectedBus && (
        <BusDetailsPanel
          bus={selectedBus}
          onClose={handleCloseBusDetails}
        />
      )}
    </div>
  );
}