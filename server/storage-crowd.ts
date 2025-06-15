import type { 
  Route, Station, Bus, Alert, RouteStation, BusArrival, 
  CrowdDensityReading, CrowdPrediction, HistoricalPattern,
  InsertRoute, InsertStation, InsertBus, InsertAlert, InsertRouteStation, InsertBusArrival,
  InsertCrowdDensityReading, InsertCrowdPrediction, InsertHistoricalPattern,
  BusWithRoute, AlertWithDetails, BusArrivalWithDetails, StationDetails, SystemStats, CrowdAnalytics
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
  
  // Crowd Analytics
  getCrowdDensityReadings(stationId?: number, busId?: number): Promise<CrowdDensityReading[]>;
  getLatestCrowdDensity(stationId: number): Promise<CrowdDensityReading | undefined>;
  createCrowdDensityReading(reading: InsertCrowdDensityReading): Promise<CrowdDensityReading>;
  getCrowdPredictions(stationId: number, routeId: number): Promise<CrowdPrediction[]>;
  createCrowdPrediction(prediction: InsertCrowdPrediction): Promise<CrowdPrediction>;
  getHistoricalPatterns(stationId: number, routeId: number): Promise<HistoricalPattern[]>;
  updateHistoricalPattern(pattern: InsertHistoricalPattern): Promise<HistoricalPattern>;
  getCrowdAnalytics(stationId: number): Promise<CrowdAnalytics>;
  generateCrowdPredictions(stationId: number, routeId: number): Promise<CrowdPrediction[]>;
  
  // System Stats
  getSystemStats(): Promise<SystemStats>;
}

export class MemStorage implements IStorage {
  private routes: Map<number, Route>;
  private stations: Map<number, Station>;
  private buses: Map<number, Bus>;
  private alerts: Map<number, Alert>;
  private routeStations: Map<number, RouteStation>;
  private busArrivals: Map<number, BusArrival>;
  private crowdDensityReadings: Map<number, CrowdDensityReading>;
  private crowdPredictions: Map<number, CrowdPrediction>;
  private historicalPatterns: Map<number, HistoricalPattern>;
  private currentRouteId: number;
  private currentStationId: number;
  private currentBusId: number;
  private currentAlertId: number;
  private currentRouteStationId: number;
  private currentBusArrivalId: number;
  private currentCrowdReadingId: number;
  private currentCrowdPredictionId: number;
  private currentHistoricalPatternId: number;

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
    this.currentCrowdPredictionId = 1;
    this.currentHistoricalPatternId = 1;
    this.seedData();
    this.simulateRealTimeData();
  }

  private seedData() {
    // Seed initial crowd density readings for major stations
    const majorStations = [1, 2, 3, 5, 7, 9, 12, 15, 18, 22, 25, 28];
    majorStations.forEach((stationId) => {
      // Create initial readings
      for (let i = 0; i < 24; i++) {
        const hour = new Date().getHours() - i;
        const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
        const basePassengers = Math.floor(Math.random() * 30) + 10;
        const rushMultiplier = isRushHour ? 2.2 : 1;
        const passengerCount = Math.min(70, Math.floor(basePassengers * rushMultiplier));
        const capacity = 70;
        const densityLevel = this.calculateDensityLevel(passengerCount, capacity);
        
        const reading: CrowdDensityReading = {
          id: this.currentCrowdReadingId++,
          stationId,
          busId: null,
          passengerCount,
          capacity,
          densityLevel,
          sensorType: Math.random() > 0.7 ? "camera" : "infrared",
          timestamp: new Date(Date.now() - (i * 60 * 60 * 1000))
        };
        this.crowdDensityReadings.set(reading.id, reading);
      }
    });

    // Seed historical patterns
    majorStations.forEach((stationId) => {
      [1, 2, 3, 4, 5].forEach((routeId) => {
        for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
          for (let hour = 6; hour < 22; hour++) {
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
            
            let avgDensity = Math.random() * 0.4 + 0.2; // Base 20-60%
            if (!isWeekend && isRushHour) {
              avgDensity = Math.min(0.95, avgDensity * 2.5);
            }
            
            const pattern: HistoricalPattern = {
              id: this.currentHistoricalPatternId++,
              stationId,
              routeId,
              dayOfWeek,
              hourOfDay: hour,
              avgPassengerCount: Math.floor(avgDensity * 70),
              avgDensityLevel: this.calculateDensityLevel(Math.floor(avgDensity * 70), 70),
              peakMultiplier: isRushHour ? 2.5 : 1,
              lastUpdated: new Date()
            };
            this.historicalPatterns.set(pattern.id, pattern);
          }
        }
      });
    });
  }

  private calculateDensityLevel(passengers: number, capacity: number): string {
    const ratio = passengers / capacity;
    if (ratio >= 0.85) return "critical";
    if (ratio >= 0.65) return "high";
    if (ratio >= 0.40) return "medium";
    return "low";
  }

  private simulateRealTimeData() {
    // Simulate new crowd readings every 2 minutes
    setInterval(() => {
      const majorStations = [1, 2, 3, 5, 7, 9, 12, 15, 18, 22, 25, 28];
      const randomStation = majorStations[Math.floor(Math.random() * majorStations.length)];
      
      const currentHour = new Date().getHours();
      const isRushHour = (currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 19);
      const basePassengers = Math.floor(Math.random() * 35) + 10;
      const rushMultiplier = isRushHour ? 2.1 : 1;
      const passengerCount = Math.min(70, Math.floor(basePassengers * rushMultiplier));
      
      this.createCrowdDensityReading({
        stationId: randomStation,
        passengerCount,
        capacity: 70,
        densityLevel: this.calculateDensityLevel(passengerCount, 70),
        sensorType: "automatic"
      });
    }, 120000); // Every 2 minutes
  }

  // Crowd Analytics Methods
  async getCrowdDensityReadings(stationId?: number, busId?: number): Promise<CrowdDensityReading[]> {
    const readings = Array.from(this.crowdDensityReadings.values());
    let filtered = readings;
    
    if (stationId) {
      filtered = filtered.filter(r => r.stationId === stationId);
    }
    if (busId) {
      filtered = filtered.filter(r => r.busId === busId);
    }
    
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getLatestCrowdDensity(stationId: number): Promise<CrowdDensityReading | undefined> {
    const readings = await this.getCrowdDensityReadings(stationId);
    return readings[0];
  }

  async createCrowdDensityReading(reading: InsertCrowdDensityReading): Promise<CrowdDensityReading> {
    const newReading: CrowdDensityReading = {
      id: this.currentCrowdReadingId++,
      ...reading,
      timestamp: new Date()
    };
    
    this.crowdDensityReadings.set(newReading.id, newReading);
    return newReading;
  }

  async getCrowdPredictions(stationId: number, routeId: number): Promise<CrowdPrediction[]> {
    return Array.from(this.crowdPredictions.values())
      .filter(p => p.stationId === stationId && p.routeId === routeId)
      .sort((a, b) => new Date(a.predictedTime).getTime() - new Date(b.predictedTime).getTime());
  }

  async createCrowdPrediction(prediction: InsertCrowdPrediction): Promise<CrowdPrediction> {
    const newPrediction: CrowdPrediction = {
      id: this.currentCrowdPredictionId++,
      ...prediction,
      createdAt: new Date()
    };
    
    this.crowdPredictions.set(newPrediction.id, newPrediction);
    return newPrediction;
  }

  async getHistoricalPatterns(stationId: number, routeId: number): Promise<HistoricalPattern[]> {
    return Array.from(this.historicalPatterns.values())
      .filter(p => p.stationId === stationId && p.routeId === routeId);
  }

  async updateHistoricalPattern(pattern: InsertHistoricalPattern): Promise<HistoricalPattern> {
    const newPattern: HistoricalPattern = {
      id: this.currentHistoricalPatternId++,
      ...pattern,
      lastUpdated: new Date()
    };
    
    this.historicalPatterns.set(newPattern.id, newPattern);
    return newPattern;
  }

  async getCrowdAnalytics(stationId: number): Promise<CrowdAnalytics> {
    const latestReading = await this.getLatestCrowdDensity(stationId);
    const predictions = await this.generateCrowdPredictions(stationId, 1); // Default route
    const patterns = await this.getHistoricalPatterns(stationId, 1);
    
    // Calculate historical average
    const historicalAverage = patterns.length > 0
      ? patterns.reduce((sum, p) => sum + p.avgPassengerCount, 0) / patterns.length
      : 0;
    
    // Get peak times from patterns
    const peakTimes = patterns
      .filter(p => p.peakMultiplier > 1.5)
      .map(p => ({ hour: p.hourOfDay, avgDensity: p.avgDensityLevel }))
      .slice(0, 8);
    
    return {
      stationId,
      currentDensity: latestReading?.densityLevel || "low",
      passengerCount: latestReading?.passengerCount || 0,
      capacity: latestReading?.capacity || 70,
      utilizationRate: latestReading ? (latestReading.passengerCount / latestReading.capacity) * 100 : 0,
      predictions,
      historicalAverage,
      peakTimes
    };
  }

  async generateCrowdPredictions(stationId: number, routeId: number): Promise<CrowdPrediction[]> {
    const predictions: CrowdPrediction[] = [];
    const currentTime = new Date();
    const patterns = await this.getHistoricalPatterns(stationId, routeId);
    const currentDayOfWeek = currentTime.getDay();
    
    // Generate predictions for the next 6 hours
    for (let i = 1; i <= 6; i++) {
      const futureTime = new Date(currentTime.getTime() + (i * 60 * 60 * 1000));
      const futureHour = futureTime.getHours();
      
      // Find matching historical pattern
      const pattern = patterns.find(p => 
        p.dayOfWeek === currentDayOfWeek && 
        p.hourOfDay === futureHour
      );
      
      const baseCount = pattern?.avgPassengerCount || 30;
      const variance = Math.floor(Math.random() * 10) - 5; // ±5 variance
      const predictedCount = Math.max(5, Math.min(70, baseCount + variance));
      
      const prediction: CrowdPrediction = {
        id: this.currentCrowdPredictionId++,
        stationId,
        routeId,
        predictedTime: futureTime,
        predictedDensity: this.calculateDensityLevel(predictedCount, 70),
        predictedPassengerCount: predictedCount,
        confidence: 0.75 + (Math.random() * 0.2), // 75-95% confidence
        modelVersion: "v2.1",
        createdAt: new Date()
      };
      
      predictions.push(prediction);
      this.crowdPredictions.set(prediction.id, prediction);
    }
    
    return predictions;
  }

  // Existing methods remain the same - will reference storage-fixed.ts for implementation
  async getRoutes(): Promise<Route[]> {
    return Array.from(this.routes.values());
  }

  async getRoute(id: number): Promise<Route | undefined> {
    return this.routes.get(id);
  }

  async createRoute(route: InsertRoute): Promise<Route> {
    const newRoute: Route = { 
      id: this.currentRouteId++, 
      ...route 
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
    const buses = Array.from(this.buses.values());
    return buses.map(bus => ({
      ...bus,
      route: this.routes.get(bus.routeId)!
    }));
  }

  async getBus(id: number): Promise<Bus | undefined> {
    return this.buses.get(id);
  }

  async createBus(bus: InsertBus): Promise<Bus> {
    const newBus: Bus = { 
      id: this.currentBusId++, 
      ...bus,
      lastUpdated: new Date()
    };
    this.buses.set(newBus.id, newBus);
    return newBus;
  }

  async updateBusPosition(id: number, x: number, y: number): Promise<Bus | undefined> {
    const bus = this.buses.get(id);
    if (bus) {
      bus.currentX = x;
      bus.currentY = y;
      bus.lastUpdated = new Date();
      this.buses.set(id, bus);
      return bus;
    }
    return undefined;
  }

  async updateBusStatus(id: number, status: string): Promise<Bus | undefined> {
    const bus = this.buses.get(id);
    if (bus) {
      bus.status = status;
      bus.lastUpdated = new Date();
      this.buses.set(id, bus);
      return bus;
    }
    return undefined;
  }

  async getActiveAlerts(): Promise<AlertWithDetails[]> {
    const alerts = Array.from(this.alerts.values()).filter(alert => alert.isActive);
    return alerts.map(alert => ({
      ...alert,
      bus: alert.busId ? this.buses.get(alert.busId) || null : null,
      route: alert.routeId ? this.routes.get(alert.routeId) || null : null
    }));
  }

  async getAlert(id: number): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const newAlert: Alert = { 
      id: this.currentAlertId++, 
      ...alert,
      createdAt: new Date()
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
    const routeStationPairs = Array.from(this.routeStations.values())
      .filter(rs => rs.routeId === routeId)
      .sort((a, b) => a.sequence - b.sequence);
    
    return routeStationPairs
      .map(rs => this.stations.get(rs.stationId))
      .filter(station => station !== undefined) as Station[];
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

    const upcomingArrivals = await this.getBusArrivals(id);
    const routeIds = Array.from(this.routeStations.values())
      .filter(rs => rs.stationId === id)
      .map(rs => rs.routeId);
    
    const activeRoutes = routeIds
      .map(routeId => this.routes.get(routeId))
      .filter(route => route !== undefined) as Route[];

    const currentDensity = await this.getLatestCrowdDensity(id);
    const predictions = await this.getCrowdPredictions(id, activeRoutes[0]?.id || 1);

    return {
      ...station,
      upcomingArrivals,
      activeRoutes,
      currentDensity,
      predictions
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
    const arrivals = Array.from(this.busArrivals.values())
      .filter(arrival => arrival.stationId === stationId);
    
    return arrivals.map(arrival => {
      const bus = this.buses.get(arrival.busId);
      const route = bus ? this.routes.get(bus.routeId) : null;
      return {
        ...arrival,
        bus: bus ? { ...bus, route: route! } : null!,
        route: route!
      };
    });
  }

  async createBusArrival(arrival: InsertBusArrival): Promise<BusArrival> {
    const id = this.currentBusArrivalId++;
    const newArrival: BusArrival = { 
      id, 
      ...arrival,
      scheduledArrival: arrival.estimatedArrival,
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
    const allBuses = Array.from(this.buses.values());
    const activeRoutes = Array.from(this.routes.values());
    const onTimeBuses = allBuses.filter(bus => bus.status === "active").length;
    const delayedBuses = allBuses.filter(bus => bus.status === "delayed").length;
    const alertBuses = allBuses.filter(bus => bus.status === "alert").length;
    
    // Calculate crowd analytics
    const allReadings = Array.from(this.crowdDensityReadings.values());
    const avgCrowdDensity = allReadings.length > 0
      ? allReadings.reduce((sum, r) => sum + (r.passengerCount / r.capacity), 0) / allReadings.length * 100
      : 0;
    
    const highDensityStations = allReadings.filter(r => 
      r.densityLevel === "high" || r.densityLevel === "critical"
    ).length;

    return {
      totalBuses: allBuses.length,
      activeRoutes: activeRoutes.length,
      onTimePercentage: allBuses.length > 0 ? Math.round((onTimeBuses / allBuses.length) * 100) : 0,
      onTimeBuses,
      delayedBuses,
      alertBuses,
      avgCrowdDensity: Math.round(avgCrowdDensity),
      peakStations: highDensityStations
    };
  }
}

export const storage = new MemStorage();