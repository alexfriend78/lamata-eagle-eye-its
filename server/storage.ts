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
    // Create stations based on London bus routes
    const stationsData = [
      { name: "Paddington", x: 80, y: 128 },
      { name: "Oxford Circus", x: 320, y: 128 },
      { name: "King's Cross", x: 384, y: 80 },
      { name: "Liverpool Street", x: 480, y: 128 },
      { name: "Bank", x: 448, y: 192 },
      { name: "Holborn", x: 300, y: 200 },
      { name: "Tottenham Court Road", x: 260, y: 160 },
      { name: "Regent Street", x: 240, y: 180 },
    ];

    stationsData.forEach(station => {
      const id = this.currentStationId++;
      this.stations.set(id, { id, ...station });
    });

    // Create routes
    const routesData = [
      { routeNumber: "8", name: "Bow - Tottenham Court Road", color: "#1976D2" },
      { routeNumber: "25", name: "Holborn - Ilford", color: "#1976D2" },
      { routeNumber: "73", name: "Victoria - Stoke Newington", color: "#1976D2" },
      { routeNumber: "205", name: "Paddington - Bow", color: "#1976D2" },
    ];

    routesData.forEach(route => {
      const id = this.currentRouteId++;
      this.routes.set(id, { id, isActive: true, ...route });
    });

    // Create buses
    const busesData = [
      { routeId: 1, busNumber: "LF08-KXY", currentX: 96, currentY: 112, status: "on_time", direction: "forward" },
      { routeId: 1, busNumber: "LF08-MZB", currentX: 320, currentY: 112, status: "delayed", direction: "reverse" },
      { routeId: 2, busNumber: "LF09-ABC", currentX: 160, currentY: 144, status: "alert", direction: "forward" },
      { routeId: 3, busNumber: "LF09-DEF", currentX: 304, currentY: 128, status: "on_time", direction: "forward" },
      { routeId: 4, busNumber: "LF10-GHI", currentX: 176, currentY: 224, status: "on_time", direction: "reverse" },
      { routeId: 4, busNumber: "LF10-JKL", currentX: 352, currentY: 224, status: "delayed", direction: "forward" },
    ];

    busesData.forEach(bus => {
      const id = this.currentBusId++;
      this.buses.set(id, { id, lastUpdated: new Date(), ...bus });
    });

    // Create some alerts
    const alertsData = [
      { busId: 3, routeId: 2, type: "emergency", message: "Emergency stop - Medical assistance required", severity: "critical" },
      { routeId: 1, type: "delay", message: "Traffic delay - Expected 10 min behind schedule", severity: "medium" },
    ];

    alertsData.forEach(alert => {
      const id = this.currentAlertId++;
      this.alerts.set(id, { id, isActive: true, createdAt: new Date(), ...alert });
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
    const newRoute: Route = { id, ...route };
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
    const newBus: Bus = { id, lastUpdated: new Date(), ...bus };
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
    const newAlert: Alert = { id, isActive: true, createdAt: new Date(), ...alert };
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
