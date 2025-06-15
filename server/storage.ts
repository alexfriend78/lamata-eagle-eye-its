import { 
  routes, stations, buses, alerts, routeStations, busArrivals,
  type Route, type Station, type Bus, type Alert, type RouteStation, type BusArrival,
  type InsertRoute, type InsertStation, type InsertBus, type InsertAlert, type InsertRouteStation, type InsertBusArrival,
  type BusWithRoute, type RouteWithStations, type AlertWithDetails, type SystemStats, type StationDetails, type BusArrivalWithDetails
} from "@shared/schema";

export interface IStorage {
  // Routes
  getRoutes(): Promise<Route[]>;
  getRoute(id: number): Promise<Route | undefined>;
  createRoute(route: InsertRoute): Promise<Route>;
  
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
    // Create stations based on Lagos BRT routes - utilizing full landscape screen (1280x720)
    const stationsData = [
      // Route 1: Main northwest diagonal across full screen
      { name: "Oshodi Terminal 2", x: 940, y: 440 },
      { name: "Bolade", x: 860, y: 380 },
      { name: "Ladipo", x: 780, y: 320 },
      { name: "Shogunle", x: 700, y: 260 },
      { name: "PWD", x: 620, y: 200 },
      { name: "Airport Junction", x: 540, y: 140 },
      { name: "Ikeja Along", x: 460, y: 100 },
      { name: "Ile Zik", x: 380, y: 80 },
      { name: "Mangoro", x: 300, y: 60 },
      { name: "Cement", x: 220, y: 50 },
      { name: "Iyana Dopemu", x: 140, y: 40 },
      { name: "Adealu", x: 80, y: 30 },
      { name: "Abule Egba", x: 20, y: 20 },
      
      // Route 2: Southeast extension to full screen edge
      { name: "CMS Terminal", x: 1180, y: 620 },
      { name: "Obalende", x: 1100, y: 560 },
      { name: "TBS Terminal", x: 1260, y: 680 },
      { name: "Anthony", x: 1020, y: 500 },
      { name: "Maryland", x: 1180, y: 620 },
      { name: "Fadeyi", x: 1100, y: 560 },
      
      // Route 3: Bottom horizontal traverse
      { name: "Ikorodu Terminal", x: 40, y: 700 },
      { name: "Benson", x: 160, y: 680 },
      { name: "AGRIC TERMINAL", x: 280, y: 660 },
      { name: "OWUTU IDIROKO", x: 400, y: 640 },
      { name: "OGOLONTO", x: 520, y: 620 },
      { name: "MAJIDUN AWORI", x: 640, y: 600 },
      { name: "MILE12 TERMINAL", x: 760, y: 580 },
      { name: "Ketu", x: 880, y: 560 },
      { name: "Ojota", x: 1000, y: 540 },
      { name: "Newgarage", x: 1120, y: 520 },
      
      // Route 4: Upper horizontal
      { name: "Berger Terminal", x: 30, y: 200 },
      { name: "Ogba", x: 150, y: 190 },
      { name: "Agege", x: 270, y: 180 },
      { name: "Pen Cinema", x: 390, y: 170 },
      { name: "Ogba Junction", x: 510, y: 160 },
      { name: "Allen Avenue", x: 630, y: 150 },
      { name: "Computer Village", x: 750, y: 140 },
      { name: "Underbridge", x: 870, y: 130 },
      { name: "Lekki Phase 1", x: 990, y: 120 },
      { name: "Lekki Toll Gate", x: 1110, y: 110 },
      { name: "Lekki Terminal", x: 1230, y: 100 },
      
      // Route 5: Central east-west
      { name: "Lagos Island", x: 1250, y: 360 },
      { name: "Marina", x: 1150, y: 350 },
      { name: "National Theatre", x: 1050, y: 340 },
      { name: "Surulere", x: 950, y: 330 },
      { name: "Yaba", x: 850, y: 320 },
      { name: "Mushin", x: 750, y: 310 },
      { name: "Papa Ajao", x: 650, y: 300 },
      { name: "Isolo", x: 550, y: 290 },
      { name: "Ejigbo", x: 450, y: 280 },
      { name: "Igando", x: 350, y: 270 },
      { name: "Alaba", x: 250, y: 260 },
      { name: "Ojo", x: 150, y: 250 },
      { name: "Badagry", x: 50, y: 240 }
    ];

    stationsData.forEach((station, index) => {
      const id = this.currentStationId++;
      const trafficConditions = ["light", "normal", "heavy", "severe"];
      const amenitiesOptions = [
        ["shelter", "seating", "lighting"],
        ["shelter", "lighting", "cctv"],
        ["seating", "lighting"],
        ["shelter", "seating", "lighting", "cctv"],
        ["lighting"]
      ];
      
      this.stations.set(id, { 
        id, 
        ...station,
        zone: Math.floor(index / 7) + 1, // Distribute across 4 zones
        passengerCount: Math.floor(Math.random() * 50) + 5,
        trafficCondition: trafficConditions[Math.floor(Math.random() * trafficConditions.length)],
        accessibility: Math.random() > 0.2, // 80% accessible
        amenities: amenitiesOptions[Math.floor(Math.random() * amenitiesOptions.length)]
      });
    });

    // Create routes with aesthetic customization options
    const routesData = [
      { 
        routeNumber: "1", name: "Blue Line - Northern Corridor", color: "#1E40AF",
        lineStyle: "solid", lineWidth: 4, opacity: 1.0, pattern: "none", animation: "none"
      },
      { 
        routeNumber: "2", name: "Red Line - Main Diagonal", color: "#DC2626",
        lineStyle: "solid", lineWidth: 5, opacity: 0.9, pattern: "arrows", animation: "flow"
      },
      { 
        routeNumber: "3", name: "Green Line - Upper Express", color: "#059669",
        lineStyle: "dashed", lineWidth: 3, opacity: 1.0, pattern: "none", animation: "none"
      },
      { 
        routeNumber: "4", name: "Orange Line - Central Spine", color: "#EA580C",
        lineStyle: "solid", lineWidth: 6, opacity: 0.8, pattern: "gradient", animation: "glow",
        gradientEnd: "#F97316", glowColor: "#FB923C"
      },
      { 
        routeNumber: "5", name: "Purple Line - Southern Express", color: "#7C3AED",
        lineStyle: "solid", lineWidth: 4, opacity: 1.0, pattern: "dots", animation: "pulse"
      },
      { 
        routeNumber: "6", name: "Teal Line - Coastal Edge", color: "#0D9488",
        lineStyle: "dotted", lineWidth: 3, opacity: 0.9, pattern: "none", animation: "none"
      },
      { 
        routeNumber: "7", name: "Yellow Line - Western Spine", color: "#CA8A04",
        lineStyle: "solid", lineWidth: 4, opacity: 1.0, pattern: "arrows", animation: "flow"
      },
      { 
        routeNumber: "8", name: "Pink Line - Central Axis", color: "#BE185D",
        lineStyle: "double", lineWidth: 5, opacity: 0.8, pattern: "gradient", animation: "glow",
        gradientEnd: "#F472B6", glowColor: "#FBCFE8"
      },
      { 
        routeNumber: "9", name: "Cyan Line - Eastern Spine", color: "#0891B2",
        lineStyle: "solid", lineWidth: 3, opacity: 1.0, pattern: "dots", animation: "none"
      },
      { 
        routeNumber: "10", name: "Brown Line - Cross Diagonal", color: "#A16207",
        lineStyle: "dashed", lineWidth: 4, opacity: 0.9, pattern: "arrows", animation: "flow"
      },
      { 
        routeNumber: "11", name: "Lime Line - Orbital Ring", color: "#65A30D",
        lineStyle: "solid", lineWidth: 5, opacity: 0.7, pattern: "gradient", animation: "pulse",
        gradientEnd: "#84CC16", glowColor: "#BEF264"
      },
      { 
        routeNumber: "12", name: "Indigo Line - Figure Eight", color: "#4338CA",
        lineStyle: "solid", lineWidth: 4, opacity: 1.0, pattern: "dots", animation: "glow",
        glowColor: "#A5B4FC"
      },
      { 
        routeNumber: "13", name: "Violet Line - Grand Circle", color: "#8B5CF6",
        lineStyle: "solid", lineWidth: 6, opacity: 0.8, pattern: "gradient", animation: "pulse",
        gradientEnd: "#C4B5FD", glowColor: "#DDD6FE"
      },
      { 
        routeNumber: "14", name: "Gold Line - Mountain Ridge", color: "#D97706",
        lineStyle: "double", lineWidth: 4, opacity: 1.0, pattern: "arrows", animation: "glow",
        glowColor: "#FCD34D"
      },
      { 
        routeNumber: "15", name: "Silver Line - River Flow", color: "#6B7280",
        lineStyle: "solid", lineWidth: 3, opacity: 0.9, pattern: "dots", animation: "flow"
      },
      { 
        routeNumber: "16", name: "Coral Line - Wave Pattern", color: "#F97316",
        lineStyle: "dotted", lineWidth: 5, opacity: 0.8, pattern: "gradient", animation: "pulse",
        gradientEnd: "#FDBA74", glowColor: "#FED7AA"
      }
    ];

    routesData.forEach(route => {
      const id = this.currentRouteId++;
      this.routes.set(id, { 
        id, 
        ...route, 
        isActive: true,
        // Add default values for missing aesthetic properties
        lineStyle: route.lineStyle || "solid",
        lineWidth: route.lineWidth || 3,
        opacity: route.opacity || 1.0,
        pattern: route.pattern || "none",
        animation: route.animation || "none",
        glowColor: route.glowColor || null,
        gradientEnd: route.gradientEnd || null
      });
    });

    // Create buses for all 16 zone networks - comprehensive coverage
    const busesData = [
      // Zone 1 buses
      { routeId: 1, busNumber: "Z1-01-AGE", currentX: 160, currentY: 90, status: "on_time", direction: "forward" },
      { routeId: 1, busNumber: "Z1-02-IKE", currentX: 240, currentY: 130, status: "delayed", direction: "reverse" },
      
      // Zone 2 buses  
      { routeId: 2, busNumber: "Z2-01-OGB", currentX: 480, currentY: 100, status: "on_time", direction: "forward" },
      { routeId: 2, busNumber: "Z2-02-IKJ", currentX: 420, currentY: 140, status: "on_time", direction: "reverse" },
      
      // Zone 3 buses
      { routeId: 3, busNumber: "Z3-01-ALL", currentX: 760, currentY: 110, status: "alert", direction: "forward" },
      { routeId: 3, busNumber: "Z3-02-OPE", currentX: 680, currentY: 130, status: "on_time", direction: "reverse" },
      
      // Zone 4 buses
      { routeId: 4, busNumber: "Z4-01-GRA", currentX: 1080, currentY: 120, status: "on_time", direction: "forward" },
      { routeId: 4, busNumber: "Z4-02-AIR", currentX: 1000, currentY: 130, status: "delayed", direction: "reverse" },
      
      // Zone 5 buses
      { routeId: 5, busNumber: "Z5-01-MUS", currentX: 180, currentY: 290, status: "on_time", direction: "forward" },
      { routeId: 5, busNumber: "Z5-02-ISO", currentX: 240, currentY: 320, status: "on_time", direction: "reverse" },
      
      // Zone 6 buses
      { routeId: 6, busNumber: "Z6-01-SUR", currentX: 480, currentY: 300, status: "on_time", direction: "forward" },
      { routeId: 6, busNumber: "Z6-02-ALA", currentX: 420, currentY: 320, status: "delayed", direction: "reverse" },
      
      // Zone 7 buses
      { routeId: 7, busNumber: "Z7-01-YAB", currentX: 760, currentY: 310, status: "on_time", direction: "forward" },
      { routeId: 7, busNumber: "Z7-02-EBU", currentX: 680, currentY: 320, status: "on_time", direction: "reverse" },
      
      // Zone 8 buses
      { routeId: 8, busNumber: "Z8-01-APA", currentX: 1080, currentY: 300, status: "on_time", direction: "forward" },
      { routeId: 8, busNumber: "Z8-02-FES", currentX: 1000, currentY: 310, status: "alert", direction: "reverse" },
      
      // Zone 9 buses
      { routeId: 9, busNumber: "Z9-01-KET", currentX: 180, currentY: 480, status: "on_time", direction: "forward" },
      { routeId: 9, busNumber: "Z9-02-MIL", currentX: 240, currentY: 500, status: "on_time", direction: "reverse" },
      
      // Zone 10 buses
      { routeId: 10, busNumber: "Z10-01-GBA", currentX: 480, currentY: 490, status: "delayed", direction: "forward" },
      { routeId: 10, busNumber: "Z10-02-SHO", currentX: 420, currentY: 500, status: "on_time", direction: "reverse" },
      
      // Zone 11 buses
      { routeId: 11, busNumber: "Z11-01-BAR", currentX: 760, currentY: 500, status: "on_time", direction: "forward" },
      { routeId: 11, busNumber: "Z11-02-SOM", currentX: 680, currentY: 490, status: "on_time", direction: "reverse" },
      
      // Zone 12 buses
      { routeId: 12, busNumber: "Z12-01-LAG", currentX: 1080, currentY: 480, status: "on_time", direction: "forward" },
      { routeId: 12, busNumber: "Z12-02-ISL", currentX: 1000, currentY: 490, status: "delayed", direction: "reverse" },
      
      // Zone 13 buses
      { routeId: 13, busNumber: "Z13-01-IKO", currentX: 180, currentY: 670, status: "on_time", direction: "forward" },
      { routeId: 13, busNumber: "Z13-02-NOR", currentX: 240, currentY: 680, status: "on_time", direction: "reverse" },
      
      // Zone 14 buses
      { routeId: 14, busNumber: "Z14-01-KOS", currentX: 480, currentY: 680, status: "on_time", direction: "forward" },
      { routeId: 14, busNumber: "Z14-02-ANT", currentX: 420, currentY: 670, status: "alert", direction: "reverse" },
      
      // Zone 15 buses
      { routeId: 15, busNumber: "Z15-01-VIC", currentX: 760, currentY: 670, status: "on_time", direction: "forward" },
      { routeId: 15, busNumber: "Z15-02-ISL", currentX: 680, currentY: 680, status: "on_time", direction: "reverse" },
      
      // Zone 16 buses
      { routeId: 16, busNumber: "Z16-01-LEK", currentX: 1080, currentY: 680, status: "delayed", direction: "forward" },
      { routeId: 16, busNumber: "Z16-02-AJA", currentX: 1000, currentY: 670, status: "on_time", direction: "reverse" }
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

    // Create sample bus arrivals for the next 30 minutes
    const now = new Date();
    const busArrivalsData = [];
    
    // Generate arrivals for first few stations
    for (let stationId = 1; stationId <= 5; stationId++) {
      for (let i = 0; i < 3; i++) {
        const estimatedArrival = new Date(now.getTime() + (i * 10 + Math.random() * 5) * 60000); // 10-15 min intervals
        busArrivalsData.push({
          busId: Math.floor(Math.random() * 11) + 1,
          stationId,
          routeId: Math.floor(Math.random() * 9) + 1,
          estimatedArrival,
          status: Math.random() > 0.8 ? "approaching" : "scheduled"
        });
      }
    }

    busArrivalsData.forEach(arrival => {
      const id = this.currentBusArrivalId++;
      this.busArrivals.set(id, { id, actualArrival: null, ...arrival });
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

  // Simulate bus movement along routes
  public simulateBusMovement() {
    const routePaths: Record<number, { x: number; y: number }[]> = {
      1: [ // Oshodi - Abule-Egba (diagonal northwest)
        { x: 800, y: 400 }, { x: 750, y: 370 }, { x: 700, y: 340 }, { x: 650, y: 310 },
        { x: 600, y: 280 }, { x: 550, y: 250 }, { x: 500, y: 220 }, { x: 450, y: 190 },
        { x: 400, y: 160 }, { x: 350, y: 130 }, { x: 300, y: 100 }, { x: 250, y: 70 },
        { x: 200, y: 50 }, { x: 150, y: 30 }, { x: 100, y: 20 }, { x: 50, y: 15 }, { x: 20, y: 10 }
      ],
      2: [ // Abule Egba - TBS/Obalende (northwest to southeast)
        { x: 20, y: 10 }, { x: 50, y: 15 }, { x: 100, y: 20 }, { x: 150, y: 30 },
        { x: 200, y: 50 }, { x: 250, y: 70 }, { x: 300, y: 100 }, { x: 350, y: 130 },
        { x: 400, y: 160 }, { x: 450, y: 190 }, { x: 500, y: 220 }, { x: 550, y: 250 },
        { x: 600, y: 280 }, { x: 650, y: 310 }, { x: 700, y: 340 }, { x: 750, y: 370 },
        { x: 800, y: 400 }, { x: 900, y: 450 }, { x: 950, y: 470 }, { x: 1000, y: 490 },
        { x: 1150, y: 480 }, { x: 1200, y: 500 }, { x: 1250, y: 520 }
      ],
      3: [ // Ikorodu - TBS (southwest to southeast)
        { x: 50, y: 600 }, { x: 120, y: 580 }, { x: 200, y: 560 }, { x: 280, y: 540 },
        { x: 360, y: 520 }, { x: 440, y: 500 }, { x: 520, y: 480 }, { x: 600, y: 460 },
        { x: 680, y: 440 }, { x: 720, y: 420 }, { x: 800, y: 400 }, { x: 900, y: 450 },
        { x: 1000, y: 490 }, { x: 1200, y: 500 }, { x: 1250, y: 520 }
      ],
      4: [ // Ikorodu - Fadeyi (southwest to center)
        { x: 50, y: 600 }, { x: 120, y: 580 }, { x: 200, y: 560 }, { x: 280, y: 540 },
        { x: 360, y: 520 }, { x: 440, y: 500 }, { x: 520, y: 480 }, { x: 600, y: 460 },
        { x: 680, y: 440 }, { x: 720, y: 420 }, { x: 800, y: 400 }, { x: 900, y: 450 },
        { x: 1000, y: 490 }
      ],
      5: [ // Ikorodu - Oshodi (southwest to center)
        { x: 50, y: 600 }, { x: 120, y: 580 }, { x: 200, y: 560 }, { x: 280, y: 540 },
        { x: 360, y: 520 }, { x: 440, y: 500 }, { x: 520, y: 480 }, { x: 600, y: 460 },
        { x: 680, y: 440 }, { x: 720, y: 420 }, { x: 800, y: 400 }
      ],
      6: [ // Berger - Ajah (west to east)
        { x: 100, y: 350 }, { x: 200, y: 340 }, { x: 300, y: 330 }, { x: 400, y: 325 },
        { x: 500, y: 320 }, { x: 600, y: 315 }, { x: 700, y: 310 }, { x: 800, y: 305 },
        { x: 900, y: 300 }, { x: 1000, y: 295 }, { x: 1100, y: 290 }, { x: 1200, y: 285 }
      ],
      7: [ // Lekki - Victoria Island (east coast)
        { x: 1200, y: 200 }, { x: 1150, y: 220 }, { x: 1100, y: 240 }, { x: 1050, y: 260 },
        { x: 1000, y: 280 }, { x: 950, y: 300 }, { x: 900, y: 320 }, { x: 850, y: 340 }
      ],
      8: [ // Yaba - Surulere (central)
        { x: 600, y: 150 }, { x: 650, y: 170 }, { x: 700, y: 190 }, { x: 750, y: 210 },
        { x: 800, y: 230 }, { x: 850, y: 250 }, { x: 900, y: 270 }
      ],
      9: [ // Ikeja - Lagos Island (central diagonal)
        { x: 400, y: 250 }, { x: 450, y: 270 }, { x: 500, y: 290 }, { x: 550, y: 310 },
        { x: 600, y: 330 }, { x: 650, y: 350 }, { x: 700, y: 370 }, { x: 750, y: 390 },
        { x: 800, y: 410 }, { x: 850, y: 430 }
      ]
    };

    this.buses.forEach((bus) => {
      const routePoints = routePaths[bus.routeId] || [];
      if (routePoints.length > 1) {
        // Find nearest point on route
        let nearestIndex = 0;
        let minDistance = Infinity;
        
        routePoints.forEach((point, index) => {
          const distance = Math.sqrt(
            Math.pow(point.x - bus.currentX, 2) + Math.pow(point.y - bus.currentY, 2)
          );
          if (distance < minDistance) {
            minDistance = distance;
            nearestIndex = index;
          }
        });
        
        // Move to next point based on direction
        let targetIndex;
        if (bus.direction === "forward") {
          targetIndex = nearestIndex < routePoints.length - 1 ? nearestIndex + 1 : 0;
        } else {
          targetIndex = nearestIndex > 0 ? nearestIndex - 1 : routePoints.length - 1;
        }
        
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
      }
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

  async getStationDetails(id: number): Promise<StationDetails | undefined> {
    const station = this.stations.get(id);
    if (!station) return undefined;

    const upcomingArrivals = await this.getBusArrivals(id);
    const routeIds = Array.from(this.routeStations.values())
      .filter(rs => rs.stationId === id)
      .map(rs => rs.routeId);
    const activeRoutes = routeIds.map(routeId => this.routes.get(routeId)!).filter(Boolean);

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
      .filter(arrival => arrival.stationId === stationId && arrival.estimatedArrival > new Date())
      .sort((a, b) => a.estimatedArrival.getTime() - b.estimatedArrival.getTime())
      .slice(0, 5); // Next 5 arrivals

    return arrivals.map(arrival => {
      const bus = this.buses.get(arrival.busId)!;
      const route = this.routes.get(arrival.routeId)!;
      return {
        ...arrival,
        bus: { ...bus, route },
        route
      };
    });
  }

  async createBusArrival(arrival: InsertBusArrival): Promise<BusArrival> {
    const id = this.currentBusArrivalId++;
    const newArrival: BusArrival = { 
      id, 
      busId: arrival.busId,
      stationId: arrival.stationId,
      routeId: arrival.routeId,
      estimatedArrival: arrival.estimatedArrival,
      actualArrival: arrival.actualArrival ?? null,
      status: arrival.status ?? "scheduled"
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

// Start bus movement simulation
setInterval(() => {
  storage.simulateBusMovement();
}, 1000); // Update bus positions every second
