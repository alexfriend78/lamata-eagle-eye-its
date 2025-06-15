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
}

export class MemStorage implements IStorage {
  private routes: Map<number, Route>;
  private stations: Map<number, Station>;
  private buses: Map<number, Bus>;
  private alerts: Map<number, Alert>;
  private routeStations: Map<number, RouteStation>;
  private busArrivals: Map<number, BusArrival>;
  private currentRouteId: number;
  private currentStationId: number;
  private currentBusId: number;
  private currentAlertId: number;
  private currentRouteStationId: number;
  private currentBusArrivalId: number;

  constructor() {
    this.routes = new Map();
    this.stations = new Map();
    this.buses = new Map();
    this.alerts = new Map();
    this.routeStations = new Map();
    this.busArrivals = new Map();
    this.currentRouteId = 1;
    this.currentStationId = 1;
    this.currentBusId = 1;
    this.currentAlertId = 1;
    this.currentRouteStationId = 1;
    this.currentBusArrivalId = 1;
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

    // Create authentic Lagos BRT stations using percentage coordinates to match routes
    const stationsData = [
      // Route 1: Oshodi - Abule-Egba stations
      { name: "Oshodi Terminal 2", x: 0.5, y: 0.6, zone: 2 },
      { name: "Bolade", x: 0.48, y: 0.58, zone: 2 },
      { name: "Ladipo", x: 0.46, y: 0.56, zone: 2 },
      { name: "Shogunle", x: 0.44, y: 0.54, zone: 2 },
      { name: "PWD", x: 0.42, y: 0.52, zone: 2 },
      { name: "Airport Junction", x: 0.40, y: 0.50, zone: 2 },
      { name: "Ikeja Along", x: 0.38, y: 0.48, zone: 2 },
      { name: "Ile Zik", x: 0.36, y: 0.46, zone: 2 },
      { name: "Mangoro", x: 0.34, y: 0.44, zone: 2 },
      { name: "Cement", x: 0.32, y: 0.42, zone: 2 },
      { name: "Iyana Dopemu", x: 0.30, y: 0.40, zone: 1 },
      { name: "Adealu", x: 0.28, y: 0.38, zone: 1 },
      { name: "Iyana Ipaja Bus stop", x: 0.26, y: 0.36, zone: 1 },
      { name: "Pleasure", x: 0.24, y: 0.34, zone: 1 },
      { name: "Ile Epo", x: 0.22, y: 0.32, zone: 1 },
      { name: "Super", x: 0.20, y: 0.30, zone: 1 },
      { name: "Abule Egba", x: 0.18, y: 0.28, zone: 1 },

      // Route 2 additional stations
      { name: "LASMA", x: 0.52, y: 0.62, zone: 2 },
      { name: "Anthony", x: 0.54, y: 0.64, zone: 2 },
      { name: "Westex", x: 0.56, y: 0.66, zone: 2 },
      { name: "First Pedro", x: 0.58, y: 0.68, zone: 3 },
      { name: "Charley Boy", x: 0.60, y: 0.70, zone: 3 },
      { name: "Gbagada Phase 1", x: 0.62, y: 0.72, zone: 3 },
      { name: "Iyana Oworo", x: 0.64, y: 0.74, zone: 3 },
      { name: "Adeniji", x: 0.66, y: 0.76, zone: 3 },
      { name: "Obalende", x: 0.68, y: 0.78, zone: 3 },
      { name: "CMS Terminal", x: 0.70, y: 0.80, zone: 3 },

      // Ikorodu routes stations
      { name: "Ikorodu Terminal", x: 0.15, y: 0.85, zone: 4 },
      { name: "Benson", x: 0.17, y: 0.83, zone: 4 },
      { name: "ARUNA", x: 0.19, y: 0.81, zone: 4 },
      { name: "AGRIC TERMINAL", x: 0.21, y: 0.79, zone: 4 },
      { name: "OWUTU IDIROKO", x: 0.23, y: 0.77, zone: 4 },
      { name: "OGOLONTO", x: 0.25, y: 0.75, zone: 3 },
      { name: "MAJIDUN AWORI", x: 0.27, y: 0.73, zone: 3 },
      { name: "AJEGUNLE", x: 0.29, y: 0.71, zone: 3 },
      { name: "IRAWO", x: 0.31, y: 0.69, zone: 3 },
      { name: "IDERA", x: 0.33, y: 0.67, zone: 3 },
      { name: "OWODEONIRIN", x: 0.35, y: 0.65, zone: 3 },
      { name: "MILE12 TERMINAL", x: 0.37, y: 0.63, zone: 3 },
      { name: "KETU", x: 0.39, y: 0.61, zone: 3 },
      { name: "OJOTA", x: 0.41, y: 0.59, zone: 2 },
      { name: "NEWGARAGE", x: 0.43, y: 0.57, zone: 2 },
      { name: "Maryland", x: 0.45, y: 0.55, zone: 2 },
      { name: "Idiroko", x: 0.47, y: 0.53, zone: 2 },
      { name: "Obanikoro", x: 0.51, y: 0.49, zone: 2 },
      { name: "Palmgroove", x: 0.53, y: 0.47, zone: 2 },
      { name: "Onipanu", x: 0.55, y: 0.45, zone: 2 },
      { name: "Fadeyi", x: 0.57, y: 0.43, zone: 2 },

      // Route 3 additional stations
      { name: "MOSALASI TERMINAL", x: 0.59, y: 0.41, zone: 2 },
      { name: "BARRAKS", x: 0.61, y: 0.39, zone: 2 },
      { name: "Stadium", x: 0.63, y: 0.37, zone: 2 },
      { name: "Iponri", x: 0.65, y: 0.35, zone: 2 },
      { name: "Costain", x: 0.67, y: 0.33, zone: 2 },
      { name: "Leventis", x: 0.69, y: 0.31, zone: 2 },
      { name: "MARINA TRAIN STATION", x: 0.73, y: 0.27, zone: 2 },
      { name: "TBS Terminal", x: 0.75, y: 0.25, zone: 2 },

      // Route 5 additional station
      { name: "Oshodi Terminal 3", x: 0.50, y: 0.60, zone: 2 }
    ];

    stationsData.forEach(stationData => {
      const id = this.currentStationId++;
      this.stations.set(id, {
        id,
        ...stationData,
        passengerCount: Math.floor(Math.random() * 400) + 100,
        trafficCondition: ["light", "normal", "heavy"][Math.floor(Math.random() * 3)],
        accessibility: true,
        amenities: ["shelter", "seating", "lighting"]
      });
    });

    // Create buses for the 5 routes using percentage coordinates
    const busesData = [
      // Route 1 buses
      { routeId: 1, busNumber: "LBT-001", currentX: 0.38, currentY: 0.48, status: "on_time", direction: "forward" },
      { routeId: 1, busNumber: "LBT-002", currentX: 0.26, currentY: 0.36, status: "on_time", direction: "reverse" },
      { routeId: 1, busNumber: "LBT-003", currentX: 0.42, currentY: 0.52, status: "delayed", direction: "forward" },

      // Route 2 buses
      { routeId: 2, busNumber: "LBT-004", currentX: 0.20, currentY: 0.30, status: "on_time", direction: "forward" },
      { routeId: 2, busNumber: "LBT-005", currentX: 0.62, currentY: 0.72, status: "on_time", direction: "reverse" },
      { routeId: 2, busNumber: "LBT-006", currentX: 0.50, currentY: 0.60, status: "on_time", direction: "forward" },

      // Route 3 buses
      { routeId: 3, busNumber: "LBT-007", currentX: 0.25, currentY: 0.75, status: "on_time", direction: "forward" },
      { routeId: 3, busNumber: "LBT-008", currentX: 0.61, currentY: 0.39, status: "delayed", direction: "reverse" },
      { routeId: 3, busNumber: "LBT-009", currentX: 0.45, currentY: 0.55, status: "on_time", direction: "forward" },

      // Route 4 buses
      { routeId: 4, busNumber: "LBT-010", currentX: 0.21, currentY: 0.79, status: "on_time", direction: "forward" },
      { routeId: 4, busNumber: "LBT-011", currentX: 0.53, currentY: 0.47, status: "on_time", direction: "reverse" },
      { routeId: 4, busNumber: "LBT-012", currentX: 0.39, currentY: 0.61, status: "on_time", direction: "forward" },

      // Route 5 buses
      { routeId: 5, busNumber: "LBT-013", currentX: 0.17, currentY: 0.83, status: "on_time", direction: "forward" },
      { routeId: 5, busNumber: "LBT-014", currentX: 0.43, currentY: 0.57, status: "on_time", direction: "reverse" },
      { routeId: 5, busNumber: "LBT-015", currentX: 0.31, currentY: 0.69, status: "delayed", direction: "forward" }
    ];

    busesData.forEach(busData => {
      const id = this.currentBusId++;
      this.buses.set(id, {
        id,
        lastUpdated: new Date(),
        ...busData
      });
    });

    // Create alerts
    const alertsData = [
      { busId: 3, routeId: 1, type: "delay", message: "Route 1 experiencing delays due to traffic at Ikeja Along", severity: "medium" },
      { busId: null, routeId: null, type: "maintenance", message: "Scheduled maintenance at Oshodi Terminal", severity: "low" }
    ];

    alertsData.forEach(alertData => {
      const id = this.currentAlertId++;
      this.alerts.set(id, {
        id,
        isActive: true,
        createdAt: new Date(),
        stationId: null,
        ...alertData
      });
    });
  }

  // Rest of the interface methods remain the same...
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
      routeNumber: route.routeNumber,
      name: route.name,
      color: route.color || "#1976D2",
      isActive: route.isActive ?? true,
      lineStyle: route.lineStyle || "solid",
      lineWidth: route.lineWidth || 3,
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
    const existingRoute = this.routes.get(id);
    if (!existingRoute) return undefined;

    const updatedRoute: Route = {
      ...existingRoute,
      ...aesthetics,
      id
    };
    
    this.routes.set(id, updatedRoute);
    return updatedRoute;
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
      name: station.name,
      x: station.x,
      y: station.y,
      zone: station.zone ?? 1,
      passengerCount: station.passengerCount ?? 0,
      trafficCondition: station.trafficCondition ?? "normal",
      accessibility: station.accessibility ?? true,
      amenities: station.amenities ?? []
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
      lastUpdated: new Date(),
      routeId: bus.routeId,
      busNumber: bus.busNumber,
      currentX: bus.currentX,
      currentY: bus.currentY,
      status: bus.status || "on_time",
      direction: bus.direction || "forward"
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
      isActive: true,
      createdAt: new Date(),
      type: alert.type,
      message: alert.message,
      severity: alert.severity,
      busId: alert.busId || null,
      routeId: alert.routeId || null,
      stationId: alert.stationId || null
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
    const routeStationMappings = Array.from(this.routeStations.values())
      .filter(rs => rs.routeId === routeId)
      .sort((a, b) => a.stopOrder - b.stopOrder);
    
    return routeStationMappings
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
    const routeStationMappings = Array.from(this.routeStations.values())
      .filter(rs => rs.stationId === id);
    
    const activeRoutes = routeStationMappings
      .map(rs => this.routes.get(rs.routeId))
      .filter(route => route !== undefined) as Route[];

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
    
    return arrivals.map(arrival => {
      const bus = this.buses.get(arrival.busId);
      const route = bus ? this.routes.get(bus.routeId) : undefined;
      return {
        ...arrival,
        bus: bus ? { ...bus, route: route! } : {} as BusWithRoute,
        route: route!
      };
    });
  }

  async createBusArrival(arrival: InsertBusArrival): Promise<BusArrival> {
    const id = this.currentBusArrivalId++;
    const newArrival: BusArrival = { 
      id, 
      busId: arrival.busId,
      stationId: arrival.stationId,
      scheduledArrival: arrival.scheduledArrival,
      estimatedArrival: arrival.estimatedArrival,
      actualArrival: arrival.actualArrival || null,
      status: arrival.status
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
    const onTimeBuses = Array.from(this.buses.values()).filter(bus => bus.status === "on_time").length;
    const delayedBuses = Array.from(this.buses.values()).filter(bus => bus.status === "delayed").length;
    const alertBuses = Array.from(this.buses.values()).filter(bus => bus.status === "alert").length;
    const onTimePercentage = totalBuses > 0 ? Math.round((onTimeBuses / totalBuses) * 100) : 0;

    return {
      totalBuses,
      activeRoutes,
      onTimePercentage,
      onTimeBuses,
      delayedBuses,
      alertBuses
    };
  }

  public simulateBusMovement() {
    Array.from(this.buses.values()).forEach(bus => {
      const variation = (Math.random() - 0.5) * 0.02; // Small percentage-based movement
      const newX = Math.max(0.05, Math.min(0.95, bus.currentX + variation));
      const newY = Math.max(0.05, Math.min(0.95, bus.currentY + variation));
      this.updateBusPosition(bus.id, newX, newY);
    });
  }
}

export const storage = new MemStorage();

// Simulate bus movement every 3 seconds
setInterval(() => {
  storage.simulateBusMovement();
}, 3000);