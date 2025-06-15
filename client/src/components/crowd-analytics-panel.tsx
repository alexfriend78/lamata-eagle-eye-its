import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import type { CrowdAnalytics, CrowdPrediction, Station } from "@shared/schema";

interface CrowdAnalyticsPanelProps {
  selectedStation: Station | null;
  isOpen: boolean;
  onClose: () => void;
  theme: "light" | "dark";
}

export default function CrowdAnalyticsPanel({ 
  selectedStation, 
  isOpen, 
  onClose, 
  theme 
}: CrowdAnalyticsPanelProps) {
  const [predictions, setPredictions] = useState<CrowdPrediction[]>([]);

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/stations', selectedStation?.id, 'crowd-analytics'],
    enabled: !!selectedStation && isOpen,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: crowdReadings } = useQuery({
    queryKey: ['/api/crowd-density'],
    queryFn: () => fetch(`/api/crowd-density?stationId=${selectedStation?.id}`).then(res => res.json()),
    enabled: !!selectedStation && isOpen,
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  const generatePredictions = async () => {
    if (!selectedStation) return;
    
    try {
      const response = await fetch('/api/predictions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stationId: selectedStation.id, routeId: 1 })
      });
      const newPredictions = await response.json();
      setPredictions(newPredictions);
    } catch (error) {
      console.error('Error generating predictions:', error);
    }
  };

  const getDensityColor = (density: string) => {
    switch (density) {
      case "low": return "bg-green-500";
      case "medium": return "bg-yellow-500";  
      case "high": return "bg-orange-500";
      case "critical": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getDensityTextColor = (density: string) => {
    switch (density) {
      case "low": return "text-green-600";
      case "medium": return "text-yellow-600";
      case "high": return "text-orange-600";
      case "critical": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen || !selectedStation) return null;

  const typedAnalytics = analytics as CrowdAnalytics;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} 
        rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto`}>
        
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Crowd Analytics - {selectedStation.name}
          </h2>
          <Button variant="ghost" onClick={onClose}>✕</Button>
        </div>

        <div className="p-6 space-y-6">
          {analyticsLoading ? (
            <div className="text-center py-8">Loading analytics...</div>
          ) : typedAnalytics ? (
            <>
              {/* Current Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Current Density</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge className={`${getDensityColor(typedAnalytics.currentDensity)} text-white`}>
                        {typedAnalytics.currentDensity.toUpperCase()}
                      </Badge>
                      <span className="text-2xl font-bold">
                        {typedAnalytics.passengerCount}/{typedAnalytics.capacity}
                      </span>
                    </div>
                    <Progress 
                      value={typedAnalytics.utilizationRate} 
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {typedAnalytics.utilizationRate.toFixed(1)}% capacity
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Historical Average</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="text-2xl font-bold">
                        {Math.round(typedAnalytics.historicalAverage)}
                      </span>
                      <span className="text-sm text-gray-500">passengers</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      {typedAnalytics.currentDensity === "critical" ? (
                        <>
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="text-red-600 font-semibold">Overcrowded</span>
                        </>
                      ) : (
                        <>
                          <Users className="w-4 h-4 text-green-500" />
                          <span className="text-green-600 font-semibold">Normal</span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Peak Times */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Peak Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {typedAnalytics.peakTimes.slice(0, 8).map((peak, index) => (
                      <div key={index} className="text-center p-3 rounded border">
                        <div className="font-semibold">{peak.hour}:00</div>
                        <Badge 
                          variant="outline" 
                          className={`mt-1 ${getDensityTextColor(peak.avgDensity)}`}
                        >
                          {peak.avgDensity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Predictions */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Crowd Predictions
                  </CardTitle>
                  <Button onClick={generatePredictions} size="sm">
                    Generate New Predictions
                  </Button>
                </CardHeader>
                <CardContent>
                  {(predictions.length > 0 || typedAnalytics.predictions.length > 0) ? (
                    <div className="space-y-3">
                      {(predictions.length > 0 ? predictions : typedAnalytics.predictions).map((prediction, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded border">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">
                              {formatTime(prediction.predictedTime)}
                            </span>
                            <Badge className={`${getDensityColor(prediction.predictedDensity)} text-white`}>
                              {prediction.predictedDensity}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {prediction.predictedPassengerCount} passengers
                            </div>
                            <div className="text-sm text-gray-500">
                              {Math.round(prediction.confidence * 100)}% confidence
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No predictions available. Click "Generate New Predictions" to create forecasts.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Readings */}
              {crowdReadings && crowdReadings.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Readings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {crowdReadings.slice(0, 5).map((reading: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded border">
                          <div className="flex items-center gap-3">
                            <span className="text-sm">
                              {formatTime(reading.timestamp)}
                            </span>
                            <Badge variant="outline" className={getDensityTextColor(reading.densityLevel)}>
                              {reading.densityLevel}
                            </Badge>
                          </div>
                          <div className="text-sm">
                            {reading.passengerCount}/{reading.capacity} passengers
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No analytics data available for this station.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}