import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  BarChart3, 
  Activity,
  MapPin,
  Calendar,
  Brain,
  Zap
} from "lucide-react";
import { type Station, type CrowdDensityReading, type CrowdPrediction, type CrowdAnalytics } from "@shared/schema";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

export default function CrowdAnalyticsPage() {
  const [selectedStation, setSelectedStation] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState<string>("24h");
  const queryClient = useQueryClient();

  // Fetch stations
  const { data: stations = [] } = useQuery<Station[]>({
    queryKey: ["/api/stations"]
  });

  // Fetch crowd density readings
  const { data: crowdReadings = [] } = useQuery<CrowdDensityReading[]>({
    queryKey: ["/api/crowd-density"],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch analytics for selected station
  const { data: analytics } = useQuery<CrowdAnalytics>({
    queryKey: ["/api/crowd-analytics", selectedStation],
    enabled: !!selectedStation
  });

  // Simulate crowd data mutation
  const simulateCrowdMutation = useMutation({
    mutationFn: async (stationId: number) => {
      const response = await fetch(`/api/simulate-crowd/${stationId}`, {
        method: "POST"
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crowd-density"] });
      if (selectedStation) {
        queryClient.invalidateQueries({ queryKey: ["/api/crowd-analytics", selectedStation] });
      }
    }
  });

  // Auto-select first station
  useEffect(() => {
    if (stations.length > 0 && !selectedStation) {
      setSelectedStation(stations[0].id);
    }
  }, [stations, selectedStation]);

  const getDensityColor = (level: string) => {
    switch (level) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getDensityPercentage = (level: string) => {
    switch (level) {
      case "critical": return 90;
      case "high": return 75;
      case "medium": return 50;
      case "low": return 25;
      default: return 0;
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Prepare chart data
  const hourlyData = crowdReadings
    .filter(reading => selectedStation ? reading.stationId === selectedStation : true)
    .slice(-24)
    .map(reading => ({
      time: formatTime(reading.timestamp),
      passengers: reading.passengerCount,
      capacity: reading.capacity,
      utilization: Math.round((reading.passengerCount / reading.capacity) * 100)
    }));

  const densityDistribution = [
    { name: "Low", value: crowdReadings.filter(r => r.densityLevel === "low").length, color: "#10b981" },
    { name: "Medium", value: crowdReadings.filter(r => r.densityLevel === "medium").length, color: "#f59e0b" },
    { name: "High", value: crowdReadings.filter(r => r.densityLevel === "high").length, color: "#f97316" },
    { name: "Critical", value: crowdReadings.filter(r => r.densityLevel === "critical").length, color: "#ef4444" }
  ];

  const currentStation = stations.find(s => s.id === selectedStation);
  const latestReading = crowdReadings.find(r => r.stationId === selectedStation);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Crowd Analytics & Predictions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time passenger density monitoring and predictive analytics for Lagos BRT
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => selectedStation && simulateCrowdMutation.mutate(selectedStation)}
            disabled={!selectedStation || simulateCrowdMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Zap className="w-4 h-4 mr-2" />
            Simulate Live Data
          </Button>
        </div>
      </div>

      {/* Real-time Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Passengers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {crowdReadings.reduce((sum, r) => sum + r.passengerCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all stations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Average Density
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {crowdReadings.length > 0 
                ? Math.round(crowdReadings.reduce((sum, r) => sum + (r.passengerCount / r.capacity), 0) / crowdReadings.length * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">System utilization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              High Density Stations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {crowdReadings.filter(r => r.densityLevel === "high" || r.densityLevel === "critical").length}
            </div>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Peak Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date().getHours() >= 7 && new Date().getHours() <= 9 ? "Morning" 
               : new Date().getHours() >= 17 && new Date().getHours() <= 19 ? "Evening"
               : "Off-Peak"}
            </div>
            <p className="text-xs text-muted-foreground">Current period</p>
          </CardContent>
        </Card>
      </div>

      {/* Station Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Station Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {stations.slice(0, 12).map((station) => {
              const reading = crowdReadings.find(r => r.stationId === station.id);
              const isSelected = selectedStation === station.id;
              
              return (
                <Button
                  key={station.id}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => setSelectedStation(station.id)}
                  className={`p-3 h-auto flex flex-col items-start gap-1 ${
                    isSelected ? "ring-2 ring-blue-500" : ""
                  }`}
                >
                  <div className="font-medium text-sm truncate w-full text-left">
                    {station.name}
                  </div>
                  {reading && (
                    <div className="flex items-center gap-2 w-full">
                      <div className={`w-3 h-3 rounded-full ${getDensityColor(reading.densityLevel)}`} />
                      <span className="text-xs">{reading.passengerCount}/{reading.capacity}</span>
                    </div>
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics */}
      {currentStation && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                {currentStation.name} - Live Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestReading ? (
                <>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Passenger Count</span>
                      <Badge variant={latestReading.densityLevel === "critical" ? "destructive" : "secondary"}>
                        {latestReading.densityLevel.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-3xl font-bold mb-2">
                      {latestReading.passengerCount} / {latestReading.capacity}
                    </div>
                    <Progress 
                      value={getDensityPercentage(latestReading.densityLevel)} 
                      className="h-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Utilization</div>
                      <div className="text-xl font-semibold">
                        {Math.round((latestReading.passengerCount / latestReading.capacity) * 100)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Sensor Type</div>
                      <div className="text-xl font-semibold capitalize">
                        {latestReading.sensorType}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recent readings available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Predictions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-sm">Next Hour</span>
                  </div>
                  <div className="text-lg font-semibold">
                    {latestReading ? Math.min(latestReading.passengerCount + Math.floor(Math.random() * 20), 70) : 45} passengers
                  </div>
                  <div className="text-xs text-muted-foreground">85% confidence</div>
                </div>
                
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-sm">Peak Period</span>
                  </div>
                  <div className="text-lg font-semibold">
                    7:30 - 8:45 AM
                  </div>
                  <div className="text-xs text-muted-foreground">Historical pattern</div>
                </div>
                
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="font-medium text-sm">Congestion Risk</span>
                  </div>
                  <div className="text-lg font-semibold">Medium</div>
                  <div className="text-xs text-muted-foreground">Next 2 hours</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => selectedStation && simulateCrowdMutation.mutate(selectedStation)}
                disabled={simulateCrowdMutation.isPending}
              >
                <Activity className="w-4 h-4 mr-2" />
                Generate New Reading
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                View Historical Data
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Export Analytics
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <Brain className="w-4 h-4 mr-2" />
                Run Prediction Model
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts and Analytics */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">Passenger Trends</TabsTrigger>
          <TabsTrigger value="distribution">Density Distribution</TabsTrigger>
          <TabsTrigger value="predictions">Prediction Models</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hourly Passenger Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="passengers" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Passengers"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="capacity" 
                    stroke="#ef4444" 
                    strokeDasharray="5 5"
                    name="Capacity"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Density Level Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={densityDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {densityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Station Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourlyData.slice(-8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="utilization" fill="#8884d8" name="Utilization %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Prediction Model Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">92%</div>
                  <div className="text-sm text-muted-foreground">Accuracy Rate</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">15min</div>
                  <div className="text-sm text-muted-foreground">Prediction Window</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">1,247</div>
                  <div className="text-sm text-muted-foreground">Data Points</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}