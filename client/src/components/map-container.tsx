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
  backgroundMapOpacity: number;
  selectedBackgroundStyle: string;
}

export default function MapContainer({ 
  buses, 
  routes, 
  stations, 
  selectedRoutes, 
  theme, 
  selectedZone, 
  onZoneSelect, 
  showMap, 
  showStationNames, 
  onStationClick, 
  onStationHover, 
  onBusHover, 
  showLiveFeed, 
  showRoutes, 
  showStations, 
  showBuses, 
  showBackgroundMap, 
  backgroundMapOpacity,
  selectedBackgroundStyle 
}: MapContainerProps) {
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
      setGeofencingAlert({
        busId: availableOffRouteBuses[0].id,
        busNumber: availableOffRouteBuses[0].busNumber
      });
    } else if (availableOffRouteBuses.length === 0 && geofencingAlert) {
      setGeofencingAlert(null);
    }
  }, [buses, dismissedAlerts, geofencingAlert]);

  const mapWidth = 1200;
  const mapHeight = 800;
  const zoomLevel = 1;

  const getZoomTransform = () => {
    return `scale(${zoomLevel})`;
  };

  const handleBusClick = (bus: BusWithRoute) => {
    setSelectedBus(bus);
  };

  const handleCloseBusDetails = () => {
    setSelectedBus(null);
  };

  const getOffRouteGlowIntensity = (bus: BusWithRoute): number => {
    if (bus.status !== "off-route") return 0;
    
    const time = Date.now();
    const slowPulse = Math.sin(time * 0.001) * 0.3 + 0.7; // Slow pulsing between 0.4 and 1.0
    return slowPulse;
  };

  // Get stations for selected routes
  const routeStations = useRouteStations(selectedRoutes);

  const renderRouteLine = (route: Route, routeIndex: number) => {
    let routePoints;
    try {
      routePoints = JSON.parse(route.points || "[]");
    } catch {
      routePoints = [];
    }
    
    if (routePoints.length < 2) return null;

    const isHighlighted = selectedRoutes.length === 0 || selectedRoutes.includes(route.id);
    
    // Create path string for the route
    let pathData = `M${routePoints[0].x},${routePoints[0].y}`;
    
    for (let i = 1; i < routePoints.length; i++) {
      pathData += ` L${routePoints[i].x},${routePoints[i].y}`;
    }

    return (
      <g key={route.id}>
        <path
          d={pathData}
          fill="none"
          stroke={isHighlighted ? (route.color || '#10b981') : '#9ca3af'}
          strokeWidth={isHighlighted ? "6" : "3"}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={isHighlighted ? 0.8 : 0.3}
          style={{
            filter: isHighlighted ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))' : 'none'
          }}
        />
      </g>
    );
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      <div 
        className="w-full h-full relative"
        style={{
          transform: getZoomTransform(),
          transformOrigin: 'center center'
        }}
      >
        {/* Professional Background Styles */}
        {showBackgroundMap && (
          <div className="absolute inset-0" style={{ zIndex: 1, opacity: backgroundMapOpacity }}>
            {selectedBackgroundStyle === 'grid' && (
              <svg width={mapWidth} height={mapHeight} className="absolute inset-0">
                <defs>
                  <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            )}
            
            {selectedBackgroundStyle === 'minimal' && (
              <div className={`w-full h-full ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'} border ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
                <div className="absolute top-4 left-4 right-4 bottom-4 border border-dashed opacity-20" style={{ borderColor: theme === 'dark' ? '#6b7280' : '#9ca3af' }} />
              </div>
            )}
            
            {selectedBackgroundStyle === 'topographic' && (
              <svg width={mapWidth} height={mapHeight} className="absolute inset-0">
                <defs>
                  <radialGradient id="topo1" cx="30%" cy="40%">
                    <stop offset="0%" stopColor={theme === 'dark' ? '#1e40af' : '#3b82f6'} stopOpacity="0.1"/>
                    <stop offset="100%" stopColor="transparent"/>
                  </radialGradient>
                  <radialGradient id="topo2" cx="70%" cy="60%">
                    <stop offset="0%" stopColor={theme === 'dark' ? '#059669' : '#10b981'} stopOpacity="0.1"/>
                    <stop offset="100%" stopColor="transparent"/>
                  </radialGradient>
                </defs>
                <circle cx={mapWidth * 0.3} cy={mapHeight * 0.4} r="150" fill="url(#topo1)"/>
                <circle cx={mapWidth * 0.7} cy={mapHeight * 0.6} r="200" fill="url(#topo2)"/>
                {Array.from({length: 12}, (_, i) => (
                  <circle key={i} cx={mapWidth * 0.3} cy={mapHeight * 0.4} r={50 + i * 15} 
                    fill="none" stroke={theme === 'dark' ? '#475569' : '#cbd5e1'} 
                    strokeWidth="0.5" opacity="0.3"/>
                ))}
                {Array.from({length: 10}, (_, i) => (
                  <circle key={i + 12} cx={mapWidth * 0.7} cy={mapHeight * 0.6} r={60 + i * 20} 
                    fill="none" stroke={theme === 'dark' ? '#475569' : '#cbd5e1'} 
                    strokeWidth="0.5" opacity="0.3"/>
                ))}
              </svg>
            )}
            
            {selectedBackgroundStyle === 'network' && (
              <svg width={mapWidth} height={mapHeight} className="absolute inset-0">
                <defs>
                  <pattern id="network" width="100" height="100" patternUnits="userSpaceOnUse">
                    <circle cx="50" cy="50" r="2" fill={theme === 'dark' ? '#64748b' : '#94a3b8'} opacity="0.4"/>
                    <line x1="50" y1="50" x2="100" y2="0" stroke={theme === 'dark' ? '#475569' : '#cbd5e1'} strokeWidth="0.5" opacity="0.3"/>
                    <line x1="50" y1="50" x2="0" y2="100" stroke={theme === 'dark' ? '#475569' : '#cbd5e1'} strokeWidth="0.5" opacity="0.3"/>
                    <line x1="50" y1="50" x2="100" y2="100" stroke={theme === 'dark' ? '#475569' : '#cbd5e1'} strokeWidth="0.5" opacity="0.3"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#network)" />
              </svg>
            )}
            
            {selectedBackgroundStyle === 'transit' && (
              <svg width={mapWidth} height={mapHeight} className="absolute inset-0">
                {/* Stylized metro/transit lines */}
                <g opacity="0.3">
                  <path d={`M0,${mapHeight * 0.3} Q${mapWidth * 0.5},${mapHeight * 0.1} ${mapWidth},${mapHeight * 0.3}`} 
                    fill="none" stroke="#dc2626" strokeWidth="8" strokeLinecap="round"/>
                  <path d={`M0,${mapHeight * 0.7} Q${mapWidth * 0.5},${mapHeight * 0.9} ${mapWidth},${mapHeight * 0.7}`} 
                    fill="none" stroke="#2563eb" strokeWidth="8" strokeLinecap="round"/>
                  <path d={`M${mapWidth * 0.2},0 Q${mapWidth * 0.4},${mapHeight * 0.5} ${mapWidth * 0.2},${mapHeight}`} 
                    fill="none" stroke="#059669" strokeWidth="8" strokeLinecap="round"/>
                  <path d={`M${mapWidth * 0.8},0 Q${mapWidth * 0.6},${mapHeight * 0.5} ${mapWidth * 0.8},${mapHeight}`} 
                    fill="none" stroke="#d97706" strokeWidth="8" strokeLinecap="round"/>
                </g>
                {/* Station markers */}
                <g opacity="0.2">
                  {Array.from({length: 20}, (_, i) => {
                    // Use deterministic positions based on index for consistency
                    const angle = (i / 20) * 2 * Math.PI;
                    const radius = 100 + (i % 3) * 150;
                    const x = mapWidth * 0.5 + Math.cos(angle) * radius;
                    const y = mapHeight * 0.5 + Math.sin(angle) * radius;
                    return (
                      <circle key={i} 
                        cx={x} 
                        cy={y} 
                        r="6" 
                        fill={theme === 'dark' ? '#f1f5f9' : '#334155'} 
                        stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} 
                        strokeWidth="2"/>
                    );
                  })}
                </g>
              </svg>
            )}
          </div>
        )}

        {/* Routes Layer */}
        {showRoutes && (
          <svg width={mapWidth} height={mapHeight} className="absolute inset-0" style={{ zIndex: 2 }}>
            {routes
              .filter(route => selectedRoutes.length === 0 || selectedRoutes.includes(route.id))
              .map((route, index) => renderRouteLine(route, index))}
          </svg>
        )}

        {/* Stations Layer */}
        {showStations && (
          <div className="absolute inset-0" style={{ zIndex: 3 }}>
            {(selectedRoutes.length > 0 ? routeStations : stations)
              .map((station) => (
                <div
                  key={station.id}
                  className="absolute cursor-pointer transition-all duration-200 hover:scale-110"
                  style={{
                    left: `${station.x * mapWidth}px`,
                    top: `${station.y * mapHeight}px`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onClick={() => onStationClick?.(station)}
                  onMouseEnter={() => onStationHover?.(station)}
                  onMouseLeave={() => onStationHover?.(null)}
                >
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    theme === 'dark' 
                      ? 'bg-blue-400 border-blue-300' 
                      : 'bg-blue-600 border-blue-500'
                  } shadow-lg`} />
                  
                  {/* Live feed indicator */}
                  {showLiveFeed && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg" />
                  )}
                  
                  {/* Station name label */}
                  {showStationNames && (
                    <div className={`absolute top-6 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                      theme === 'dark' 
                        ? 'bg-gray-800 text-white border border-gray-600' 
                        : 'bg-white text-gray-900 border border-gray-300'
                    } shadow-md`}>
                      {station.name}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* Buses Layer */}
        {showBuses && (
          <div className="absolute inset-0" style={{ zIndex: 4 }}>
            {buses
              .filter(bus => selectedRoutes.length === 0 || selectedRoutes.includes(bus.routeId))
              .map((bus) => {
                // Check if this bus has an emergency alert
                const hasEmergencyAlert = alerts.some(alert => 
                  alert.busId === bus.id && alert.type === 'emergency' && alert.isActive
                );
                
                const glowIntensity = getOffRouteGlowIntensity(bus);
                
                return (
                  <div
                    key={bus.id}
                    className="absolute cursor-pointer transition-all duration-200 hover:scale-110"
                    style={{
                      left: `${bus.currentX * mapWidth}px`,
                      top: `${bus.currentY * mapHeight}px`,
                      transform: 'translate(-50%, -50%)',
                      filter: bus.status === "off-route" 
                        ? `drop-shadow(0 0 ${12 * glowIntensity}px rgba(239, 68, 68, ${glowIntensity}))` 
                        : hasEmergencyAlert 
                        ? 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.8))' 
                        : 'none'
                    }}
                    onMouseEnter={() => onBusHover?.(bus)}
                    onMouseLeave={() => onBusHover?.(null)}
                    onClick={() => handleBusClick(bus)}
                  >
                    <BusIcon 
                      bus={bus} 
                      isEmergency={hasEmergencyAlert}
                      theme={theme}
                    />
                    
                    {/* Driver video feed overlay */}
                    {showLiveFeed && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                        <div className="w-16 h-12 bg-black rounded border border-white shadow-lg overflow-hidden">
                          <video 
                            src="/attached_assets/Lagos_Bus_Driver_s_Erratic_Drive_1750102993348.mp4"
                            autoPlay 
                            muted 
                            loop 
                            className="w-full h-full object-cover"
                            onLoadStart={() => console.log('Video load started')}
                            onLoadedMetadata={() => console.log('Video metadata loaded')}
                            onCanPlay={() => console.log('Video can play')}
                          />
                          <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}

        {/* Emergency Alerts Layer */}
        <div className="absolute inset-0" style={{ zIndex: 5 }}>
          {alerts
            .filter(alert => alert.type === 'emergency' && alert.isActive)
            .map((alert) => {
              const bus = buses.find(b => b.id === alert.busId);
              if (!bus) return null;
              
              return (
                <div
                  key={alert.id}
                  className="absolute animate-pulse"
                  style={{
                    left: `${bus.currentX * mapWidth}px`,
                    top: `${bus.currentY * mapHeight}px`,
                    transform: 'translate(-50%, -120%)',
                  }}
                >
                  <div className="bg-red-600 text-white px-3 py-1 rounded-lg shadow-lg text-sm font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    EMERGENCY
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

        {/* Geofencing Alert */}
        {geofencingAlert && (
          <div className="absolute top-4 right-4 bg-orange-500 text-white p-4 rounded-lg shadow-lg border-l-4 border-orange-600 max-w-sm z-50">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Geofencing Alert</h4>
                  <p className="text-sm mt-1">
                    Bus {geofencingAlert.busNumber} has left its designated route
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setShowReturnDialog(true)}
                      className="text-xs"
                    >
                      Return to Route
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setDismissedAlerts(prev => new Set([...prev, geofencingAlert.busId]));
                        setGeofencingAlert(null);
                      }}
                      className="text-xs"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setGeofencingAlert(null)}
                className="p-1 h-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}