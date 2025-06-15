import type { 
  Route, Station, Bus, Alert, RouteStation, BusArrival,
  InsertRoute, InsertStation, InsertBus, InsertAlert, InsertRouteStation, InsertBusArrival,
  BusWithRoute, AlertWithDetails, BusArrivalWithDetails, StationDetails, SystemStats
} from "../shared/schema.js";

export interface IStorage {
  // Routes
  getRoutes(): Promise<Route[]>;
  getRoute(id: number): Promise<Route | undefined>;
  createRoute(route: InsertRoute): Promise<Route>;
  updateRouteAesthetics(id: number, aesthetics: Partial<Route>): Promise<Route | undefined>;
  
  // Stations
  getStations(): Promise<Station[]>;
  getStation(id: number): Promise<Station | undefined>;
  getStationDetails(id: number): Promise<StationDetails | undefined>;
  createStation(station: InsertStation): Promise<Station>;
  updateStationPassengerCount(id: number, count: number): Promise<Station | undefined>;
  
  // Buses
  getBuses(): Promise<Bus[]>;
  getBusesWithRoutes(): Promise<BusWithRoute[]>;
  getBus(id: number): Promise<Bus | undefined>;
  createBus(bus: InsertBus): Promise<Bus>;
  updateBusPosition(id: number, x: number, y: number): Promise<Bus | undefined>;
  updateBusStatus(id: number, status: string): Promise<Bus | undefined>;
  
  // Alerts
  getActiveAlerts(): Promise<AlertWithDetails[]>;
  getAlert(id: number): Promise<Alert | undefined>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  acknowledgeAlert(id: number): Promise<Alert | undefined>;
  
  // Route Stations
  getRouteStations(routeId: number): Promise<Station[]>;
  addStationToRoute(routeStation: InsertRouteStation): Promise<RouteStation>;
  
  // Bus Arrivals
  getBusArrivals(stationId: number): Promise<BusArrivalWithDetails[]>;
  createBusArrival(arrival: InsertBusArrival): Promise<BusArrival>;
  updateArrivalStatus(id: number, status: string): Promise<BusArrival | undefined>;
  
  // System Stats
  getSystemStats(): Promise<SystemStats>;
  
  // Crowd Density Analytics
  getCrowdDensityReadings(stationId?: number, busId?: number): Promise<any[]>;
  getLatestCrowdDensity(stationId: number): Promise<any | undefined>;
  createCrowdDensityReading(reading: any): Promise<any>;
  getCrowdPredictions(stationId: number, routeId: number): Promise<any[]>;
  createCrowdPrediction(prediction: any): Promise<any>;
  getHistoricalPatterns(stationId: number, routeId: number): Promise<any[]>;
  updateHistoricalPattern(pattern: any): Promise<any>;
  getCrowdAnalytics(stationId: number): Promise<any>;
  generateCrowdPredictions(stationId: number, routeId: number): Promise<any[]>;
}

export class MemStorage implements IStorage {
  private routes: Map<number, Route>;
  private stations: Map<number, Station>;
  private buses: Map<number, Bus>;
  private alerts: Map<number, Alert>;
  private routeStations: Map<number, RouteStation>;
  private busArrivals: Map<number, BusArrival>;
  private crowdDensityReadings: Map<number, any>;
  private crowdPredictions: Map<number, any>;
  private historicalPatterns: Map<number, any>;
  private currentRouteId: number;
  private currentStationId: number;
  private currentBusId: number;
  private currentAlertId: number;
  private currentRouteStationId: number;
  private currentBusArrivalId: number;
  private currentCrowdReadingId: number;
  private currentPredictionId: number;
  private currentPatternId: number;

  constructor() {
    this.routes = new Map();
    this.stations = new Map();
    this.buses = new Map();
    this.alerts = new Map();
    this.routeStations = new Map();
    this.busArrivals = new Map();
    this.crowdDensityReadings = new Map();
    this.crowdPredictions = new Map();
    this.historicalPatterns = new Map();
    this.currentRouteId = 1;
    this.currentStationId = 1;
    this.currentBusId = 1;
    this.currentAlertId = 1;
    this.currentRouteStationId = 1;
    this.currentBusArrivalId = 1;
    this.currentCrowdReadingId = 1;
    this.currentPredictionId = 1;
    this.currentPatternId = 1;
    this.seedData();
  }

  private seedData() {
    // Seed routes
    const routeData = [
      { name: "BRT Blue Line", color: "#2563eb", startLocation: "Mile 12", endLocation: "CMS", isActive: true },
      { name: "BRT Red Line", color: "#dc2626", startLocation: "Oshodi", endLocation: "Abule Egba", isActive: true },
      { name: "Danfo Yellow Line", color: "#eab308", startLocation: "Ikeja", endLocation: "Lagos Island", isActive: true },
      { name: "LAGBUS Green Line", color: "#16a34a", startLocation: "Ikorodu", endLocation: "TBS", isActive: true },
      { name: "Molue Orange Line", color: "#ea580c", startLocation: "Badagry", endLocation: "Marina", isActive: false }
    ];

    routeData.forEach(route => {
      const newRoute: Route = { 
        id: this.currentRouteId++, 
        ...route,
        strokeWidth: 4,
        opacity: 0.8,
        dashPattern: null
      };
      this.routes.set(newRoute.id, newRoute);
    });

    // Seed stations
    const stationData = [
      { name: "Mile 12 Terminal", x: 100, y: 350, passengerCount: 150 },
      { name: "Berger Bus Stop", x: 150, y: 300, passengerCount: 89 },
      { name: "Ojota Terminal", x: 200, y: 250, passengerCount: 203 },
      { name: "Maryland Mall", x: 250, y: 200, passengerCount: 67 },
      { name: "National Theatre", x: 300, y: 150, passengerCount: 134 },
      { name: "CMS Terminal", x: 400, y: 100, passengerCount: 298 },
      { name: "Oshodi Interchange", x: 320, y: 280, passengerCount: 425 },
      { name: "Ikeja City Mall", x: 280, y: 320, passengerCount: 187 },
      { name: "Airport Road", x: 240, y: 360, passengerCount: 92 },
      { name: "Abule Egba Terminal", x: 180, y: 400, passengerCount: 156 },
      { name: "Lagos Island Terminal", x: 450, y: 80, passengerCount: 312 },
      { name: "Ikorodu Terminal", x: 80, y: 420, passengerCount: 234 },
      { name: "TBS Terminal", x: 380, y: 120, passengerCount: 267 },
      { name: "Marina Terminal", x: 480, y: 60, passengerCount: 398 },
      { name: "Badagry Terminal", x: 60, y: 450, passengerCount: 123 }
    ];

    stationData.forEach(station => {
      const newStation: Station = { id: this.currentStationId++, ...station };
      this.stations.set(newStation.id, newStation);
    });

    // Seed route-station relationships
    const routeStationData = [
      // BRT Blue Line (Route 1)
      { routeId: 1, stationId: 1, sequence: 1 },
      { routeId: 1, stationId: 2, sequence: 2 },
      { routeId: 1, stationId: 3, sequence: 3 },
      { routeId: 1, stationId: 4, sequence: 4 },
      { routeId: 1, stationId: 5, sequence: 5 },
      { routeId: 1, stationId: 6, sequence: 6 },
      
      // BRT Red Line (Route 2)
      { routeId: 2, stationId: 7, sequence: 1 },
      { routeId: 2, stationId: 8, sequence: 2 },
      { routeId: 2, stationId: 9, sequence: 3 },
      { routeId: 2, stationId: 10, sequence: 4 },
      
      // Danfo Yellow Line (Route 3)
      { routeId: 3, stationId: 8, sequence: 1 },
      { routeId: 3, stationId: 11, sequence: 2 },
      
      // LAGBUS Green Line (Route 4)
      { routeId: 4, stationId: 12, sequence: 1 },
      { routeId: 4, stationId: 13, sequence: 2 },
      
      // Molue Orange Line (Route 5)
      { routeId: 5, stationId: 15, sequence: 1 },
      { routeId: 5, stationId: 14, sequence: 2 }
    ];

    routeStationData.forEach(rs => {
      const newRouteStation: RouteStation = { id: this.currentRouteStationId++, ...rs };
      this.routeStations.set(newRouteStation.id, newRouteStation);
    });

    // Seed buses
    const busData = [
      { number: "BRT001", routeId: 1, x: 120, y: 340, status: "active" },
      { number: "BRT002", routeId: 1, x: 180, y: 280, status: "active" },
      { number: "BRT003", routeId: 2, x: 300, y: 300, status: "active" },
      { number: "DANFO001", routeId: 3, x: 290, y: 310, status: "maintenance" },
      { number: "LAGBUS001", routeId: 4, x: 90, y: 410, status: "active" },
      { number: "BRT004", routeId: 1, x: 220, y: 230, status: "active" },
      { number: "BRT005", routeId: 2, x: 260, y: 340, status: "delayed" },
      { number: "DANFO002", routeId: 3, x: 320, y: 290, status: "active" }
    ];

    busData.forEach(bus => {
      const newBus: Bus = { id: this.currentBusId++, ...bus };
      this.buses.set(newBus.id, newBus);
    });

    // Seed alerts
    const alertData = [
      { type: "traffic", message: "Heavy traffic on Oshodi-Abule Egba route", severity: "medium", isActive: true, routeId: 2, busId: null },
      { type: "maintenance", message: "Bus BRT002 scheduled for maintenance", severity: "low", isActive: true, routeId: 1, busId: 2 },
      { type: "delay", message: "Expected 15-minute delay on Blue Line", severity: "high", isActive: true, routeId: 1, busId: null }
    ];

    alertData.forEach(alert => {
      const newAlert: Alert = { 
        id: this.currentAlertId++, 
        ...alert,
        timestamp: new Date()
      };
      this.alerts.set(newAlert.id, newAlert);
    });

    // Seed crowd density readings
    this.seedCrowdData();

    // Start bus simulation
    this.simulateBusMovement();
  }

  private seedCrowdData() {
    // Generate realistic crowd density data for each station
    this.stations.forEach((station, stationId) => {
      const baseReading = {
        id: this.currentCrowdReadingId++,
        stationId: stationId,
        timestamp: new Date(),
        crowdLevel: Math.floor(Math.random() * 100),
        temperature: 25 + Math.random() * 10,
        humidity: 60 + Math.random() * 20,
        noiseLevel: 40 + Math.random() * 30
      };
      this.crowdDensityReadings.set(baseReading.id, baseReading);

      // Generate historical patterns
      for (let hour = 0; hour < 24; hour++) {
        const pattern = {
          id: this.currentPatternId++,
          stationId: stationId,
          routeId: 1,
          hour: hour,
          avgCrowdLevel: this.getHourlyPattern(hour),
          dayOfWeek: 1,
          month: new Date().getMonth() + 1
        };
        this.historicalPatterns.set(pattern.id, pattern);
      }

      // Generate initial predictions
      for (let i = 0; i < 5; i++) {
        const prediction = {
          id: this.currentPredictionId++,
          stationId: stationId,
          routeId: 1,
          predictedTime: new Date(Date.now() + (i + 1) * 30 * 60 * 1000),
          predictedCrowdLevel: Math.floor(Math.random() * 100),
          confidence: 0.7 + Math.random() * 0.3,
          factors: ['weather', 'time_of_day', 'historical_pattern']
        };
        this.crowdPredictions.set(prediction.id, prediction);
      }
    });
  }

  private getHourlyPattern(hour: number): number {
    // Rush hour patterns: 7-9 AM and 5-7 PM
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      return 70 + Math.random() * 30;
    }
    // Regular hours
    if (hour >= 10 && hour <= 16) {
      return 30 + Math.random() * 40;
    }
    // Off-peak hours
    return 10 + Math.random() * 30;
  }

  // Crowd Analytics Methods
  async getCrowdDensityReadings(stationId?: number, busId?: number): Promise<any[]> {
    const readings = Array.from(this.crowdDensityReadings.values());
    if (stationId) {
      return readings.filter(r => r.stationId === stationId);
    }
    if (busId) {
      return readings.filter(r => r.busId === busId);
    }
    return readings;
  }

  async getLatestCrowdDensity(stationId: number): Promise<any | undefined> {
    const readings = Array.from(this.crowdDensityReadings.values())
      .filter(r => r.stationId === stationId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return readings[0];
  }

  async createCrowdDensityReading(reading: any): Promise<any> {
    const newReading = {
      id: this.currentCrowdReadingId++,
      ...reading,
      timestamp: new Date()
    };
    this.crowdDensityReadings.set(newReading.id, newReading);
    return newReading;
  }

  async getCrowdPredictions(stationId: number, routeId: number): Promise<any[]> {
    return Array.from(this.crowdPredictions.values())
      .filter(p => p.stationId === stationId && p.routeId === routeId)
      .sort((a, b) => new Date(a.predictedTime).getTime() - new Date(b.predictedTime).getTime());
  }

  async createCrowdPrediction(prediction: any): Promise<any> {
    const newPrediction = {
      id: this.currentPredictionId++,
      ...prediction
    };
    this.crowdPredictions.set(newPrediction.id, newPrediction);
    return newPrediction;
  }

  async getHistoricalPatterns(stationId: number, routeId: number): Promise<any[]> {
    return Array.from(this.historicalPatterns.values())
      .filter(p => p.stationId === stationId && p.routeId === routeId)
      .sort((a, b) => a.hour - b.hour);
  }

  async updateHistoricalPattern(pattern: any): Promise<any> {
    if (pattern.id) {
      this.historicalPatterns.set(pattern.id, pattern);
      return pattern;
    } else {
      const newPattern = {
        id: this.currentPatternId++,
        ...pattern
      };
      this.historicalPatterns.set(newPattern.id, newPattern);
      return newPattern;
    }
  }

  async getCrowdAnalytics(stationId: number): Promise<any> {
    const currentReading = await this.getLatestCrowdDensity(stationId);
    const predictions = await this.getCrowdPredictions(stationId, 1);
    const patterns = await this.getHistoricalPatterns(stationId, 1);

    const currentHour = new Date().getHours();
    const currentPattern = patterns.find(p => p.hour === currentHour);

    return {
      stationId,
      currentCrowdLevel: currentReading?.crowdLevel || 0,
      currentTemperature: currentReading?.temperature || 25,
      currentHumidity: currentReading?.humidity || 60,
      predictions: predictions.slice(0, 5),
      hourlyPatterns: patterns,
      peakHours: patterns
        .filter(p => p.avgCrowdLevel > 70)
        .map(p => p.hour),
      averageCrowdLevel: patterns.reduce((sum, p) => sum + p.avgCrowdLevel, 0) / patterns.length,
      trend: currentReading?.crowdLevel > (currentPattern?.avgCrowdLevel || 50) ? 'increasing' : 'decreasing'
    };
  }

  async generateCrowdPredictions(stationId: number, routeId: number): Promise<any[]> {
    const patterns = await this.getHistoricalPatterns(stationId, routeId);
    const currentHour = new Date().getHours();
    const predictions = [];

    for (let i = 1; i <= 6; i++) {
      const futureHour = (currentHour + i) % 24;
      const pattern = patterns.find(p => p.hour === futureHour);
      const baseCrowdLevel = pattern?.avgCrowdLevel || 50;
      
      // Add some randomness and factors
      const weatherFactor = Math.random() * 0.2 - 0.1; // ±10%
      const eventFactor = Math.random() > 0.9 ? 0.3 : 0; // 10% chance of event
      
      const predictedLevel = Math.max(0, Math.min(100, 
        baseCrowdLevel * (1 + weatherFactor + eventFactor)
      ));

      const prediction = {
        id: this.currentPredictionId++,
        stationId,
        routeId,
        predictedTime: new Date(Date.now() + i * 30 * 60 * 1000),
        predictedCrowdLevel: Math.round(predictedLevel),
        confidence: 0.8 - (i * 0.1),
        factors: ['historical_pattern', 'time_of_day']
      };

      if (weatherFactor !== 0) prediction.factors.push('weather');
      if (eventFactor !== 0) prediction.factors.push('special_event');

      predictions.push(prediction);
      this.crowdPredictions.set(prediction.id, prediction);
    }

    return predictions;
  }

  // Existing methods remain the same...
  async getRoutes(): Promise<Route[]> {
    return Array.from(this.routes.values());
  }

  async getRoute(id: number): Promise<Route | undefined> {
    return this.routes.get(id);
  }

  async createRoute(route: InsertRoute): Promise<Route> {
    const newRoute: Route = { 
      id: this.currentRouteId++, 
      ...route,
      strokeWidth: route.strokeWidth || 4,
      opacity: route.opacity || 0.8,
      dashPattern: route.dashPattern || null
    };
    this.routes.set(newRoute.id, newRoute);
    return newRoute;
  }

  async updateRouteAesthetics(id: number, aesthetics: Partial<Route>): Promise<Route | undefined> {
    const route = this.routes.get(id);
    if (route) {
      const updatedRoute: Route = {
        ...route,
        ...aesthetics
      };
      this.routes.set(id, updatedRoute);
      return updatedRoute;
    }
    return undefined;
  }

  async getStations(): Promise<Station[]> {
    return Array.from(this.stations.values());
  }

  async getStation(id: number): Promise<Station | undefined> {
    return this.stations.get(id);
  }

  async createStation(station: InsertStation): Promise<Station> {
    const newStation: Station = { 
      id: this.currentStationId++, 
      ...station 
    };
    this.stations.set(newStation.id, newStation);
    return newStation;
  }

  async getBuses(): Promise<Bus[]> {
    return Array.from(this.buses.values());
  }

  async getBusesWithRoutes(): Promise<BusWithRoute[]> {
    return Array.from(this.buses.values()).map(bus => {
      const route = this.routes.get(bus.routeId);
      return {
        ...bus,
        route: route || null
      };
    });
  }

  async getBus(id: number): Promise<Bus | undefined> {
    return this.buses.get(id);
  }

  async createBus(bus: InsertBus): Promise<Bus> {
    const newBus: Bus = { 
      id: this.currentBusId++, 
      ...bus 
    };
    this.buses.set(newBus.id, newBus);
    return newBus;
  }

  async updateBusPosition(id: number, x: number, y: number): Promise<Bus | undefined> {
    const bus = this.buses.get(id);
    if (bus) {
      bus.x = x;
      bus.y = y;
      this.buses.set(id, bus);
      return bus;
    }
    return undefined;
  }

  public simulateBusMovement() {
    setInterval(() => {
      this.buses.forEach((bus) => {
        if (bus.status === 'active') {
          const route = this.routes.get(bus.routeId);
          if (route) {
            const routePoints = this.getRoutePoints(bus.routeId);
            if (routePoints.length > 0) {
              const randomPoint = routePoints[Math.floor(Math.random() * routePoints.length)];
              const newX = randomPoint.x + (Math.random() - 0.5) * 20;
              const newY = randomPoint.y + (Math.random() - 0.5) * 20;
              
              bus.x = Math.max(50, Math.min(500, newX));
              bus.y = Math.max(50, Math.min(450, newY));
              this.buses.set(bus.id, bus);
            }
          }
        }
      });
    }, 3000);
  }

  async updateBusStatus(id: number, status: string): Promise<Bus | undefined> {
    const bus = this.buses.get(id);
    if (bus) {
      bus.status = status;
      this.buses.set(id, bus);
      return bus;
    }
    return undefined;
  }

  async getActiveAlerts(): Promise<AlertWithDetails[]> {
    return Array.from(this.alerts.values())
      .filter(alert => alert.isActive)
      .map(alert => {
        const bus = alert.busId ? this.buses.get(alert.busId) : null;
        const route = alert.routeId ? this.routes.get(alert.routeId) : null;
        return {
          ...alert,
          busNumber: bus?.number || null,
          routeName: route?.name || null
        };
      });
  }

  async getAlert(id: number): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const newAlert: Alert = { 
      id: this.currentAlertId++, 
      ...alert,
      timestamp: new Date(),
      isActive: alert.isActive ?? true
    };
    this.alerts.set(newAlert.id, newAlert);
    return newAlert;
  }

  async acknowledgeAlert(id: number): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (alert) {
      alert.isActive = false;
      this.alerts.set(id, alert);
      return alert;
    }
    return undefined;
  }

  async getRouteStations(routeId: number): Promise<Station[]> {
    const routeStationList = Array.from(this.routeStations.values())
      .filter(rs => rs.routeId === routeId)
      .sort((a, b) => a.sequence - b.sequence);
    
    return routeStationList.map(rs => this.stations.get(rs.stationId)).filter(Boolean) as Station[];
  }

  async addStationToRoute(routeStation: InsertRouteStation): Promise<RouteStation> {
    const id = this.currentRouteStationId++;
    const newRouteStation: RouteStation = { id, ...routeStation };
    this.routeStations.set(id, newRouteStation);
    return newRouteStation;
  }

  async getStationDetails(id: number): Promise<StationDetails | undefined> {
    const station = this.stations.get(id);
    if (!station) return undefined;

    const routeStationList = Array.from(this.routeStations.values())
      .filter(rs => rs.stationId === id);
    
    const routes = routeStationList.map(rs => this.routes.get(rs.routeId)).filter(Boolean) as Route[];

    return {
      ...station,
      routes,
      avgWaitTime: Math.floor(Math.random() * 15) + 5,
      nextArrivals: []
    };
  }

  async updateStationPassengerCount(id: number, count: number): Promise<Station | undefined> {
    const station = this.stations.get(id);
    if (station) {
      station.passengerCount = count;
      this.stations.set(id, station);
      return station;
    }
    return undefined;
  }

  async getBusArrivals(stationId: number): Promise<BusArrivalWithDetails[]> {
    return Array.from(this.busArrivals.values())
      .filter(arrival => arrival.stationId === stationId)
      .map(arrival => {
        const bus = this.buses.get(arrival.busId);
        const route = this.routes.get(arrival.routeId);
        return {
          ...arrival,
          busNumber: bus?.number || `Bus ${arrival.busId}`,
          routeName: route?.name || `Route ${arrival.routeId}`
        };
      })
      .sort((a, b) => new Date(a.estimatedArrival).getTime() - new Date(b.estimatedArrival).getTime());
  }

  async createBusArrival(arrival: InsertBusArrival): Promise<BusArrival> {
    const id = this.currentBusArrivalId++;
    const newArrival: BusArrival = { 
      id, 
      ...arrival,
      status: arrival.status || "scheduled"
    };
    this.busArrivals.set(id, newArrival);
    return newArrival;
  }

  async updateArrivalStatus(id: number, status: string): Promise<BusArrival | undefined> {
    const arrival = this.busArrivals.get(id);
    if (arrival) {
      arrival.status = status;
      this.busArrivals.set(id, arrival);
      return arrival;
    }
    return undefined;
  }

  async getSystemStats(): Promise<SystemStats> {
    const totalBuses = this.buses.size;
    const activeRoutes = this.routes.size;
    const onTimeBuses = Array.from(this.buses.values()).filter(bus => bus.status === 'active').length;
    const delayedBuses = Array.from(this.buses.values()).filter(bus => bus.status === 'delayed').length;
    const alertBuses = Array.from(this.buses.values()).filter(bus => bus.status === 'maintenance').length;
    const onTimePercentage = totalBuses > 0 ? Math.round((onTimeBuses / totalBuses) * 100) : 0;

    // Calculate crowd analytics
    const allReadings = Array.from(this.crowdDensityReadings.values());
    const avgCrowdDensity = allReadings.length > 0 
      ? allReadings.reduce((sum, r) => sum + r.crowdLevel, 0) / allReadings.length 
      : 0;

    const stationCrowdLevels = new Map<number, number>();
    allReadings.forEach(reading => {
      const current = stationCrowdLevels.get(reading.stationId) || 0;
      stationCrowdLevels.set(reading.stationId, Math.max(current, reading.crowdLevel));
    });

    const peakStations = Array.from(stationCrowdLevels.entries())
      .filter(([_, crowdLevel]) => crowdLevel > 70)
      .map(([stationId, _]) => {
        const station = this.stations.get(stationId);
        return station?.name || `Station ${stationId}`;
      });

    return {
      totalBuses,
      activeRoutes,
      onTimePercentage,
      onTimeBuses,
      delayedBuses,
      alertBuses,
      avgCrowdDensity: Math.round(avgCrowdDensity),
      peakStations
    };
  }

  private getRoutePoints(routeId: number): Array<{x: number, y: number}> {
    const routeStationList = Array.from(this.routeStations.values())
      .filter(rs => rs.routeId === routeId)
      .sort((a, b) => a.sequence - b.sequence);
    
    return routeStationList.map(rs => {
      const station = this.stations.get(rs.stationId);
      return station ? { x: station.x, y: station.y } : { x: 0, y: 0 };
    }).filter(point => point.x !== 0 || point.y !== 0);
  }
}

export const storage = new MemStorage();