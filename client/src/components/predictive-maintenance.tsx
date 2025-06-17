import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingDown,
  TrendingUp,
  Gauge,
  Thermometer,
  Zap,
  Fuel,
  Settings,
  Calendar,
  BarChart3,
  Shield,
  X
} from "lucide-react";
import type { Bus } from "@shared/schema";

interface MaintenanceRecord {
  id: number;
  busId: number;
  type: 'routine' | 'preventive' | 'corrective' | 'emergency';
  component: string;
  description: string;
  scheduledDate: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedCost: number;
  estimatedDuration: number; // in hours
}

interface BusDiagnostics {
  busId: number;
  busNumber: string;
  healthScore: number; // 0-100
  mileage: number;
  engineHours: number;
  lastService: string;
  nextService: string;
  components: {
    engine: ComponentHealth;
    transmission: ComponentHealth;
    brakes: ComponentHealth;
    suspension: ComponentHealth;
    electrical: ComponentHealth;
    hvac: ComponentHealth;
    doors: ComponentHealth;
    tires: ComponentHealth;
  };
  predictedFailures: PredictedFailure[];
  maintenanceAlerts: MaintenanceAlert[];
}

interface ComponentHealth {
  name: string;
  healthScore: number;
  lastChecked: string;
  nextCheck: string;
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  wearLevel: number; // 0-100%
  estimatedLifeRemaining: number; // in days
}

interface PredictedFailure {
  component: string;
  probability: number; // 0-100%
  estimatedDate: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendedAction: string;
}

interface MaintenanceAlert {
  type: 'overdue' | 'due_soon' | 'inspection_required' | 'component_warning';
  message: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  daysUntilDue: number;
}

interface PredictiveMaintenanceProps {
  buses: Bus[];
  theme: "light" | "dark";
  onClose: () => void;
}

export default function PredictiveMaintenance({ buses, theme, onClose }: PredictiveMaintenanceProps) {
  const [selectedBus, setSelectedBus] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [diagnostics, setDiagnostics] = useState<BusDiagnostics[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);

  // Generate stable diagnostic data for buses (seeded by bus ID)
  const generateDiagnostics = (): BusDiagnostics[] => {
    return buses.map(bus => {
      // Use bus ID as seed for consistent values
      const seed = bus.id * 1000;
      const baseHealth = Math.floor((seed % 30)) + 70; // 70-100
      const mileage = Math.floor((seed % 500000)) + 50000; // 50k-550k km
      const engineHours = Math.floor(mileage / 25); // Approximate engine hours
      
      const generateComponentHealth = (baseScore: number, componentId: number, variance: number = 15): ComponentHealth => {
        const componentSeed = seed + componentId * 100;
        const randomValue = (componentSeed % 100) / 100 - 0.5; // Stable random between -0.5 and 0.5
        const healthScore = Math.max(0, Math.min(100, baseScore + randomValue * variance));
        const wearLevel = 100 - healthScore;
        let status: ComponentHealth['status'];
        
        if (healthScore >= 90) status = 'excellent';
        else if (healthScore >= 75) status = 'good';
        else if (healthScore >= 60) status = 'fair';
        else if (healthScore >= 40) status = 'poor';
        else status = 'critical';
        
        const lastCheckedDays = (componentSeed % 30) + 1;
        const nextCheckDays = (componentSeed % 30) + 30;
        
        return {
          name: '',
          healthScore,
          lastChecked: new Date(Date.now() - lastCheckedDays * 24 * 60 * 60 * 1000).toISOString(),
          nextCheck: new Date(Date.now() + nextCheckDays * 24 * 60 * 60 * 1000).toISOString(),
          status,
          wearLevel,
          estimatedLifeRemaining: Math.floor((healthScore / 100) * 365) // Days based on health
        };
      };

      const components = {
        engine: { ...generateComponentHealth(baseHealth, 1), name: 'Engine' },
        transmission: { ...generateComponentHealth(baseHealth, 2), name: 'Transmission' },
        brakes: { ...generateComponentHealth(baseHealth - 5, 3), name: 'Brakes' },
        suspension: { ...generateComponentHealth(baseHealth, 4), name: 'Suspension' },
        electrical: { ...generateComponentHealth(baseHealth + 5, 5), name: 'Electrical' },
        hvac: { ...generateComponentHealth(baseHealth, 6), name: 'HVAC' },
        doors: { ...generateComponentHealth(baseHealth - 3, 7), name: 'Doors' },
        tires: { ...generateComponentHealth(baseHealth - 10, 8), name: 'Tires' }
      };

      // Generate predicted failures
      const predictedFailures: PredictedFailure[] = [];
      Object.entries(components).forEach(([key, component]) => {
        if (component.healthScore < 70) {
          const probability = Math.max(10, 100 - component.healthScore);
          const daysUntilFailure = Math.floor((component.healthScore / 100) * 90);
          
          predictedFailures.push({
            component: component.name,
            probability,
            estimatedDate: new Date(Date.now() + daysUntilFailure * 24 * 60 * 60 * 1000).toISOString(),
            severity: component.healthScore < 40 ? 'critical' : 
                     component.healthScore < 55 ? 'high' : 'medium',
            recommendedAction: component.healthScore < 40 ? 
              `Immediate replacement required for ${component.name}` :
              `Schedule preventive maintenance for ${component.name}`
          });
        }
      });

      // Generate maintenance alerts
      const maintenanceAlerts: MaintenanceAlert[] = [];
      const daysSinceLastService = Math.floor((Date.now() - new Date(components.engine.lastChecked).getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastService > 90) {
        maintenanceAlerts.push({
          type: 'overdue',
          message: 'Regular service is overdue',
          urgency: 'high',
          daysUntilDue: -daysSinceLastService + 90
        });
      } else if (daysSinceLastService > 75) {
        maintenanceAlerts.push({
          type: 'due_soon',
          message: 'Regular service due soon',
          urgency: 'medium',
          daysUntilDue: 90 - daysSinceLastService
        });
      }

      // Add component-specific alerts
      Object.entries(components).forEach(([key, component]) => {
        if (component.healthScore < 50) {
          maintenanceAlerts.push({
            type: 'component_warning',
            message: `${component.name} requires attention`,
            urgency: component.healthScore < 30 ? 'critical' : 'high',
            daysUntilDue: component.estimatedLifeRemaining
          });
        }
      });

      return {
        busId: bus.id,
        busNumber: bus.busNumber,
        healthScore: Math.floor(Object.values(components).reduce((sum, comp) => sum + comp.healthScore, 0) / 8),
        mileage,
        engineHours,
        lastService: components.engine.lastChecked,
        nextService: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        components,
        predictedFailures,
        maintenanceAlerts
      };
    });
  };

  // Generate stable maintenance records
  const generateMaintenanceRecords = (): MaintenanceRecord[] => {
    const records: MaintenanceRecord[] = [];
    const maintenanceTypes = ['routine', 'preventive', 'corrective', 'emergency'] as const;
    const components = ['Engine', 'Brakes', 'Transmission', 'Tires', 'HVAC', 'Doors', 'Electrical'];
    
    buses.forEach(bus => {
      // Use bus ID as seed for consistent records
      const busBaseSeed = bus.id * 10000;
      const recordCount = (busBaseSeed % 3) + 3; // 3-5 records per bus
      
      for (let i = 0; i < recordCount; i++) {
        const recordSeed = busBaseSeed + i * 1000;
        const type = maintenanceTypes[recordSeed % maintenanceTypes.length];
        const component = components[recordSeed % components.length];
        const dayOffset = ((recordSeed % 120) - 60); // -60 to +60 days
        const scheduledDate = new Date(Date.now() + dayOffset * 24 * 60 * 60 * 1000);
        
        let status: MaintenanceRecord['status'];
        let priority: MaintenanceRecord['priority'];
        
        if (scheduledDate < new Date()) {
          status = (recordSeed % 10) > 3 ? 'completed' : 'overdue';
        } else {
          status = (recordSeed % 10) > 8 ? 'in_progress' : 'scheduled';
        }
        
        if (type === 'emergency') priority = 'critical';
        else if (type === 'corrective') priority = 'high';
        else if (type === 'preventive') priority = 'medium';
        else priority = 'low';
        
        records.push({
          id: records.length + 1,
          busId: bus.id,
          type,
          component,
          description: `${type} maintenance for ${component}`,
          scheduledDate: scheduledDate.toISOString(),
          status,
          priority,
          estimatedCost: 0, // Remove cost display
          estimatedDuration: (recordSeed % 8) + 2
        });
      }
    });
    
    return records.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  };

  useEffect(() => {
    setDiagnostics(generateDiagnostics());
    setMaintenanceRecords(generateMaintenanceRecords());
  }, [buses]);

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getHealthBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-gray-100 text-gray-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const criticalBuses = diagnostics.filter(d => d.healthScore < 50).length;
  const upcomingMaintenance = maintenanceRecords.filter(r => 
    r.status === 'scheduled' && 
    new Date(r.scheduledDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ).length;
  const overdueMaintenance = maintenanceRecords.filter(r => r.status === 'overdue').length;

  return (
    <div className={`fixed inset-0 z-50 ${theme === 'dark' ? 'bg-black/80' : 'bg-white/80'} backdrop-blur-sm`}>
      <div className={`fixed right-0 top-0 h-full w-[1000px] ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'} border-l shadow-2xl overflow-y-auto`}>
        
        {/* Header */}
        <div className={`sticky top-0 z-10 ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'} border-b p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-600 rounded-lg">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Predictive Maintenance
                </h2>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  AI-powered fleet health monitoring and maintenance optimization
                </p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className={`${theme === 'dark' ? 'border-gray-600 text-gray-400 hover:text-white' : ''} h-8 w-8 p-0`}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Button
              variant="outline"
              className={`h-auto p-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'hover:bg-gray-50'}`}
              onClick={() => setActiveTab('overview')}
            >
              <div className="flex items-center space-x-2 w-full">
                <Shield className={`w-5 h-5 ${getHealthColor(diagnostics.reduce((sum, d) => sum + d.healthScore, 0) / diagnostics.length || 0)}`} />
                <div className="text-left">
                  <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {Math.floor(diagnostics.reduce((sum, d) => sum + d.healthScore, 0) / diagnostics.length || 0)}%
                  </div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Fleet Health
                  </div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className={`h-auto p-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'hover:bg-gray-50'}`}
              onClick={() => setActiveTab('overview')}
            >
              <div className="flex items-center space-x-2 w-full">
                <AlertTriangle className={`w-5 h-5 ${criticalBuses > 0 ? 'text-red-600' : 'text-green-600'}`} />
                <div className="text-left">
                  <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {criticalBuses}
                  </div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Critical Buses
                  </div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className={`h-auto p-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'hover:bg-gray-50'}`}
              onClick={() => setActiveTab('maintenance')}
            >
              <div className="flex items-center space-x-2 w-full">
                <Calendar className={`w-5 h-5 ${upcomingMaintenance > 0 ? 'text-yellow-600' : 'text-green-600'}`} />
                <div className="text-left">
                  <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {upcomingMaintenance}
                  </div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Due This Week
                  </div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className={`h-auto p-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'hover:bg-gray-50'}`}
              onClick={() => setActiveTab('maintenance')}
            >
              <div className="flex items-center space-x-2 w-full">
                <Clock className={`w-5 h-5 ${overdueMaintenance > 0 ? 'text-red-600' : 'text-green-600'}`} />
                <div className="text-left">
                  <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {overdueMaintenance}
                  </div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Overdue
                  </div>
                </div>
              </div>
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className={`grid w-full grid-cols-4 ${theme === 'dark' ? 'bg-gray-800' : ''}`}>
              <TabsTrigger value="overview">Fleet Overview</TabsTrigger>
              <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="predictions">Predictions</TabsTrigger>
            </TabsList>

            {/* Fleet Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {diagnostics.map((diagnostic) => (
                  <Card 
                    key={diagnostic.busId} 
                    className={`cursor-pointer transition-all ${
                      selectedBus === diagnostic.busId ? 'ring-2 ring-blue-500' : ''
                    } ${theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'hover:bg-gray-50'}`}
                    onClick={() => setSelectedBus(diagnostic.busId)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className={`text-lg flex items-center justify-between ${theme === 'dark' ? 'text-white' : ''}`}>
                        <span>{diagnostic.busNumber}</span>
                        <Badge className={getPriorityColor(
                          diagnostic.healthScore < 50 ? 'critical' :
                          diagnostic.healthScore < 70 ? 'high' :
                          diagnostic.healthScore < 85 ? 'medium' : 'low'
                        )}>
                          {diagnostic.healthScore < 50 ? 'Critical' :
                           diagnostic.healthScore < 70 ? 'Attention' :
                           diagnostic.healthScore < 85 ? 'Good' : 'Excellent'}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Health Score
                        </span>
                        <span className={`font-bold ${getHealthColor(diagnostic.healthScore)}`}>
                          {diagnostic.healthScore}%
                        </span>
                      </div>
                      
                      <Progress 
                        value={diagnostic.healthScore} 
                        className="h-2"
                      />
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Mileage:</span>
                          <span className={`ml-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                            {diagnostic.mileage.toLocaleString()} km
                          </span>
                        </div>
                        <div>
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Alerts:</span>
                          <span className={`ml-1 font-medium ${
                            diagnostic.maintenanceAlerts.length > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {diagnostic.maintenanceAlerts.length}
                          </span>
                        </div>
                      </div>

                      {diagnostic.maintenanceAlerts.length > 0 && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Next Alert:
                          </div>
                          <div className="text-xs text-red-600 mt-1">
                            {diagnostic.maintenanceAlerts[0].message}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Diagnostics Tab */}
            <TabsContent value="diagnostics" className="space-y-4">
              {selectedBus ? (
                (() => {
                  const diagnostic = diagnostics.find(d => d.busId === selectedBus);
                  if (!diagnostic) return <div>Bus not found</div>;
                  
                  return (
                    <div className="space-y-4">
                      <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
                        <CardHeader>
                          <CardTitle className={`flex items-center ${theme === 'dark' ? 'text-white' : ''}`}>
                            <Gauge className="w-5 h-5 mr-2" />
                            {diagnostic.busNumber} - Component Health
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {Object.entries(diagnostic.components).map(([key, component]) => (
                            <div key={key} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                                  {component.name}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <Badge className={
                                    component.status === 'excellent' ? 'bg-green-100 text-green-800' :
                                    component.status === 'good' ? 'bg-blue-100 text-blue-800' :
                                    component.status === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                                    component.status === 'poor' ? 'bg-orange-100 text-orange-800' :
                                    'bg-red-100 text-red-800'
                                  }>
                                    {component.status}
                                  </Badge>
                                  <span className={`font-bold ${getHealthColor(component.healthScore)}`}>
                                    {component.healthScore}%
                                  </span>
                                </div>
                              </div>
                              <Progress value={component.healthScore} className="h-2" />
                              <div className="flex justify-between text-xs">
                                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                  Wear: {component.wearLevel}%
                                </span>
                                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                  Est. life: {component.estimatedLifeRemaining} days
                                </span>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })()
              ) : (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Select a bus from the Fleet Overview to view detailed diagnostics
                </div>
              )}
            </TabsContent>

            {/* Maintenance Tab */}
            <TabsContent value="maintenance" className="space-y-4">
              <div className="space-y-3">
                {maintenanceRecords.slice(0, 10).map((record) => {
                  const bus = buses.find(b => b.id === record.busId);
                  return (
                    <Card key={record.id} className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded ${
                              record.type === 'emergency' ? 'bg-red-100' :
                              record.type === 'corrective' ? 'bg-orange-100' :
                              record.type === 'preventive' ? 'bg-blue-100' :
                              'bg-gray-100'
                            }`}>
                              {record.type === 'emergency' ? <AlertTriangle className="w-4 h-4 text-red-600" /> :
                               record.type === 'corrective' ? <Wrench className="w-4 h-4 text-orange-600" /> :
                               record.type === 'preventive' ? <Settings className="w-4 h-4 text-blue-600" /> :
                               <CheckCircle className="w-4 h-4 text-gray-600" />}
                            </div>
                            <div>
                              <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {bus?.busNumber} - {record.component}
                              </div>
                              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {record.description}
                              </div>
                              <div className="flex items-center space-x-4 mt-1 text-xs">
                                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                  {new Date(record.scheduledDate).toLocaleDateString()}
                                </span>
                                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                  {record.estimatedDuration}h
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getPriorityColor(record.priority)}>
                              {record.priority}
                            </Badge>
                            <Badge className={getStatusColor(record.status)}>
                              {record.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Predictions Tab */}
            <TabsContent value="predictions" className="space-y-4">
              {diagnostics.filter(d => d.predictedFailures.length > 0).map((diagnostic) => (
                <Card key={diagnostic.busId} className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
                  <CardHeader>
                    <CardTitle className={`flex items-center ${theme === 'dark' ? 'text-white' : ''}`}>
                      <BarChart3 className="w-5 h-5 mr-2" />
                      {diagnostic.busNumber} - Predicted Failures
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {diagnostic.predictedFailures.map((failure, index) => (
                      <div key={index} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {failure.component}
                          </span>
                          <Badge className={getPriorityColor(failure.severity)}>
                            {failure.probability}% probability
                          </Badge>
                        </div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {failure.recommendedAction}
                        </div>
                        <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Estimated date: {new Date(failure.estimatedDate).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
              
              {diagnostics.filter(d => d.predictedFailures.length > 0).length === 0 && (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  No critical predictions at this time. Fleet is in good condition.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}