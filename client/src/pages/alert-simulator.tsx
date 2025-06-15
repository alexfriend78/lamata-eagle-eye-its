import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle, XCircle, Clock, Info, ArrowLeft, Monitor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Route, Bus, Station, AlertWithDetails } from "@shared/schema";

const ALERT_TYPES = [
  { value: "emergency", label: "Emergency", icon: AlertTriangle, color: "text-red-600" },
  { value: "medical", label: "Medical", icon: AlertTriangle, color: "text-red-500" },
  { value: "security", label: "Security", icon: AlertTriangle, color: "text-orange-600" },
  { value: "breakdown", label: "Breakdown", icon: XCircle, color: "text-yellow-600" },
  { value: "traffic", label: "Traffic", icon: Clock, color: "text-blue-600" },
  { value: "maintenance", label: "Maintenance", icon: Info, color: "text-gray-600" }
];

const PRIORITIES = [
  { value: "P1", label: "P1 - Critical", color: "bg-red-100 text-red-800 border-red-300" },
  { value: "P2", label: "P2 - High", color: "bg-red-50 text-red-700 border-red-200" },
  { value: "P3", label: "P3 - Medium", color: "bg-amber-100 text-amber-800 border-amber-300" },
  { value: "P4", label: "P4 - Low", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "P5", label: "P5 - Info", color: "bg-gray-100 text-gray-700 border-gray-300" }
];

const SEVERITIES = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" }
];

const ZONES = ["Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5"];

export default function AlertSimulator() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    type: "",
    message: "",
    priority: "",
    severity: "",
    busId: "",
    routeId: "",
    driverName: "",
    driverNumber: "",
    lastStopId: "",
    nextStopId: "",
    zoneNumber: ""
  });

  // Fetch data for dropdowns
  const { data: routes = [] } = useQuery<Route[]>({ queryKey: ["/api/routes"] });
  const { data: buses = [] } = useQuery<Bus[]>({ queryKey: ["/api/buses"] });
  const { data: stations = [] } = useQuery<Station[]>({ queryKey: ["/api/stations"] });
  const { data: alerts = [] } = useQuery<AlertWithDetails[]>({ queryKey: ["/api/alerts"] });

  // Create alert mutation
  const createAlertMutation = useMutation({
    mutationFn: (alertData: any) => apiRequest("POST", "/api/alerts", alertData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Alert Created",
        description: "Emergency alert has been sent to the dashboard",
      });
      // Reset form
      setFormData({
        type: "",
        message: "",
        priority: "",
        severity: "",
        busId: "",
        routeId: "",
        driverName: "",
        driverNumber: "",
        lastStopId: "",
        nextStopId: "",
        zoneNumber: ""
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create alert",
        variant: "destructive"
      });
    }
  });

  // Acknowledge alert mutation
  const acknowledgeAlertMutation = useMutation({
    mutationFn: (alertId: number) => apiRequest("PATCH", `/api/alerts/${alertId}/acknowledge`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Alert Acknowledged",
        description: "Alert has been acknowledged and removed from dashboard",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.message || !formData.priority || !formData.severity) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const alertData = {
      ...formData,
      busId: formData.busId ? parseInt(formData.busId) : null,
      routeId: formData.routeId ? parseInt(formData.routeId) : null,
      lastStopId: formData.lastStopId ? parseInt(formData.lastStopId) : null,
      nextStopId: formData.nextStopId ? parseInt(formData.nextStopId) : null,
      isActive: true
    };

    createAlertMutation.mutate(alertData);
  };

  const handleQuickAlert = (type: string, priority: string, message: string) => {
    const randomBus = buses[Math.floor(Math.random() * buses.length)];
    const randomRoute = routes[Math.floor(Math.random() * routes.length)];
    const randomStation = stations[Math.floor(Math.random() * stations.length)];
    
    const alertData = {
      type,
      message,
      priority,
      severity: priority === "P1" ? "critical" : priority === "P2" ? "high" : "medium",
      busId: randomBus?.id || null,
      routeId: randomRoute?.id || null,
      driverName: "John Adebayo",
      driverNumber: "+234-8012-345-678",
      lastStopId: randomStation?.id || null,
      nextStopId: stations[Math.floor(Math.random() * stations.length)]?.id || null,
      zoneNumber: ZONES[Math.floor(Math.random() * ZONES.length)],
      isActive: true
    };

    createAlertMutation.mutate(alertData);
  };

  const activeAlerts = alerts.filter(alert => alert.isActive);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Emergency Alert Simulator
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Create and manage emergency alerts for the bus monitoring dashboard
            </p>
          </div>
          <Link href="/">
            <Button variant="default" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              View Dashboard
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alert Creation Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Create New Alert
              </CardTitle>
              <CardDescription>
                Fill out the form below to send an emergency alert to the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Alert Type */}
                <div>
                  <Label htmlFor="type">Alert Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select alert type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ALERT_TYPES.map(type => {
                        const Icon = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${type.color}`} />
                              {type.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div>
                  <Label htmlFor="priority">Priority *</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map(priority => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <Badge variant="outline" className={priority.color}>
                            {priority.label}
                          </Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Severity */}
                <div>
                  <Label htmlFor="severity">Severity *</Label>
                  <Select value={formData.severity} onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEVERITIES.map(severity => (
                        <SelectItem key={severity.value} value={severity.value}>
                          {severity.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Message */}
                <div>
                  <Label htmlFor="message">Alert Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter detailed alert message..."
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                  />
                </div>

                {/* Bus and Route Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="busId">Bus</Label>
                    <Select value={formData.busId} onValueChange={(value) => setFormData(prev => ({ ...prev, busId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bus" />
                      </SelectTrigger>
                      <SelectContent>
                        {buses.map(bus => (
                          <SelectItem key={bus.id} value={bus.id.toString()}>
                            {bus.busNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="routeId">Route</Label>
                    <Select value={formData.routeId} onValueChange={(value) => setFormData(prev => ({ ...prev, routeId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select route" />
                      </SelectTrigger>
                      <SelectContent>
                        {routes.map(route => (
                          <SelectItem key={route.id} value={route.id.toString()}>
                            Route {route.routeNumber} - {route.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Driver Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="driverName">Driver Name</Label>
                    <Input
                      id="driverName"
                      placeholder="John Adebayo"
                      value={formData.driverName}
                      onChange={(e) => setFormData(prev => ({ ...prev, driverName: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="driverNumber">Driver Phone</Label>
                    <Input
                      id="driverNumber"
                      placeholder="+234-8012-345-678"
                      value={formData.driverNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, driverNumber: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Station Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lastStopId">Last Station</Label>
                    <Select value={formData.lastStopId} onValueChange={(value) => setFormData(prev => ({ ...prev, lastStopId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select last station" />
                      </SelectTrigger>
                      <SelectContent>
                        {stations.map(station => (
                          <SelectItem key={station.id} value={station.id.toString()}>
                            {station.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="nextStopId">Next Station</Label>
                    <Select value={formData.nextStopId} onValueChange={(value) => setFormData(prev => ({ ...prev, nextStopId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select next station" />
                      </SelectTrigger>
                      <SelectContent>
                        {stations.map(station => (
                          <SelectItem key={station.id} value={station.id.toString()}>
                            {station.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Zone */}
                <div>
                  <Label htmlFor="zoneNumber">Zone</Label>
                  <Select value={formData.zoneNumber} onValueChange={(value) => setFormData(prev => ({ ...prev, zoneNumber: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {ZONES.map(zone => (
                        <SelectItem key={zone} value={zone}>
                          {zone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={createAlertMutation.isPending}
                >
                  {createAlertMutation.isPending ? "Creating Alert..." : "Send Alert to Dashboard"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quick Actions and Active Alerts */}
          <div className="space-y-6">
            {/* Quick Alert Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Alert Templates</CardTitle>
                <CardDescription>
                  Send pre-configured alerts with one click
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    onClick={() => handleQuickAlert("emergency", "P1", "CRITICAL: Fire emergency - immediate evacuation required")}
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={createAlertMutation.isPending}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    P1 Critical Emergency
                  </Button>

                  <Button
                    onClick={() => handleQuickAlert("medical", "P1", "URGENT: Medical emergency - ambulance dispatched")}
                    className="w-full bg-red-500 hover:bg-red-600"
                    disabled={createAlertMutation.isPending}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    P1 Medical Emergency
                  </Button>

                  <Button
                    onClick={() => handleQuickAlert("security", "P3", "Security incident reported - passenger disturbance")}
                    className="w-full bg-amber-600 hover:bg-amber-700"
                    disabled={createAlertMutation.isPending}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    P3 Security Alert
                  </Button>

                  <Button
                    onClick={() => handleQuickAlert("breakdown", "P4", "Minor mechanical issue - running behind schedule")}
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                    disabled={createAlertMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    P4 Breakdown Alert
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Active Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Active Alerts
                  <Badge variant="secondary">
                    {activeAlerts.length} active
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Currently active alerts on the dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeAlerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                    <p>No active alerts</p>
                    <p className="text-sm">Dashboard is clear</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeAlerts.map(alert => {
                      const priority = PRIORITIES.find(p => p.value === alert.priority);
                      const alertType = ALERT_TYPES.find(t => t.value === alert.type);
                      const Icon = alertType?.icon || AlertTriangle;
                      
                      return (
                        <div
                          key={alert.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${alertType?.color || 'text-gray-600'}`} />
                              <Badge variant="outline" className={priority?.color}>
                                {alert.priority}
                              </Badge>
                              <span className="text-sm font-medium capitalize">
                                {alert.type}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => acknowledgeAlertMutation.mutate(alert.id)}
                              disabled={acknowledgeAlertMutation.isPending}
                            >
                              Acknowledge
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {alert.message}
                          </p>
                          {alert.bus && (
                            <p className="text-xs text-gray-500">
                              Bus: {alert.bus.busNumber} | Zone: {alert.zoneNumber}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}