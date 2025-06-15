import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useBusData } from "@/hooks/use-bus-data";
import { useTheme } from "@/hooks/use-theme";
import MapContainer from "@/components/map-container";
import ControlPanel from "@/components/control-panel";
import EmergencyAlert from "@/components/emergency-alert";
import StationDetailsPanel from "@/components/station-details-panel";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Settings, Eye, Map, MapPin, Video, Type } from "lucide-react";
import type { Station, StationDetails } from "@shared/schema";

export default function BusMonitor() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedRoutes, setSelectedRoutes] = useState<number[]>([]);
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showStationNames, setShowStationNames] = useState(true);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [showLiveFeed, setShowLiveFeed] = useState(false);
  const { buses, routes, stations, alerts, stats, refetch } = useBusData();
  const { theme, setTheme } = useTheme();

  // Fetch station details when a station is selected
  const { data: stationDetails } = useQuery({
    queryKey: ['/api/stations', selectedStation?.id],
    enabled: !!selectedStation?.id,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);

    return () => clearInterval(interval);
  }, [refetch]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const criticalAlert = alerts?.find(alert => alert.severity === "critical");

  const toggleRouteHighlight = (routeId: number) => {
    setSelectedRoutes(prev => 
      prev.includes(routeId) 
        ? prev.filter(id => id !== routeId)
        : [...prev, routeId]
    );
  };

  const handleStationClick = (station: Station) => {
    setSelectedStation(station);
  };

  const handleCloseStationDetails = () => {
    setSelectedStation(null);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {criticalAlert && (
        <EmergencyAlert 
          alert={criticalAlert}
          onAcknowledge={() => refetch()}
        />
      )}
      
      {/* Full Screen Header */}
      <header className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'} border-b px-6 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-2xl">🚌</div>
            <h1 className="text-xl font-semibold">LAMATA - Eagle Eye ITS</h1>
            <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Route Selection */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Highlight Routes:</span>
              <div className="flex space-x-1 flex-wrap">
                {routes?.map((route) => (
                  <Button
                    key={route.id}
                    onClick={() => toggleRouteHighlight(route.id)}
                    variant={selectedRoutes.includes(route.id) ? "default" : "outline"}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    style={selectedRoutes.includes(route.id) ? { backgroundColor: route.color } : {}}
                  >
                    {route.routeNumber}
                  </Button>
                ))}
              </div>
            </div>

            {/* Station Names Toggle */}
            <Button
              onClick={() => setShowStationNames(!showStationNames)}
              variant={showStationNames ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0"
              title="Toggle station names"
            >
              <Type className="h-4 w-4" />
            </Button>

            {/* Map Toggle */}
            <Button
              onClick={() => setShowMap(!showMap)}
              variant={showMap ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0"
              title="Toggle background map"
            >
              <Map className="h-4 w-4" />
            </Button>

            {/* Live Feed Toggle */}
            <Button
              onClick={() => setShowLiveFeed(!showLiveFeed)}
              variant={showLiveFeed ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0"
              title="Toggle live feed"
            >
              <Video className="h-4 w-4" />
            </Button>

            {/* Theme Toggle */}
            <Button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Settings */}
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Settings className="h-4 w-4" />
            </Button>

            {/* System Status */}
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">System Online</span>
            </div>
            
            <div className="text-sm text-gray-400">
              {formatTime(currentTime)}
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Full Screen Map Area */}
        <div className="flex-1 relative overflow-hidden">
          <MapContainer 
            buses={buses || []}
            routes={routes || []}
            stations={stations || []}
            selectedRoutes={selectedRoutes}
            theme={theme}
            selectedZone={selectedZone}
            onZoneSelect={setSelectedZone}
            showMap={showMap}
            showStationNames={showStationNames}
            onStationClick={handleStationClick}
            showLiveFeed={showLiveFeed}
          />
        </div>

        {/* Collapsible Control Panel */}
        {showSettings && (
          <div className={`w-80 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'} border-l p-4 overflow-y-auto`}>
            <ControlPanel 
              stats={stats}
              alerts={alerts || []}
              routes={routes || []}
              onRefresh={refetch}
              theme={theme}
            />
          </div>
        )}

        {/* Station Details Panel */}
        <StationDetailsPanel
          stationDetails={stationDetails}
          isOpen={!!selectedStation}
          onClose={handleCloseStationDetails}
        />
      </div>
    </div>
  );
}
