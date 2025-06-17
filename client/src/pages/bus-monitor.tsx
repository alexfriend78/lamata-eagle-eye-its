import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useBusData } from "@/hooks/use-bus-data";
import { useTheme } from "@/hooks/use-theme";
import MapContainer from "@/components/map-container";
import ControlPanel from "@/components/control-panel";
import EmergencyAlert from "@/components/emergency-alert";
import EmergencyAlertSystem from "@/components/emergency-alert-system";
import StationDetailsPanel from "@/components/station-details-panel";
import RouteCustomizationPanel from "@/components/route-customization-panel";
import RouteAestheticsPanel from "@/components/route-aesthetics-panel";
import CrowdAnalyticsPanel from "@/components/crowd-analytics-panel";
import AlertsManager from "@/components/alerts-manager";
import AIInsightsPanel from "@/components/ai-insights-panel";
import RouteOptimizer from "@/components/route-optimizer";
import PredictiveMaintenance from "@/components/predictive-maintenance";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Settings, Eye, Map, MapPin, Video, Type, Palette, Route, Bus, AlertTriangle, Brain, Navigation, Wrench } from "lucide-react";
import type { Station, StationDetails } from "@shared/schema";

export default function BusMonitor() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedRoutes, setSelectedRoutes] = useState<number[]>([1, 2, 3, 4, 5]); // Show all 5 routes by default
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showStationNames, setShowStationNames] = useState(true);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [hoveredStation, setHoveredStation] = useState<Station | null>(null);
  const [hoveredBus, setHoveredBus] = useState<any | null>(null);
  const [showLiveFeed, setShowLiveFeed] = useState(false);
  const [showRouteCustomization, setShowRouteCustomization] = useState(false);
  const [activeAlert, setActiveAlert] = useState<any | null>(null);
  const [showAlertsManager, setShowAlertsManager] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [showRouteOptimizer, setShowRouteOptimizer] = useState(false);
  const [showPredictiveMaintenance, setShowPredictiveMaintenance] = useState(false);

  // Handle AI Insights close event
  useEffect(() => {
    const handleCloseAIInsights = () => setShowAIInsights(false);
    window.addEventListener('closeAIInsights', handleCloseAIInsights);
    return () => window.removeEventListener('closeAIInsights', handleCloseAIInsights);
  }, []);
  
  // Visibility controls for routes, bus stops, and buses
  const [showRoutes, setShowRoutes] = useState(true);
  const [showStations, setShowStations] = useState(true);
  const [showBuses, setShowBuses] = useState(true);
  const [showBackgroundMap, setShowBackgroundMap] = useState(false);
  const { buses, routes, stations, alerts, stats, refetch } = useBusData();
  const { theme, setTheme } = useTheme();

  // Fetch station details when a station is hovered or selected
  const activeStation = hoveredStation || selectedStation;
  const { data: stationDetails } = useQuery<StationDetails>({
    queryKey: [`/api/stations/${activeStation?.id}`],
    enabled: !!activeStation?.id,
  });
  
  // Debug logging for station selection
  useEffect(() => {
    if (activeStation) {
      console.log('🔍 Active station changed:', { id: activeStation.id, name: activeStation.name });
      console.log('📡 Station details received:', stationDetails);
    }
  }, [activeStation, stationDetails]);

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

  const criticalAlert = alerts?.find(alert => alert.severity === "critical" && alert.isActive);
  
  // Find the most recent active alert with highest priority
  const priorityOrder: Record<string, number> = { P1: 1, P2: 2, P3: 3, P4: 4, P5: 5 };
  const highestPriorityAlert = alerts?.filter(alert => alert.isActive)
    .sort((a, b) => (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5))[0] || null;

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

  const handleStationHover = (station: Station | null) => {
    setHoveredStation(station);
  };

  const handleBusHover = (bus: any | null) => {
    setHoveredBus(bus);
  };

  const handleCloseStationDetails = () => {
    setSelectedStation(null);
    setHoveredStation(null);
    setHoveredBus(null);
  };

  const handleSimulateEmergency = async () => {
    // Create a high-priority emergency alert in the database
    if (routes && routes.length > 0) {
      const randomRoute = routes[Math.floor(Math.random() * routes.length)];
      
      try {
        const response = await fetch('/api/alerts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            routeId: randomRoute.id,
            type: "emergency",
            message: "EMERGENCY: Medical assistance required - Bus stopped",
            severity: "critical",
            priority: "P1"
          }),
        });
        
        if (response.ok) {
          // Refresh alerts data
          refetch();
          console.log('Emergency alert created successfully');
        } else {
          console.error('Failed to create emergency alert');
        }
      } catch (error) {
        console.error('Error creating emergency alert:', error);
      }
    }
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
      <header className={`bg-gradient-to-r from-green-600 via-white to-green-600 dark:from-green-800 dark:via-gray-900 dark:to-green-800 border-b border-green-200 dark:border-green-700 px-6 py-3 shadow-lg`}>
        <div className="flex flex-col space-y-3">
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

          <div className="flex items-center justify-between">
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



            {/* Visibility Controls */}
            <div className="flex items-center space-x-1 border-l border-gray-300 dark:border-gray-600 pl-4 ml-4">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mr-2">Show:</span>
              
              {/* Routes Toggle */}
              <Button
                onClick={() => setShowRoutes(!showRoutes)}
                variant={showRoutes ? "default" : "outline"}
                size="sm"
                className="h-8 px-2 text-xs"
                title="Toggle routes visibility"
              >
                Routes
              </Button>

              {/* Bus Stops Toggle */}
              <Button
                onClick={() => setShowStations(!showStations)}
                variant={showStations ? "default" : "outline"}
                size="sm"
                className="h-8 px-2 text-xs"
                title="Toggle bus stops visibility"
              >
                Stops
              </Button>

              {/* Buses Toggle */}
              <Button
                onClick={() => setShowBuses(!showBuses)}
                variant={showBuses ? "default" : "outline"}
                size="sm"
                className="h-8 px-2 text-xs"
                title="Toggle buses visibility"
              >
                Buses
              </Button>

              {/* Background Map Toggle */}
              <Button
                onClick={() => setShowBackgroundMap(!showBackgroundMap)}
                variant={showBackgroundMap ? "default" : "outline"}
                size="sm"
                className="h-8 px-2 text-xs"
                title="Toggle background map"
              >
                Map
              </Button>
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



            {/* Theme Toggle */}
            <Button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Route Aesthetics */}
            <RouteAestheticsPanel 
              routes={routes || []}
              theme={theme}
            />



            {/* AI Insights */}
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

            {/* Settings */}
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
            onStationHover={handleStationHover}
            onBusHover={handleBusHover}
            showLiveFeed={showLiveFeed}
            showRoutes={showRoutes}
            showStations={showStations}
            showBuses={showBuses}
            showBackgroundMap={showBackgroundMap}
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
              onSimulateEmergency={handleSimulateEmergency}
              theme={theme}
            />
          </div>
        )}

        {/* Station Details Panel */}
        <StationDetailsPanel
          stationDetails={stationDetails || null}
          isOpen={!!activeStation}
          onClose={handleCloseStationDetails}
        />

        {/* Bus Details Panel */}
        {hoveredBus && (
          <div className={`fixed right-4 top-24 w-80 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} border rounded-lg shadow-lg p-4 z-50`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Bus Details</h3>
              <button
                onClick={() => setHoveredBus(null)}
                className={`text-gray-500 hover:text-gray-700 ${theme === 'dark' ? 'hover:text-gray-300' : ''}`}
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🚌</span>
                <div>
                  <div className="font-medium">{hoveredBus.busNumber}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{hoveredBus.route?.name}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium">Status:</span>
                  <div className={`inline-block ml-2 px-2 py-1 rounded text-xs ${
                    hoveredBus.status === 'on_time' || hoveredBus.status === 'active' || hoveredBus.status === 'alert' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    hoveredBus.status === 'delayed' 
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {hoveredBus.status === 'alert' ? 'ACTIVE (WITH ALERTS)' : 
                     hoveredBus.status === 'active' ? 'ACTIVE' :
                     hoveredBus.status.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
                
                <div>
                  <span className="font-medium">Direction:</span>
                  <span className="ml-2 capitalize">{hoveredBus.direction}</span>
                </div>
                
                <div>
                  <span className="font-medium">Route:</span>
                  <span className="ml-2">{hoveredBus.route?.routeNumber}</span>
                </div>
                
                <div>
                  <span className="font-medium">Position:</span>
                  <span className="ml-2 text-xs">({hoveredBus.currentX}, {hoveredBus.currentY})</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Last updated: {formatTime(new Date(hoveredBus.lastUpdated))}
              </div>
            </div>
          </div>
        )}

      {/* Route Customization Panel */}
      <RouteCustomizationPanel
        routes={routes || []}
        isOpen={showRouteCustomization}
        onClose={() => setShowRouteCustomization(false)}
        theme={theme}
      />

      {/* Emergency Alert System */}
      <EmergencyAlertSystem
        buses={buses || []}
        stations={stations || []}
        activeAlert={highestPriorityAlert || null}
        onAlertDismiss={() => setActiveAlert(null)}
        onAlertCreate={(alert) => setActiveAlert(alert)}
      />

      {/* Alerts Manager */}
      {showAlertsManager && (
        <AlertsManager onClose={() => setShowAlertsManager(false)} />
      )}

      {/* Route Optimizer */}
      {showRouteOptimizer && (
        <RouteOptimizer
          routes={routes || []}
          stations={stations || []}
          buses={buses || []}
          theme={theme}
          onClose={() => setShowRouteOptimizer(false)}
        />
      )}

      {/* Predictive Maintenance */}
      {showPredictiveMaintenance && (
        <PredictiveMaintenance
          buses={buses || []}
          theme={theme}
          onClose={() => setShowPredictiveMaintenance(false)}
        />
      )}

      {/* AI Insights Panel */}
      {showAIInsights && (
        <AIInsightsPanel
          buses={buses || []}
          stations={stations || []}
          alerts={alerts || []}
          stats={stats || { totalBuses: 0, activeRoutes: 0, onTimePercentage: 0, onTimeBuses: 0, delayedBuses: 0, alertBuses: 0, avgCrowdDensity: 0, peakStations: 0 }}
          routes={routes || []}
          theme={theme}
          onClose={() => setShowAIInsights(false)}
        />
      )}
      </div>
    </div>
  );
}
