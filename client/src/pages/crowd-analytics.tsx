import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Activity,
  BarChart3,
  Thermometer,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { type Station, type Route, type CrowdDensityReading, type CrowdPrediction } from "@shared/schema";

interface CrowdAnalyticsData {
  stations: Station[];
  routes: Route[];
  densityReadings: CrowdDensityReading[];
  predictions: CrowdPrediction[];
  analytics: {
    avgCrowdDensity: number;
    peakStations: Array<{ stationId: number; density: number }>;
    crowdTrends: Array<{ hour: number; density: number }>;
  };
}

type TimeFilter = "1h" | "6h" | "24h" | "7d";
type DensityLevel = "low" | "medium" | "high" | "critical";

export default function CrowdAnalytics() {
  const [selectedRoute, setSelectedRoute] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("24h");
  const [heatmapData, setHeatmapData] = useState<Map<number, DensityLevel>>(new Map());

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/crowd-analytics', selectedRoute, timeFilter],
    queryFn: async () => {
      const response = await fetch(`/api/crowd-analytics?route=${selectedRoute}&period=${timeFilter}`);
      return response.json() as Promise<CrowdAnalyticsData>;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Generate real-time crowd density heatmap
  useEffect(() => {
    if (analytics?.densityReadings) {
      const densityMap = new Map<number, DensityLevel>();
      
      analytics.densityReadings.forEach(reading => {
        const level = getDensityLevel(reading.passengerCount, reading.capacity || 70);
        densityMap.set(reading.stationId || 0, level);
      });
      
      setHeatmapData(densityMap);
    }
  }, [analytics]);

  const getDensityLevel = (count: number, capacity: number): DensityLevel => {
    const ratio = count / capacity;
    if (ratio < 0.3) return "low";
    if (ratio < 0.6) return "medium";
    if (ratio < 0.85) return "high";
    return "critical";
  };

  const getDensityColor = (level: DensityLevel): string => {
    switch (level) {
      case "low": return "bg-green-100 border-green-300";
      case "medium": return "bg-yellow-100 border-yellow-300";
      case "high": return "bg-orange-100 border-orange-300";
      case "critical": return "bg-red-100 border-red-300";
    }
  };

  const getDensityBadgeColor = (level: DensityLevel): string => {
    switch (level) {
      case "low": return "bg-green-600";
      case "medium": return "bg-yellow-600";
      case "high": return "bg-orange-600";
      case "critical": return "bg-red-600";
    }
  };

  const formatTimeFilter = (filter: TimeFilter): string => {
    switch (filter) {
      case "1h": return "Last Hour";
      case "6h": return "Last 6 Hours";
      case "24h": return "Last 24 Hours";
      case "7d": return "Last 7 Days";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading crowd analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Crowd Density Analytics</h1>
          <p className="text-muted-foreground">
            Real-time passenger density insights across the Lagos BRT network
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedRoute} onValueChange={setSelectedRoute}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select route" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Routes</SelectItem>
              {analytics?.routes.map(route => (
                <SelectItem key={route.id} value={route.id.toString()}>
                  Route {route.routeNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={timeFilter} onValueChange={(value) => setTimeFilter(value as TimeFilter)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Density</p>
                <p className="text-2xl font-bold">
                  {analytics?.analytics.avgCrowdDensity?.toFixed(1) || "0.0"}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Peak Stations</p>
                <p className="text-2xl font-bold">
                  {analytics?.analytics.peakStations?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Time Period</p>
                <p className="text-lg font-semibold">{formatTimeFilter(timeFilter)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Readings</p>
                <p className="text-2xl font-bold">
                  {analytics?.densityReadings?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Crowd Density Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Real-time Crowd Density Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Legend */}
            <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Density Levels:</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-600"></div>
                <span className="text-xs">Low (0-30%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-yellow-600"></div>
                <span className="text-xs">Medium (30-60%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-orange-600"></div>
                <span className="text-xs">High (60-85%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-600"></div>
                <span className="text-xs">Critical (85%+)</span>
              </div>
            </div>

            {/* Station Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {analytics?.stations.map(station => {
                const densityLevel = heatmapData.get(station.id) || "low";
                const densityReading = analytics.densityReadings.find(r => r.stationId === station.id);
                const occupancyPercentage = densityReading 
                  ? ((densityReading.passengerCount / (densityReading.capacity || 70)) * 100)
                  : 0;

                return (
                  <Card 
                    key={station.id} 
                    className={`${getDensityColor(densityLevel)} border-2 transition-all hover:shadow-md`}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <h3 className="font-medium text-sm leading-tight">
                              {station.name}
                            </h3>
                          </div>
                          <Badge 
                            className={`${getDensityBadgeColor(densityLevel)} text-white text-xs`}
                          >
                            {densityLevel.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Passengers:</span>
                            <span className="font-medium">
                              {densityReading?.passengerCount || 0}/{densityReading?.capacity || 70}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Occupancy:</span>
                            <span className="font-medium">{occupancyPercentage.toFixed(1)}%</span>
                          </div>
                        </div>

                        {/* Density Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              densityLevel === "low" ? "bg-green-600" :
                              densityLevel === "medium" ? "bg-yellow-600" :
                              densityLevel === "high" ? "bg-orange-600" : "bg-red-600"
                            }`}
                            style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
                          ></div>
                        </div>

                        {densityLevel === "critical" && (
                          <div className="flex items-center gap-1 text-red-600 text-xs">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Overcrowded</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Crowd Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Predictive Crowd Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Peak Stations */}
            <div>
              <h3 className="font-semibold mb-3">Highest Density Stations</h3>
              <div className="space-y-2">
                {analytics?.analytics.peakStations?.slice(0, 5).map((peak, index) => {
                  const station = analytics.stations.find(s => s.id === peak.stationId);
                  return (
                    <div key={peak.stationId} className="flex items-center justify-between p-3 bg-muted rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                        <span className="font-medium">{station?.name}</span>
                      </div>
                      <Badge variant="outline">{peak.density.toFixed(1)}%</Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Crowd Trends */}
            <div>
              <h3 className="font-semibold mb-3">Hourly Density Trends</h3>
              <div className="space-y-2">
                {analytics?.analytics.crowdTrends?.slice(0, 6).map(trend => (
                  <div key={trend.hour} className="flex items-center justify-between p-3 bg-muted rounded">
                    <span className="font-medium">{trend.hour}:00</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-blue-600"
                          style={{ width: `${(trend.density / 100) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{trend.density.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}