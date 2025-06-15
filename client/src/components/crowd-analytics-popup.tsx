import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, TrendingUp, Clock, AlertTriangle, BarChart3, Activity } from "lucide-react";
import { type Station, type CrowdDensityReading } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

interface CrowdAnalyticsPopupProps {
  station: Station | null;
  isOpen: boolean;
  onClose: () => void;
}

interface CrowdAnalytics {
  avgDensity: number;
  peakTimes: Array<{ hour: number; avgDensity: string }>;
  hourlyPattern: Array<{ hour: number; density: number }>;
  predictions: Array<{
    timeMinutes: number;
    predictedCount: number;
    confidence: number;
  }>;
  currentReading?: CrowdDensityReading;
}

export default function CrowdAnalyticsPopup({ station, isOpen, onClose }: CrowdAnalyticsPopupProps) {
  // Fetch detailed analytics for the station
  const { data: analytics, isLoading } = useQuery<CrowdAnalytics>({
    queryKey: ['/api/crowd/analytics', station?.id],
    enabled: !!station && isOpen,
  });

  // Fetch current crowd density reading
  const { data: currentReading } = useQuery<CrowdDensityReading>({
    queryKey: ['/api/crowd/latest', station?.id],
    enabled: !!station && isOpen,
    refetchInterval: 5000,
  });

  // Fetch crowd predictions for this station
  const { data: predictions = [] } = useQuery<any[]>({
    queryKey: ['/api/crowd/predictions', station?.id],
    enabled: !!station && isOpen,
  });

  if (!station) return null;

  const getDensityColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDensityLabel = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'Low Density';
      case 'medium': return 'Medium Density';
      case 'high': return 'High Density';
      case 'critical': return 'Critical Density';
      default: return 'Unknown';
    }
  };

  const getCapacityPercentage = (count: number, capacity: number) => {
    return Math.min((count / capacity) * 100, 100);
  };

  const formatTime = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${ampm}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {station.name} - Crowd Analytics
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card rounded-lg p-4 border">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Current Density</h3>
                </div>
                {currentReading ? (
                  <>
                    <div className="text-2xl font-bold mb-2">
                      {currentReading.passengerCount} / {currentReading.capacity}
                    </div>
                    <Progress 
                      value={getCapacityPercentage(currentReading.passengerCount, currentReading.capacity)} 
                      className="mb-2"
                    />
                    <Badge 
                      className={`${getDensityColor(currentReading.densityLevel)} text-white`}
                    >
                      {getDensityLabel(currentReading.densityLevel)}
                    </Badge>
                  </>
                ) : (
                  <div className="text-muted-foreground">No current reading available</div>
                )}
              </div>

              <div className="bg-card rounded-lg p-4 border">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Average Daily Density</h3>
                </div>
                <div className="text-2xl font-bold mb-2">
                  {analytics?.avgDensity || 0}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Based on historical patterns
                </div>
              </div>
            </div>

            {/* Crowd Predictions */}
            {predictions.length > 0 && (
              <div className="bg-card rounded-lg p-4 border">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">15-Minute Predictions</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {predictions.slice(0, 4).map((prediction, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">{prediction.predictedPassengerCount} passengers</div>
                          <div className="text-sm text-muted-foreground">
                            {prediction.predictionTimeMinutes} min forecast
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {prediction.confidenceLevel}% confidence
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Peak Times */}
            <div className="bg-card rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Peak Times Today</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {analytics?.peakTimes?.slice(0, 4).map((peak, index) => (
                  <div key={index} className="text-center p-3 bg-muted rounded-lg">
                    <div className="font-semibold">{formatTime(peak.hour)}</div>
                    <Badge 
                      variant="secondary" 
                      className={`mt-1 ${getDensityColor(peak.avgDensity)} text-white`}
                    >
                      {getDensityLabel(peak.avgDensity)}
                    </Badge>
                  </div>
                )) || (
                  <div className="col-span-full text-center text-muted-foreground">
                    No peak time data available
                  </div>
                )}
              </div>
            </div>

            {/* Hourly Pattern Chart */}
            <div className="bg-card rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">24-Hour Density Pattern</h3>
              </div>
              <div className="h-32 flex items-end justify-between gap-1">
                {analytics?.hourlyPattern?.map((hour, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="bg-primary w-full rounded-t"
                      style={{ 
                        height: `${Math.max(hour.density, 5)}%`,
                        minHeight: '4px'
                      }}
                    ></div>
                    <div className="text-xs mt-1 text-muted-foreground">
                      {hour.hour % 4 === 0 ? formatTime(hour.hour) : ''}
                    </div>
                  </div>
                )) || (
                  <div className="flex items-center justify-center w-full h-full">
                    <span className="text-muted-foreground">No pattern data available</span>
                  </div>
                )}
              </div>
            </div>

            {/* Predictions */}
            <div className="bg-card rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Crowd Predictions</h3>
              </div>
              <div className="space-y-3">
                {analytics?.predictions?.map((prediction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">+{prediction.timeMinutes} min</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm">{prediction.predictedCount} passengers</span>
                      <Badge variant="outline" className="text-xs">
                        {prediction.confidence}% confidence
                      </Badge>
                    </div>
                  </div>
                )) || (
                  <div className="text-center text-muted-foreground py-4">
                    No prediction data available
                  </div>
                )}
              </div>
            </div>

            {/* Station Details */}
            <div className="bg-card rounded-lg p-4 border">
              <h3 className="font-semibold mb-3">Station Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Zone:</span>
                  <span className="ml-2 font-medium">Zone {station.zone}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Capacity:</span>
                  <span className="ml-2 font-medium">{currentReading?.capacity || 70} passengers</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Current Count:</span>
                  <span className="ml-2 font-medium">{currentReading?.passengerCount || 0} passengers</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span className="ml-2 font-medium">
                    {currentReading ? new Date(currentReading.timestamp).toLocaleTimeString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}