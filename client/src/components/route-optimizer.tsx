import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Cloud, 
  CloudRain, 
  Sun, 
  Wind, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Route, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Navigation,
  Zap
} from "lucide-react";
import type { Route as RouteType, Station, Bus } from "@shared/schema";

interface WeatherData {
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  temperature: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  impactLevel: 'low' | 'medium' | 'high';
}

interface CrowdData {
  stationId: number;
  stationName: string;
  currentDensity: number;
  predictedDensity: number;
  capacity: number;
  crowdLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface RouteOptimization {
  routeId: number;
  routeName: string;
  currentEfficiency: number;
  optimizedEfficiency: number;
  recommendations: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedImpact: {
    timeSaving: number;
    capacityIncrease: number;
    satisfactionImprovement: number;
  };
}

interface RouteOptimizerProps {
  routes: RouteType[];
  stations: Station[];
  buses: Bus[];
  theme: "light" | "dark";
  onClose: () => void;
}

export default function RouteOptimizer({ routes, stations, buses, theme, onClose }: RouteOptimizerProps) {
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizations, setOptimizations] = useState<RouteOptimization[]>([]);

  // Simulate weather data (in real implementation, this would fetch from weather API)
  const generateWeatherData = (): WeatherData => {
    const conditions = ['sunny', 'cloudy', 'rainy', 'stormy'] as const;
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    return {
      condition,
      temperature: Math.floor(Math.random() * 15) + 20, // 20-35°C
      humidity: Math.floor(Math.random() * 40) + 60, // 60-100%
      windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
      visibility: condition === 'rainy' || condition === 'stormy' ? 
        Math.floor(Math.random() * 3) + 2 : // 2-5 km
        Math.floor(Math.random() * 5) + 8, // 8-13 km
      impactLevel: condition === 'stormy' ? 'high' : 
                  condition === 'rainy' ? 'medium' : 'low'
    };
  };

  // Generate crowd density data based on stations
  const generateCrowdData = (): CrowdData[] => {
    return stations.map(station => {
      const currentDensity = Math.floor(Math.random() * 100);
      const predictedDensity = Math.max(0, currentDensity + (Math.random() - 0.5) * 30);
      const capacity = 150; // Standard BRT station capacity
      
      let crowdLevel: 'low' | 'medium' | 'high' | 'critical';
      const densityRatio = currentDensity / capacity;
      
      if (densityRatio < 0.3) crowdLevel = 'low';
      else if (densityRatio < 0.6) crowdLevel = 'medium';
      else if (densityRatio < 0.9) crowdLevel = 'high';
      else crowdLevel = 'critical';

      return {
        stationId: station.id,
        stationName: station.name,
        currentDensity,
        predictedDensity,
        capacity,
        crowdLevel
      };
    });
  };

  const [weatherData] = useState<WeatherData>(generateWeatherData());
  const [crowdData] = useState<CrowdData[]>(generateCrowdData());

  // Generate route optimizations based on weather and crowd data
  const generateOptimizations = (): RouteOptimization[] => {
    return routes.map(route => {
      const routeBuses = buses.filter(bus => bus.routeId === route.id);
      const routeStations = stations.filter(station => 
        // Simplified: assume stations belong to route based on route ID patterns
        (route.id === 1 && station.id >= 1 && station.id <= 17) ||
        (route.id === 2 && station.id >= 18 && station.id <= 45) ||
        (route.id === 3 && station.id >= 46 && station.id <= 65) ||
        (route.id === 4 && station.id >= 66 && station.id <= 84) ||
        (route.id === 5 && station.id >= 85 && station.id <= 102)
      );
      
      const routeCrowdData = crowdData.filter(crowd => 
        routeStations.some(station => station.id === crowd.stationId)
      );

      // Calculate current efficiency (simplified scoring)
      const currentEfficiency = Math.floor(Math.random() * 30) + 60; // 60-90%
      
      // Calculate optimization potential
      const weatherImpact = weatherData.impactLevel === 'high' ? 0.8 : 
                           weatherData.impactLevel === 'medium' ? 0.9 : 1.0;
      
      const crowdImpact = routeCrowdData.reduce((acc, crowd) => {
        return acc + (crowd.crowdLevel === 'critical' ? 0.7 : 
                     crowd.crowdLevel === 'high' ? 0.8 : 
                     crowd.crowdLevel === 'medium' ? 0.9 : 1.0);
      }, 0) / routeCrowdData.length;

      const optimizedEfficiency = Math.min(95, Math.floor(currentEfficiency / (weatherImpact * crowdImpact)));
      
      // Generate recommendations
      const recommendations: string[] = [];
      
      if (weatherData.impactLevel === 'high') {
        recommendations.push("Increase bus frequency due to severe weather conditions");
        recommendations.push("Deploy additional staff at major stations");
      }
      
      if (weatherData.condition === 'rainy') {
        recommendations.push("Activate covered waiting areas and shelters");
        recommendations.push("Reduce speed limits for safety (15% slower)");
      }

      const criticalStations = routeCrowdData.filter(crowd => crowd.crowdLevel === 'critical');
      if (criticalStations.length > 0) {
        recommendations.push(`Deploy express buses to bypass ${criticalStations.length} overcrowded stations`);
        recommendations.push("Implement passenger flow control at peak stations");
      }

      const highCrowdStations = routeCrowdData.filter(crowd => crowd.crowdLevel === 'high');
      if (highCrowdStations.length > 2) {
        recommendations.push("Increase bus capacity by 25% during peak hours");
        recommendations.push("Activate real-time passenger information displays");
      }

      if (routeBuses.length < 3) {
        recommendations.push("Deploy additional buses to meet demand");
      }

      // Determine priority
      let priority: 'low' | 'medium' | 'high' | 'critical';
      if (criticalStations.length > 0 || weatherData.impactLevel === 'high') {
        priority = 'critical';
      } else if (highCrowdStations.length > 1 || weatherData.impactLevel === 'medium') {
        priority = 'high';
      } else if (optimizedEfficiency - currentEfficiency > 10) {
        priority = 'medium';
      } else {
        priority = 'low';
      }

      return {
        routeId: route.id,
        routeName: route.name,
        currentEfficiency,
        optimizedEfficiency,
        recommendations: recommendations.slice(0, 4), // Limit to top 4 recommendations
        priority,
        estimatedImpact: {
          timeSaving: Math.floor((optimizedEfficiency - currentEfficiency) * 0.5), // minutes
          capacityIncrease: Math.floor((optimizedEfficiency - currentEfficiency) * 2), // percentage
          satisfactionImprovement: Math.floor((optimizedEfficiency - currentEfficiency) * 1.5) // percentage
        }
      };
    });
  };

  const handleOptimize = async () => {
    setOptimizing(true);
    
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newOptimizations = generateOptimizations();
    setOptimizations(newOptimizations);
    setOptimizing(false);
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-5 h-5 text-yellow-500" />;
      case 'cloudy': return <Cloud className="w-5 h-5 text-gray-500" />;
      case 'rainy': return <CloudRain className="w-5 h-5 text-blue-500" />;
      case 'stormy': return <Wind className="w-5 h-5 text-purple-500" />;
      default: return <Sun className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      case 'low': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getCrowdColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${theme === 'dark' ? 'bg-black/80' : 'bg-white/80'} backdrop-blur-sm`}>
      <div className={`fixed right-0 top-0 h-full w-[900px] ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'} border-l shadow-2xl overflow-y-auto`}>
        
        {/* Header */}
        <div className={`sticky top-0 z-10 ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'} border-b p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Navigation className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Smart Route Optimizer
                </h2>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  AI-powered optimization with weather & crowd density integration
                </p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className={theme === 'dark' ? 'border-gray-600 text-gray-400 hover:text-white' : ''}
            >
              Close
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Current Conditions */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Weather Conditions */}
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader className="pb-3">
                <CardTitle className={`text-lg flex items-center ${theme === 'dark' ? 'text-white' : ''}`}>
                  {getWeatherIcon(weatherData.condition)}
                  <span className="ml-2">Weather Conditions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Condition</span>
                  <Badge className={`${
                    weatherData.impactLevel === 'high' ? 'bg-red-600' :
                    weatherData.impactLevel === 'medium' ? 'bg-yellow-600' :
                    'bg-green-600'
                  } text-white`}>
                    {weatherData.condition}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Temperature</span>
                  <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}>{weatherData.temperature}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Visibility</span>
                  <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}>{weatherData.visibility} km</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Impact Level</span>
                  <Badge className={`${
                    weatherData.impactLevel === 'high' ? 'bg-red-100 text-red-800' :
                    weatherData.impactLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {weatherData.impactLevel}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Crowd Analytics Summary */}
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader className="pb-3">
                <CardTitle className={`text-lg flex items-center ${theme === 'dark' ? 'text-white' : ''}`}>
                  <Users className="w-5 h-5 mr-2" />
                  Crowd Density Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Critical Stations</span>
                  <span className="text-red-600 font-medium">
                    {crowdData.filter(c => c.crowdLevel === 'critical').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>High Density</span>
                  <span className="text-orange-600 font-medium">
                    {crowdData.filter(c => c.crowdLevel === 'high').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Medium Density</span>
                  <span className="text-yellow-600 font-medium">
                    {crowdData.filter(c => c.crowdLevel === 'medium').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Low Density</span>
                  <span className="text-green-600 font-medium">
                    {crowdData.filter(c => c.crowdLevel === 'low').length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Optimization Controls */}
          <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={`flex items-center ${theme === 'dark' ? 'text-white' : ''}`}>
                <Zap className="w-5 h-5 mr-2 text-blue-600" />
                Route Optimization Engine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Analyze all routes with current weather and crowd conditions
                  </p>
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Last optimization: {optimizations.length > 0 ? 'Just now' : 'Never'}
                  </p>
                </div>
                <Button
                  onClick={handleOptimize}
                  disabled={optimizing}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {optimizing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Optimize Routes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Optimization Results */}
          {optimizations.length > 0 && (
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Optimization Results
              </h3>
              
              {optimizations
                .sort((a, b) => {
                  const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                  return priorityOrder[b.priority] - priorityOrder[a.priority];
                })
                .map((optimization) => (
                  <Card key={optimization.routeId} className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className={`flex items-center ${theme === 'dark' ? 'text-white' : ''}`}>
                          <Route className="w-5 h-5 mr-2" />
                          {optimization.routeName}
                        </CardTitle>
                        <Badge className={getPriorityColor(optimization.priority)}>
                          {optimization.priority} priority
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      
                      {/* Efficiency Metrics */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {optimization.currentEfficiency}%
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Current Efficiency
                          </div>
                        </div>
                        <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div className={`text-2xl font-bold text-green-600`}>
                            {optimization.optimizedEfficiency}%
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Optimized Efficiency
                          </div>
                        </div>
                        <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div className={`text-2xl font-bold flex items-center justify-center ${
                            optimization.optimizedEfficiency > optimization.currentEfficiency ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {optimization.optimizedEfficiency > optimization.currentEfficiency ? (
                              <TrendingUp className="w-6 h-6 mr-1" />
                            ) : (
                              <TrendingDown className="w-6 h-6 mr-1" />
                            )}
                            +{optimization.optimizedEfficiency - optimization.currentEfficiency}%
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Improvement
                          </div>
                        </div>
                      </div>

                      {/* Impact Estimates */}
                      <div className="grid grid-cols-3 gap-4 pt-2">
                        <div className="text-center">
                          <div className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            <Clock className="w-4 h-4 inline mr-1" />
                            {optimization.estimatedImpact.timeSaving} min
                          </div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Time Saving
                          </div>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            <Users className="w-4 h-4 inline mr-1" />
                            +{optimization.estimatedImpact.capacityIncrease}%
                          </div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Capacity Increase
                          </div>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            <CheckCircle className="w-4 h-4 inline mr-1" />
                            +{optimization.estimatedImpact.satisfactionImprovement}%
                          </div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Satisfaction
                          </div>
                        </div>
                      </div>

                      <Separator className={theme === 'dark' ? 'bg-gray-700' : ''} />

                      {/* Recommendations */}
                      <div>
                        <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Optimization Recommendations
                        </h4>
                        <div className="space-y-2">
                          {optimization.recommendations.map((recommendation, index) => (
                            <div key={index} className={`flex items-start space-x-2 text-sm`}>
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                                {recommendation}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2 pt-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Apply Optimization
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className={theme === 'dark' ? 'border-gray-600 text-gray-300 hover:text-white' : ''}
                        >
                          Schedule for Later
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className={theme === 'dark' ? 'border-gray-600 text-gray-300 hover:text-white' : ''}
                          onClick={() => setSelectedRoute(optimization.routeId)}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}

          {/* Help Section */}
          <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''} mt-6`}>
            <CardHeader>
              <CardTitle className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : ''}`}>
                How Smart Optimization Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                • <strong>Weather Integration:</strong> Analyzes current weather conditions and their impact on bus operations
              </p>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                • <strong>Crowd Density:</strong> Real-time passenger density data from all stations to optimize capacity
              </p>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                • <strong>AI Recommendations:</strong> Machine learning algorithms suggest optimal route adjustments
              </p>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                • <strong>Impact Prediction:</strong> Estimates time savings, capacity improvements, and passenger satisfaction
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}