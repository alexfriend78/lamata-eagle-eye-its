import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { type SystemStats, type AlertWithDetails, type Route } from "@shared/schema";

interface ControlPanelProps {
  stats?: SystemStats;
  alerts: AlertWithDetails[];
  routes: Route[];
  onRefresh: () => void;
  theme: "light" | "dark";
}

export default function ControlPanel({ stats, alerts, routes, onRefresh, theme }: ControlPanelProps) {
  const { toast } = useToast();

  const simulateAlertMutation = useMutation({
    mutationFn: async () => {
      const alertTypes = ["emergency", "delay", "breakdown", "security"];
      const messages = [
        "Emergency stop - Medical assistance required",
        "Security Alert - Suspicious activity reported", 
        "Medical Alert - Medical assistance needed",
        "Technical Alert - Vehicle breakdown reported"
      ];
      
      const randomType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      const randomRoute = routes[Math.floor(Math.random() * routes.length)];
      
      return apiRequest('POST', '/api/alerts', {
        routeId: randomRoute?.id,
        type: randomType,
        message: randomMessage,
        severity: randomType === "emergency" ? "critical" : "medium"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Alert Simulated",
        description: "A new alert has been created for testing purposes.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to simulate alert.",
        variant: "destructive",
      });
    }
  });

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    let alertDate: Date;
    
    if (typeof date === 'string') {
      alertDate = new Date(date);
    } else if (date instanceof Date) {
      alertDate = date;
    } else {
      // Handle cases where date might be null, undefined, or invalid
      return "unknown";
    }
    
    // Check if the date is valid
    if (isNaN(alertDate.getTime())) {
      return "unknown";
    }
    
    const diffMinutes = Math.floor((now.getTime() - alertDate.getTime()) / (1000 * 60));
    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h ago`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "border-red-600 bg-red-900/30";
      case "high": return "border-orange-600 bg-orange-900/30";
      case "medium": return "border-yellow-600 bg-yellow-900/30";
      default: return "border-gray-600 bg-gray-900/30";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on_time": return "text-green-400";
      case "delayed": return "text-yellow-400";
      case "alert": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        System Monitor
      </h2>
      
      {/* System Status */}
      <div>
        <h3 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          SYSTEM STATUS
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Total Buses
            </span>
            <span className="text-lg font-semibold text-blue-500">
              {stats?.totalBuses || 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Active Routes
            </span>
            <span className="text-lg font-semibold text-blue-500">
              {stats?.activeRoutes || 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              On Time
            </span>
            <span className="text-lg font-semibold text-green-500">
              {stats?.onTimePercentage || 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Bus Status Legend */}
      <div>
        <h3 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          BUS STATUS
        </h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <span className="text-xl text-green-500">🚌</span>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              On Time
            </span>
            <span className={`text-xs ml-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {stats?.onTimeBuses || 0} buses
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xl text-yellow-500">🚌</span>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Delayed
            </span>
            <span className={`text-xs ml-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {stats?.delayedBuses || 0} buses
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xl text-red-500">🚌</span>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Alert
            </span>
            <span className={`text-xs ml-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {stats?.alertBuses || 0} buses
            </span>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      <div>
        <h3 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          ACTIVE ALERTS
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {alerts.length === 0 ? (
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              No active alerts
            </p>
          ) : (
            alerts.map((alert) => (
              <div 
                key={alert.id}
                className={`border rounded-lg p-3 ${getSeverityColor(alert.severity)} ${
                  theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${getStatusColor(alert.type)}`}>
                    {alert.route ? `Route ${alert.route.routeNumber}` : "System"}
                  </span>
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatTimeAgo(alert.createdAt)}
                  </span>
                </div>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {alert.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Route Quick Access */}
      <div>
        <h3 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          ROUTES
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {routes.slice(0, 6).map((route) => (
            <Button
              key={route.id}
              variant="outline"
              size="sm"
              className={`text-xs p-2 h-8 ${
                theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600' 
                  : 'bg-white hover:bg-gray-100 text-gray-900 border-gray-300'
              }`}
              style={{ borderColor: route.color }}
            >
              {route.routeNumber}
            </Button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-3">
        <Button
          onClick={() => simulateAlertMutation.mutate()}
          disabled={simulateAlertMutation.isPending}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
        >
          {simulateAlertMutation.isPending ? "Creating..." : "Simulate Alert"}
        </Button>
        <Button
          onClick={onRefresh}
          variant="outline"
          className={`w-full ${
            theme === 'dark'
              ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
              : 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500'
          }`}
        >
          Refresh Data
        </Button>
      </div>
    </div>
  );
}
