import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Leaf, 
  Car, 
  Bus, 
  TreePine,
  Droplets,
  Wind,
  Calculator,
  TrendingDown,
  Globe,
  X,
  Users,
  Clock,
  MapPin
} from "lucide-react";
import { type Bus as BusType, type Route, type Station } from "@shared/schema";

interface EcoImpactCalculatorProps {
  buses: BusType[];
  routes: Route[];
  stations: Station[];
  theme: "light" | "dark";
  onClose: () => void;
}

interface EcoMetrics {
  co2Saved: number;
  airPollutantsReduced: number;
  fuelSaved: number;
  moneySaved: number;
  treesEquivalent: number;
  particlesMatterReduced: number;
}

interface TransitUsageInputs {
  tripsPerWeek: number;
  averageDistance: number;
  carType: 'small' | 'medium' | 'large' | 'suv';
  transitMode: 'bus' | 'mixed';
}

export default function EcoImpactCalculator({ 
  buses, 
  routes, 
  stations, 
  theme, 
  onClose 
}: EcoImpactCalculatorProps) {
  const [activeTab, setActiveTab] = useState("calculator");
  const [inputs, setInputs] = useState<TransitUsageInputs>({
    tripsPerWeek: 10,
    averageDistance: 12,
    carType: 'medium',
    transitMode: 'bus'
  });
  const [ecoMetrics, setEcoMetrics] = useState<EcoMetrics | null>(null);

  // Emission factors (kg CO2 per km)
  const emissionFactors = {
    small: 0.12,
    medium: 0.15,
    large: 0.18,
    suv: 0.22,
    bus: 0.08
  };

  // Fuel consumption (liters per 100km)
  const fuelConsumption = {
    small: 6.5,
    medium: 8.0,
    large: 10.5,
    suv: 12.0,
    bus: 2.5
  };

  // Air pollutant factors (grams per km)
  const pollutantFactors = {
    small: { nox: 0.4, pm25: 0.02 },
    medium: { nox: 0.5, pm25: 0.025 },
    large: { nox: 0.6, pm25: 0.03 },
    suv: { nox: 0.7, pm25: 0.035 },
    bus: { nox: 0.15, pm25: 0.008 }
  };

  const calculateEcoImpact = (): EcoMetrics => {
    const { tripsPerWeek, averageDistance, carType } = inputs;
    const annualDistance = tripsPerWeek * averageDistance * 52;
    
    // Car emissions if driving
    const carCO2 = annualDistance * emissionFactors[carType];
    const carFuel = (annualDistance / 100) * fuelConsumption[carType];
    const carPollutants = annualDistance * (pollutantFactors[carType].nox + pollutantFactors[carType].pm25) / 1000;
    
    // Transit emissions
    const transitCO2 = annualDistance * emissionFactors.bus;
    const transitFuel = (annualDistance / 100) * fuelConsumption.bus;
    const transitPollutants = annualDistance * (pollutantFactors.bus.nox + pollutantFactors.bus.pm25) / 1000;
    
    // Savings
    const co2Saved = carCO2 - transitCO2;
    const fuelSaved = carFuel - transitFuel;
    const airPollutantsReduced = carPollutants - transitPollutants;
    
    // Economic calculations (Nigerian prices)
    const fuelPricePerLiter = 617;
    const moneySaved = fuelSaved * fuelPricePerLiter;
    
    // Environmental equivalents
    const treesEquivalent = co2Saved / 22;
    const particlesMatterReduced = annualDistance * (pollutantFactors[carType].pm25 - pollutantFactors.bus.pm25) / 1000;

    return {
      co2Saved: Math.max(0, co2Saved),
      airPollutantsReduced: Math.max(0, airPollutantsReduced),
      fuelSaved: Math.max(0, fuelSaved),
      moneySaved: Math.max(0, moneySaved),
      treesEquivalent: Math.max(0, treesEquivalent),
      particlesMatterReduced: Math.max(0, particlesMatterReduced)
    };
  };

  useEffect(() => {
    const newMetrics = calculateEcoImpact();
    setEcoMetrics(newMetrics);
  }, [inputs]);

  const getSystemwideMetrics = () => {
    const totalBuses = buses.length;
    const avgPassengersPerBus = 35;
    const avgDailyDistance = 180;
    const operatingDays = 300;
    
    const annualSystemDistance = totalBuses * avgDailyDistance * operatingDays;
    const totalPassengers = totalBuses * avgPassengersPerBus;
    
    const systemCarCO2 = annualSystemDistance * emissionFactors.medium * avgPassengersPerBus;
    const systemBusCO2 = annualSystemDistance * emissionFactors.bus * avgPassengersPerBus;
    const systemCO2Saved = systemCarCO2 - systemBusCO2;
    
    return {
      totalCO2Saved: systemCO2Saved / 1000,
      equivalentTrees: systemCO2Saved / 22,
      dailyPassengers: totalPassengers,
      busesInService: totalBuses
    };
  };

  const systemMetrics = getSystemwideMetrics();

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-black/80' : 'bg-black/50'}`}>
      <div className={`w-full max-w-5xl h-[90vh] rounded-lg shadow-2xl ${theme === 'dark' ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
              <Leaf className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Eco-Impact Calculator
              </h2>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Environmental Benefits of Public Transit Usage
              </p>
            </div>
          </div>
          
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="calculator" className="flex items-center space-x-2">
                <Calculator className="h-4 w-4" />
                <span>Personal Calculator</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>System Impact</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center space-x-2">
                <TrendingDown className="h-4 w-4" />
                <span>Environmental Insights</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calculator" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Section */}
                <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <CardHeader>
                    <CardTitle className={`flex items-center space-x-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <Calculator className="h-5 w-5" />
                      <span>Your Transit Usage</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Trips per week
                      </Label>
                      <Input
                        type="number"
                        value={inputs.tripsPerWeek}
                        onChange={(e) => setInputs({...inputs, tripsPerWeek: parseInt(e.target.value) || 0})}
                        min="1"
                        max="50"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Average distance per trip (km)
                      </Label>
                      <Input
                        type="number"
                        value={inputs.averageDistance}
                        onChange={(e) => setInputs({...inputs, averageDistance: parseFloat(e.target.value) || 0})}
                        min="1"
                        max="100"
                        step="0.5"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Your car type (alternative)
                      </Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {[
                          { key: 'small', label: 'Small Car', icon: <Car className="h-4 w-4" /> },
                          { key: 'medium', label: 'Medium Car', icon: <Car className="h-4 w-4" /> },
                          { key: 'large', label: 'Large Car', icon: <Car className="h-4 w-4" /> },
                          { key: 'suv', label: 'SUV', icon: <Car className="h-4 w-4" /> }
                        ].map((type) => (
                          <Button
                            key={type.key}
                            variant={inputs.carType === type.key ? "default" : "outline"}
                            size="sm"
                            onClick={() => setInputs({...inputs, carType: type.key as any})}
                            className="flex items-center space-x-2"
                          >
                            {type.icon}
                            <span className="text-xs">{type.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Results Section */}
                <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <CardHeader>
                    <CardTitle className={`flex items-center space-x-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <Leaf className="h-5 w-5" />
                      <span>Annual Environmental Impact</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {ecoMetrics && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                          <div className="flex items-center space-x-3">
                            <Wind className="h-5 w-5 text-green-600" />
                            <span className="font-medium">CO₂ Saved</span>
                          </div>
                          <span className="text-lg font-bold text-green-600">
                            {ecoMetrics.co2Saved.toFixed(1)} kg
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                          <div className="flex items-center space-x-3">
                            <Droplets className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">Fuel Saved</span>
                          </div>
                          <span className="text-lg font-bold text-blue-600">
                            {ecoMetrics.fuelSaved.toFixed(1)} L
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                          <div className="flex items-center space-x-3">
                            <TreePine className="h-5 w-5 text-purple-600" />
                            <span className="font-medium">Trees Equivalent</span>
                          </div>
                          <span className="text-lg font-bold text-purple-600">
                            {ecoMetrics.treesEquivalent.toFixed(1)} trees
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                          <div className="flex items-center space-x-3">
                            <span className="text-yellow-600 font-bold">₦</span>
                            <span className="font-medium">Money Saved</span>
                          </div>
                          <span className="text-lg font-bold text-yellow-600">
                            ₦{ecoMetrics.moneySaved.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="system" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <Bus className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold">{systemMetrics.busesInService}</p>
                        <p className="text-sm text-gray-500">Active Buses</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <Users className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold">{systemMetrics.dailyPassengers.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">Daily Passengers</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <Wind className="h-8 w-8 text-purple-600" />
                      <div>
                        <p className="text-2xl font-bold">{systemMetrics.totalCO2Saved.toFixed(0)}</p>
                        <p className="text-sm text-gray-500">Tonnes CO₂ Saved/Year</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <TreePine className="h-8 w-8 text-green-700" />
                      <div>
                        <p className="text-2xl font-bold">{systemMetrics.equivalentTrees.toFixed(0)}</p>
                        <p className="text-sm text-gray-500">Trees Planted Equivalent</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className={`mt-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <CardHeader>
                  <CardTitle className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Lagos BRT System Environmental Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {systemMetrics.totalCO2Saved.toFixed(0)}
                      </div>
                      <p className="text-sm text-gray-500">Tonnes CO₂ reduced annually by the entire BRT system</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {((systemMetrics.totalCO2Saved * 1000) / 2.3).toFixed(0)}
                      </div>
                      <p className="text-sm text-gray-500">Cars taken off the road equivalent</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        ₦{(systemMetrics.totalCO2Saved * 1000 * 617 / 2.3).toLocaleString()}
                      </div>
                      <p className="text-sm text-gray-500">Naira saved in fuel costs system-wide</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <CardHeader>
                    <CardTitle className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Environmental Benefits of Public Transit
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Wind className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Air Quality Improvement</h4>
                        <p className="text-sm text-gray-500">
                          Public buses reduce nitrogen oxides and particulate matter by up to 75% per passenger compared to private cars.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Droplets className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Fuel Efficiency</h4>
                        <p className="text-sm text-gray-500">
                          A single bus can replace up to 40 private cars, significantly reducing fuel consumption and emissions.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <TreePine className="h-5 w-5 text-green-700 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Carbon Footprint</h4>
                        <p className="text-sm text-gray-500">
                          Transit users produce 45% less CO₂ emissions compared to driving alone.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <CardHeader>
                    <CardTitle className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Lagos Specific Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Traffic Congestion</h4>
                        <p className="text-sm text-gray-500">
                          BRT reduces traffic by removing an estimated 200,000 private trips daily from Lagos roads.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Time Savings</h4>
                        <p className="text-sm text-gray-500">
                          Dedicated bus lanes reduce average commute time by 30% compared to regular traffic.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Globe className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Urban Air Quality</h4>
                        <p className="text-sm text-gray-500">
                          Lagos BRT contributes to 15% reduction in city-wide vehicle emissions in covered areas.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className={`mt-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <CardHeader>
                  <CardTitle className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Take Action for the Environment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
                      <Bus className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <h4 className="font-medium mb-1">Choose Transit</h4>
                      <p className="text-xs text-gray-500">Use BRT for daily commutes</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
                      <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h4 className="font-medium mb-1">Share & Inspire</h4>
                      <p className="text-xs text-gray-500">Encourage others to use public transit</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-center">
                      <Calculator className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <h4 className="font-medium mb-1">Track Impact</h4>
                      <p className="text-xs text-gray-500">Monitor your environmental savings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}