import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle, X, ArrowUp, Clock, Shield, AlertOctagon, Info, MapPin, Phone, User } from "lucide-react";
import { type AlertWithDetails } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface AlertsManagerProps {
  onClose: () => void;
}

export default function AlertsManager({ onClose }: AlertsManagerProps) {
  const queryClient = useQueryClient();
  const [selectedAlert, setSelectedAlert] = useState<AlertWithDetails | null>(null);

  // Fetch all alerts (both active and inactive)
  const { data: allAlerts = [] } = useQuery<AlertWithDetails[]>({
    queryKey: ['/api/alerts', 'includeAll'],
    queryFn: () => fetch('/api/alerts?includeAll=true').then(res => res.json()),
    refetchInterval: 2000
  });

  // Separate alerts by status
  const activeAlerts = allAlerts.filter(alert => alert.isActive && alert.status === 'active');
  const clearedAlerts = allAlerts.filter(alert => alert.status === 'cleared');
  const closedAlerts = allAlerts.filter(alert => alert.status === 'closed');
  const escalatedAlerts = allAlerts.filter(alert => alert.status === 'escalated');
  const acknowledgedAlerts = allAlerts.filter(alert => alert.status === 'acknowledged');

  // Mutations for alert actions
  const clearAlertMutation = useMutation({
    mutationFn: (alertId: number) => apiRequest("PATCH", `/api/alerts/${alertId}/clear`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/buses'] });
    }
  });

  const escalateAlertMutation = useMutation({
    mutationFn: (alertId: number) => apiRequest("PATCH", `/api/alerts/${alertId}/escalate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/buses'] });
    }
  });

  const acknowledgeAlertMutation = useMutation({
    mutationFn: (alertId: number) => apiRequest("PATCH", `/api/alerts/${alertId}/acknowledge`),
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
    <Card 
      key={alert.id} 
      className="mb-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => setSelectedAlert(alert)}
    >
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
        
        {/* Show operator info for cleared/closed alerts */}
        {(alert.status === 'cleared' || alert.status === 'closed' || alert.status === 'escalated' || alert.status === 'acknowledged') && (
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>
              {alert.status === 'cleared' && 'Cleared by: '}
              {alert.status === 'closed' && 'Closed by: '}
              {alert.status === 'escalated' && 'Escalated by: '}
              {alert.status === 'acknowledged' && 'Acknowledged by: '}
              <span className="font-medium">Operator Sarah Chen</span>
            </span>
          </div>
        )}

        {showActions && (
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
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
            <TabsList className="grid w-full grid-cols-5">
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
              <TabsTrigger value="closed" className="flex items-center gap-2">
                <X className="w-4 h-4" />
                Closed ({closedAlerts.length})
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

            <TabsContent value="closed" className="mt-6">
              <div className="space-y-4">
                {closedAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <X className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      No Closed Alerts
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Closed alerts will appear here
                    </p>
                  </div>
                ) : (
                  closedAlerts
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map(alert => <AlertCard key={alert.id} alert={alert} showActions={false} />)
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Alert Details Modal */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Alert Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedAlert && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Alert Type</label>
                  <p className="text-lg font-semibold capitalize">{selectedAlert.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Priority</label>
                  <Badge className={`${getPriorityColor(selectedAlert.priority)} text-white`}>
                    {selectedAlert.priority?.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Severity</label>
                  <Badge variant={selectedAlert.severity === 'critical' ? 'destructive' : 'secondary'}>
                    {selectedAlert.severity}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <Badge variant={selectedAlert.isActive ? 'destructive' : 'secondary'}>
                    {selectedAlert.status}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Message</label>
                <p className="text-gray-800 dark:text-gray-200 mt-1">{selectedAlert.message}</p>
              </div>

              {selectedAlert.bus && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Bus Information
                    </label>
                    <p className="text-gray-800 dark:text-gray-200">
                      Bus #{selectedAlert.bus.busNumber}
                    </p>
                  </div>
                  {selectedAlert.route && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Route</label>
                      <p className="text-gray-800 dark:text-gray-200">
                        {selectedAlert.route.routeNumber} - {selectedAlert.route.name}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {selectedAlert.driverName && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Driver
                    </label>
                    <p className="text-gray-800 dark:text-gray-200">{selectedAlert.driverName}</p>
                  </div>
                  {selectedAlert.driverNumber && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        Contact
                      </label>
                      <p className="text-gray-800 dark:text-gray-200">{selectedAlert.driverNumber}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-gray-800 dark:text-gray-200">
                    {new Date(selectedAlert.createdAt).toLocaleString()}
                  </p>
                </div>
                {selectedAlert.zoneNumber && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Zone</label>
                    <p className="text-gray-800 dark:text-gray-200">{selectedAlert.zoneNumber}</p>
                  </div>
                )}
              </div>

              {selectedAlert.isActive && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => {
                      clearAlertMutation.mutate(selectedAlert.id);
                      setSelectedAlert(null);
                    }}
                    variant="destructive"
                    disabled={clearAlertMutation.isPending}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear Alert
                  </Button>
                  <Button
                    onClick={() => {
                      escalateAlertMutation.mutate(selectedAlert.id);
                      setSelectedAlert(null);
                    }}
                    variant="outline"
                    disabled={escalateAlertMutation.isPending}
                  >
                    <ArrowUp className="w-4 h-4 mr-1" />
                    Escalate
                  </Button>
                  <Button
                    onClick={() => {
                      acknowledgeAlertMutation.mutate(selectedAlert.id);
                      setSelectedAlert(null);
                    }}
                    variant="secondary"
                    disabled={acknowledgeAlertMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Acknowledge
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}