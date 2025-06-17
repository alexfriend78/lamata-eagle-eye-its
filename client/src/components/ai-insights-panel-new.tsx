import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, TrendingUp, Users, Clock, MapPin, AlertTriangle, Zap, ChevronRight, CheckCircle, Navigation, Wrench, X } from "lucide-react";
import RouteOptimizer from "@/components/route-optimizer";
import PredictiveMaintenance from "@/components/predictive-maintenance";
import type { BusWithRoute, Station, AlertWithDetails, SystemStats, Route, Bus } from "@shared/schema";

interface AIInsightsPanelProps {
  buses: BusWithRoute[];
  stations: Station[];
  alerts: AlertWithDetails[];
  stats: SystemStats;
  routes: Route[];
  theme: "light" | "dark";
  onClose: () => void;
}

interface AIInsight {
  id: string;
  type: 'deployment' | 'optimization' | 'alert' | 'prediction';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendation: string;
  impact: string;
  confidence: number;
  location?: string;
  route?: string;
  eta?: string;
  implemented?: boolean;
}

export default function AIInsightsPanel({ buses, stations, alerts, stats, routes, theme, onClose }: AIInsightsPanelProps) {
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [implementedInsights, setImplementedInsights] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("insights");

  // Generate AI insights based on real-time data
  const generateInsights = (): AIInsight[] => {
    const insights: AIInsight[] = [];

    // Analyze crowd density patterns
    const highDensityStations = stations.filter(station => 
      (station as any).passengerCount > 50
    );

    if (highDensityStations.length > 0) {
      insights.push({
        id: 'crowd-deployment-1',
        type: 'deployment',
        priority: 'high',
        title: 'Additional Bus Deployment Required',
        description: `${highDensityStations.length} stations showing high passenger density (>50 people)`,
        recommendation: `Deploy 2-3 additional buses with drivers Adebayo Ogundimu and Kemi Adeleke to Route 1 immediately`,
        impact: 'Reduce waiting times by 35% and improve passenger satisfaction',
        confidence: 87,
        location: highDensityStations[0]?.name,
        eta: '15-20 minutes'
      });
    }

    // Bus utilization analysis
    const underutilizedBuses = buses.filter(bus => 
      bus.status === 'active' && (bus as any).utilization < 40
    );

    if (underutilizedBuses.length > 0) {
      insights.push({
        id: 'optimization-1',
        type: 'optimization',
        priority: 'medium',
        title: 'Route Optimization Opportunity',
        description: `${underutilizedBuses.length} buses operating below 40% capacity`,
        recommendation: 'Redistribute buses to high-demand routes or adjust service frequency',
        impact: 'Improve fleet efficiency by 22% and reduce operational costs',
        confidence: 78,
        eta: '30-45 minutes'
      });
    }

    // Alert-based insights
    if (alerts && alerts.length > 0) {
      const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
      if (criticalAlerts.length > 0) {
        insights.push({
          id: 'alert-response-1',
          type: 'alert',
          priority: 'high',
          title: 'Critical Alert Response Required',
          description: `${criticalAlerts.length} critical alerts requiring immediate attention`,
          recommendation: 'Deploy emergency response team and reroute nearby buses',
          impact: 'Minimize service disruption and ensure passenger safety',
          confidence: 95,
          eta: '5-10 minutes'
        });
      }
    }

    // Predictive insights based on patterns
    const peakHourPrediction = new Date().getHours() >= 7 && new Date().getHours() <= 9;
    if (peakHourPrediction) {
      insights.push({
        id: 'prediction-1',
        type: 'prediction',
        priority: 'medium',
        title: 'Peak Hour Surge Predicted',
        description: 'Expected 40% increase in passenger volume within next hour',
        recommendation: 'Pre-position 3 standby buses at Oshodi and Ikeja terminals',
        impact: 'Prevent overcrowding and maintain service quality',
        confidence: 82,
        eta: '60 minutes'
      });
    }

    // Weather-based insights
    insights.push({
      id: 'weather-adjustment-1',
      type: 'optimization',
      priority: 'low',
      title: 'Weather-Based Service Adjustment',
      description: 'Clear weather conditions detected - optimal for full service',
      recommendation: 'Maintain current service levels and consider express routes',
      impact: 'Optimize travel times and passenger comfort',
      confidence: 75,
      eta: 'Immediate'
    });

    return insights;
  };

  const insights = generateInsights();

  const handleImplementInsight = (insightId: string) => {
    setImplementedInsights(prev => new Set([...Array.from(prev), insightId]));
    setSelectedInsight(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`w-[95vw] max-w-7xl h-[90vh] ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-2xl flex flex-col`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-green-600" />
            <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              AI Fleet Intelligence Hub
            </h2>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Tabs Interface */}
        <div className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className={`grid w-full grid-cols-3 ${theme === 'dark' ? 'bg-gray-800' : ''}`}>
              <TabsTrigger value="insights" className="flex items-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>AI Insights</span>
              </TabsTrigger>
              <TabsTrigger value="optimizer" className="flex items-center space-x-2">
                <Navigation className="w-4 h-4" />
                <span>Route Optimizer</span>
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="flex items-center space-x-2">
                <Wrench className="w-4 h-4" />
                <span>Predictive Maintenance</span>
              </TabsTrigger>
            </TabsList>

            {/* AI Insights Tab */}
            <TabsContent value="insights" className="mt-6 h-[calc(100%-60px)] overflow-y-auto">
              <div className="space-y-4">
                {insights.map((insight) => (
                  <Card
                    key={insight.id}
                    className={`border transition-all cursor-pointer hover:shadow-md ${
                      implementedInsights.has(insight.id)
                        ? 'border-green-200 bg-green-50 dark:bg-green-900/20'
                        : insight.priority === 'high'
                        ? 'border-red-200 bg-red-50 dark:bg-red-900/20'
                        : insight.priority === 'medium'
                        ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-gray-200 bg-gray-50 dark:bg-gray-700'
                    } ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}`}
                    onClick={() => setSelectedInsight(insight)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {insight.type === 'deployment' && <TrendingUp className="h-4 w-4 text-blue-600" />}
                            {insight.type === 'optimization' && <Zap className="h-4 w-4 text-purple-600" />}
                            {insight.type === 'alert' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                            {insight.type === 'prediction' && <Clock className="h-4 w-4 text-orange-600" />}
                            
                            <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {insight.title}
                            </h4>
                            
                            {implementedInsights.has(insight.id) && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          
                          <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {insight.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <Badge
                              className={
                                insight.priority === 'high'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  : insight.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                              }
                            >
                              {insight.priority} priority
                            </Badge>
                            
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {insight.confidence}% confidence
                              </Badge>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleImplementInsight(insight.id);
                                }}
                                disabled={implementedInsights.has(insight.id)}
                                className="text-xs h-7"
                              >
                                {implementedInsights.has(insight.id) ? 'Implemented' : 'Implement'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {selectedInsight && (
                  <Card className={`border-blue-200 ${theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50'}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {selectedInsight.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h5 className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Recommendation:
                        </h5>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {selectedInsight.recommendation}
                        </p>
                      </div>
                      
                      <div>
                        <h5 className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Expected Impact:
                        </h5>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {selectedInsight.impact}
                        </p>
                      </div>
                      
                      {selectedInsight.eta && (
                        <div>
                          <h5 className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Implementation Time:
                          </h5>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {selectedInsight.eta}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex space-x-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleImplementInsight(selectedInsight.id)}
                          disabled={implementedInsights.has(selectedInsight.id)}
                          className="text-xs h-7"
                        >
                          {implementedInsights.has(selectedInsight.id) ? 'Implemented' : 'Implement'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedInsight(null)}
                          className="text-xs h-7"
                        >
                          Close
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Route Optimizer Tab */}
            <TabsContent value="optimizer" className="mt-6 h-[calc(100%-60px)]">
              <div className="h-full">
                <RouteOptimizer
                  routes={routes}
                  stations={stations}
                  buses={buses}
                  theme={theme}
                  onClose={() => {}}
                />
              </div>
            </TabsContent>

            {/* Predictive Maintenance Tab */}
            <TabsContent value="maintenance" className="mt-6 h-[calc(100%-60px)]">
              <div className="h-full">
                <PredictiveMaintenance
                  buses={buses}
                  theme={theme}
                  onClose={() => {}}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}