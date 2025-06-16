import type { 
  Route, Bus, Station, Alert, RouteStation, BusArrival, 
  InsertRoute, InsertBus, InsertStation, InsertAlert, InsertRouteStation, InsertBusArrival,
  BusWithRoute, AlertWithDetails, BusArrivalWithDetails, StationDetails, SystemStats
} from "@shared/schema";

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
  getAllAlerts(): Promise<AlertWithDetails[]>;
  getAlert(id: number): Promise<Alert | undefined>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  acknowledgeAlert(id: number): Promise<Alert | undefined>;
  closeAlert(id: number): Promise<Alert | undefined>;
  clearAlert(id: number): Promise<Alert | undefined>;
  
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
    // Create 5 routes with detailed points for professional display
    const routeData = [
      {
        name: "Oshodi - Abule Egba",
        routeNumber: "Route 1",
        color: "#FF6B35",
        points: JSON.stringify([
          { x: 100, y: 200 }, { x: 150, y: 180 }, { x: 200, y: 160 },
          { x: 250, y: 150 }, { x: 300, y: 140 }, { x: 350, y: 130 },
          { x: 400, y: 120 }, { x: 450, y: 110 }, { x: 500, y: 100 }
        ])
      },
      {
        name: "Marina - Ikorodu",
        routeNumber: "Route 2", 
        color: "#4ECDC4",
        points: JSON.stringify([
          { x: 80, y: 300 }, { x: 120, y: 280 }, { x: 160, y: 260 },
          { x: 200, y: 240 }, { x: 240, y: 220 }, { x: 280, y: 200 },
          { x: 320, y: 180 }, { x: 360, y: 160 }, { x: 400, y: 140 }
        ])
      },
      {
        name: "Ikeja - Victoria Island",
        routeNumber: "Route 3",
        color: "#45B7D1",
        points: JSON.stringify([
          { x: 120, y: 150 }, { x: 180, y: 170 }, { x: 240, y: 190 },
          { x: 300, y: 210 }, { x: 360, y: 230 }, { x: 420, y: 250 },
          { x: 480, y: 270 }, { x: 540, y: 290 }
        ])
      },
      {
        name: "Ajah - CMS",
        routeNumber: "Route 4",
        color: "#96CEB4",
        points: JSON.stringify([
          { x: 60, y: 250 }, { x: 140, y: 240 }, { x: 220, y: 230 },
          { x: 300, y: 220 }, { x: 380, y: 210 }, { x: 460, y: 200 },
          { x: 540, y: 190 }, { x: 620, y: 180 }
        ])
      },
      {
        name: "Berger - Obalende",
        routeNumber: "Route 5",
        color: "#FFEAA7",
        points: JSON.stringify([
          { x: 90, y: 180 }, { x: 160, y: 200 }, { x: 230, y: 220 },
          { x: 300, y: 240 }, { x: 370, y: 260 }, { x: 440, y: 280 },
          { x: 510, y: 300 }, { x: 580, y: 320 }
        ])
      }
    ];

    routeData.forEach((route, index) => {
      const newRoute: Route = {
        id: this.currentRouteId++,
        routeNumber: route.routeNumber,
        name: route.name,
        color: route.color,
        isActive: true,
        points: route.points,
        lineStyle: "solid",
        lineWidth: 3,
        opacity: 1.0,
        pattern: "none",
        animation: "none",
        glowColor: null,
        gradientEnd: null
      };
      this.routes.set(newRoute.id, newRoute);
    });

    // Create stations along routes
    const stationData = [
      // Route 1 stations
      { name: "Oshodi Terminal", x: 100, y: 200, zone: 1 },
      { name: "Bolade", x: 200, y: 160, zone: 1 },
      { name: "Ladipo", x: 300, y: 140, zone: 2 },
      { name: "Shogunle", x: 400, y: 120, zone: 2 },
      { name: "Abule Egba", x: 500, y: 100, zone: 3 },
      
      // Route 2 stations
      { name: "Marina", x: 80, y: 300, zone: 1 },
      { name: "Iddo", x: 160, y: 260, zone: 1 },
      { name: "Yaba", x: 240, y: 220, zone: 2 },
      { name: "Palmgrove", x: 320, y: 180, zone: 2 },
      { name: "Ikorodu", x: 400, y: 140, zone: 3 },
      
      // Route 3 stations
      { name: "Ikeja", x: 120, y: 150, zone: 2 },
      { name: "Allen", x: 240, y: 190, zone: 2 },
      { name: "Ojuelegba", x: 360, y: 230, zone: 1 },
      { name: "Tafawa Balewa", x: 480, y: 270, zone: 1 },
      { name: "Victoria Island", x: 540, y: 290, zone: 1 },
      
      // Route 4 stations
      { name: "Ajah", x: 60, y: 250, zone: 4 },
      { name: "Abraham Adesanya", x: 220, y: 230, zone: 3 },
      { name: "Ibeju-Lekki", x: 380, y: 210, zone: 3 },
      { name: "Lekki Phase 1", x: 540, y: 190, zone: 2 },
      { name: "CMS", x: 620, y: 180, zone: 1 },
      
      // Route 5 stations
      { name: "Berger", x: 90, y: 180, zone: 3 },
      { name: "Ojodu", x: 230, y: 220, zone: 2 },
      { name: "Ogba", x: 370, y: 260, zone: 2 },
      { name: "Fadeyi", x: 510, y: 300, zone: 1 },
      { name: "Obalende", x: 580, y: 320, zone: 1 }
    ];

    stationData.forEach(station => {
      const newStation: Station = {
        id: this.currentStationId++,
        name: station.name,
        x: station.x,
        y: station.y,
        zone: station.zone,
        passengerCount: Math.floor(Math.random() * 50) + 10,
        trafficCondition: ["light", "normal", "heavy"][Math.floor(Math.random() * 3)],
        accessibility: Math.random() > 0.2,
        amenities: ["shelter", "seating", "lighting", "cctv"]
      };
      this.stations.set(newStation.id, newStation);
    });

    // Create buses that follow route paths
    const busData = [
      { routeId: 1, busNumber: "BRT-001", routeProgress: 0.1 },
      { routeId: 1, busNumber: "BRT-002", routeProgress: 0.6 },
      { routeId: 2, busNumber: "BRT-003", routeProgress: 0.3 },
      { routeId: 2, busNumber: "BRT-004", routeProgress: 0.8 },
      { routeId: 3, busNumber: "BRT-005", routeProgress: 0.2 },
      { routeId: 3, busNumber: "BRT-006", routeProgress: 0.7 },
      { routeId: 4, busNumber: "BRT-007", routeProgress: 0.4 },
      { routeId: 4, busNumber: "BRT-008", routeProgress: 0.9 },
      { routeId: 5, busNumber: "BRT-009", routeProgress: 0.15 },
      { routeId: 5, busNumber: "BRT-010", routeProgress: 0.65 }
    ];

    busData.forEach(busInfo => {
      const route = this.routes.get(busInfo.routeId);
      if (route) {
        const routePoints = JSON.parse(route.points);
        const position = this.getPositionOnRoute(routePoints, busInfo.routeProgress);
        
        const newBus: Bus = {
          id: this.currentBusId++,
          routeId: busInfo.routeId,
          busNumber: busInfo.busNumber,
          currentX: position.x,
          currentY: position.y,
          status: Math.random() > 0.8 ? "delayed" : "on_time",
          direction: "forward",
          passengerCount: Math.floor(Math.random() * 60) + 15,
          driverName: `Driver ${this.currentBusId - 1}`,
          driverPhone: `+234${Math.floor(Math.random() * 1000000000)}`,
          lastUpdated: new Date()
        };
        this.buses.set(newBus.id, newBus);
      }
    });

    // Create some alerts
    this.createSampleAlerts();
  }

  private getPositionOnRoute(points: {x: number, y: number}[], progress: number): {x: number, y: number} {
    if (points.length < 2) return points[0] || {x: 0, y: 0};
    
    const totalSegments = points.length - 1;
    const segmentProgress = progress * totalSegments;
    const segmentIndex = Math.floor(segmentProgress);
    const localProgress = segmentProgress - segmentIndex;
    
    if (segmentIndex >= totalSegments) {
      return points[points.length - 1];
    }
    
    const startPoint = points[segmentIndex];
    const endPoint = points[segmentIndex + 1];
    
    return {
      x: startPoint.x + (endPoint.x - startPoint.x) * localProgress,
      y: startPoint.y + (endPoint.y - startPoint.y) * localProgress
    };
  }

  private createSampleAlerts() {
    const alertTypes = ["breakdown", "traffic", "medical", "security", "weather"];
    const severities = ["low", "medium", "high", "critical"];
    
    for (let i = 0; i < 3; i++) {
      const busId = Array.from(this.buses.keys())[Math.floor(Math.random() * this.buses.size)];
      const bus = this.buses.get(busId);
      
      if (bus) {
        const alert: Alert = {
          id: this.currentAlertId++,
          busId: busId,
          routeId: bus.routeId,
          type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
          message: `Alert for bus ${bus.busNumber}`,
          priority: severities[Math.floor(Math.random() * severities.length)],
          severity: severities[Math.floor(Math.random() * severities.length)],
          status: "active",
          isActive: true,
          driverName: bus.driverName,
          driverNumber: bus.driverPhone,
          location: `${bus.currentX}, ${bus.currentY}`,
          estimatedResolution: new Date(Date.now() + Math.random() * 3600000),
          createdAt: new Date(),
          timestamp: new Date()
        };
        this.alerts.set(alert.id, alert);
      }
    }
  }

  public simulateBusMovement() {
    this.buses.forEach((bus, id) => {
      const route = this.routes.get(bus.routeId);
      if (route) {
        const routePoints = JSON.parse(route.points);
        // Move bus along route
        const currentProgress = this.getBusProgressOnRoute(bus, routePoints);
        const newProgress = (currentProgress + 0.01) % 1.0; // Small increment
        const newPosition = this.getPositionOnRoute(routePoints, newProgress);
        
        bus.currentX = newPosition.x;
        bus.currentY = newPosition.y;
        bus.lastUpdated = new Date();
        
        this.buses.set(id, bus);
      }
    });
  }

  private getBusProgressOnRoute(bus: Bus, routePoints: {x: number, y: number}[]): number {
    // Find closest point on route and calculate progress
    let minDistance = Infinity;
    let closestSegment = 0;
    
    for (let i = 0; i < routePoints.length - 1; i++) {
      const distance = this.distanceToSegment(
        bus.currentX, bus.currentY,
        routePoints[i].x, routePoints[i].y,
        routePoints[i + 1].x, routePoints[i + 1].y
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestSegment = i;
      }
    }
    
    return closestSegment / (routePoints.length - 1);
  }

  private distanceToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
    
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (length * length)));
    const projectionX = x1 + t * dx;
    const projectionY = y1 + t * dy;
    
    return Math.sqrt((px - projectionX) * (px - projectionX) + (py - projectionY) * (py - projectionY));
  }

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
      points: route.points || "[]",
      lineStyle: route.lineStyle || "solid",
      lineWidth: route.lineWidth || 3,
      opacity: route.opacity || 1.0,
      pattern: route.pattern || "none",
      animation: route.animation || "none",
      glowColor: route.glowColor || null,
      gradientEnd: route.gradientEnd || null
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
      ...station,
      amenities: station.amenities || []
    };
    this.stations.set(newStation.id, newStation);
    return newStation;
  }

  async getBuses(): Promise<Bus[]> {
    return Array.from(this.buses.values());
  }

  async getBusesWithRoutes(): Promise<BusWithRoute[]> {
    const buses = Array.from(this.buses.values());
    const routes = Array.from(this.routes.values());
    
    return buses.map(bus => {
      const route = routes.find(r => r.id === bus.routeId);
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
    const activeAlerts = Array.from(this.alerts.values()).filter(alert => alert.isActive);
    return activeAlerts.map(alert => ({
      ...alert,
      busNumber: this.buses.get(alert.busId || 0)?.busNumber || null,
      routeName: this.routes.get(alert.routeId || 0)?.name || null
    }));
  }

  async getAllAlerts(): Promise<AlertWithDetails[]> {
    const allAlerts = Array.from(this.alerts.values());
    return allAlerts.map(alert => ({
      ...alert,
      busNumber: this.buses.get(alert.busId || 0)?.busNumber || null,
      routeName: this.routes.get(alert.routeId || 0)?.name || null
    }));
  }

  async getAlert(id: number): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const newAlert: Alert = { 
      id: this.currentAlertId++, 
      ...alert,
      createdAt: new Date(),
      timestamp: new Date()
    };
    this.alerts.set(newAlert.id, newAlert);
    return newAlert;
  }

  async acknowledgeAlert(id: number): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (alert) {
      alert.status = "acknowledged";
      this.alerts.set(id, alert);
      return alert;
    }
    return undefined;
  }

  async closeAlert(id: number): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (alert) {
      alert.status = "closed";
      alert.isActive = false;
      this.alerts.set(id, alert);
      return alert;
    }
    return undefined;
  }

  async clearAlert(id: number): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (alert) {
      alert.status = "cleared";
      alert.isActive = false;
      this.alerts.set(id, alert);
      return alert;
    }
    return undefined;
  }

  async getRouteStations(routeId: number): Promise<Station[]> {
    const routeStations = Array.from(this.routeStations.values())
      .filter(rs => rs.routeId === routeId)
      .sort((a, b) => a.order - b.order);
    
    return routeStations.map(rs => {
      const station = this.stations.get(rs.stationId);
      return station!;
    }).filter(Boolean);
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

    return {
      ...station,
      upcomingArrivals: [], // Would be populated with real arrival data
      alerts: Array.from(this.alerts.values()).filter(alert => 
        alert.routeId && this.getRouteStations(alert.routeId).then(stations => 
          stations.some(s => s.id === id)
        )
      )
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
    
    return arrivals.map(arrival => ({
      ...arrival,
      busNumber: this.buses.get(arrival.busId)?.busNumber || null,
      routeName: this.routes.get(arrival.routeId)?.name || null
    }));
  }

  async createBusArrival(arrival: InsertBusArrival): Promise<BusArrival> {
    const newArrival: BusArrival = { 
      id: this.currentBusArrivalId++, 
      ...arrival
    };
    this.busArrivals.set(newArrival.id, newArrival);
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
    const buses = Array.from(this.buses.values());
    const routes = Array.from(this.routes.values());
    const onTimeBuses = buses.filter(bus => bus.status === "on_time").length;
    const delayedBuses = buses.filter(bus => bus.status === "delayed").length;
    const alertBuses = buses.filter(bus => bus.status === "alert").length;
    
    return {
      totalBuses: buses.length,
      activeRoutes: routes.filter(route => route.isActive).length,
      onTimePercentage: buses.length > 0 ? Math.round((onTimeBuses / buses.length) * 100) : 0,
      onTimeBuses,
      delayedBuses,
      alertBuses,
      avgCrowdDensity: 0,
      peakStations: []
    };
  }
}

export const storage = new MemStorage();

// Start bus movement simulation
setInterval(() => {
  storage.simulateBusMovement();
}, 2000);