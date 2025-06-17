import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle, 
  Shield, 
  Heart, 
  MapPin,
  Users,
  Target,
  Activity,
  X,
  Eye,
  ThumbsDown,
  Zap,
  Brain,
  Calendar,
  CalendarRange
} from "lucide-react";
import { type SystemStats, type Bus, type Station, type AlertWithDetails } from "@shared/schema";

interface ManagementAnalyticsPanelProps {
  buses: Bus[];
  stations: Station[];
  alerts: AlertWithDetails[];
  stats: SystemStats;
  theme: "light" | "dark";
  onClose: () => void;
}

interface KPI {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "stable";
  trendValue: number;
  status: "good" | "warning" | "critical";
  icon: React.ReactNode;
}

interface CrowdAnalytics {
  currentLevel: number;
  predictedPeak: {
    time: string;
    level: number;
    confidence: number;
  };
  recommendations: string[];
  hotspots: Array<{
    stationId: number;
    stationName: string;
    crowdLevel: number;
    riskLevel: "low" | "medium" | "high";
  }>;
}

export default function ManagementAnalyticsPanel({ 
  buses, 
  stations, 
  alerts, 
  stats, 
  theme, 
  onClose 
}: ManagementAnalyticsPanelProps) {
  const [activeTab, setActiveTab] = useState("kpis");
  const [daysBack, setDaysBack] = useState([7]); // Default to 7 days back
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    end: new Date()
  });

  // Generate realistic KPI data based on actual system state and date range
  const generateKPIs = (): KPI[] => {
    const totalBuses = buses.length;
    const onTimeBuses = buses.filter(bus => bus.status === 'on_time' || bus.status === 'active').length;
    const delayedBuses = buses.filter(bus => bus.status === 'delayed').length;
    const alertBuses = buses.filter(bus => bus.status === 'alert').length;
    
    // Calculate base performance
    const baseOnTimePercentage = totalBuses > 0 ? (onTimeBuses / totalBuses) * 100 : 0;
    const securityAlerts = alerts.filter(alert => alert.type === 'security').length;
    const medicalAlerts = alerts.filter(alert => alert.type === 'medical').length;
    
    // Historical variation factors based on selected time period
    const daysBackValue = daysBack[0];
    const seasonalFactor = Math.sin((daysBackValue / 30) * Math.PI) * 0.1; // Seasonal variation
    const weatherFactor = Math.random() * 0.15 - 0.075; // Weather impact
    const dayOfWeekFactor = (daysBackValue % 7 < 5) ? 0.05 : -0.1; // Weekday vs weekend
    
    // Apply historical variations
    const onTimePercentage = Math.max(60, Math.min(95, baseOnTimePercentage + (seasonalFactor + weatherFactor + dayOfWeekFactor) * 20));
    
    // Historical variations for all metrics
    const complaintsBase = Math.max(0, Math.round(totalBuses * 0.3 + (daysBackValue / 10)));
    const complaintsVariation = Math.max(0, Math.round(complaintsBase * (1 + seasonalFactor + weatherFactor)));
    
    const escalationsBase = Math.max(0, Math.round(alertBuses * 0.8 + securityAlerts));
    const escalationsVariation = Math.max(0, Math.round(escalationsBase * (1 + Math.abs(seasonalFactor) * 2)));
    
    const securityBase = Math.max(0, securityAlerts + Math.round(daysBackValue / 15));
    const securityVariation = Math.max(0, Math.round(securityBase * (1 + Math.abs(weatherFactor) * 3)));
    
    const medicalBase = Math.max(0, medicalAlerts + Math.round(daysBackValue / 20));
    const medicalVariation = Math.max(0, Math.round(medicalBase * (1 + Math.random() * 0.5)));
    
    const violationsBase = Math.max(0, Math.round(delayedBuses * 1.2 + (daysBackValue / 8)));
    const violationsVariation = Math.max(0, Math.round(violationsBase * (1 + Math.abs(seasonalFactor) * 1.5)));
    
    const satisfactionBase = 85 + (onTimePercentage - 75) * 0.2 - (daysBackValue / 30);
    const satisfactionVariation = Math.max(60, Math.min(95, satisfactionBase + weatherFactor * 10));
    
    const utilizationBase = (totalBuses > 0 ? (onTimeBuses / totalBuses) * 100 : 0);
    const utilizationVariation = Math.max(50, Math.min(98, utilizationBase + (seasonalFactor + dayOfWeekFactor) * 15));

    return [
      {
        id: "on_time_performance",
        name: "On-Time Performance",
        value: Math.round(onTimePercentage),
        target: 85,
        unit: "%",
        trend: onTimePercentage >= 85 ? "up" : onTimePercentage >= 75 ? "stable" : "down",
        trendValue: Math.round((onTimePercentage - 80) * 0.5),
        status: onTimePercentage >= 85 ? "good" : onTimePercentage >= 75 ? "warning" : "critical",
        icon: <Clock className="h-5 w-5" />
      },
      {
        id: "complaints_received",
        name: "Daily Complaints",
        value: complaintsVariation,
        target: 10,
        unit: "cases",
        trend: complaintsVariation <= 10 ? "down" : "up",
        trendValue: complaintsVariation <= 10 ? -12 : 15,
        status: complaintsVariation <= 10 ? "good" : complaintsVariation <= 20 ? "warning" : "critical",
        icon: <ThumbsDown className="h-5 w-5" />
      },
      {
        id: "escalations",
        name: "Critical Escalations",
        value: escalationsVariation,
        target: 2,
        unit: "cases",
        trend: escalationsVariation <= 2 ? "stable" : "up",
        trendValue: escalationsVariation <= 2 ? 0 : 25,
        status: escalationsVariation <= 2 ? "good" : escalationsVariation <= 5 ? "warning" : "critical",
        icon: <TrendingUp className="h-5 w-5" />
      },
      {
        id: "security_threats",
        name: "Security Incidents",
        value: securityVariation,
        target: 0,
        unit: "alerts",
        trend: securityVariation === 0 ? "stable" : "up",
        trendValue: securityVariation === 0 ? 0 : securityVariation * 50,
        status: securityVariation === 0 ? "good" : securityVariation <= 2 ? "warning" : "critical",
        icon: <Shield className="h-5 w-5" />
      },
      {
        id: "medical_alerts",
        name: "Medical Emergencies",
        value: medicalVariation,
        target: 0,
        unit: "cases",
        trend: medicalVariation === 0 ? "stable" : "up",
        trendValue: medicalVariation === 0 ? 0 : medicalVariation * 25,
        status: medicalVariation === 0 ? "good" : medicalVariation <= 1 ? "warning" : "critical",
        icon: <Heart className="h-5 w-5" />
      },
      {
        id: "geofencing_alerts",
        name: "Route Violations",
        value: violationsVariation,
        target: 1,
        unit: "buses",
        trend: violationsVariation <= 1 ? "down" : "up",
        trendValue: violationsVariation <= 1 ? -25 : 20,
        status: violationsVariation <= 1 ? "good" : violationsVariation <= 5 ? "warning" : "critical",
        icon: <MapPin className="h-5 w-5" />
      },
      {
        id: "passenger_satisfaction",
        name: "Passenger Satisfaction",
        value: Math.round(satisfactionVariation * 10) / 10,
        target: 90,
        unit: "%",
        trend: satisfactionVariation >= 85 ? "up" : "down",
        trendValue: Math.round((satisfactionVariation - 85) * 0.5),
        status: satisfactionVariation >= 85 ? "good" : satisfactionVariation >= 75 ? "warning" : "critical",
        icon: <Users className="h-5 w-5" />
      },
      {
        id: "operational_efficiency",
        name: "Fleet Utilization",
        value: Math.round(utilizationVariation),
        target: 95,
        unit: "%",
        trend: utilizationVariation >= 85 ? "up" : "stable",
        trendValue: Math.round((utilizationVariation - 85) * 0.2),
        status: utilizationVariation >= 85 ? "good" : utilizationVariation >= 70 ? "warning" : "critical",
        icon: <Activity className="h-5 w-5" />
      }
    ];
  };

  // Generate crowd analytics data
  const generateCrowdAnalytics = (): CrowdAnalytics => {
    const currentHour = new Date().getHours();
    const isRushHour = (currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 19);
    
    const hotspots = stations.slice(0, 5).map(station => ({
      stationId: station.id,
      stationName: station.name,
      crowdLevel: Math.floor(Math.random() * 100) + (isRushHour ? 40 : 0),
      riskLevel: (() => {
        const level = Math.floor(Math.random() * 100) + (isRushHour ? 40 : 0);
        return level > 80 ? "high" : level > 60 ? "medium" : "low";
      })() as "low" | "medium" | "high"
    }));

    const recommendations = [
      "Deploy additional buses to Route 1 (Oshodi-Abule Egba) during 8-9 AM peak",
      "Increase security presence at Oshodi Terminal 2 due to high crowd density",
      "Consider implementing crowd control measures at Ikeja stations",
      "Optimize boarding processes at high-traffic stations to reduce dwell time",
      "Activate overflow management protocol for stations exceeding 85% capacity"
    ];

    return {
      currentLevel: Math.floor(Math.random() * 40) + (isRushHour ? 60 : 20),
      predictedPeak: {
        time: isRushHour ? "18:30" : "08:15",
        level: 92,
        confidence: 87
      },
      recommendations: recommendations.slice(0, 3),
      hotspots
    };
  };

  const kpis = generateKPIs();
  const crowdAnalytics = generateCrowdAnalytics();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good": return "text-green-600 dark:text-green-400";
      case "warning": return "text-yellow-600 dark:text-yellow-400";
      case "critical": return "text-red-600 dark:text-red-400";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down": return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4 rounded-full bg-gray-400" />;
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default: return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`w-[95vw] max-w-7xl h-[90vh] ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-2xl flex flex-col`}>
        {/* Header */}
        <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Management Analytics
              </h2>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Real-time KPIs and Performance Metrics
              </p>
            </div>
          </div>
          
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="kpis" className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Key Performance Indicators</span>
              </TabsTrigger>
              <TabsTrigger value="crowd" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Crowd Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="predictive" className="flex items-center space-x-2">
                <Brain className="h-4 w-4" />
                <span>AI Recommendations</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="kpis" className="mt-6">
              {/* Date Range Controls */}
              <div className={`mb-6 p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
                  <div className="flex-1">
                    <Label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Historical Analysis Period
                    </Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center space-x-4">
                        <CalendarRange className="h-4 w-4" />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {daysBack[0]} {daysBack[0] === 1 ? 'day' : 'days'} ago
                        </span>
                      </div>
                      <Slider
                        value={daysBack}
                        onValueChange={(value) => {
                          setDaysBack(value);
                          const newStartDate = new Date(Date.now() - value[0] * 24 * 60 * 60 * 1000);
                          setDateRange({ start: newStartDate, end: new Date() });
                        }}
                        max={90}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>1 day</span>
                        <span>3 months</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Date Range
                    </Label>
                    <div className={`p-2 rounded border text-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-700'}`}>
                      {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi) => (
                  <Card key={kpi.id} className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-lg ${getStatusColor(kpi.status).includes('green') ? 'bg-green-100 dark:bg-green-900' : 
                          getStatusColor(kpi.status).includes('yellow') ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-red-100 dark:bg-red-900'}`}>
                          {kpi.icon}
                        </div>
                        {getTrendIcon(kpi.trend)}
                      </div>
                      <CardTitle className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {kpi.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-baseline space-x-2">
                          <span className={`text-2xl font-bold ${getStatusColor(kpi.status)}`}>
                            {kpi.value.toFixed(1)}
                          </span>
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {kpi.unit}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                              Target: {kpi.target}{kpi.unit}
                            </span>
                            <span className={`flex items-center space-x-1 ${kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                              <span>{kpi.trend === 'up' ? '+' : kpi.trend === 'down' ? '-' : ''}{Math.abs(kpi.trendValue)}%</span>
                            </span>
                          </div>
                          <Progress 
                            value={Math.min((kpi.value / kpi.target) * 100, 100)} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="crowd" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Crowd Levels */}
                <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <CardHeader>
                    <CardTitle className={`flex items-center space-x-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <Users className="h-5 w-5" />
                      <span>System-wide Crowd Level</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${crowdAnalytics.currentLevel > 80 ? 'text-red-600' : crowdAnalytics.currentLevel > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {crowdAnalytics.currentLevel}%
                        </div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Current Capacity Utilization
                        </p>
                      </div>
                      
                      <Progress 
                        value={crowdAnalytics.currentLevel} 
                        className="h-3"
                      />
                      
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Predicted Peak
                        </h4>
                        <div className="flex justify-between items-center">
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                            {crowdAnalytics.predictedPeak.time} - {crowdAnalytics.predictedPeak.level}%
                          </span>
                          <Badge variant="outline">
                            {crowdAnalytics.predictedPeak.confidence}% confidence
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Crowd Hotspots */}
                <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <CardHeader>
                    <CardTitle className={`flex items-center space-x-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <Eye className="h-5 w-5" />
                      <span>Crowd Hotspots</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {crowdAnalytics.hotspots.map((hotspot) => (
                        <div key={hotspot.stationId} className={`p-3 rounded-lg border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {hotspot.stationName}
                            </h4>
                            <Badge className={getRiskBadgeColor(hotspot.riskLevel)}>
                              {hotspot.riskLevel.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              Crowd Level: {hotspot.crowdLevel}%
                            </span>
                            <Progress value={hotspot.crowdLevel} className="w-20 h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="predictive" className="mt-6">
              <div className="grid grid-cols-1 gap-6">
                <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <CardHeader>
                    <CardTitle className={`flex items-center space-x-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <Brain className="h-5 w-5" />
                      <span>AI-Powered Recommendations</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {crowdAnalytics.recommendations.map((recommendation, index) => (
                        <div key={index} className={`p-4 rounded-lg border-l-4 ${
                          index === 0 ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                          index === 1 ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                          'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        }`}>
                          <div className="flex items-start space-x-3">
                            <div className={`p-1 rounded-full mt-1 ${
                              index === 0 ? 'bg-red-500' :
                              index === 1 ? 'bg-yellow-500' :
                              'bg-blue-500'
                            }`}>
                              <Zap className="h-3 w-3 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                Priority {index === 0 ? 'High' : index === 1 ? 'Medium' : 'Low'}
                              </h4>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {recommendation}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Automated Actions Available
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Button variant="outline" size="sm" className="justify-start">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Activate Overflow Protocol
                          </Button>
                          <Button variant="outline" size="sm" className="justify-start">
                            <Users className="h-4 w-4 mr-2" />
                            Deploy Extra Buses
                          </Button>
                          <Button variant="outline" size="sm" className="justify-start">
                            <Shield className="h-4 w-4 mr-2" />
                            Increase Security Presence
                          </Button>
                          <Button variant="outline" size="sm" className="justify-start">
                            <Activity className="h-4 w-4 mr-2" />
                            Optimize Route Schedules
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}