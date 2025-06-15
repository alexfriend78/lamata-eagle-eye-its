import { useState, useEffect } from "react";
import { useBusData } from "@/hooks/use-bus-data";
import { useTheme } from "@/hooks/use-theme";
import MapContainer from "@/components/map-container";
import ControlPanel from "@/components/control-panel";
import EmergencyAlert from "@/components/emergency-alert";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Settings, Eye, Map, MapPin, Video, Type } from "lucide-react";

export default function BusMonitor() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedRoutes, setSelectedRoutes] = useState<number[]>([]);
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showStationNames, setShowStationNames] = useState(true);
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [showLiveFeed, setShowLiveFeed] = useState(false);
  const { buses, routes, stations, alerts, stats, refetch } = useBusData();
  const { theme, setTheme } = useTheme();

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
            onStationClick={setSelectedStation}
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

        {/* Station Details Modal */}
        {selectedStation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg p-6 max-w-md w-full mx-4 shadow-xl`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                  {selectedStation.name}
                </h3>
                <Button
                  onClick={() => setSelectedStation(null)}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                {/* Passenger Crowd */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Passenger Crowd</h4>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${Math.random() > 0.7 ? 'bg-red-500' : Math.random() > 0.4 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                    <span className="text-sm">
                      {Math.random() > 0.7 ? 'High' : Math.random() > 0.4 ? 'Medium' : 'Low'} crowd level
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.floor(Math.random() * 50 + 10)} people waiting
                  </div>
                </div>

                {/* Next Arrivals */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Next Arrivals</h4>
                  <div className="space-y-1">
                    {[1, 2, 3].map((_, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>Route {Math.floor(Math.random() * 9 + 1)}</span>
                        <span className={i === 0 ? 'text-green-500' : 'text-gray-500'}>
                          {i === 0 ? '2 min' : `${(i + 1) * 5 + Math.floor(Math.random() * 3)} min`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Traffic Conditions */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Traffic Conditions</h4>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${Math.random() > 0.6 ? 'bg-red-500' : Math.random() > 0.3 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                    <span className="text-sm">
                      {Math.random() > 0.6 ? 'Heavy traffic' : Math.random() > 0.3 ? 'Moderate traffic' : 'Light traffic'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Average delay: {Math.floor(Math.random() * 8 + 1)} minutes
                  </div>
                </div>

                {/* Live Feed Option */}
                {showLiveFeed && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Live Feed</h4>
                    <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded p-4 text-center`}>
                      <Video className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                      <div className="text-xs text-gray-500">
                        Live camera feed would appear here
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
