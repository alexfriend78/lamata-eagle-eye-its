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
        impact: 'Reduce wait times by 35% and improve passenger satisfaction',
        confidence: 92,
        location: 'Oshodi Terminal 2, Bolade Station',
        route: 'Route 1',
        eta: '12 minutes'
      });
    }

    // Traffic congestion analysis
    const slowBuses = buses.filter(bus => (bus as any).currentSpeed < 15);
    if (slowBuses.length > 3) {
      insights.push({
        id: 'traffic-optimization-1',
        type: 'optimization',
        priority: 'medium',
        title: 'Traffic Congestion Detected',
        description: `${slowBuses.length} buses moving below 15km/h - likely traffic congestion`,
        recommendation: 'Activate alternate route protocols - assign drivers Folake Adebisi and Emeka Okafor to bypass congested areas',
        impact: 'Reduce delay by 18 minutes per trip',
        confidence: 87,
        location: 'Ikeja Axis',
        route: 'Multiple Routes'
      });
    }

    // Peak hour prediction
    const currentHour = new Date().getHours();
    if (currentHour >= 7 && currentHour <= 9) {
      insights.push({
        id: 'peak-prediction-1',
        type: 'prediction',
        priority: 'high',
        title: 'Morning Rush Hour Peak Incoming',
        description: 'Passenger demand expected to increase 340% in next 30 minutes',
        recommendation: 'Deploy 5 additional buses with drivers Chioma Nwachukwu, Yusuf Ibrahim, Funmi Oluwaseun, Tunde Bakare, and Amina Hassan across all routes within 15 minutes',
        impact: 'Prevent overcrowding and maintain service quality',
        confidence: 95,
        location: 'All Major Terminals',
        eta: '8-15 minutes'
      });
    }

    // Alert pattern analysis
    if (alerts.length > 2) {
      insights.push({
        id: 'alert-pattern-1',
        type: 'alert',
        priority: 'medium',
        title: 'Elevated Security Alert Pattern',
        description: `${alerts.length} active alerts detected - above normal threshold`,
        recommendation: 'Increase security patrols and deploy rapid response teams',
        impact: 'Enhance passenger safety and reduce incident response time',
        confidence: 78,
        location: 'System-wide'
      });
    }

    // Route efficiency optimization
    insights.push({
      id: 'efficiency-1',
      type: 'optimization',
      priority: 'low',
      title: 'Route Efficiency Optimization',
      description: 'AI analysis suggests minor route adjustments for Route 4',
      recommendation: 'Adjust stop timing at Ketu Station by +2 minutes with driver Olumide Ogundipe',
      impact: 'Improve overall route punctuality by 12%',
      confidence: 83,
      route: 'Route 4 (Ketu-Ikorodu)'
    });

    // Maintenance scheduling insight
    insights.push({
      id: 'maintenance-schedule-1',
      type: 'optimization',
      priority: 'medium',
      title: 'Preventive Maintenance Scheduling',
      description: '4 buses approaching scheduled maintenance intervals',
      recommendation: 'Schedule maintenance for BRT005, BRT009, BRT011, and BRT013 during off-peak hours with backup drivers Fatima Yusuf, Chidi Okwu, Blessing Ikenna, and Uche Okafor',
      impact: 'Prevent unexpected breakdowns and maintain 99% fleet availability',
      confidence: 95,
      location: 'Maintenance Depot',
      route: 'Routes 2, 3, 4, 5',
      eta: '48-72 hours'
    });

    // Driver performance optimization
    insights.push({
      id: 'driver-performance-1',
      type: 'optimization',
      priority: 'medium',
      title: 'Driver Performance Enhancement',
      description: 'Identified opportunities for fuel efficiency improvements',
      recommendation: 'Deploy eco-driving training for drivers Kelechi Nwachukwu, Aisha Mohammed, Rotimi Adebayo, and Hauwa Ibrahim to reduce fuel consumption',
      impact: 'Reduce fuel costs by 15% and improve passenger comfort',
      confidence: 88,
      location: 'Training Center',
      route: 'All Routes'
    });

    // Weather impact analysis
    insights.push({
      id: 'weather-impact-1',
      type: 'prediction',
      priority: 'medium',
      title: 'Weather Impact Assessment',
      description: 'Afternoon heat expected to affect passenger comfort and AC load',
      recommendation: 'Deploy additional buses with enhanced AC systems and assign experienced drivers Maryam Bello, Victor Eze, Grace Okonkwo, and Segun Ogundimu',
      impact: 'Maintain passenger satisfaction during peak heat hours',
      confidence: 82,
      location: 'All Air-Conditioned Routes',
      eta: '2-3 hours'
    });

    // Security enhancement insight
    insights.push({
      id: 'security-enhancement-1',
      type: 'alert',
      priority: 'high',
      title: 'Security Protocol Enhancement',
      description: 'Enhanced security measures recommended for evening operations',
      recommendation: 'Deploy security-trained drivers Bukola Adeyemi, Chioma Nwachukwu, and Tunde Bakare for night shifts with emergency response protocols',
      impact: 'Ensure passenger safety and driver confidence during evening hours',
      confidence: 92,
      location: 'All Night Routes',
      route: 'Routes 1, 2, 3'
    });

    // Weather-based insights
    const weatherCondition = Math.random() > 0.7 ? 'rain' : 'clear';
    if (weatherCondition === 'rain') {
      insights.push({
        id: 'weather-1',
        type: 'deployment',
        priority: 'medium',
        title: 'Weather Impact Mitigation',
        description: 'Rain forecast detected - increased travel demand expected',
        recommendation: 'Pre-position 3 buses at major terminals before rain starts',
        impact: 'Maintain service levels during adverse weather',
        confidence: 89,
        eta: '25 minutes'
      });
    }

    return insights;
  };

  const insights = generateInsights();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deployment': return <MapPin className="w-4 h-4" />;
      case 'optimization': return <Zap className="w-4 h-4" />;
      case 'alert': return <AlertTriangle className="w-4 h-4" />;
      case 'prediction': return <TrendingUp className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const implementInsight = (insightId: string) => {
    setImplementedInsights(prev => new Set([...prev, insightId]));
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border-2 border-green-200 dark:border-green-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg text-white">
              <Brain className="w-4 h-4" />
            </div>
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent font-bold">
              AI Fleet Intelligence
            </span>
            <Badge variant="secondary" className="ml-2">
              {insights.length} Insights
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-6 w-6 p-0"
              onClick={() => window.dispatchEvent(new CustomEvent('closeAIInsights'))}
            >
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.map((insight) => {
            const isImplemented = implementedInsights.has(insight.id);
            
            return (
              <Card 
                key={insight.id}
                className={`transition-all duration-200 hover:shadow-md cursor-pointer border ${
                  selectedInsight?.id === insight.id 
                    ? 'ring-2 ring-blue-500 border-blue-300' 
                    : 'hover:border-gray-300'
                } ${isImplemented ? 'bg-green-50 border-green-200' : ''}`}
                onClick={() => setSelectedInsight(insight)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center justify-center w-6 h-6 rounded ${
                        isImplemented ? 'bg-green-500' : 'bg-gray-100'
                      }`}>
                        {isImplemented ? (
                          <CheckCircle className="w-4 h-4 text-white" />
                        ) : (
                          getTypeIcon(insight.type)
                        )}
                      </div>
                      <h3 className={`font-semibold text-sm ${
                        isImplemented ? 'text-green-800' : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {insight.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${getPriorityColor(insight.priority)}`}>
                        {insight.priority.toUpperCase()}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {insight.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        {insight.confidence}% confidence
                      </span>
                      {insight.eta && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          ETA: {insight.eta}
                        </span>
                      )}
                    </div>
                    {!isImplemented && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          implementInsight(insight.id);
                        }}
                      >
                        Implement
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>

      {/* Detailed insight view */}
      {selectedInsight && (
        <Card className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              {getTypeIcon(selectedInsight.type)}
              Detailed Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-1">Recommendation</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {selectedInsight.recommendation}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm mb-1">Expected Impact</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {selectedInsight.impact}
              </p>
            </div>

            {selectedInsight.location && (
              <div>
                <h4 className="font-semibold text-sm mb-1">Location</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {selectedInsight.location}
                </p>
              </div>
            )}

            {selectedInsight.route && (
              <div>
                <h4 className="font-semibold text-sm mb-1">Affected Route</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {selectedInsight.route}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-xs text-gray-500">
                AI Confidence: {selectedInsight.confidence}%
              </span>
              {!implementedInsights.has(selectedInsight.id) && (
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => implementInsight(selectedInsight.id)}
                >
                  Implement Now
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}