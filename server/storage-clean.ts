import { 
  Route, Station, Bus, Alert, RouteStation, BusArrival, 
  BusWithRoute, AlertWithDetails, BusArrivalWithDetails, StationDetails, SystemStats,
  InsertRoute, InsertStation, InsertBus, InsertAlert, InsertRouteStation, InsertBusArrival
} from '@shared/schema';
import { IStorage } from './storage';

export class CleanMemStorage implements IStorage {
  private routes: Map<number, Route> = new Map();
  private stations: Map<number, Station> = new Map();
  private buses: Map<number, Bus> = new Map();
  private alerts: Map<number, Alert> = new Map();
  private routeStations: Map<number, RouteStation> = new Map();
  private busArrivals: Map<number, BusArrival> = new Map();
  
  private currentRouteId = 1;
  private currentStationId = 1;
  private currentBusId = 1;
  private currentAlertId = 1;
  private currentRouteStationId = 1;
  private currentBusArrivalId = 1;

  constructor() {
    this.seedData();
    this.simulateBusMovement();
  }

  private seedData() {
    // Lagos bus routes with actual paths
    const lagosRoutes = [
      {
        id: this.currentRouteId++,
        name: "Oshodi-Abule Egba",
        routeNumber: "BRT-1",
        color: "#dc2626",
        isActive: true,
        points: JSON.stringify([
          {x: 200, y: 150}, {x: 250, y: 160}, {x: 300, y: 170}, {x: 350, y: 180},
          {x: 400, y: 190}, {x: 450, y: 200}, {x: 500, y: 210}, {x: 550, y: 220}
        ]),
        lineStyle: "solid",
        lineWidth: 4,
        opacity: 0.8,
        pattern: "none",
        animation: "none",
        glowColor: null,
        gradientEnd: null
      },
      {
        id: this.currentRouteId++,
        name: "Mile 2-CMS",
        routeNumber: "BRT-2", 
        color: "#2563eb",
        isActive: true,
        points: JSON.stringify([
          {x: 150, y: 300}, {x: 200, y: 280}, {x: 250, y: 260}, {x: 300, y: 240},
          {x: 350, y: 220}, {x: 400, y: 200}, {x: 450, y: 180}, {x: 500, y: 160}
        ]),
        lineStyle: "solid",
        lineWidth: 4,
        opacity: 0.8,
        pattern: "none",
        animation: "none",
        glowColor: null,
        gradientEnd: null
      },
      {
        id: this.currentRouteId++,
        name: "Ikorodu-TBS",
        routeNumber: "BRT-3",
        color: "#059669",
        isActive: true,
        points: JSON.stringify([
          {x: 100, y: 400}, {x: 180, y: 350}, {x: 260, y: 300}, {x: 340, y: 250},
          {x: 420, y: 200}, {x: 500, y: 150}, {x: 580, y: 100}
        ]),
        lineStyle: "solid",
        lineWidth: 4,
        opacity: 0.8,
        pattern: "none",
        animation: "none",
        glowColor: null,
        gradientEnd: null
      }
    ];

    lagosRoutes.forEach(route => {
      this.routes.set(route.id, route);
    });

    // Lagos bus stations
    const lagosStations = [
      { id: this.currentStationId++, name: "Oshodi Terminal", x: 200, y: 150, zone: 1, passengerCount: 45, trafficCondition: "moderate", accessibility: true, amenities: ["WiFi", "Shelter"] },
      { id: this.currentStationId++, name: "Bolade", x: 300, y: 170, zone: 1, passengerCount: 32, trafficCondition: "light", accessibility: true, amenities: ["Shelter"] },
      { id: this.currentStationId++, name: "Ladipo", x: 400, y: 190, zone: 2, passengerCount: 28, trafficCondition: "moderate", accessibility: false, amenities: ["WiFi"] },
      { id: this.currentStationId++, name: "Mile 2", x: 150, y: 300, zone: 3, passengerCount: 52, trafficCondition: "heavy", accessibility: true, amenities: ["WiFi", "Shelter", "ATM"] },
      { id: this.currentStationId++, name: "Festac", x: 250, y: 260, zone: 3, passengerCount: 38, trafficCondition: "moderate", accessibility: true, amenities: ["Shelter"] },
      { id: this.currentStationId++, name: "Ikorodu Garage", x: 100, y: 400, zone: 4, passengerCount: 41, trafficCondition: "light", accessibility: false, amenities: ["WiFi"] }
    ];

    lagosStations.forEach(station => {
      this.stations.set(station.id, station);
    });

    // Lagos buses with proper route assignment
    const lagosBuses = [
      { id: this.currentBusId++, routeId: 1, busNumber: "LG-001-BRT", currentX: 200, currentY: 150, status: "on-time", direction: "outbound", passengerCount: 45, driverName: "Adebayo Ogundimu", driverPhone: "+234-801-234-5678", lastUpdated: new Date() },
      { id: this.currentBusId++, routeId: 1, busNumber: "LG-002-BRT", currentX: 350, currentY: 180, status: "delayed", direction: "inbound", passengerCount: 32, driverName: "Fatima Aliyu", driverPhone: "+234-802-345-6789", lastUpdated: new Date() },
      { id: this.currentBusId++, routeId: 2, busNumber: "LG-003-BRT", currentX: 150, currentY: 300, status: "on-time", direction: "outbound", passengerCount: 28, driverName: "Chinedu Okoro", driverPhone: "+234-803-456-7890", lastUpdated: new Date() },
      { id: this.currentBusId++, routeId: 2, busNumber: "LG-004-BRT", currentX: 400, currentY: 200, status: "breakdown", direction: "inbound", passengerCount: 0, driverName: "Kemi Adesanya", driverPhone: "+234-804-567-8901", lastUpdated: new Date() },
      { id: this.currentBusId++, routeId: 3, busNumber: "LG-005-BRT", currentX: 260, currentY: 300, status: "on-time", direction: "outbound", passengerCount: 38, driverName: "Ibrahim Hassan", driverPhone: "+234-805-678-9012", lastUpdated: new Date() }
    ];

    lagosBuses.forEach(bus => {
      this.buses.set(bus.id, bus);
    });

    // Create sample alerts
    this.createSampleAlerts();
  }

  private createSampleAlerts() {
    const alertTypes = ["breakdown", "delay", "emergency", "maintenance"];
    const severities = ["low", "medium", "high", "critical"];
    
    const sampleAlerts = [
      {
        id: this.currentAlertId++,
        busId: 4,
        routeId: 2,
        type: "breakdown",
        message: "Bus LG-004-BRT experiencing mechanical issues at Festac station",
        priority: "high",
        severity: "high",
        status: "active",
        isActive: true,
        driverName: "Kemi Adesanya",
        driverNumber: "+234-804-567-8901",
        estimatedResolution: new Date(Date.now() + 1800000),
        createdAt: new Date(),
        timestamp: new Date()
      }
    ];

    sampleAlerts.forEach(alert => {
      this.alerts.set(alert.id, alert);
    });
  }

  public simulateBusMovement() {
    setInterval(() => {
      for (const [id, bus] of this.buses.entries()) {
        const route = this.routes.get(bus.routeId);
        if (!route || bus.status === "breakdown") continue;

        try {
          const points = JSON.parse(route.points) as Array<{x: number, y: number}>;
          if (points.length < 2) continue;

          // Move bus along route path
          const currentIndex = this.getBusIndexOnRoute(bus, points);
          const nextIndex = (currentIndex + 1) % points.length;
          const nextPoint = points[nextIndex];

          // Smooth movement towards next point
          const dx = nextPoint.x - bus.currentX;
          const dy = nextPoint.y - bus.currentY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 5) {
            const moveX = (dx / distance) * 2;
            const moveY = (dy / distance) * 2;
            
            const updatedBus = {
              ...bus,
              currentX: bus.currentX + moveX,
              currentY: bus.currentY + moveY,
              lastUpdated: new Date()
            };
            
            this.buses.set(id, updatedBus);
          }
        } catch (error) {
          console.warn(`Error moving bus ${bus.busNumber}:`, error);
        }
      }
    }, 2000);
  }

  private getBusIndexOnRoute(bus: Bus, points: Array<{x: number, y: number}>): number {
    let closestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < points.length; i++) {
      const dx = points[i].x - bus.currentX;
      const dy = points[i].y - bus.currentY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    return closestIndex;
  }

  // IStorage implementation
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
      color: route.color || "#000000",
      isActive: route.isActive || true
    };
    this.routes.set(newRoute.id, newRoute);
    return newRoute;
  }

  async updateRouteAesthetics(id: number, aesthetics: Partial<Route>): Promise<Route | undefined> {
    const route = this.routes.get(id);
    if (route) {
      const updatedRoute = { ...route, ...aesthetics };
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
      ...station,
      passengerCount: station.passengerCount || 0,
      zone: station.zone || 1,
      trafficCondition: station.trafficCondition || "light",
      accessibility: station.accessibility || false
    };
    this.stations.set(newStation.id, newStation);
    return newStation;
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

  async getBuses(): Promise<Bus[]> {
    return Array.from(this.buses.values());
  }

  async getBusesWithRoutes(): Promise<BusWithRoute[]> {
    const buses = Array.from(this.buses.values());
    return buses.map(bus => {
      const route = this.routes.get(bus.routeId);
      return { ...bus, route: route! };
    }).filter(bus => bus.route);
  }

  async getBus(id: number): Promise<Bus | undefined> {
    return this.buses.get(id);
  }

  async createBus(bus: InsertBus): Promise<Bus> {
    const newBus: Bus = { 
      id: this.currentBusId++, 
      ...bus,
      status: bus.status || "on-time",
      direction: bus.direction || "outbound",
      passengerCount: bus.passengerCount || 0,
      lastUpdated: new Date()
    };
    this.buses.set(newBus.id, newBus);
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
    return Array.from(this.alerts.values())
      .filter(alert => alert.isActive)
      .map(alert => {
        const bus = alert.busId ? this.buses.get(alert.busId) : undefined;
        const route = alert.routeId ? this.routes.get(alert.routeId) : undefined;
        return { ...alert, bus, route };
      });
  }

  async getAllAlerts(): Promise<AlertWithDetails[]> {
    return Array.from(this.alerts.values()).map(alert => {
      const bus = alert.busId ? this.buses.get(alert.busId) : undefined;
      const route = alert.routeId ? this.routes.get(alert.routeId) : undefined;
      return { ...alert, bus, route };
    });
  }

  async getAlert(id: number): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const newAlert: Alert = { 
      id: this.currentAlertId++, 
      ...alert,
      routeId: alert.routeId || null,
      status: alert.status || "active",
      isActive: alert.isActive || true,
      createdAt: new Date(),
      timestamp: new Date()
    };
    this.alerts.set(newAlert.id, newAlert);
    return newAlert;
  }

  async acknowledgeAlert(id: number): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (alert) {
      const updatedAlert = { ...alert, status: "acknowledged" };
      this.alerts.set(id, updatedAlert);
      return updatedAlert;
    }
    return undefined;
  }

  async closeAlert(id: number): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (alert) {
      const updatedAlert = { ...alert, status: "closed", isActive: false };
      this.alerts.set(id, updatedAlert);
      return updatedAlert;
    }
    return undefined;
  }

  async clearAlert(id: number): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (alert) {
      const updatedAlert = { ...alert, status: "resolved", isActive: false };
      this.alerts.set(id, updatedAlert);
      return updatedAlert;
    }
    return undefined;
  }

  async getRouteStations(routeId: number): Promise<Station[]> {
    return Array.from(this.stations.values()).filter(station => station.zone <= 2);
  }

  async addStationToRoute(routeStation: InsertRouteStation): Promise<RouteStation> {
    const newRouteStation: RouteStation = { 
      id: this.currentRouteStationId++, 
      ...routeStation 
    };
    this.routeStations.set(newRouteStation.id, newRouteStation);
    return newRouteStation;
  }

  async getBusArrivals(stationId: number): Promise<BusArrivalWithDetails[]> {
    return [];
  }

  async createBusArrival(arrival: InsertBusArrival): Promise<BusArrival> {
    const newArrival: BusArrival = { 
      id: this.currentBusArrivalId++, 
      ...arrival,
      status: arrival.status || "scheduled"
    };
    this.busArrivals.set(newArrival.id, newArrival);
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

  async getStationDetails(id: number): Promise<StationDetails | undefined> {
    const station = this.stations.get(id);
    if (!station) return undefined;

    return {
      ...station,
      upcomingArrivals: [],
      activeRoutes: Array.from(this.routes.values()).slice(0, 2)
    };
  }

  async getSystemStats(): Promise<SystemStats> {
    const buses = Array.from(this.buses.values());
    const routes = Array.from(this.routes.values());
    const alerts = Array.from(this.alerts.values());

    const onTimeBuses = buses.filter(bus => bus.status === "on-time").length;
    const delayedBuses = buses.filter(bus => bus.status === "delayed").length;
    const alertBuses = buses.filter(bus => alerts.some(alert => alert.busId === bus.id && alert.isActive)).length;

    return {
      totalBuses: buses.length,
      activeRoutes: routes.filter(route => route.isActive).length,
      onTimePercentage: buses.length > 0 ? Math.round((onTimeBuses / buses.length) * 100) : 0,
      onTimeBuses,
      delayedBuses,
      alertBuses,
      avgCrowdDensity: 0,
      peakStations: 3
    };
  }
}

export const storage = new CleanMemStorage();