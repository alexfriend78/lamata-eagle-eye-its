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

    // Create buses for each route
    const busesData = [
      { number: "BRT001", routeId: 1, status: "active", capacity: 70 },
      { number: "BRT002", routeId: 1, status: "active", capacity: 70 },
      { number: "BRT003", routeId: 2, status: "delayed", capacity: 70 },
      { number: "BRT004", routeId: 2, status: "active", capacity: 70 },
      { number: "BRT005", routeId: 3, status: "active", capacity: 70 },
      { number: "BRT006", routeId: 3, status: "alert", capacity: 70 },
      { number: "BRT007", routeId: 4, status: "active", capacity: 70 },
      { number: "BRT008", routeId: 5, status: "active", capacity: 70 }
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

    // Create some sample alerts
    const alertsData = [
      { type: "traffic", message: "Heavy traffic on Route 2", routeId: 2, severity: "medium", isActive: true },
      { type: "maintenance", message: "Bus BRT006 requires maintenance", busId: 6, severity: "high", isActive: true }
    ];

    alertsData.forEach(alertData => {
      const id = this.currentAlertId++;
      this.alerts.set(id, {
        id,
        ...alertData,
        createdAt: new Date()
      });
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
      const speed = bus.status === "delayed" ? 2 : bus.status === "alert" ? 1 : 4;
      
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
}

export const storage = new MemStorage();