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
    // Create only the 5 Lagos BRT routes
    const routesData = [
      { routeNumber: "1", name: "Oshodi - Abule-Egba", color: "#FF0000" },
      { routeNumber: "2", name: "Abule Egba - TBS/Obalende", color: "#0066CC" },
      { routeNumber: "3", name: "Lagos Metro Express", color: "#00AA44" },
      { routeNumber: "4", name: "Ikorodu - Fadeyi", color: "#FFD700" },
      { routeNumber: "5", name: "Lagos Orbital Express", color: "#8A2BE2" }
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
      // Route 1: Oshodi - Abule-Egba stations (positioned exactly on frontend route line)
      // Frontend path: 0.37,0.67 → 0.365,0.65 → 0.345,0.63 → ... → 0.065,0.35
      { name: "Oshodi Terminal 2", x: 0.37, y: 0.67, zone: 2, routeId: 1 },
      { name: "Bolade", x: 0.365, y: 0.65, zone: 2, routeId: 1 },
      { name: "Ladipo", x: 0.345, y: 0.63, zone: 2, routeId: 1 },
      { name: "Shogunle", x: 0.325, y: 0.61, zone: 2, routeId: 1 },
      { name: "PWD", x: 0.305, y: 0.59, zone: 1, routeId: 1 },
      { name: "Airport Junction", x: 0.285, y: 0.57, zone: 1, routeId: 1 },
      { name: "Ikeja Along", x: 0.265, y: 0.55, zone: 1, routeId: 1 },
      { name: "Ile Zik", x: 0.245, y: 0.53, zone: 1, routeId: 1 },
      { name: "Mangoro", x: 0.225, y: 0.51, zone: 1, routeId: 1 },
      { name: "Cement", x: 0.205, y: 0.49, zone: 1, routeId: 1 },
      { name: "Iyana Dopemu", x: 0.185, y: 0.47, zone: 1, routeId: 1 },
      { name: "Adealu", x: 0.165, y: 0.45, zone: 1, routeId: 1 },
      { name: "Iyana Ipaja Bus stop", x: 0.145, y: 0.43, zone: 1, routeId: 1 },
      { name: "Pleasure", x: 0.125, y: 0.41, zone: 1, routeId: 1 },
      { name: "Ile Epo", x: 0.105, y: 0.39, zone: 1, routeId: 1 },
      { name: "Super", x: 0.085, y: 0.37, zone: 1, routeId: 1 },
      { name: "Abule Egba", x: 0.065, y: 0.35, zone: 1, routeId: 1 },

      // Route 2: Blue Line - Zigzag route with stations positioned along 7 segments
      // Segment 1 stations: Northwest diagonal
      { name: "Abule Egba Terminal", x: 0.18, y: 0.28, zone: 1, routeId: 2 },
      { name: "Ile Epo", x: 0.20, y: 0.26, zone: 1, routeId: 2 },
      { name: "Command", x: 0.22, y: 0.24, zone: 1, routeId: 2 },
      { name: "Canaan Land", x: 0.25, y: 0.22, zone: 1, routeId: 2 },
      
      // Segment 2 stations: Northeast diagonal
      { name: "Iyana Ipaja", x: 0.28, y: 0.24, zone: 1, routeId: 2 },
      { name: "Alimosho", x: 0.31, y: 0.26, zone: 1, routeId: 2 },
      { name: "Dopemu Junction", x: 0.35, y: 0.28, zone: 1, routeId: 2 },
      
      // Segment 3 stations: Straight east
      { name: "Agege", x: 0.38, y: 0.28, zone: 1, routeId: 2 },
      { name: "Pen Cinema", x: 0.42, y: 0.28, zone: 1, routeId: 2 },
      { name: "Ogba", x: 0.46, y: 0.28, zone: 1, routeId: 2 },
      { name: "Ikeja Along", x: 0.50, y: 0.28, zone: 1, routeId: 2 },
      
      // Segment 4 stations: Southeast diagonal
      { name: "Airport Junction", x: 0.53, y: 0.31, zone: 2, routeId: 2 },
      { name: "PWD", x: 0.56, y: 0.34, zone: 2, routeId: 2 },
      { name: "Berger", x: 0.60, y: 0.38, zone: 2, routeId: 2 },
      
      // Segment 5 stations: Southwest diagonal
      { name: "Ketu", x: 0.57, y: 0.41, zone: 2, routeId: 2 },
      { name: "Ojota", x: 0.54, y: 0.44, zone: 2, routeId: 2 },
      { name: "Maryland", x: 0.51, y: 0.47, zone: 2, routeId: 2 },
      { name: "Anthony", x: 0.50, y: 0.50, zone: 2, routeId: 2 },
      
      // Segment 6 stations: Southeast diagonal again
      { name: "Obanikoro", x: 0.54, y: 0.54, zone: 2, routeId: 2 },
      { name: "Palmgroove", x: 0.58, y: 0.58, zone: 2, routeId: 2 },
      { name: "Yaba", x: 0.62, y: 0.61, zone: 2, routeId: 2 },
      { name: "Jibowu", x: 0.66, y: 0.63, zone: 2, routeId: 2 },
      { name: "Costain", x: 0.70, y: 0.65, zone: 2, routeId: 2 },
      
      // Segment 7 stations: Final east stretch
      { name: "National Theatre", x: 0.74, y: 0.65, zone: 2, routeId: 2 },
      { name: "Lagos Island", x: 0.78, y: 0.65, zone: 2, routeId: 2 },
      { name: "CMS Terminal", x: 0.82, y: 0.65, zone: 2, routeId: 2 },
      { name: "Marina", x: 0.86, y: 0.65, zone: 2, routeId: 2 },
      { name: "Victoria Island Terminal", x: 0.90, y: 0.65, zone: 3, routeId: 2 },

      // Route 3: Lagos Metro Express (positioned exactly on frontend route line)
      // Frontend path: (0.15,0.70) → (0.40,0.35) → (0.30,0.15) → (0.65,0.25) → (0.85,0.60)
      
      // Segment 1: Southwest to northeast diagonal (0.15,0.70) → (0.40,0.35)
      { name: "Ikorodu West", x: 0.15, y: 0.70, zone: 3, routeId: 3 },
      { name: "Owutu", x: 0.20, y: 0.63, zone: 2, routeId: 3 },
      { name: "Kosofe", x: 0.25, y: 0.56, zone: 2, routeId: 3 },
      { name: "Ketu", x: 0.30, y: 0.49, zone: 2, routeId: 3 },
      { name: "Mile 12", x: 0.35, y: 0.42, zone: 2, routeId: 3 },
      { name: "Ojota", x: 0.40, y: 0.35, zone: 2, routeId: 3 },
      
      // Segment 2: Northwest to southeast diagonal (0.40,0.35) → (0.30,0.15)
      { name: "Maryland", x: 0.38, y: 0.30, zone: 2, routeId: 3 },
      { name: "Palmgrove", x: 0.36, y: 0.25, zone: 2, routeId: 3 },
      { name: "Ikeja GRA", x: 0.34, y: 0.20, zone: 2, routeId: 3 },
      { name: "Allen Avenue", x: 0.32, y: 0.17, zone: 2, routeId: 3 },
      { name: "Computer Village", x: 0.30, y: 0.15, zone: 2, routeId: 3 },
      
      // Segment 3: Southwest to northeast diagonal (0.30,0.15) → (0.65,0.25)
      { name: "Ojuelegba", x: 0.37, y: 0.17, zone: 2, routeId: 3 },
      { name: "Surulere", x: 0.44, y: 0.19, zone: 2, routeId: 3 },
      { name: "National Stadium", x: 0.51, y: 0.21, zone: 2, routeId: 3 },
      { name: "Alaba", x: 0.58, y: 0.23, zone: 2, routeId: 3 },
      { name: "Mile 2", x: 0.65, y: 0.25, zone: 2, routeId: 3 },
      
      // Segment 4: Northwest to southeast diagonal (0.65,0.25) → (0.85,0.60)
      { name: "Festac", x: 0.69, y: 0.32, zone: 2, routeId: 3 },
      { name: "Satellite Town", x: 0.73, y: 0.39, zone: 2, routeId: 3 },
      { name: "Trade Fair", x: 0.77, y: 0.46, zone: 2, routeId: 3 },
      { name: "Badagry Terminal", x: 0.85, y: 0.60, zone: 3, routeId: 3 },

      // Route 4: Realistic Lagos BRT stations - Ikorodu to Victoria Island
      // Segment 1 stations: Northeast from Ikorodu towards Mile 12
      { name: "Ikorodu Terminal", x: 0.15, y: 0.85, zone: 4, routeId: 4 },
      { name: "Benson", x: 0.18, y: 0.82, zone: 4, routeId: 4 },
      { name: "Agric", x: 0.21, y: 0.79, zone: 4, routeId: 4 },
      { name: "Mile 12", x: 0.26, y: 0.74, zone: 3, routeId: 4 },
      { name: "Owutu", x: 0.30, y: 0.70, zone: 3, routeId: 4 },
      
      // Segment 2 stations: East through Ketu-Maryland corridor
      { name: "Ketu", x: 0.35, y: 0.68, zone: 3, routeId: 4 },
      { name: "Ojota", x: 0.40, y: 0.66, zone: 2, routeId: 4 },
      { name: "Maryland", x: 0.45, y: 0.65, zone: 2, routeId: 4 },
      
      // Segment 3 stations: Northeast through Yaba-Surulere
      { name: "Anthony", x: 0.50, y: 0.58, zone: 2, routeId: 4 },
      { name: "Palmgroove", x: 0.53, y: 0.55, zone: 2, routeId: 4 },
      { name: "Yaba", x: 0.57, y: 0.52, zone: 2, routeId: 4 },
      { name: "Surulere", x: 0.60, y: 0.50, zone: 2, routeId: 4 },
      
      // Segment 4 stations: East through Lagos Island
      { name: "National Theatre", x: 0.65, y: 0.48, zone: 2, routeId: 4 },
      { name: "Lagos Island", x: 0.70, y: 0.46, zone: 2, routeId: 4 },
      { name: "CMS", x: 0.75, y: 0.45, zone: 2, routeId: 4 },
      
      // Segment 5 stations: Southeast to Victoria Island
      { name: "Tafawa Balewa Square", x: 0.78, y: 0.42, zone: 2, routeId: 4 },
      { name: "Ikoyi Bridge", x: 0.81, y: 0.39, zone: 2, routeId: 4 },
      { name: "Falomo", x: 0.83, y: 0.37, zone: 2, routeId: 4 },
      { name: "Victoria Island Terminal", x: 0.85, y: 0.35, zone: 2, routeId: 4 },

      // Route 5: Lagos Orbital Express - Non-crossing Arc stations
      // Segment 1 stations: Start northwest
      { name: "Abule Egba Terminal", x: 0.15, y: 0.25, zone: 1, routeId: 5 },
      { name: "Iyana Ipaja", x: 0.20, y: 0.22, zone: 1, routeId: 5 },
      { name: "Command", x: 0.25, y: 0.20, zone: 1, routeId: 5 },
      { name: "Ikeja GRA", x: 0.30, y: 0.18, zone: 2, routeId: 5 },
      
      // Segment 2 stations: Curve northeast
      { name: "Allen Avenue", x: 0.35, y: 0.15, zone: 2, routeId: 5 },
      { name: "Ojuelegba", x: 0.40, y: 0.13, zone: 2, routeId: 5 },
      { name: "Yaba", x: 0.45, y: 0.12, zone: 2, routeId: 5 },
      { name: "Palmgrove", x: 0.50, y: 0.11, zone: 2, routeId: 5 },
      
      // Segment 3 stations: Continue northeast
      { name: "Ebute Metta", x: 0.55, y: 0.10, zone: 2, routeId: 5 },
      { name: "National Theatre", x: 0.60, y: 0.10, zone: 2, routeId: 5 },
      { name: "Ijora", x: 0.65, y: 0.12, zone: 2, routeId: 5 },
      { name: "Costain", x: 0.70, y: 0.15, zone: 2, routeId: 5 },
      
      // Segment 4 stations: Turn southeast
      { name: "Alaba Market", x: 0.75, y: 0.20, zone: 2, routeId: 5 },
      { name: "Mile 2", x: 0.78, y: 0.23, zone: 2, routeId: 5 },
      { name: "Festac", x: 0.80, y: 0.25, zone: 2, routeId: 5 },
      
      // Segment 5 stations: End southwest
      { name: "LASU Gate", x: 0.82, y: 0.30, zone: 2, routeId: 5 },
      { name: "Igando", x: 0.84, y: 0.35, zone: 2, routeId: 5 },
      { name: "Isheri Terminal", x: 0.85, y: 0.40, zone: 2, routeId: 5 }
    ];

    const stationIdMap = new Map<number, number>(); // index -> actual station ID
    
    stationsData.forEach((stationData, index) => {
      const id = this.currentStationId++;
      stationIdMap.set(index, id);
      this.stations.set(id, {
        id,
        name: stationData.name,
        x: stationData.x,
        y: stationData.y,
        zone: stationData.zone,
        passengerCount: Math.floor(Math.random() * 60) + 10,
        trafficCondition: 'normal',
        accessibility: true,
        amenities: ['benches', 'lighting']
      });
    });
    
    console.log(`✅ Initialized ${this.stations.size} stations across ${this.routes.size} routes`);

    // Add route-station relationships using correct station IDs
    stationsData.forEach((stationData, index) => {
      const routeStationId = this.currentRouteStationId++;
      const actualStationId = stationIdMap.get(index)!;
      this.routeStations.set(routeStationId, {
        id: routeStationId,
        routeId: stationData.routeId,
        stationId: actualStationId,
        sequence: index
      });
    });

    // Create buses for each route with direction of travel and Nigerian driver data
    const busesData = [
      // Route 1 buses - positioned on current route coordinates (matching frontend path)
      { number: "BRT001", routeId: 1, status: "active", capacity: 70, direction: "Outbound", currentX: 0.385, currentY: 0.67, driverName: "Adebayo Johnson", driverPhone: "+234-8012-345-678" },
      { number: "BRT002", routeId: 1, status: "active", capacity: 70, direction: "Inbound", currentX: 0.245, currentY: 0.53, driverName: "Chukwudi Okafor", driverPhone: "+234-8023-456-789" },
      { number: "BRT009", routeId: 1, status: "delayed", capacity: 70, direction: "Outbound", currentX: 0.185, currentY: 0.47, driverName: "Fatima Abdullahi", driverPhone: "+234-8034-567-890" },
      
      // Route 2 buses
      { number: "BRT003", routeId: 2, status: "delayed", capacity: 70, direction: "Southbound", driverName: "Olumide Adeyemi", driverPhone: "+234-8045-678-901" },
      { number: "BRT004", routeId: 2, status: "active", capacity: 70, direction: "Northbound", driverName: "Ngozi Okwu", driverPhone: "+234-8056-789-012" },
      { number: "BRT010", routeId: 2, status: "active", capacity: 70, direction: "Southbound", driverName: "Ibrahim Musa", driverPhone: "+234-8067-890-123" },
      
      // Route 3 buses - positioned on updated Route 3 path
      { number: "BRT005", routeId: 3, status: "active", capacity: 70, direction: "Eastbound", currentX: 0.51, currentY: 0.21, driverName: "Folake Akinola", driverPhone: "+234-8078-901-234" },
      { number: "BRT006", routeId: 3, status: "alert", capacity: 70, direction: "Westbound", currentX: 0.38, currentY: 0.30, driverName: "Emeka Nwosu", driverPhone: "+234-8089-012-345" },
      { number: "BRT011", routeId: 3, status: "active", capacity: 70, direction: "Eastbound", currentX: 0.25, currentY: 0.56, driverName: "Aisha Bello", driverPhone: "+234-8090-123-456" },
      
      // Route 4 buses
      { number: "BRT007", routeId: 4, status: "active", capacity: 70, direction: "Northbound", driverName: "Tunde Olawale", driverPhone: "+234-8001-234-567" },
      { number: "BRT012", routeId: 4, status: "active", capacity: 70, direction: "Southbound", driverName: "Kemi Owolabi", driverPhone: "+234-8012-345-678" },
      
      // Route 5 buses  
      { number: "BRT008", routeId: 5, status: "active", capacity: 70, direction: "Eastbound", driverName: "Hassan Usman", driverPhone: "+234-8023-456-789" },
      { number: "BRT013", routeId: 5, status: "active", capacity: 70, direction: "Westbound", driverName: "Chioma Ikechukwu", driverPhone: "+234-8034-567-890" }
    ];

    busesData.forEach(busData => {
      const id = this.currentBusId++;
      let currentX, currentY;
      
      // Use provided coordinates for Route 1 buses, otherwise generate from route points
      if (busData.currentX !== undefined && busData.currentY !== undefined) {
        currentX = busData.currentX;
        currentY = busData.currentY;
      } else {
        const routePoints = this.getRoutePoints(busData.routeId);
        const randomPoint = routePoints[Math.floor(Math.random() * routePoints.length)] || { x: 0.5, y: 0.5 };
        currentX = randomPoint.x;
        currentY = randomPoint.y;
      }
      
      this.buses.set(id, {
        id,
        routeId: busData.routeId,
        busNumber: busData.number,
        currentX,
        currentY,
        status: busData.status,
        direction: busData.direction,
        passengerCount: Math.floor(Math.random() * busData.capacity * 0.8),
        lastUpdated: new Date(),
        driverName: busData.driverName,
        driverPhone: busData.driverPhone
      });
    });

    // No automatic alerts - only user-created alerts will appear

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
    const stations = Array.from(this.stations.values());
    console.log(`📊 getStations() returning ${stations.length} stations`);
    console.log(`📍 First 5 stations:`, stations.slice(0, 5).map(s => ({ id: s.id, name: s.name })));
    return stations;
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
      
      // Check if bus is very close to current target (within 0.01 units)
      const currentTarget = routePoints[closestIndex];
      const distanceToTarget = Math.sqrt(
        Math.pow(currentTarget.x - bus.currentX, 2) + Math.pow(currentTarget.y - bus.currentY, 2)
      );
      
      // If close enough to current point, move to next point
      const targetIndex = distanceToTarget < 0.015 ? (closestIndex + 1) % routePoints.length : closestIndex;
      const targetPoint = routePoints[targetIndex];
      
      const speed = bus.status === "delayed" ? 0.004 : bus.status === "alert" ? 0.002 : 0.006;
      
      // Calculate direction vector
      const deltaX = targetPoint.x - bus.currentX;
      const deltaY = targetPoint.y - bus.currentY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (distance > 0.001) {
        // Normalize and apply speed
        const newX = bus.currentX + (deltaX / distance) * speed;
        const newY = bus.currentY + (deltaY / distance) * speed;
        
        // Update bus position
        this.buses.set(bus.id, {
          ...bus,
          currentX: newX,
          currentY: newY,
          lastUpdated: new Date()
        });
      }
    });
  }

  // Simulate bus going off-route for geofencing alerts
  public simulateOffRouteMovement(busId: number) {
    const bus = this.buses.get(busId);
    if (!bus) return;

    // Mark bus as off-route
    this.buses.set(busId, { ...bus, status: "off-route" });

    // Create interval to move bus away from route
    const offRouteInterval = setInterval(() => {
      const currentBus = this.buses.get(busId);
      if (!currentBus || currentBus.status !== "off-route") {
        clearInterval(offRouteInterval);
        return;
      }

      // Move bus in random direction away from route
      const randomAngle = Math.random() * 2 * Math.PI;
      const speed = 0.008; // Faster off-route movement
      
      const newX = currentBus.currentX + Math.cos(randomAngle) * speed;
      const newY = currentBus.currentY + Math.sin(randomAngle) * speed;

      // Keep within bounds
      const boundedX = Math.max(0.1, Math.min(0.9, newX));
      const boundedY = Math.max(0.1, Math.min(0.9, newY));

      this.buses.set(busId, {
        ...currentBus,
        currentX: boundedX,
        currentY: boundedY,
        lastUpdated: new Date()
      });
    }, 3000); // Update every 3 seconds for more dramatic effect
  }

  // Return bus to its designated route
  public returnBusToRoute(busId: number) {
    const bus = this.buses.get(busId);
    if (!bus) return;

    // Find closest route point and snap back to route
    const routePoints = this.getRoutePoints(bus.routeId);
    if (routePoints.length === 0) return;

    let closestPoint = routePoints[0];
    let closestDistance = Infinity;

    routePoints.forEach(point => {
      const distance = Math.sqrt(
        Math.pow(point.x - bus.currentX, 2) + Math.pow(point.y - bus.currentY, 2)
      );
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPoint = point;
      }
    });

    // Snap bus back to closest route point
    this.buses.set(busId, {
      ...bus,
      currentX: closestPoint.x,
      currentY: closestPoint.y,
      status: "active",
      lastUpdated: new Date()
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
    const alerts = Array.from(this.alerts.values()).filter(alert => 
      alert.isActive || alert.status === "acknowledged"
    );
    return alerts.map(alert => ({
      ...alert,
      bus: alert.busId ? this.buses.get(alert.busId) : undefined,
      route: alert.routeId ? this.routes.get(alert.routeId) : undefined
    }));
  }

  async getAllAlerts(): Promise<AlertWithDetails[]> {
    const alerts = Array.from(this.alerts.values());
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
      isActive: true,
      status: alert.status || "active",
      createdAt: new Date()
    };
    this.alerts.set(id, newAlert);
    return newAlert;
  }

  async acknowledgeAlert(id: number): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (alert) {
      const updatedAlert = { ...alert, isActive: false, status: "acknowledged" };
      this.alerts.set(id, updatedAlert);
      return updatedAlert;
    }
    return undefined;
  }

  async clearAlert(id: number): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (alert) {
      const updatedAlert = { ...alert, isActive: false, status: "cleared" };
      this.alerts.set(id, updatedAlert);
      return updatedAlert;
    }
    return undefined;
  }

  async escalateAlert(id: number): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (alert) {
      const updatedAlert = { ...alert, isActive: false, status: "escalated" };
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
      const updatedAlert = { ...alert, isActive: false, status: "cleared" };
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

    // Get the primary route ID for this station (first route it belongs to)
    const primaryRouteId = routeStations.length > 0 ? routeStations[0].routeId : null;

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
      routeId: primaryRouteId,
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
      1: [ // Route 1: Oshodi - Abule-Egba (matching frontend coordinates exactly)
        { x: 0.385, y: 0.67 }, // Right of Oshodi Terminal 2
        { x: 0.365, y: 0.65 }, // Right of Bolade
        { x: 0.345, y: 0.63 }, // Right of Ladipo
        { x: 0.325, y: 0.61 }, // Right of Shogunle
        { x: 0.305, y: 0.59 }, // Right of PWD
        { x: 0.285, y: 0.57 }, // Right of Airport Junction
        { x: 0.265, y: 0.55 }, // Right of Ikeja Along
        { x: 0.245, y: 0.53 }, // Right of Ile Zik
        { x: 0.225, y: 0.51 }, // Right of Mangoro
        { x: 0.205, y: 0.49 }, // Right of Cement
        { x: 0.185, y: 0.47 }, // Right of Iyana Dopemu
        { x: 0.165, y: 0.45 }, // Right of Adealu
        { x: 0.145, y: 0.43 }, // Right of Iyana Ipaja Bus stop
        { x: 0.125, y: 0.41 }, // Right of Pleasure
        { x: 0.105, y: 0.39 }, // Right of Ile Epo
        { x: 0.085, y: 0.37 }, // Right of Super
        { x: 0.065, y: 0.35 }  // Right of Abule Egba (corrected endpoint)
      ],
      2: [ // Route 2: Multi-segment zigzag route with 7 distinct segments
        // Segment 1: Northwest diagonal
        { x: 0.18, y: 0.28 }, 
        { x: 0.25, y: 0.22 },
        
        // Segment 2: Northeast diagonal  
        { x: 0.35, y: 0.28 },
        
        // Segment 3: Straight east
        { x: 0.50, y: 0.28 },
        
        // Segment 4: Southeast diagonal
        { x: 0.60, y: 0.38 },
        
        // Segment 5: Southwest diagonal
        { x: 0.50, y: 0.50 },
        
        // Segment 6: Southeast diagonal again
        { x: 0.70, y: 0.65 },
        
        // Segment 7: Final east stretch
        { x: 0.90, y: 0.65 }
      ],
      3: [ // Route 3: Lagos Metro Express - Following station coordinates
        // Segment 1: Southwest to northeast diagonal (matches stations)
        { x: 0.15, y: 0.70 }, // Ikorodu West
        { x: 0.20, y: 0.63 }, // Owutu
        { x: 0.25, y: 0.56 }, // Kosofe
        { x: 0.30, y: 0.49 }, // Ketu
        { x: 0.35, y: 0.42 }, // Mile 12
        { x: 0.40, y: 0.35 }, // Ojota
        
        // Segment 2: Northwest curve
        { x: 0.38, y: 0.30 }, // Maryland
        { x: 0.36, y: 0.25 }, // Palmgrove
        { x: 0.34, y: 0.20 }, // Ikeja GRA
        { x: 0.32, y: 0.17 }, // Allen Avenue
        { x: 0.30, y: 0.15 }, // Computer Village
        
        // Segment 3: Northeast to Mile 2
        { x: 0.37, y: 0.17 }, // Ojuelegba
        { x: 0.44, y: 0.19 }, // Surulere
        { x: 0.51, y: 0.21 }, // National Stadium
        { x: 0.58, y: 0.23 }, // Alaba
        { x: 0.65, y: 0.25 }, // Mile 2
        
        // Segment 4: Southeast to Badagry
        { x: 0.69, y: 0.32 }, // Festac
        { x: 0.73, y: 0.39 }, // Satellite Town
        { x: 0.77, y: 0.46 }, // Trade Fair
        { x: 0.81, y: 0.53 }, // Intermediate point
        { x: 0.85, y: 0.60 }  // Badagry Terminal
      ],
      4: [ // Route 4: Realistic Lagos BRT - Ikorodu to Victoria Island
        // Segment 1: Northeast from Ikorodu towards Mile 12
        { x: 0.15, y: 0.85 },
        { x: 0.30, y: 0.70 },
        
        // Segment 2: East through Ketu-Maryland corridor
        { x: 0.45, y: 0.65 },
        
        // Segment 3: Northeast through Yaba-Surulere
        { x: 0.60, y: 0.50 },
        
        // Segment 4: East through Lagos Island
        { x: 0.75, y: 0.45 },
        
        // Segment 5: Southeast to Victoria Island
        { x: 0.85, y: 0.35 }
      ],
      5: [ // Route 5: Lagos Orbital Express - Zigzag Pattern
        // Segment 1: Southwest diagonal
        { x: 0.80, y: 0.20 },
        { x: 0.60, y: 0.40 },
        
        // Segment 2: Northwest diagonal
        { x: 0.40, y: 0.20 },
        
        // Segment 3: Northeast diagonal
        { x: 0.60, y: 0.10 },
        
        // Segment 4: Southeast diagonal
        { x: 0.85, y: 0.35 },
        
        // Segment 5: Southwest diagonal to finish
        { x: 0.70, y: 0.50 }
      ]
    };
    return routePaths[routeId] || [];
  }
}

export const storage = new MemStorage();