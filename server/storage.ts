import { 
  routes, stations, buses, alerts, routeStations,
  type Route, type Station, type Bus, type Alert, type RouteStation,
  type InsertRoute, type InsertStation, type InsertBus, type InsertAlert, type InsertRouteStation,
  type BusWithRoute, type RouteWithStations, type AlertWithDetails, type SystemStats
} from "@shared/schema";

export interface IStorage {
  // Routes
  getRoutes(): Promise<Route[]>;
  getRoute(id: number): Promise<Route | undefined>;
  createRoute(route: InsertRoute): Promise<Route>;
  
  // Stations
  getStations(): Promise<Station[]>;
  getStation(id: number): Promise<Station | undefined>;
  createStation(station: InsertStation): Promise<Station>;
  
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
  
  // System Stats
  getSystemStats(): Promise<SystemStats>;
}

export class MemStorage implements IStorage {
  private routes: Map<number, Route>;
  private stations: Map<number, Station>;
  private buses: Map<number, Bus>;
  private alerts: Map<number, Alert>;
  private routeStations: Map<number, RouteStation>;
  private currentRouteId: number;
  private currentStationId: number;
  private currentBusId: number;
  private currentAlertId: number;
  private currentRouteStationId: number;

  constructor() {
    this.routes = new Map();
    this.stations = new Map();
    this.buses = new Map();
    this.alerts = new Map();
    this.routeStations = new Map();
    this.currentRouteId = 1;
    this.currentStationId = 1;
    this.currentBusId = 1;
    this.currentAlertId = 1;
    this.currentRouteStationId = 1;
    
    this.seedData();
  }

  private seedData() {
    // Create stations based on Lagos BRT routes
    const stationsData = [
      // Route 1: Oshodi - Abule-Egba
      { name: "Oshodi Terminal 2", x: 400, y: 300 },
      { name: "Bolade", x: 380, y: 280 },
      { name: "Ladipo", x: 360, y: 260 },
      { name: "Shogunle", x: 340, y: 240 },
      { name: "PWD", x: 320, y: 220 },
      { name: "Airport Junction", x: 300, y: 200 },
      { name: "Ikeja Along", x: 280, y: 180 },
      { name: "Ile Zik", x: 260, y: 160 },
      { name: "Mangoro", x: 240, y: 140 },
      { name: "Cement", x: 220, y: 120 },
      { name: "Iyana Dopemu", x: 200, y: 100 },
      { name: "Adealu", x: 180, y: 80 },
      { name: "Iyana Ipaja Bus stop", x: 160, y: 60 },
      { name: "Pleasure", x: 140, y: 40 },
      { name: "Ile Epo", x: 120, y: 20 },
      { name: "Super", x: 100, y: 10 },
      { name: "Abule Egba", x: 80, y: 5 },
      
      // Route 2/3 additional stations
      { name: "CMS Terminal", x: 600, y: 500 },
      { name: "Obalende", x: 580, y: 480 },
      { name: "TBS Terminal", x: 650, y: 520 },
      { name: "Anthony", x: 420, y: 350 },
      { name: "Maryland", x: 460, y: 380 },
      { name: "Fadeyi", x: 500, y: 420 },
      
      // Route 3/4/5 Ikorodu line
      { name: "Ikorodu Terminal", x: 100, y: 600 },
      { name: "Mile12 Terminal", x: 300, y: 500 },
      { name: "Ketu", x: 350, y: 460 },
      { name: "Ojota", x: 400, y: 420 },
    ];

    stationsData.forEach(station => {
      const id = this.currentStationId++;
      this.stations.set(id, { id, ...station });
    });

    // Create routes based on Lagos BRT system
    const routesData = [
      { routeNumber: "1", name: "Oshodi - Abule-Egba", color: "#FF6B35" },
      { routeNumber: "2", name: "Abule Egba - TBS/Obalende", color: "#2E86AB" },
      { routeNumber: "3", name: "Ikorodu - TBS", color: "#A23B72" },
      { routeNumber: "4", name: "Ikorodu - Fadeyi", color: "#F18F01" },
      { routeNumber: "5", name: "Ikorodu - Oshodi", color: "#C73E1D" },
    ];

    routesData.forEach(route => {
      const id = this.currentRouteId++;
      this.routes.set(id, { id, ...route, isActive: true });
    });

    // Create buses on different routes
    const busesData = [
      { routeId: 1, busNumber: "LG-01-KXY", currentX: 200, currentY: 150, status: "on_time", direction: "forward" },
      { routeId: 1, busNumber: "LG-01-MZB", currentX: 300, currentY: 200, status: "delayed", direction: "reverse" },
      { routeId: 2, busNumber: "LG-02-ABC", currentX: 180, currentY: 80, status: "alert", direction: "forward" },
      { routeId: 2, busNumber: "LG-02-DEF", currentX: 500, currentY: 400, status: "on_time", direction: "reverse" },
      { routeId: 3, busNumber: "LG-03-GHI", currentX: 200, currentY: 550, status: "on_time", direction: "forward" },
      { routeId: 4, busNumber: "LG-04-JKL", currentX: 250, currentY: 500, status: "delayed", direction: "forward" },
      { routeId: 5, busNumber: "LG-05-MNO", currentX: 150, currentY: 600, status: "on_time", direction: "reverse" },
    ];

    busesData.forEach(bus => {
      const id = this.currentBusId++;
      this.buses.set(id, { id, lastUpdated: new Date(), ...bus });
    });

    // Create some alerts
    const alertsData = [
      { busId: 3, routeId: 2, type: "emergency", message: "Emergency stop - Medical assistance required", severity: "critical" },
      { busId: null, routeId: 3, type: "delay", message: "Heavy traffic on Third Mainland Bridge - 15 min delay", severity: "medium" },
    ];

    alertsData.forEach(alert => {
      const id = this.currentAlertId++;
      this.alerts.set(id, { id, isActive: true, createdAt: new Date(), ...alert });
    });

    // Add route-station relationships
    const routeStationsData = [
      // Route 1: Oshodi - Abule-Egba
      { routeId: 1, stationId: 1, sequence: 1 }, // Oshodi Terminal 2
      { routeId: 1, stationId: 2, sequence: 2 }, // Bolade
      { routeId: 1, stationId: 3, sequence: 3 }, // Ladipo
      { routeId: 1, stationId: 4, sequence: 4 }, // Shogunle
      { routeId: 1, stationId: 5, sequence: 5 }, // PWD
      { routeId: 1, stationId: 6, sequence: 6 }, // Airport Junction
      { routeId: 1, stationId: 7, sequence: 7 }, // Ikeja Along
      { routeId: 1, stationId: 8, sequence: 8 }, // Ile Zik
      { routeId: 1, stationId: 9, sequence: 9 }, // Mangoro
      { routeId: 1, stationId: 10, sequence: 10 }, // Cement
      { routeId: 1, stationId: 11, sequence: 11 }, // Iyana Dopemu
      { routeId: 1, stationId: 12, sequence: 12 }, // Adealu
      { routeId: 1, stationId: 13, sequence: 13 }, // Iyana Ipaja Bus stop
      { routeId: 1, stationId: 14, sequence: 14 }, // Pleasure
      { routeId: 1, stationId: 15, sequence: 15 }, // Ile Epo
      { routeId: 1, stationId: 16, sequence: 16 }, // Super
      { routeId: 1, stationId: 17, sequence: 17 }, // Abule Egba
    ];

    routeStationsData.forEach(routeStation => {
      const id = this.currentRouteStationId++;
      this.routeStations.set(id, { id, ...routeStation });
    });
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
      routeNumber: route.routeNumber,
      name: route.name,
      color: route.color || "#1976D2",
      isActive: route.isActive ?? true
    };
    this.routes.set(id, newRoute);
    return newRoute;
  }

  async getStations(): Promise<Station[]> {
    return Array.from(this.stations.values());
  }

  async getStation(id: number): Promise<Station | undefined> {
    return this.stations.get(id);
  }

  async createStation(station: InsertStation): Promise<Station> {
    const id = this.currentStationId++;
    const newStation: Station = { id, ...station };
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
      busId: alert.busId ?? null,
      routeId: alert.routeId ?? null,
      type: alert.type,
      message: alert.message,
      severity: alert.severity ?? "medium"
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
    const routeStationsList = Array.from(this.routeStations.values())
      .filter(rs => rs.routeId === routeId)
      .sort((a, b) => a.sequence - b.sequence);
    
    return routeStationsList.map(rs => this.stations.get(rs.stationId)!);
  }

  async addStationToRoute(routeStation: InsertRouteStation): Promise<RouteStation> {
    const id = this.currentRouteStationId++;
    const newRouteStation: RouteStation = { id, ...routeStation };
    this.routeStations.set(id, newRouteStation);
    return newRouteStation;
  }

  async getSystemStats(): Promise<SystemStats> {
    const buses = Array.from(this.buses.values());
    const routes = Array.from(this.routes.values()).filter(r => r.isActive);
    
    const onTimeBuses = buses.filter(b => b.status === "on_time").length;
    const delayedBuses = buses.filter(b => b.status === "delayed").length;
    const alertBuses = buses.filter(b => b.status === "alert").length;
    
    return {
      totalBuses: buses.length,
      activeRoutes: routes.length,
      onTimePercentage: Math.round((onTimeBuses / buses.length) * 100),
      onTimeBuses,
      delayedBuses,
      alertBuses
    };
  }
}

export const storage = new MemStorage();
