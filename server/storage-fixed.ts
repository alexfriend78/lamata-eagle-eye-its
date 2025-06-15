import type { 
  Route, Station, Bus, Alert, RouteStation, BusArrival, 
  InsertRoute, InsertStation, InsertBus, InsertAlert, InsertRouteStation, InsertBusArrival,
  BusWithRoute, AlertWithDetails, BusArrivalWithDetails, StationDetails, SystemStats,
  CrowdDensityReading, InsertCrowdDensityReading, CrowdPrediction, InsertCrowdPrediction,
  HistoricalPattern, InsertHistoricalPattern, CrowdAnalytics
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
  getCrowdDensityReadings(stationId?: number, busId?: number): Promise<CrowdDensityReading[]>;
  getLatestCrowdDensity(stationId: number): Promise<CrowdDensityReading | undefined>;
  createCrowdDensityReading(reading: InsertCrowdDensityReading): Promise<CrowdDensityReading>;
  getCrowdPredictions(stationId: number, routeId: number): Promise<CrowdPrediction[]>;
  createCrowdPrediction(prediction: InsertCrowdPrediction): Promise<CrowdPrediction>;
  getHistoricalPatterns(stationId: number, routeId: number): Promise<HistoricalPattern[]>;
  updateHistoricalPattern(pattern: InsertHistoricalPattern): Promise<HistoricalPattern>;
  getCrowdAnalytics(stationId: number): Promise<CrowdAnalytics>;
  generateCrowdPredictions(stationId: number, routeId: number): Promise<CrowdPrediction[]>;
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
  }

  private seedData() {
    // Create only the 5 Lagos BRT routes
    const routesData = [
      { routeNumber: "1", name: "Oshodi - Abule-Egba", color: "#0066CC" },
      { routeNumber: "2", name: "Abule Egba - TBS/Obalende", color: "#CC0000" },
      { routeNumber: "3", name: "Ikorodu - TBS", color: "#00AA44" },
      { routeNumber: "4", name: "Ikorodu - Fadeyi", color: "#FFD700" },
      { routeNumber: "5", name: "Ikorodu - Oshodi", color: "#8A2BE2" }
    ];

    routesData.forEach(routeData => {
      const id = this.currentRouteId++;
      this.routes.set(id, {
        id,
        ...routeData,
        isActive: true,
        lineStyle: "solid",
        lineWidth: 4,
        opacity: 1.0,
        pattern: "none",
        animation: "none",
        glowColor: null,
        gradientEnd: null
      });
    });

    // Create authentic Lagos BRT stations positioned exactly on route paths
    const stationsData = [
      // Route 1: Oshodi - Abule-Egba stations (matching exact route coordinates)
      { name: "Oshodi Terminal 2", x: 0.50, y: 0.60, zone: 2, routeId: 1 },
      { name: "Bolade", x: 0.48, y: 0.58, zone: 2, routeId: 1 },
      { name: "Ladipo", x: 0.46, y: 0.56, zone: 2, routeId: 1 },
      { name: "Shogunle", x: 0.44, y: 0.54, zone: 2, routeId: 1 },
      { name: "PWD", x: 0.42, y: 0.52, zone: 1, routeId: 1 },
      { name: "Airport Junction", x: 0.40, y: 0.50, zone: 1, routeId: 1 },
      { name: "Ikeja Along", x: 0.38, y: 0.48, zone: 1, routeId: 1 },
      { name: "Ile Zik", x: 0.36, y: 0.46, zone: 1, routeId: 1 },
      { name: "Mangoro", x: 0.34, y: 0.44, zone: 1, routeId: 1 },
      { name: "Cement", x: 0.32, y: 0.42, zone: 1, routeId: 1 },
      { name: "Iyana Dopemu", x: 0.30, y: 0.40, zone: 1, routeId: 1 },
      { name: "Adealu", x: 0.28, y: 0.38, zone: 1, routeId: 1 },
      { name: "Iyana Ipaja Bus stop", x: 0.26, y: 0.36, zone: 1, routeId: 1 },
      { name: "Pleasure", x: 0.24, y: 0.34, zone: 1, routeId: 1 },
      { name: "Ile Epo", x: 0.22, y: 0.32, zone: 1, routeId: 1 },
      { name: "Super", x: 0.20, y: 0.30, zone: 1, routeId: 1 },
      { name: "Abule Egba", x: 0.18, y: 0.28, zone: 1, routeId: 1 },

      // Route 3: Ikorodu - TBS stations 
      { name: "Ikorodu Terminal", x: 0.15, y: 0.85, zone: 4, routeId: 3 },
      { name: "Benson", x: 0.17, y: 0.83, zone: 4, routeId: 3 },
      { name: "ARUNA", x: 0.19, y: 0.81, zone: 4, routeId: 3 },
      { name: "AGRIC TERMINAL", x: 0.21, y: 0.79, zone: 4, routeId: 3 },
      { name: "OWUTU IDIROKO", x: 0.23, y: 0.77, zone: 4, routeId: 3 },
      { name: "OGOLONTO", x: 0.25, y: 0.75, zone: 3, routeId: 3 },
      { name: "MAJIDUN AWORI", x: 0.27, y: 0.73, zone: 3, routeId: 3 },
      { name: "AJEGUNLE", x: 0.29, y: 0.71, zone: 3, routeId: 3 },
      { name: "IRAWO", x: 0.31, y: 0.69, zone: 3, routeId: 3 },
      { name: "IDERA", x: 0.33, y: 0.67, zone: 3, routeId: 3 },
      { name: "OWODEONIRIN", x: 0.35, y: 0.65, zone: 3, routeId: 3 },
      { name: "MILE12 TERMINAL", x: 0.37, y: 0.63, zone: 3, routeId: 3 },
      { name: "KETU", x: 0.39, y: 0.61, zone: 2, routeId: 3 },
      { name: "OJOTA", x: 0.41, y: 0.59, zone: 2, routeId: 3 },
      { name: "NEWGARAGE", x: 0.43, y: 0.57, zone: 2, routeId: 3 },
      { name: "Maryland", x: 0.45, y: 0.55, zone: 2, routeId: 3 },
      { name: "Idiroko", x: 0.47, y: 0.53, zone: 2, routeId: 3 },
      { name: "Anthony", x: 0.49, y: 0.51, zone: 2, routeId: 3 },
      { name: "Obanikoro", x: 0.51, y: 0.49, zone: 2, routeId: 3 },
      { name: "Palmgroove", x: 0.53, y: 0.47, zone: 2, routeId: 3 },
      { name: "Onipanu", x: 0.55, y: 0.45, zone: 2, routeId: 3 },
      { name: "Fadeyi", x: 0.57, y: 0.43, zone: 2, routeId: 3 },
      { name: "MOSALASI TERMINAL", x: 0.59, y: 0.41, zone: 2, routeId: 3 },
      { name: "BARRAKS", x: 0.61, y: 0.39, zone: 2, routeId: 3 },
      { name: "Stadium", x: 0.63, y: 0.37, zone: 2, routeId: 3 },
      { name: "Iponri", x: 0.65, y: 0.35, zone: 2, routeId: 3 },
      { name: "Costain", x: 0.67, y: 0.33, zone: 2, routeId: 3 },
      { name: "Leventis", x: 0.69, y: 0.31, zone: 2, routeId: 3 },
      { name: "CMS Terminal", x: 0.71, y: 0.29, zone: 2, routeId: 3 },
      { name: "MARINA TRAIN STATION", x: 0.73, y: 0.27, zone: 2, routeId: 3 },
      { name: "TBS Terminal", x: 0.75, y: 0.25, zone: 2, routeId: 3 }
    ];

    stationsData.forEach(stationData => {
      const id = this.currentStationId++;
      this.stations.set(id, {
        id,
        ...stationData,
        passengerCount: Math.floor(Math.random() * 60) + 10 // 10-70 passengers
      });
    });

    // Add route-station relationships
    stationsData.forEach((stationData, index) => {
      const routeStationId = this.currentRouteStationId++;
      this.routeStations.set(routeStationId, {
        id: routeStationId,
        routeId: stationData.routeId,
        stationId: index + 1,
        order: index
      });
    });

    // Create buses for each route with direction of travel
    const busesData = [
      { number: "BRT001", routeId: 1, status: "active", capacity: 70, direction: "Outbound" },
      { number: "BRT002", routeId: 1, status: "active", capacity: 70, direction: "Inbound" },
      { number: "BRT003", routeId: 2, status: "delayed", capacity: 70, direction: "Southbound" },
      { number: "BRT004", routeId: 2, status: "active", capacity: 70, direction: "Northbound" },
      { number: "BRT005", routeId: 3, status: "active", capacity: 70, direction: "Eastbound" },
      { number: "BRT006", routeId: 3, status: "alert", capacity: 70, direction: "Westbound" },
      { number: "BRT007", routeId: 4, status: "active", capacity: 70, direction: "Northbound" },
      { number: "BRT008", routeId: 5, status: "active", capacity: 70, direction: "Eastbound" }
    ];

    busesData.forEach(busData => {
      const id = this.currentBusId++;
      const routePoints = this.getRoutePoints(busData.routeId);
      const randomPoint = routePoints[Math.floor(Math.random() * routePoints.length)] || { x: 0.5, y: 0.5 };
      
      this.buses.set(id, {
        id,
        ...busData,
        currentX: randomPoint.x,
        currentY: randomPoint.y,
        passengerCount: Math.floor(Math.random() * busData.capacity * 0.8),
        lastUpdated: new Date()
      });
    });

    // Create some sample alerts with enhanced fields
    const alertsData = [
      { 
        type: "traffic", 
        message: "Heavy traffic on Route 2", 
        routeId: 2, 
        priority: "P3",
        severity: "medium", 
        isActive: true,
        driverName: null,
        driverNumber: null,
        lastStopId: null,
        nextStopId: null,
        zoneNumber: "Zone 2"
      },
      { 
        type: "maintenance", 
        message: "Bus BRT006 requires maintenance", 
        busId: 6, 
        priority: "P2",
        severity: "high", 
        isActive: true,
        driverName: "John Adebayo",
        driverNumber: "+234-8012-345-678",
        lastStopId: 15,
        nextStopId: 16,
        zoneNumber: "Zone 3"
      }
    ];

    alertsData.forEach(alertData => {
      const id = this.currentAlertId++;
      this.alerts.set(id, {
        id,
        ...alertData,
        createdAt: new Date()
      });
    });

    // Create sample crowd density readings
    const crowdReadings = [
      { stationId: 1, passengerCount: 45, capacity: 70, busId: null, source: "sensor" },
      { stationId: 2, passengerCount: 32, capacity: 70, busId: null, source: "sensor" },
      { stationId: 3, passengerCount: 58, capacity: 70, busId: null, source: "sensor" },
      { stationId: 4, passengerCount: 25, capacity: 70, busId: null, source: "sensor" },
      { stationId: 5, passengerCount: 65, capacity: 70, busId: null, source: "sensor" },
      { stationId: 18, passengerCount: 40, capacity: 70, busId: null, source: "sensor" },
      { stationId: 19, passengerCount: 28, capacity: 70, busId: null, source: "sensor" },
      { stationId: 20, passengerCount: 52, capacity: 70, busId: null, source: "sensor" },
      { stationId: 21, passengerCount: 35, capacity: 70, busId: null, source: "sensor" },
      { stationId: 22, passengerCount: 48, capacity: 70, busId: null, source: "sensor" }
    ];

    crowdReadings.forEach(reading => {
      this.createCrowdDensityReading(reading);
    });

    // Create sample crowd predictions
    const crowdPredictionsData = [
      { stationId: 1, routeId: 1, predictedPassengerCount: 65, predictionTimeMinutes: 15, confidenceLevel: 85, predictionType: "ml_model" },
      { stationId: 2, routeId: 1, predictedPassengerCount: 42, predictionTimeMinutes: 15, confidenceLevel: 78, predictionType: "ml_model" },
      { stationId: 3, routeId: 1, predictedPassengerCount: 72, predictionTimeMinutes: 15, confidenceLevel: 82, predictionType: "ml_model" },
      { stationId: 4, routeId: 1, predictedPassengerCount: 38, predictionTimeMinutes: 15, confidenceLevel: 75, predictionType: "ml_model" },
      { stationId: 5, routeId: 1, predictedPassengerCount: 88, predictionTimeMinutes: 15, confidenceLevel: 90, predictionType: "ml_model" },
      { stationId: 6, routeId: 1, predictedPassengerCount: 55, predictionTimeMinutes: 15, confidenceLevel: 80, predictionType: "ml_model" },
      { stationId: 7, routeId: 1, predictedPassengerCount: 48, predictionTimeMinutes: 15, confidenceLevel: 77, predictionType: "ml_model" },
      { stationId: 8, routeId: 1, predictedPassengerCount: 35, predictionTimeMinutes: 15, confidenceLevel: 73, predictionType: "ml_model" },
      
      { stationId: 18, routeId: 3, predictedPassengerCount: 58, predictionTimeMinutes: 15, confidenceLevel: 83, predictionType: "ml_model" },
      { stationId: 19, routeId: 3, predictedPassengerCount: 45, predictionTimeMinutes: 15, confidenceLevel: 79, predictionType: "ml_model" },
      { stationId: 20, routeId: 3, predictedPassengerCount: 67, predictionTimeMinutes: 15, confidenceLevel: 86, predictionType: "ml_model" },
      { stationId: 21, routeId: 3, predictedPassengerCount: 52, predictionTimeMinutes: 15, confidenceLevel: 81, predictionType: "ml_model" },
      { stationId: 22, routeId: 3, predictedPassengerCount: 72, predictionTimeMinutes: 15, confidenceLevel: 88, predictionType: "ml_model" },
      { stationId: 23, routeId: 3, predictedPassengerCount: 41, predictionTimeMinutes: 15, confidenceLevel: 76, predictionType: "ml_model" },
      { stationId: 24, routeId: 3, predictedPassengerCount: 59, predictionTimeMinutes: 15, confidenceLevel: 84, predictionType: "ml_model" },
      { stationId: 25, routeId: 3, predictedPassengerCount: 63, predictionTimeMinutes: 15, confidenceLevel: 85, predictionType: "ml_model" }
    ];

    crowdPredictionsData.forEach(prediction => {
      this.createCrowdPrediction(prediction);
    });

    // Start bus movement simulation
    setInterval(() => this.simulateBusMovement(), 5000);
  }

  async getRoutes(): Promise<Route[]> {
    return Array.from(this.routes.values());
  }

  async getRoute(id: number): Promise<Route | undefined> {
    return this.routes.get(id);
  }

  async createRoute(route: InsertRoute): Promise<Route> {
    const id = this.currentRouteId++;
    const newRoute: Route = { 
      id, 
      ...route,
      lineStyle: route.lineStyle || "solid",
      lineWidth: route.lineWidth || 4,
      opacity: route.opacity || 1.0,
      pattern: route.pattern || "none",
      animation: route.animation || "none",
      glowColor: route.glowColor || null,
      gradientEnd: route.gradientEnd || null
    };
    this.routes.set(id, newRoute);
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
    const id = this.currentStationId++;
    const newStation: Station = { 
      id, 
      ...station,
      passengerCount: station.passengerCount || 0
    };
    this.stations.set(id, newStation);
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
    const id = this.currentBusId++;
    const newBus: Bus = { 
      id, 
      ...bus,
      currentX: bus.currentX || 0.5,
      currentY: bus.currentY || 0.5,
      passengerCount: bus.passengerCount || 0,
      lastUpdated: new Date()
    };
    this.buses.set(id, newBus);
    return newBus;
  }

  async updateBusPosition(id: number, x: number, y: number): Promise<Bus | undefined> {
    const bus = this.buses.get(id);
    if (bus) {
      const updatedBus = { ...bus, currentX: x, currentY: y, lastUpdated: new Date() };
      this.buses.set(id, updatedBus);
      return updatedBus;
    }
    return undefined;
  }

  public simulateBusMovement() {
    Array.from(this.buses.values()).forEach(bus => {
      if (bus.status === "maintenance") return;
      
      const routePoints = this.getRoutePoints(bus.routeId);
      if (routePoints.length === 0) return;
      
      // Find closest point and move towards next
      let closestIndex = 0;
      let closestDistance = Infinity;
      
      routePoints.forEach((point, index) => {
        const distance = Math.sqrt(
          Math.pow(point.x - bus.currentX, 2) + Math.pow(point.y - bus.currentY, 2)
        );
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      
      const targetIndex = (closestIndex + 1) % routePoints.length;
      const targetPoint = routePoints[targetIndex];
      const speed = bus.status === "delayed" ? 6 : bus.status === "alert" ? 4 : 10;
      
      // Calculate new position
      const newX = bus.currentX + (targetPoint.x - bus.currentX) * (speed / 100);
      const newY = bus.currentY + (targetPoint.y - bus.currentY) * (speed / 100);
      
      // Update bus position
      this.buses.set(bus.id, {
        ...bus,
        currentX: newX,
        currentY: newY,
        lastUpdated: new Date()
      });
    });
  }

  async updateBusStatus(id: number, status: string): Promise<Bus | undefined> {
    const bus = this.buses.get(id);
    if (bus) {
      const updatedBus = { ...bus, status, lastUpdated: new Date() };
      this.buses.set(id, updatedBus);
      return updatedBus;
    }
    return undefined;
  }

  async getActiveAlerts(): Promise<AlertWithDetails[]> {
    const alerts = Array.from(this.alerts.values()).filter(alert => alert.isActive);
    return alerts.map(alert => ({
      ...alert,
      bus: alert.busId ? this.buses.get(alert.busId) : undefined,
      route: alert.routeId ? this.routes.get(alert.routeId) : undefined
    }));
  }

  async getAlert(id: number): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const id = this.currentAlertId++;
    const newAlert: Alert = { 
      id, 
      ...alert,
      createdAt: new Date()
    };
    this.alerts.set(id, newAlert);
    return newAlert;
  }

  async acknowledgeAlert(id: number): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (alert) {
      const updatedAlert = { ...alert, isActive: false };
      this.alerts.set(id, updatedAlert);
      return updatedAlert;
    }
    return undefined;
  }

  async getRouteStations(routeId: number): Promise<Station[]> {
    const routeStations = Array.from(this.routeStations.values())
      .filter(rs => rs.routeId === routeId)
      .sort((a, b) => a.order - b.order);
    
    return routeStations
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

    const routeStations = Array.from(this.routeStations.values())
      .filter(rs => rs.stationId === id);
    
    const activeRoutes = routeStations
      .map(rs => this.routes.get(rs.routeId))
      .filter(route => route !== undefined) as Route[];

    // Get upcoming arrivals (simplified)
    const upcomingArrivals = Array.from(this.busArrivals.values())
      .filter(arrival => arrival.stationId === id)
      .slice(0, 3)
      .map(arrival => ({
        ...arrival,
        bus: { ...this.buses.get(arrival.busId)!, route: this.routes.get(arrival.routeId)! },
        route: this.routes.get(arrival.routeId)!
      }));

    return {
      ...station,
      upcomingArrivals,
      activeRoutes
    };
  }

  async updateStationPassengerCount(id: number, count: number): Promise<Station | undefined> {
    const station = this.stations.get(id);
    if (station) {
      const updatedStation = { ...station, passengerCount: count };
      this.stations.set(id, updatedStation);
      return updatedStation;
    }
    return undefined;
  }

  async getBusArrivals(stationId: number): Promise<BusArrivalWithDetails[]> {
    const arrivals = Array.from(this.busArrivals.values())
      .filter(arrival => arrival.stationId === stationId);
    
    return arrivals.map(arrival => ({
      ...arrival,
      bus: { ...this.buses.get(arrival.busId)!, route: this.routes.get(arrival.routeId)! },
      route: this.routes.get(arrival.routeId)!
    }));
  }

  async createBusArrival(arrival: InsertBusArrival): Promise<BusArrival> {
    const id = this.currentBusArrivalId++;
    const newArrival: BusArrival = { 
      id, 
      ...arrival,
      status: arrival.status || "scheduled",
      actualArrival: arrival.actualArrival || null
    };
    this.busArrivals.set(id, newArrival);
    return newArrival;
  }

  async updateArrivalStatus(id: number, status: string): Promise<BusArrival | undefined> {
    const arrival = this.busArrivals.get(id);
    if (arrival) {
      const updatedArrival = { ...arrival, status };
      this.busArrivals.set(id, updatedArrival);
      return updatedArrival;
    }
    return undefined;
  }

  async getSystemStats(): Promise<SystemStats> {
    const totalBuses = this.buses.size;
    const activeRoutes = this.routes.size;
    const onTimeBuses = Array.from(this.buses.values()).filter(bus => bus.status === "active").length;
    const delayedBuses = Array.from(this.buses.values()).filter(bus => bus.status === "delayed").length;
    const alertBuses = Array.from(this.buses.values()).filter(bus => bus.status === "alert").length;
    
    return {
      totalBuses,
      activeRoutes,
      onTimePercentage: totalBuses > 0 ? Math.round((onTimeBuses / totalBuses) * 100) : 0,
      onTimeBuses,
      delayedBuses,
      alertBuses,
      avgCrowdDensity: 0,
      peakStations: 0
    };
  }

  private getRoutePoints(routeId: number): Array<{x: number, y: number}> {
    // Define the same route paths used in the frontend
    const routePaths: Record<number, Array<{x: number, y: number}>> = {
      1: [ // Route 1: Oshodi - Abule-Egba (Central to Northwest)
        { x: 0.50, y: 0.60 }, // Oshodi Terminal 2
        { x: 0.48, y: 0.58 }, // Bolade
        { x: 0.46, y: 0.56 }, // Ladipo
        { x: 0.44, y: 0.54 }, // Shogunle
        { x: 0.42, y: 0.52 }, // PWD
        { x: 0.40, y: 0.50 }, // Airport Junction
        { x: 0.38, y: 0.48 }, // Ikeja Along
        { x: 0.36, y: 0.46 }, // Ile Zik
        { x: 0.34, y: 0.44 }, // Mangoro
        { x: 0.32, y: 0.42 }, // Cement
        { x: 0.30, y: 0.40 }, // Iyana Dopemu
        { x: 0.28, y: 0.38 }, // Adealu
        { x: 0.26, y: 0.36 }, // Iyana Ipaja Bus stop
        { x: 0.24, y: 0.34 }, // Pleasure
        { x: 0.22, y: 0.32 }, // Ile Epo
        { x: 0.20, y: 0.30 }, // Super
        { x: 0.18, y: 0.28 }  // Abule Egba
      ],
      2: [ // Route 2: Abule Egba - TBS/Obalende (Full north-south-central)
        { x: 0.18, y: 0.28 }, // Abule Egba
        { x: 0.20, y: 0.30 }, // Super
        { x: 0.22, y: 0.32 }, // Ile Epo
        { x: 0.24, y: 0.34 }, // Pleasure
        { x: 0.26, y: 0.36 }, // Iyana Ipaja Bus stop
        { x: 0.28, y: 0.38 }, // Adealu
        { x: 0.30, y: 0.40 }, // Iyana Dopemu
        { x: 0.32, y: 0.42 }, // Cement
        { x: 0.34, y: 0.44 }, // Mangoro
        { x: 0.36, y: 0.46 }, // Ile Zik
        { x: 0.38, y: 0.48 }, // Ikeja Along
        { x: 0.40, y: 0.50 }, // Airport Junction
        { x: 0.42, y: 0.52 }, // PWD
        { x: 0.44, y: 0.54 }, // Shogunle
        { x: 0.46, y: 0.56 }, // Ladipo
        { x: 0.48, y: 0.58 }, // Bolade
        { x: 0.50, y: 0.60 }, // Oshodi Terminal 2
        { x: 0.52, y: 0.62 }, // LASMA
        { x: 0.54, y: 0.64 }, // Anthony
        { x: 0.56, y: 0.66 }, // Westex
        { x: 0.58, y: 0.68 }, // First Pedro
        { x: 0.60, y: 0.70 }, // Charley Boy
        { x: 0.62, y: 0.72 }, // Gbagada Phase 1
        { x: 0.64, y: 0.74 }, // Iyana Oworo
        { x: 0.66, y: 0.76 }, // Adeniji
        { x: 0.68, y: 0.78 }, // Obalende
        { x: 0.70, y: 0.80 }  // CMS Terminal
      ],
      3: [ // Route 3: Ikorodu - TBS (Southwest to Central)
        { x: 0.15, y: 0.85 }, // Ikorodu Terminal
        { x: 0.17, y: 0.83 }, // Benson
        { x: 0.19, y: 0.81 }, // ARUNA
        { x: 0.21, y: 0.79 }, // AGRIC TERMINAL
        { x: 0.23, y: 0.77 }, // OWUTU IDIROKO
        { x: 0.25, y: 0.75 }, // OGOLONTO
        { x: 0.27, y: 0.73 }, // MAJIDUN AWORI
        { x: 0.29, y: 0.71 }, // AJEGUNLE
        { x: 0.31, y: 0.69 }, // IRAWO
        { x: 0.33, y: 0.67 }, // IDERA
        { x: 0.35, y: 0.65 }, // OWODEONIRIN
        { x: 0.37, y: 0.63 }, // MILE12 TERMINAL
        { x: 0.39, y: 0.61 }, // KETU
        { x: 0.41, y: 0.59 }, // OJOTA
        { x: 0.43, y: 0.57 }, // NEWGARAGE
        { x: 0.45, y: 0.55 }, // Maryland
        { x: 0.47, y: 0.53 }, // Idiroko
        { x: 0.49, y: 0.51 }, // Anthony
        { x: 0.51, y: 0.49 }, // Obanikoro
        { x: 0.53, y: 0.47 }, // Palmgroove
        { x: 0.55, y: 0.45 }, // Onipanu
        { x: 0.57, y: 0.43 }, // Fadeyi
        { x: 0.59, y: 0.41 }, // MOSALASI TERMINAL
        { x: 0.61, y: 0.39 }, // BARRAKS
        { x: 0.63, y: 0.37 }, // Stadium
        { x: 0.65, y: 0.35 }, // Iponri
        { x: 0.67, y: 0.33 }, // Costain
        { x: 0.69, y: 0.31 }, // Leventis
        { x: 0.71, y: 0.29 }, // CMS Terminal
        { x: 0.73, y: 0.27 }, // MARINA TRAIN STATION
        { x: 0.75, y: 0.25 }  // TBS Terminal
      ],
      4: [ // Route 4: Ikorodu - Fadeyi (Southwest to Mid-Central)
        { x: 0.15, y: 0.85 }, // Ikorodu Terminal
        { x: 0.17, y: 0.83 }, // Benson
        { x: 0.19, y: 0.81 }, // ARUNA
        { x: 0.21, y: 0.79 }, // AGRIC TERMINAL
        { x: 0.23, y: 0.77 }, // OWUTU IDIROKO
        { x: 0.25, y: 0.75 }, // OGOLONTO
        { x: 0.27, y: 0.73 }, // MAJIDUN AWORI
        { x: 0.29, y: 0.71 }, // AJEGUNLE
        { x: 0.31, y: 0.69 }, // IRAWO
        { x: 0.33, y: 0.67 }, // IDERA
        { x: 0.35, y: 0.65 }, // OWODEONIRIN
        { x: 0.37, y: 0.63 }, // MILE12 TERMINAL
        { x: 0.39, y: 0.61 }, // KETU
        { x: 0.41, y: 0.59 }, // OJOTA
        { x: 0.43, y: 0.57 }, // NEWGARAGE
        { x: 0.45, y: 0.55 }, // Maryland
        { x: 0.47, y: 0.53 }, // Idiroko
        { x: 0.49, y: 0.51 }, // Anthony
        { x: 0.51, y: 0.49 }, // Obanikoro
        { x: 0.53, y: 0.47 }, // Palmgroove
        { x: 0.55, y: 0.45 }, // Onipanu
        { x: 0.57, y: 0.43 }  // Fadeyi
      ],
      5: [ // Route 5: Ikorodu - Oshodi (Southwest to Central)
        { x: 0.15, y: 0.85 }, // Ikorodu Terminal
        { x: 0.17, y: 0.83 }, // Benson
        { x: 0.19, y: 0.81 }, // ARUNA
        { x: 0.21, y: 0.79 }, // AGRIC TERMINAL
        { x: 0.23, y: 0.77 }, // OWUTU IDIROKO
        { x: 0.25, y: 0.75 }, // OGOLONTO
        { x: 0.27, y: 0.73 }, // MAJIDUN AWORI
        { x: 0.29, y: 0.71 }, // AJEGUNLE
        { x: 0.31, y: 0.69 }, // IRAWO
        { x: 0.33, y: 0.67 }, // IDERA
        { x: 0.35, y: 0.65 }, // OWODEONIRIN
        { x: 0.37, y: 0.63 }, // MILE12 TERMINAL
        { x: 0.39, y: 0.61 }, // KETU
        { x: 0.41, y: 0.59 }, // OJOTA
        { x: 0.43, y: 0.57 }, // NEWGARAGE
        { x: 0.45, y: 0.55 }, // Maryland
        { x: 0.47, y: 0.53 }, // Anthony
        { x: 0.50, y: 0.60 }  // Oshodi Terminal 3
      ]
    };
    return routePaths[routeId] || [];
  }

  // Crowd Density Analytics Methods
  async getCrowdDensityReadings(stationId?: number, busId?: number): Promise<CrowdDensityReading[]> {
    const readings = Array.from(this.crowdDensityReadings.values());
    return readings.filter(reading => {
      if (stationId && reading.stationId !== stationId) return false;
      if (busId && reading.busId !== busId) return false;
      return true;
    });
  }

  async getLatestCrowdDensity(stationId: number): Promise<CrowdDensityReading | undefined> {
    const readings = Array.from(this.crowdDensityReadings.values())
      .filter(reading => reading.stationId === stationId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return readings[0];
  }

  async createCrowdDensityReading(reading: InsertCrowdDensityReading): Promise<CrowdDensityReading> {
    const id = this.currentCrowdReadingId++;
    const densityLevel = this.calculateDensityLevel(reading.passengerCount, reading.capacity || 70);
    const newReading: CrowdDensityReading = {
      id,
      ...reading,
      timestamp: new Date(),
      densityLevel,
      capacity: reading.capacity || 70,
      source: reading.source || "sensor"
    };
    this.crowdDensityReadings.set(id, newReading);
    return newReading;
  }

  async getCrowdPredictions(stationId: number, routeId: number): Promise<CrowdPrediction[]> {
    return Array.from(this.crowdPredictions.values())
      .filter(prediction => prediction.stationId === stationId && prediction.routeId === routeId);
  }

  async createCrowdPrediction(prediction: InsertCrowdPrediction): Promise<CrowdPrediction> {
    const id = this.currentCrowdPredictionId++;
    const newPrediction: CrowdPrediction = {
      id,
      ...prediction,
      createdAt: new Date(),
      confidenceLevel: prediction.confidenceLevel || 75,
      predictionType: prediction.predictionType || "ml_model"
    };
    this.crowdPredictions.set(id, newPrediction);
    return newPrediction;
  }

  async getHistoricalPatterns(stationId: number, routeId: number): Promise<HistoricalPattern[]> {
    return Array.from(this.historicalPatterns.values())
      .filter(pattern => pattern.stationId === stationId && pattern.routeId === routeId);
  }

  async updateHistoricalPattern(pattern: InsertHistoricalPattern): Promise<HistoricalPattern> {
    const id = this.currentHistoricalPatternId++;
    const newPattern: HistoricalPattern = {
      id,
      ...pattern,
      lastUpdated: new Date()
    };
    this.historicalPatterns.set(id, newPattern);
    return newPattern;
  }

  async getCrowdAnalytics(stationId: number): Promise<CrowdAnalytics> {
    const latestDensity = await this.getLatestCrowdDensity(stationId);
    const station = this.stations.get(stationId);
    
    if (!station) {
      throw new Error(`Station ${stationId} not found`);
    }

    const predictions = Array.from(this.crowdPredictions.values())
      .filter(p => p.stationId === stationId);

    return {
      stationId,
      currentDensity: latestDensity?.densityLevel || "low",
      passengerCount: latestDensity?.passengerCount || station.passengerCount,
      capacity: latestDensity?.capacity || 70,
      utilizationRate: latestDensity ? (latestDensity.passengerCount / (latestDensity.capacity || 70)) * 100 : 0,
      predictions,
      historicalAverage: this.calculateHistoricalAverage(stationId),
      peakTimes: this.calculatePeakTimes(stationId)
    };
  }

  async generateCrowdPredictions(stationId: number, routeId: number): Promise<CrowdPrediction[]> {
    const now = new Date();
    const predictions: CrowdPrediction[] = [];
    
    // Generate predictions for next 6 hours
    for (let i = 1; i <= 6; i++) {
      const predictedTime = new Date(now.getTime() + (i * 60 * 60 * 1000));
      const hour = predictedTime.getHours();
      
      // Simple prediction based on time patterns
      let expectedPassengers = 30; // Base load
      if (hour >= 7 && hour <= 9) expectedPassengers = 60; // Morning rush
      else if (hour >= 17 && hour <= 19) expectedPassengers = 65; // Evening rush
      else if (hour >= 12 && hour <= 14) expectedPassengers = 45; // Lunch time
      
      // Add some variance
      expectedPassengers += Math.floor(Math.random() * 20) - 10;
      expectedPassengers = Math.max(10, Math.min(70, expectedPassengers));

      const prediction = await this.createCrowdPrediction({
        stationId,
        routeId,
        predictedTime,
        expectedPassengers,
        confidenceLevel: 80,
        predictionType: "ml_model"
      });
      
      predictions.push(prediction);
    }
    
    return predictions;
  }

  private calculateDensityLevel(passengerCount: number, capacity: number): string {
    const ratio = passengerCount / capacity;
    if (ratio < 0.3) return "low";
    if (ratio < 0.6) return "medium";
    if (ratio < 0.85) return "high";
    return "critical";
  }

  private calculateHistoricalAverage(stationId: number): number {
    const patterns = Array.from(this.historicalPatterns.values())
      .filter(p => p.stationId === stationId);
    
    if (patterns.length === 0) return 35; // Default average
    
    const total = patterns.reduce((sum, pattern) => sum + pattern.avgPassengerCount, 0);
    return Math.round(total / patterns.length);
  }

  private calculatePeakTimes(stationId: number): Array<{ hour: number; avgDensity: string }> {
    const peakHours = [7, 8, 9, 12, 13, 17, 18, 19]; // Typical peak hours
    return peakHours.map(hour => ({
      hour,
      avgDensity: hour >= 17 && hour <= 19 ? "high" : hour >= 7 && hour <= 9 ? "high" : "medium"
    }));
  }
}

export const storage = new MemStorage();