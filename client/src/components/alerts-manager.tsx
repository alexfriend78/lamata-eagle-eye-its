import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, X, ArrowUp, Clock, Shield, AlertOctagon } from "lucide-react";
import { type AlertWithDetails } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface AlertsManagerProps {
  onClose: () => void;
}

export default function AlertsManager({ onClose }: AlertsManagerProps) {
  const queryClient = useQueryClient();

  // Fetch all alerts (both active and inactive)
  const { data: allAlerts = [] } = useQuery<AlertWithDetails[]>({
    queryKey: ['/api/alerts'],
    refetchInterval: 2000
  });

  // Separate alerts by status
  const activeAlerts = allAlerts.filter(alert => alert.isActive);
  const clearedAlerts = allAlerts.filter(alert => alert.status === 'cleared' && !alert.isActive);
  const escalatedAlerts = allAlerts.filter(alert => alert.status === 'escalated' && !alert.isActive);
  const acknowledgedAlerts = allAlerts.filter(alert => alert.status === 'acknowledged' && !alert.isActive);

  // Mutations for alert actions
  const clearAlertMutation = useMutation({
    mutationFn: (alertId: number) => apiRequest(`/api/alerts/${alertId}/clear`, "PATCH"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/buses'] });
    }
  });

  const escalateAlertMutation = useMutation({
    mutationFn: (alertId: number) => apiRequest(`/api/alerts/${alertId}/escalate`, "PATCH"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/buses'] });
    }
  });

  const acknowledgeAlertMutation = useMutation({
    mutationFn: (alertId: number) => apiRequest(`/api/alerts/${alertId}/acknowledge`, "PATCH"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/buses'] });
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
      case 'p1':
        return 'bg-red-600';
      case 'high':
      case 'p2':
        return 'bg-orange-600';
      case 'medium':
      case 'p3':
        return 'bg-yellow-600';
      case 'low':
      case 'p4':
      case 'p5':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  const AlertCard = ({ alert, showActions = true }: { alert: AlertWithDetails; showActions?: boolean }) => (
    <Card key={alert.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge className={`${getPriorityColor(alert.priority)} text-white`}>
              {alert.priority?.toUpperCase() || 'MEDIUM'} PRIORITY
            </Badge>
            <Badge variant="outline" className="text-xs">
              {alert.type?.toUpperCase()}
            </Badge>
            <span className="text-sm text-gray-500">
              {new Date(alert.timestamp).toLocaleString()}
            </span>
          </div>
          {alert.bus && (
            <Badge variant="secondary">
              Bus {alert.bus.busNumber}
            </Badge>
          )}
        </div>
        
        <p className="text-gray-800 dark:text-gray-200 mb-3 font-medium">
          {alert.message}
        </p>
        
        {alert.driverName && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Driver: {alert.driverName} {alert.driverNumber && `(${alert.driverNumber})`}
          </p>
        )}

        {alert.route && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Route: {alert.route.routeNumber} - {alert.route.name}
          </p>
        )}
        
        {showActions && (
          <div className="flex gap-2">
            {alert.isActive && (
              <>
                <Button
                  onClick={() => clearAlertMutation.mutate(alert.id)}
                  disabled={clearAlertMutation.isPending}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {clearAlertMutation.isPending ? 'Clearing...' : 'Clear'}
                </Button>
                <Button
                  onClick={() => escalateAlertMutation.mutate(alert.id)}
                  disabled={escalateAlertMutation.isPending}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <ArrowUp className="w-4 h-4 mr-1" />
                  {escalateAlertMutation.isPending ? 'Escalating...' : 'Escalate'}
                </Button>
                <Button
                  onClick={() => acknowledgeAlertMutation.mutate(alert.id)}
                  disabled={acknowledgeAlertMutation.isPending}
                  size="sm"
                  variant="outline"
                >
                  <Shield className="w-4 h-4 mr-1" />
                  {acknowledgeAlertMutation.isPending ? 'Acknowledging...' : 'Acknowledge'}
                </Button>
              </>
            )}
            {!alert.isActive && alert.status === 'acknowledged' && (
              <Button
                onClick={() => clearAlertMutation.mutate(alert.id)}
                disabled={clearAlertMutation.isPending}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                {clearAlertMutation.isPending ? 'Clearing...' : 'Clear Alert'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl bg-white dark:bg-gray-800 max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              Alert Management Center
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300">
              Monitor and manage all system alerts across the transit network
            </p>
          </div>
          <Button 
            onClick={onClose} 
            variant="ghost" 
            size="sm"
            className="hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[75vh]">
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="active" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Active ({activeAlerts.length})
              </TabsTrigger>
              <TabsTrigger value="cleared" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Cleared ({clearedAlerts.length})
              </TabsTrigger>
              <TabsTrigger value="escalated" className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4" />
                Escalated ({escalatedAlerts.length})
              </TabsTrigger>
              <TabsTrigger value="acknowledged" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Acknowledged ({acknowledgedAlerts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-6">
              <div className="space-y-4">
                {activeAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      No Active Alerts
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      All systems are operating normally
                    </p>
                  </div>
                ) : (
                  activeAlerts
                    .sort((a, b) => {
                      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3, P1: 0, P2: 1, P3: 2, P4: 3, P5: 4 };
                      return (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 5) - 
                             (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 5);
                    })
                    .map(alert => <AlertCard key={alert.id} alert={alert} />)
                )}
              </div>
            </TabsContent>

            <TabsContent value="cleared" className="mt-6">
              <div className="space-y-4">
                {clearedAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      No Cleared Alerts
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Cleared alerts will appear here
                    </p>
                  </div>
                ) : (
                  clearedAlerts
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map(alert => <AlertCard key={alert.id} alert={alert} showActions={false} />)
                )}
              </div>
            </TabsContent>

            <TabsContent value="escalated" className="mt-6">
              <div className="space-y-4">
                {escalatedAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertOctagon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      No Escalated Alerts
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Escalated alerts will appear here
                    </p>
                  </div>
                ) : (
                  escalatedAlerts
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map(alert => <AlertCard key={alert.id} alert={alert} showActions={false} />)
                )}
              </div>
            </TabsContent>

            <TabsContent value="acknowledged" className="mt-6">
              <div className="space-y-4">
                {acknowledgedAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      No Acknowledged Alerts
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Acknowledged alerts will appear here
                    </p>
                  </div>
                ) : (
                  acknowledgedAlerts
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map(alert => <AlertCard key={alert.id} alert={alert} showActions={true} />)
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}