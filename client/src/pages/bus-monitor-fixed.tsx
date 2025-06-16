import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import MapContainer from "@/components/map-container";
import BusDetailsPanel from "@/components/bus-details-panel";
import AlertsManager from "@/components/alerts-manager";
import AIInsightsPanel from "@/components/ai-insights-panel";
import RouteAestheticsPanel from "@/components/route-aesthetics-panel";
import { 
  Brain, 
  Settings, 
  AlertTriangle, 
  Sun, 
  Moon, 
  Type, 
  Map 
} from "lucide-react";
import type { Route, Station, Bus, Alert } from "@shared/schema";

export default function BusMonitor() {
  const [selectedBus, setSelectedBus] = useState<number | null>(null);
  const [selectedRoutes, setSelectedRoutes] = useState<number[]>([]);
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [showAlertsManager, setShowAlertsManager] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showStations, setShowStations] = useState(true);
  const [showBuses, setShowBuses] = useState(true);
  const [showStationNames, setShowStationNames] = useState(true);
  const [showMap, setShowMap] = useState(true);
  const [showBackgroundMap, setShowBackgroundMap] = useState(true);
  const [selectedBackgroundStyle, setSelectedBackgroundStyle] = useState("grid");
  const [backgroundMapOpacity, setBackgroundMapOpacity] = useState(0.3);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Queries
  const { data: routes } = useQuery<Route[]>({
    queryKey: ["/api/routes"],
  });

  const { data: stations } = useQuery<Station[]>({
    queryKey: ["/api/stations"],
  });

  const { data: buses } = useQuery<Bus[]>({
    queryKey: ["/api/buses"],
  });

  const { data: alerts } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString();
  };

  const handleStationClick = (station: Station) => {
    console.log("Station clicked:", station);
  };

  const handleBusClick = (bus: Bus) => {
    setSelectedBus(bus.id);
  };

  const toggleRouteHighlight = (routeId: number) => {
    setSelectedRoutes(prev =>
      prev.includes(routeId)
        ? prev.filter(id => id !== routeId)
        : [...prev, routeId]
    );
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "dark" : ""} bg-gray-50 dark:bg-gray-900`}>
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 via-white to-green-600 dark:from-green-800 dark:via-gray-900 dark:to-green-800 border-b border-green-200 dark:border-green-700 px-6 py-3 shadow-lg">
        <div className="flex flex-col space-y-3">
          {/* Title Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-2xl animate-pulse">🚌</div>
              <div>
                <h1 className="text-2xl font-bold text-green-900 dark:text-green-100 drop-shadow-lg">
                  LAMATA - Eagle Eye ITS 🦅
                </h1>
                <p className="text-xs font-medium text-green-800 dark:text-green-200">
                  Lagos Metropolitan Area Transport Authority
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Alerts Button */}
              <Button
                onClick={() => setShowAlertsManager(true)}
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs relative"
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Alerts
                {alerts && alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {alerts.length}
                  </span>
                )}
              </Button>

              {/* System Status */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900 px-3 py-1 rounded-lg border border-green-300 dark:border-green-700">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-green-800 dark:text-green-200">System Online</span>
                </div>
                
                <div className="text-sm font-semibold text-green-700 dark:text-green-300 bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded shadow-sm">
                  {formatTime(currentTime)}
                </div>
              </div>
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between flex-wrap gap-4">
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

            <div className="flex items-center space-x-4">
              {/* Visibility Controls */}
              <div className="flex items-center space-x-1">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mr-2">Show:</span>
                
                <Button
                  onClick={() => setShowRoutes(!showRoutes)}
                  variant={showRoutes ? "default" : "outline"}
                  size="sm"
                  className="h-8 px-2 text-xs"
                >
                  Routes
                </Button>

                <Button
                  onClick={() => setShowStations(!showStations)}
                  variant={showStations ? "default" : "outline"}
                  size="sm"
                  className="h-8 px-2 text-xs"
                >
                  Stops
                </Button>

                <Button
                  onClick={() => setShowBuses(!showBuses)}
                  variant={showBuses ? "default" : "outline"}
                  size="sm"
                  className="h-8 px-2 text-xs"
                >
                  Buses
                </Button>

                <Button
                  onClick={() => setShowBackgroundMap(!showBackgroundMap)}
                  variant={showBackgroundMap ? "default" : "outline"}
                  size="sm"
                  className="h-8 px-2 text-xs"
                >
                  Map
                </Button>
              </div>

              {/* Background Controls */}
              {showBackgroundMap && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Style:</span>
                    <select
                      value={selectedBackgroundStyle}
                      onChange={(e) => setSelectedBackgroundStyle(e.target.value)}
                      className="h-6 px-2 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="grid">Grid</option>
                      <option value="minimal">Minimal</option>
                      <option value="topographic">Topographic</option>
                      <option value="network">Network</option>
                      <option value="transit">Transit</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Opacity:</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={backgroundMapOpacity}
                      onChange={(e) => setBackgroundMapOpacity(parseFloat(e.target.value))}
                      className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-8">
                      {Math.round(backgroundMapOpacity * 100)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Control Buttons */}
              <div className="flex items-center space-x-1">
                <Button
                  onClick={() => setShowStationNames(!showStationNames)}
                  variant={showStationNames ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="Toggle station names"
                >
                  <Type className="h-4 w-4" />
                </Button>

                <Button
                  onClick={() => setShowMap(!showMap)}
                  variant={showMap ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="Toggle background map"
                >
                  <Map className="h-4 w-4" />
                </Button>

                <Button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>

                <RouteAestheticsPanel 
                  routes={routes || []}
                  theme={theme}
                />

                <Button
                  onClick={() => setShowAIInsights(!showAIInsights)}
                  variant={showAIInsights ? "default" : "outline"}
                  size="sm"
                  className="h-8 px-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white border-0"
                  title="AI Fleet Intelligence"
                >
                  <Brain className="h-4 w-4 mr-1" />
                  AI Insights
                </Button>

                <Button
                  onClick={() => setShowSettings(!showSettings)}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>

              {/* Zone Selection */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Zones:</span>
                <div className="flex space-x-1 flex-wrap">
                  {Array.from({ length: 16 }, (_, i) => i + 1).map((zone) => (
                    <Button
                      key={zone}
                      onClick={() => setSelectedZone(selectedZone === zone ? null : zone)}
                      variant={selectedZone === zone ? "default" : "outline"}
                      size="sm"
                      className="h-7 px-2 text-xs"
                    >
                      Z{zone}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Map Area */}
        <div className="flex-1 relative overflow-hidden">
          <MapContainer 
            buses={buses || []}
            routes={routes || []}
            stations={stations || []}
            selectedRoutes={selectedRoutes}
            selectedZone={selectedZone}
            showRoutes={showRoutes}
            showStations={showStations}
            showBuses={showBuses}
            showStationNames={showStationNames}
            showMap={showMap}
            showBackgroundMap={showBackgroundMap}
            selectedBackgroundStyle={selectedBackgroundStyle}
            backgroundMapOpacity={backgroundMapOpacity}
            theme={theme}
            onStationClick={handleStationClick}
            onBusClick={handleBusClick}
          />
        </div>

        {/* Side Panel */}
        {selectedBus && (
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <BusDetailsPanel
              busId={selectedBus}
              onClose={() => setSelectedBus(null)}
            />
          </div>
        )}
      </div>

      {/* Overlays */}
      {showAlertsManager && (
        <AlertsManager
          onClose={() => setShowAlertsManager(false)}
        />
      )}

      {showAIInsights && (
        <AIInsightsPanel
          onClose={() => setShowAIInsights(false)}
        />
      )}
    </div>
  );
}