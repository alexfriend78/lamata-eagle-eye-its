import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Users, Clock, AlertTriangle, Activity, Calendar, Target } from "lucide-react";
import type { Station, Route } from "@shared/schema";

interface CrowdAnalyticsProps {
  stations: Station[];
  routes: Route[];
  theme: "light" | "dark";
  isOpen: boolean;
  onClose: () => void;
}

interface AnalyticsData {
  hourlyDistribution: Array<{ hour: number; density: number; passengers: number }>;
  routeComparison: Array<{ routeName: string; avgDensity: number; peakDensity: number; color: string }>;
  stationRanking: Array<{ name: string; density: number; risk: "low" | "medium" | "high" | "critical" }>;
  predictions: Array<{ time: string; predicted: number; confidence: number }>;
  weeklyPattern: Array<{ day: string; density: number }>;
  capacityAnalysis: {
    totalCapacity: number;
    currentUtilization: number;
    peakUtilization: number;
    bottlenecks: string[];
  };
}

const generateAnalyticsData = (stations: Station[], routes: Route[]): AnalyticsData => {
  // Generate hourly distribution data
  const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => {
    let density = 0.3;
    if (hour >= 7 && hour <= 9) density = 0.8; // Morning rush
    if (hour >= 17 && hour <= 19) density = 0.75; // Evening rush
    if (hour >= 12 && hour <= 14) density = 0.5; // Lunch
    if (hour >= 22 || hour <= 5) density = 0.15; // Night
    
    return {
      hour,
      density: density + (Math.random() - 0.5) * 0.2,
      passengers: Math.floor((density + (Math.random() - 0.5) * 0.2) * 1500)
    };
  });

  // Generate route comparison data
  const routeComparison = routes.map(route => ({
    routeName: route.name,
    avgDensity: 0.4 + Math.random() * 0.4,
    peakDensity: 0.6 + Math.random() * 0.4,
    color: route.color || "#3b82f6"
  }));

  // Generate station ranking
  const stationRanking = stations.slice(0, 10).map(station => {
    const density = Math.random();
    let risk: "low" | "medium" | "high" | "critical" = "low";
    if (density > 0.8) risk = "critical";
    else if (density > 0.6) risk = "high";
    else if (density > 0.4) risk = "medium";
    
    return {
      name: station.name,
      density,
      risk
    };
  }).sort((a, b) => b.density - a.density);

  // Generate predictions for next 6 hours
  const predictions = Array.from({ length: 6 }, (_, i) => {
    const currentHour = new Date().getHours();
    const futureHour = (currentHour + i + 1) % 24;
    let predicted = 0.3;
    if (futureHour >= 7 && futureHour <= 9) predicted = 0.8;
    if (futureHour >= 17 && futureHour <= 19) predicted = 0.75;
    
    return {
      time: `${String(futureHour).padStart(2, '0')}:00`,
      predicted: predicted + (Math.random() - 0.5) * 0.15,
      confidence: 0.7 + Math.random() * 0.25
    };
  });

  // Generate weekly pattern
  const weeklyPattern = [
    { day: "Mon", density: 0.75 },
    { day: "Tue", density: 0.78 },
    { day: "Wed", density: 0.72 },
    { day: "Thu", density: 0.76 },
    { day: "Fri", density: 0.85 },
    { day: "Sat", density: 0.45 },
    { day: "Sun", density: 0.35 }
  ];

  // Generate capacity analysis
  const capacityAnalysis = {
    totalCapacity: stations.length * 500,
    currentUtilization: 0.65,
    peakUtilization: 0.87,
    bottlenecks: ["Oshodi Terminal 2", "LASMA", "Mile 12"].slice(0, Math.floor(Math.random() * 3) + 1)
  };

  return {
    hourlyDistribution,
    routeComparison,
    stationRanking,
    predictions,
    weeklyPattern,
    capacityAnalysis
  };
};

const getRiskColor = (risk: string) => {
  switch (risk) {
    case "critical": return "text-red-600 bg-red-100 dark:bg-red-900/20";
    case "high": return "text-orange-600 bg-orange-100 dark:bg-orange-900/20";
    case "medium": return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20";
    default: return "text-green-600 bg-green-100 dark:bg-green-900/20";
  }
};

export default function CrowdAnalyticsPanel({ stations, routes, theme, isOpen, onClose }: CrowdAnalyticsProps) {
  const [selectedView, setSelectedView] = useState("overview");
  const [timeRange, setTimeRange] = useState("today");
  
  const analyticsData = useMemo(() => 
    generateAnalyticsData(stations, routes), 
    [stations, routes]
  );

  if (!isOpen) return null;

  const chartTheme = {
    grid: theme === 'dark' ? '#374151' : '#e5e7eb',
    text: theme === 'dark' ? '#d1d5db' : '#374151',
    background: theme === 'dark' ? '#1f2937' : '#ffffff'
  };

  return (
    <div className={`fixed inset-0 z-50 ${theme === 'dark' ? 'bg-black/50' : 'bg-gray-500/50'}`}>
      <div className={`absolute right-0 top-0 h-full w-[800px] ${
        theme === 'dark' ? 'bg-gray-900 border-l border-gray-700' : 'bg-white border-l border-gray-300'
      } overflow-y-auto`}>
        
        {/* Header */}
        <div className={`sticky top-0 z-10 ${
          theme === 'dark' ? 'bg-gray-900 border-b border-gray-700' : 'bg-white border-b border-gray-200'
        } p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6" />
              <h2 className="text-xl font-semibold">Crowd Analytics</h2>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={onClose} variant="outline" size="sm">
                Close
              </Button>
            </div>
          </div>
          
          {/* View Selector */}
          <div className="flex gap-2 mt-4">
            {[
              { id: "overview", label: "Overview", icon: Activity },
              { id: "predictions", label: "Predictions", icon: TrendingUp },
              { id: "capacity", label: "Capacity", icon: Target },
              { id: "patterns", label: "Patterns", icon: Calendar }
            ].map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                onClick={() => setSelectedView(id)}
                variant={selectedView === id ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          
          {/* Overview View */}
          {selectedView === "overview" && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Current System Load
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(analyticsData.capacityAnalysis.currentUtilization * 100)}%
                    </div>
                    <Progress 
                      value={analyticsData.capacityAnalysis.currentUtilization * 100} 
                      className="mt-2"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Critical Stations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {analyticsData.stationRanking.filter(s => s.risk === "critical").length}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Requires immediate attention
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Hourly Distribution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Passenger Density Throughout Day</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={analyticsData.hourlyDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                      <XAxis 
                        dataKey="hour" 
                        stroke={chartTheme.text}
                        tick={{ fill: chartTheme.text }}
                      />
                      <YAxis 
                        stroke={chartTheme.text}
                        tick={{ fill: chartTheme.text }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: chartTheme.background,
                          border: `1px solid ${chartTheme.grid}`,
                          color: chartTheme.text
                        }}
                      />
                      <Bar dataKey="passengers" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Station Risk Ranking */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Station Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analyticsData.stationRanking.slice(0, 5).map((station, index) => (
                      <div key={station.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-medium">#{index + 1}</div>
                          <div className="text-sm">{station.name}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium">
                            {Math.round(station.density * 100)}%
                          </div>
                          <Badge className={`text-xs ${getRiskColor(station.risk)}`}>
                            {station.risk}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Predictions View */}
          {selectedView === "predictions" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">6-Hour Density Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={analyticsData.predictions}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                      <XAxis 
                        dataKey="time" 
                        stroke={chartTheme.text}
                        tick={{ fill: chartTheme.text }}
                      />
                      <YAxis 
                        stroke={chartTheme.text}
                        tick={{ fill: chartTheme.text }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: chartTheme.background,
                          border: `1px solid ${chartTheme.grid}`,
                          color: chartTheme.text
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="predicted" 
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        dot={{ fill: "#8b5cf6" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                {analyticsData.predictions.slice(0, 4).map((pred, index) => (
                  <Card key={pred.time}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-semibold">{pred.time}</div>
                          <div className="text-sm text-gray-500">
                            {Math.round(pred.predicted * 100)}% density
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">Confidence</div>
                          <div className="font-medium text-green-600">
                            {Math.round(pred.confidence * 100)}%
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Capacity View */}
          {selectedView === "capacity" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">System Capacity Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Total Capacity</div>
                      <div className="text-2xl font-bold">
                        {analyticsData.capacityAnalysis.totalCapacity.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Peak Utilization</div>
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.round(analyticsData.capacityAnalysis.peakUtilization * 100)}%
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div>
                    <div className="text-sm font-medium mb-2">Current Bottlenecks</div>
                    <div className="space-y-1">
                      {analyticsData.capacityAnalysis.bottlenecks.map(station => (
                        <div key={station} className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="text-sm">{station}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Route Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.routeComparison}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                      <XAxis 
                        dataKey="routeName" 
                        stroke={chartTheme.text}
                        tick={{ fill: chartTheme.text }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        stroke={chartTheme.text}
                        tick={{ fill: chartTheme.text }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: chartTheme.background,
                          border: `1px solid ${chartTheme.grid}`,
                          color: chartTheme.text
                        }}
                      />
                      <Bar dataKey="avgDensity" fill="#3b82f6" name="Average Density" />
                      <Bar dataKey="peakDensity" fill="#ef4444" name="Peak Density" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}

          {/* Patterns View */}
          {selectedView === "patterns" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Weekly Density Pattern</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={analyticsData.weeklyPattern}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                      <XAxis 
                        dataKey="day" 
                        stroke={chartTheme.text}
                        tick={{ fill: chartTheme.text }}
                      />
                      <YAxis 
                        stroke={chartTheme.text}
                        tick={{ fill: chartTheme.text }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: chartTheme.background,
                          border: `1px solid ${chartTheme.grid}`,
                          color: chartTheme.text
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="density" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      Peak Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Morning Rush</span>
                        <span className="font-medium">7:00 - 9:00 AM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Evening Rush</span>
                        <span className="font-medium">5:00 - 7:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Lunch Period</span>
                        <span className="font-medium">12:00 - 2:00 PM</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-blue-500" />
                      Low Traffic
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Late Night</span>
                        <span className="font-medium">10:00 PM - 5:00 AM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Mid Morning</span>
                        <span className="font-medium">10:00 - 11:00 AM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Weekends</span>
                        <span className="font-medium">Sat - Sun</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}