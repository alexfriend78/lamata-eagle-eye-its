import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TrendingUp, Users, Activity, Clock, MapPin, Thermometer, BarChart3 } from "lucide-react";
import type { Station, Route } from "@shared/schema";

interface CrowdDensityData {
  stationId: number;
  currentDensity: number; // 0-1 scale
  predictedDensity: number; // 0-1 scale for next hour
  hourlyPattern: number[]; // 24 hours of density data
  peakTimes: { hour: number; density: number }[];
  trends: {
    direction: "increasing" | "decreasing" | "stable";
    confidence: number;
  };
}

interface HeatmapProps {
  stations: Station[];
  routes: Route[];
  theme: "light" | "dark";
  mapWidth: number;
  mapHeight: number;
  isVisible: boolean;
  onToggle: () => void;
}

const timeSlots = [
  { value: "current", label: "Current", description: "Real-time density" },
  { value: "1hour", label: "+1 Hour", description: "Next hour prediction" },
  { value: "2hour", label: "+2 Hours", description: "2 hours ahead" },
  { value: "peak", label: "Peak Times", description: "Historical peak periods" },
  { value: "off-peak", label: "Off-Peak", description: "Low density periods" }
];

const densityLevels = [
  { min: 0, max: 0.2, color: "#22c55e", label: "Low", description: "Comfortable spacing" },
  { min: 0.2, max: 0.4, color: "#84cc16", label: "Light", description: "Some crowding" },
  { min: 0.4, max: 0.6, color: "#eab308", label: "Moderate", description: "Busy but manageable" },
  { min: 0.6, max: 0.8, color: "#f97316", label: "High", description: "Crowded conditions" },
  { min: 0.8, max: 1.0, color: "#ef4444", label: "Critical", description: "Severe overcrowding" }
];

// Mock predictive algorithm based on historical patterns
const generateCrowdDensityData = (stationId: number): CrowdDensityData => {
  const currentHour = new Date().getHours();
  
  // Generate realistic hourly patterns based on typical transit usage
  const hourlyPattern = Array.from({ length: 24 }, (_, hour) => {
    // Morning rush (7-9 AM)
    if (hour >= 7 && hour <= 9) return 0.7 + Math.random() * 0.3;
    // Evening rush (17-19 PM)
    if (hour >= 17 && hour <= 19) return 0.6 + Math.random() * 0.4;
    // Lunch time (12-14 PM)
    if (hour >= 12 && hour <= 14) return 0.4 + Math.random() * 0.3;
    // Late night (22-5 AM)
    if (hour >= 22 || hour <= 5) return 0.1 + Math.random() * 0.2;
    // Regular hours
    return 0.3 + Math.random() * 0.4;
  });

  const currentDensity = hourlyPattern[currentHour];
  const nextHourDensity = hourlyPattern[(currentHour + 1) % 24];
  
  // Find peak times
  const peakTimes = hourlyPattern
    .map((density, hour) => ({ hour, density }))
    .filter(({ density }) => density > 0.6)
    .sort((a, b) => b.density - a.density)
    .slice(0, 3);

  // Calculate trend
  const recentTrend = hourlyPattern.slice(Math.max(0, currentHour - 2), currentHour + 1);
  const avgRecent = recentTrend.reduce((sum, val) => sum + val, 0) / recentTrend.length;
  const direction = nextHourDensity > avgRecent ? "increasing" : 
                   nextHourDensity < avgRecent ? "decreasing" : "stable";

  return {
    stationId,
    currentDensity,
    predictedDensity: nextHourDensity,
    hourlyPattern,
    peakTimes,
    trends: {
      direction,
      confidence: 0.75 + Math.random() * 0.2
    }
  };
};

export default function CrowdDensityHeatmap({ 
  stations, 
  routes, 
  theme, 
  mapWidth, 
  mapHeight, 
  isVisible, 
  onToggle 
}: HeatmapProps) {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("current");
  const [intensityMultiplier, setIntensityMultiplier] = useState(1.0);
  const [showPredictions, setShowPredictions] = useState(true);
  const [showTrends, setShowTrends] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  // Generate crowd density data for all stations
  const crowdData = useMemo(() => {
    return stations.map(station => generateCrowdDensityData(station.id));
  }, [stations]);

  const getDensityColor = (density: number, opacity = 0.7) => {
    const level = densityLevels.find(l => density >= l.min && density <= l.max);
    if (!level) return `rgba(34, 197, 94, ${opacity})`;
    
    const hex = level.color;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${opacity * intensityMultiplier})`;
  };

  const getDisplayDensity = (data: CrowdDensityData) => {
    switch (selectedTimeSlot) {
      case "current": return data.currentDensity;
      case "1hour": return data.predictedDensity;
      case "2hour": return Math.min(1, data.predictedDensity * 1.1);
      case "peak": return Math.max(...data.hourlyPattern);
      case "off-peak": return Math.min(...data.hourlyPattern);
      default: return data.currentDensity;
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case "increasing": return <TrendingUp className="h-3 w-3 text-red-500" />;
      case "decreasing": return <TrendingUp className="h-3 w-3 text-green-500 rotate-180" />;
      default: return <Activity className="h-3 w-3 text-blue-500" />;
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Heatmap Overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 15 }}>
        {crowdData.map((data) => {
          const station = stations.find(s => s.id === data.stationId);
          if (!station) return null;

          const density = getDisplayDensity(data);
          const stationX = station.x * mapWidth;
          const stationY = station.y * mapHeight;
          const radius = Math.max(20, density * 60);

          return (
            <div key={`heatmap-${station.id}`}>
              {/* Heat Circle */}
              <div
                className="absolute rounded-full"
                style={{
                  left: `${stationX - radius}px`,
                  top: `${stationY - radius}px`,
                  width: `${radius * 2}px`,
                  height: `${radius * 2}px`,
                  backgroundColor: getDensityColor(density, 0.4),
                  border: `2px solid ${getDensityColor(density, 0.8)}`,
                  boxShadow: `0 0 ${radius}px ${getDensityColor(density, 0.3)}`,
                  transition: 'all 0.3s ease-in-out',
                  cursor: 'pointer',
                  pointerEvents: 'auto'
                }}
                onClick={() => setSelectedStation(station)}
              />

              {/* Prediction Indicator */}
              {showPredictions && selectedTimeSlot !== "current" && (
                <div
                  className="absolute rounded-full border-2 border-dashed"
                  style={{
                    left: `${stationX - radius * 0.7}px`,
                    top: `${stationY - radius * 0.7}px`,
                    width: `${radius * 1.4}px`,
                    height: `${radius * 1.4}px`,
                    borderColor: getDensityColor(data.predictedDensity, 0.6),
                    animation: 'pulse 2s infinite'
                  }}
                />
              )}

              {/* Trend Arrow */}
              {showTrends && (
                <div
                  className="absolute flex items-center justify-center"
                  style={{
                    left: `${stationX - 8}px`,
                    top: `${stationY - radius - 20}px`,
                    width: '16px',
                    height: '16px',
                  }}
                >
                  {getTrendIcon(data.trends.direction)}
                </div>
              )}

              {/* Density Label */}
              <div
                className={`absolute text-xs font-bold pointer-events-none ${
                  density > 0.5 ? 'text-white' : theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}
                style={{
                  left: `${stationX - 12}px`,
                  top: `${stationY - 6}px`,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
                }}
              >
                {Math.round(density * 100)}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Control Panel */}
      <div className={`absolute top-4 right-4 p-4 rounded-lg shadow-lg ${
        theme === 'dark' ? 'bg-gray-800 border border-gray-600' : 'bg-white border border-gray-200'
      }`} style={{ zIndex: 50 }}>
        <div className="flex items-center gap-3 mb-4">
          <Thermometer className="h-5 w-5" />
          <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Crowd Density Heatmap
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Open analytics panel - this will be handled by parent component
              const event = new CustomEvent('showCrowdAnalytics');
              window.dispatchEvent(event);
            }}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggle}
          >
            Hide
          </Button>
        </div>

        {/* Time Slot Selection */}
        <div className="space-y-3">
          <Label className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            Time Period
          </Label>
          <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
            <SelectTrigger className={`${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-300'}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map(slot => (
                <SelectItem key={slot.value} value={slot.value}>
                  <div>
                    <div className="font-medium">{slot.label}</div>
                    <div className="text-xs text-gray-500">{slot.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Intensity Control */}
          <div>
            <Label className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              Intensity: {Math.round(intensityMultiplier * 100)}%
            </Label>
            <Slider
              value={[intensityMultiplier]}
              onValueChange={(value) => setIntensityMultiplier(value[0])}
              min={0.3}
              max={2.0}
              step={0.1}
              className="mt-2"
            />
          </div>

          {/* Toggle Options */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                Show Predictions
              </Label>
              <Switch
                checked={showPredictions}
                onCheckedChange={setShowPredictions}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                Show Trends
              </Label>
              <Switch
                checked={showTrends}
                onCheckedChange={setShowTrends}
              />
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="text-xs font-medium mb-2">Density Levels</div>
            <div className="space-y-1">
              {densityLevels.map(level => (
                <div key={level.label} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: level.color }}
                  />
                  <span className="text-xs">{level.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Station Details Modal */}
      {selectedStation && (
        <Dialog open={!!selectedStation} onOpenChange={() => setSelectedStation(null)}>
          <DialogContent className={`max-w-md ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white'}`}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {selectedStation.name}
              </DialogTitle>
              <DialogDescription>
                View detailed crowd density analytics and predictions for this station
              </DialogDescription>
            </DialogHeader>

            {(() => {
              const data = crowdData.find(d => d.stationId === selectedStation.id);
              if (!data) return null;

              return (
                <div className="space-y-4">
                  {/* Current Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(data.currentDensity * 100)}%
                      </div>
                      <div className="text-xs text-blue-600">Current Density</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round(data.predictedDensity * 100)}%
                      </div>
                      <div className="text-xs text-purple-600">Next Hour</div>
                    </div>
                  </div>

                  {/* Trend Information */}
                  <div className={`p-3 rounded border-l-4 ${
                    data.trends.direction === 'increasing' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                    data.trends.direction === 'decreasing' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                    'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  }`}>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(data.trends.direction)}
                      <span className="font-medium capitalize">{data.trends.direction} Trend</span>
                      <Badge variant="secondary">
                        {Math.round(data.trends.confidence * 100)}% confidence
                      </Badge>
                    </div>
                  </div>

                  {/* Peak Times */}
                  <div>
                    <div className="font-medium mb-2">Peak Hours Today</div>
                    <div className="space-y-1">
                      {data.peakTimes.map(({ hour, density }, index) => (
                        <div key={hour} className="flex justify-between text-sm">
                          <span>{String(hour).padStart(2, '0')}:00</span>
                          <span className="font-medium">{Math.round(density * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                    <div className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                      Recommendation
                    </div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">
                      {data.currentDensity > 0.7 ? 
                        "Consider alternative routes or wait for less crowded times." :
                        data.predictedDensity > 0.7 ?
                        "Crowds expected to increase. Plan accordingly." :
                        "Good time to travel with comfortable spacing."}
                    </div>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}