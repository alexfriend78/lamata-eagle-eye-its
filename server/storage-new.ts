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
    this.seedCrowdData();
    this.simulateRealTimeData();
  }

  private seedData() {
    // Seed Lagos BRT routes
    const lagosRoutes: Route[] = [
      {
        id: this.currentRouteId++,
        routeNumber: "1",
        name: "Oshodi - Abule Egba",
        startPoint: "Oshodi Terminal 2",
        endPoint: "Abule Egba Terminal",
        color: "#FF6B35",
        isActive: true,
        totalStations: 16,
        estimatedDuration: 75,
        operatingHours: "5:00 AM - 11:00 PM",
        frequency: 8,
        zonesTraveled: 4,
        direction: "Northbound",
        peakHours: "7:00-9:00 AM, 5:00-8:00 PM",
        accessibility: "Wheelchair Accessible",
        gradientStart: "#FF6B35",
        gradientEnd: "#F7931E"
      },
      {
        id: this.currentRouteId++,
        routeNumber: "2",
        name: "Mile 12 - CMS",
        startPoint: "Mile 12 Terminal",
        endPoint: "CMS Terminal",
        color: "#4ECDC4",
        isActive: true,
        totalStations: 22,
        estimatedDuration: 85,
        operatingHours: "5:30 AM - 10:30 PM",
        frequency: 10,
        zonesTraveled: 5,
        direction: "Eastbound",
        peakHours: "6:30-9:00 AM, 4:30-7:30 PM",
        accessibility: "Wheelchair Accessible",
        gradientStart: "#4ECDC4",
        gradientEnd: "#44A08D"
      },
      {
        id: this.currentRouteId++,
        routeNumber: "3",
        name: "Ikorodu - TBS",
        startPoint: "Ikorodu Terminal",
        endPoint: "Tafawa Balewa Square",
        color: "#9B59B6",
        isActive: true,
        totalStations: 18,
        estimatedDuration: 90,
        operatingHours: "5:00 AM - 11:30 PM",
        frequency: 12,
        zonesTraveled: 6,
        direction: "Northwest",
        peakHours: "6:00-9:30 AM, 5:00-8:30 PM",
        accessibility: "Wheelchair Accessible",
        gradientStart: "#9B59B6",
        gradientEnd: "#8E44AD"
      },
      {
        id: this.currentRouteId++,
        routeNumber: "4",
        name: "Ajah - Marina",
        startPoint: "Ajah Terminal",
        endPoint: "Marina Terminal",
        color: "#E74C3C",
        isActive: true,
        totalStations: 14,
        estimatedDuration: 65,
        operatingHours: "5:30 AM - 10:00 PM",
        frequency: 15,
        zonesTraveled: 3,
        direction: "Northwest",
        peakHours: "7:00-10:00 AM, 5:30-8:00 PM",
        accessibility: "Wheelchair Accessible",
        gradientStart: "#E74C3C",
        gradientEnd: "#C0392B"
      },
      {
        id: this.currentRouteId++,
        routeNumber: "5",
        name: "Airport - Ikeja",
        startPoint: "Murtala Muhammed Airport",
        endPoint: "Ikeja City Mall",
        color: "#F39C12",
        isActive: true,
        totalStations: 8,
        estimatedDuration: 35,
        operatingHours: "24 Hours",
        frequency: 20,
        zonesTraveled: 2,
        direction: "Southwest",
        peakHours: "6:00-11:00 AM, 3:00-9:00 PM",
        accessibility: "Wheelchair Accessible",
        gradientStart: "#F39C12",
        gradientEnd: "#E67E22"
      }
    ];

    lagosRoutes.forEach(route => this.routes.set(route.id, route));

    // Seed Lagos BRT stations with realistic passenger counts
    const lagosStations: Station[] = [
      // Route 1 Stations
      { id: this.currentStationId++, name: "Oshodi Terminal 2", x: 0.5, y: 0.3, zone: 1, passengerCount: 450, trafficCondition: "heavy", accessibility: true, amenities: ["restroom", "food court", "wifi"] },
      { id: this.currentStationId++, name: "Bolade", x: 0.52, y: 0.28, zone: 1, passengerCount: 280, trafficCondition: "moderate", accessibility: true, amenities: ["shelter", "security"] },
      { id: this.currentStationId++, name: "Shogunle", x: 0.48, y: 0.25, zone: 1, passengerCount: 320, trafficCondition: "heavy", accessibility: true, amenities: ["shelter", "parking"] },
      { id: this.currentStationId++, name: "Ikeja Under Bridge", x: 0.45, y: 0.22, zone: 2, passengerCount: 380, trafficCondition: "heavy", accessibility: true, amenities: ["restroom", "atm", "wifi"] },
      { id: this.currentStationId++, name: "Cement", x: 0.42, y: 0.20, zone: 2, passengerCount: 190, trafficCondition: "light", accessibility: true, amenities: ["shelter"] },
      
      // Major interchange stations
      { id: this.currentStationId++, name: "Iyana Ipaja", x: 0.38, y: 0.15, zone: 2, passengerCount: 420, trafficCondition: "heavy", accessibility: true, amenities: ["restroom", "food court", "parking", "wifi"] },
      { id: this.currentStationId++, name: "Alakuko", x: 0.35, y: 0.12, zone: 3, passengerCount: 350, trafficCondition: "moderate", accessibility: true, amenities: ["shelter", "security", "atm"] },
      { id: this.currentStationId++, name: "Abule Egba Terminal", x: 0.32, y: 0.08, zone: 3, passengerCount: 380, trafficCondition: "moderate", accessibility: true, amenities: ["restroom", "food court", "wifi"] },
      
      // Route 2 Stations
      { id: this.currentStationId++, name: "Mile 12 Terminal", x: 0.65, y: 0.45, zone: 4, passengerCount: 290, trafficCondition: "moderate", accessibility: true, amenities: ["restroom", "food court"] },
      { id: this.currentStationId++, name: "Ketu", x: 0.62, y: 0.42, zone: 4, passengerCount: 340, trafficCondition: "heavy", accessibility: true, amenities: ["shelter", "atm"] },
      { id: this.currentStationId++, name: "Ojota", x: 0.58, y: 0.38, zone: 3, passengerCount: 410, trafficCondition: "heavy", accessibility: true, amenities: ["restroom", "parking", "wifi"] },
      { id: this.currentStationId++, name: "Maryland", x: 0.55, y: 0.35, zone: 3, passengerCount: 380, trafficCondition: "heavy", accessibility: true, amenities: ["food court", "security"] },
      
      // Business district stations
      { id: this.currentStationId++, name: "Ikorodu Road", x: 0.52, y: 0.32, zone: 2, passengerCount: 320, trafficCondition: "heavy", accessibility: true, amenities: ["shelter", "wifi"] },
      { id: this.currentStationId++, name: "Yaba", x: 0.48, y: 0.40, zone: 2, passengerCount: 450, trafficCondition: "heavy", accessibility: true, amenities: ["restroom", "food court", "atm", "wifi"] },
      { id: this.currentStationId++, name: "Oyingbo", x: 0.45, y: 0.43, zone: 2, passengerCount: 280, trafficCondition: "moderate", accessibility: true, amenities: ["shelter", "security"] },
      { id: this.currentStationId++, name: "Iddo", x: 0.42, y: 0.45, zone: 1, passengerCount: 320, trafficCondition: "heavy", accessibility: true, amenities: ["restroom", "parking"] },
      { id: this.currentStationId++, name: "National Theatre", x: 0.40, y: 0.47, zone: 1, passengerCount: 290, trafficCondition: "moderate", accessibility: true, amenities: ["shelter", "wifi"] },
      { id: this.currentStationId++, name: "CMS Terminal", x: 0.38, y: 0.50, zone: 1, passengerCount: 400, trafficCondition: "heavy", accessibility: true, amenities: ["restroom", "food court", "security", "wifi"] },
      
      // Route 3 Stations
      { id: this.currentStationId++, name: "Ikorodu Terminal", x: 0.75, y: 0.65, zone: 5, passengerCount: 350, trafficCondition: "moderate", accessibility: true, amenities: ["restroom", "food court", "parking"] },
      { id: this.currentStationId++, name: "Majidun", x: 0.72, y: 0.62, zone: 5, passengerCount: 180, trafficCondition: "light", accessibility: true, amenities: ["shelter"] },
      { id: this.currentStationId++, name: "Ketu (Kosofe)", x: 0.68, y: 0.58, zone: 4, passengerCount: 220, trafficCondition: "moderate", accessibility: true, amenities: ["shelter", "security"] },
      { id: this.currentStationId++, name: "Anthony", x: 0.62, y: 0.52, zone: 3, passengerCount: 380, trafficCondition: "heavy", accessibility: true, amenities: ["restroom", "atm", "wifi"] },
      
      // Island connections
      { id: this.currentStationId++, name: "Oworonsoki", x: 0.55, y: 0.48, zone: 3, passengerCount: 290, trafficCondition: "heavy", accessibility: true, amenities: ["shelter", "parking"] },
      { id: this.currentStationId++, name: "Gbagada", x: 0.52, y: 0.45, zone: 2, passengerCount: 340, trafficCondition: "heavy", accessibility: true, amenities: ["restroom", "food court"] },
      { id: this.currentStationId++, name: "Palmgrove", x: 0.48, y: 0.42, zone: 2, passengerCount: 280, trafficCondition: "moderate", accessibility: true, amenities: ["shelter", "wifi"] },
      { id: this.currentStationId++, name: "Onipanu", x: 0.45, y: 0.40, zone: 2, passengerCount: 250, trafficCondition: "moderate", accessibility: true, amenities: ["shelter", "security"] },
      { id: this.currentStationId++, name: "Jibowu", x: 0.42, y: 0.38, zone: 1, passengerCount: 320, trafficCondition: "heavy", accessibility: true, amenities: ["restroom", "atm"] },
      { id: this.currentStationId++, name: "Yaba Left", x: 0.40, y: 0.36, zone: 1, passengerCount: 360, trafficCondition: "heavy", accessibility: true, amenities: ["food court", "wifi"] },
      { id: this.currentStationId++, name: "Sabo", x: 0.38, y: 0.35, zone: 1, passengerCount: 290, trafficCondition: "moderate", accessibility: true, amenities: ["shelter", "parking"] },
      { id: this.currentStationId++, name: "Costain", x: 0.36, y: 0.33, zone: 1, passengerCount: 270, trafficCondition: "moderate", accessibility: true, amenities: ["shelter", "security"] },
      { id: this.currentStationId++, name: "Alaba", x: 0.34, y: 0.32, zone: 1, passengerCount: 310, trafficCondition: "heavy", accessibility: true, amenities: ["restroom", "wifi"] },
      { id: this.currentStationId++, name: "Orile", x: 0.32, y: 0.30, zone: 1, passengerCount: 240, trafficCondition: "light", accessibility: true, amenities: ["shelter"] },
      { id: this.currentStationId++, name: "Iganmu", x: 0.30, y: 0.28, zone: 1, passengerCount: 280, trafficCondition: "moderate", accessibility: true, amenities: ["shelter", "atm"] },
      { id: this.currentStationId++, name: "Tafawa Balewa Square", x: 0.28, y: 0.25, zone: 1, passengerCount: 420, trafficCondition: "heavy", accessibility: true, amenities: ["restroom", "food court", "security", "wifi"] },
      
      // Route 4 & 5 Additional stations
      { id: this.currentStationId++, name: "Ajah Terminal", x: 0.85, y: 0.75, zone: 6, passengerCount: 320, trafficCondition: "moderate", accessibility: true, amenities: ["restroom", "food court", "parking"] },
      { id: this.currentStationId++, name: "Sangotedo", x: 0.82, y: 0.72, zone: 6, passengerCount: 180, trafficCondition: "light", accessibility: true, amenities: ["shelter"] },
      { id: this.currentStationId++, name: "Eleganza", x: 0.78, y: 0.68, zone: 5, passengerCount: 220, trafficCondition: "moderate", accessibility: true, amenities: ["shelter", "security"] },
      { id: this.currentStationId++, name: "VGC", x: 0.75, y: 0.65, zone: 5, passengerCount: 260, trafficCondition: "moderate", accessibility: true, amenities: ["restroom", "atm"] },
      { id: this.currentStationId++, name: "Chevron", x: 0.72, y: 0.62, zone: 4, passengerCount: 340, trafficCondition: "heavy", accessibility: true, amenities: ["food court", "wifi"] },
      { id: this.currentStationId++, name: "Lekki Phase 1", x: 0.68, y: 0.58, zone: 4, passengerCount: 390, trafficCondition: "heavy", accessibility: true, amenities: ["restroom", "parking", "wifi"] },
      { id: this.currentStationId++, name: "Admiralty Way", x: 0.65, y: 0.55, zone: 3, passengerCount: 420, trafficCondition: "heavy", accessibility: true, amenities: ["food court", "security", "atm"] },
      { id: this.currentStationId++, name: "1004 Estate", x: 0.62, y: 0.52, zone: 3, passengerCount: 280, trafficCondition: "moderate", accessibility: true, amenities: ["shelter", "wifi"] },
      { id: this.currentStationId++, name: "Victoria Island", x: 0.58, y: 0.48, zone: 2, passengerCount: 450, trafficCondition: "heavy", accessibility: true, amenities: ["restroom", "food court", "atm", "security", "wifi"] },
      { id: this.currentStationId++, name: "Tiamiyu Savage", x: 0.55, y: 0.45, zone: 2, passengerCount: 380, trafficCondition: "heavy", accessibility: true, amenities: ["restroom", "parking"] },
      { id: this.currentStationId++, name: "Marina Terminal", x: 0.52, y: 0.42, zone: 1, passengerCount: 420, trafficCondition: "heavy", accessibility: true, amenities: ["restroom", "food court", "security", "wifi"] },
      
      // Airport Route
      { id: this.currentStationId++, name: "Murtala Muhammed Airport", x: 0.25, y: 0.35, zone: 2, passengerCount: 380, trafficCondition: "moderate", accessibility: true, amenities: ["restroom", "food court", "wifi", "currency exchange"] },
      { id: this.currentStationId++, name: "Ajao Estate", x: 0.28, y: 0.32, zone: 2, passengerCount: 160, trafficCondition: "light", accessibility: true, amenities: ["shelter"] },
      { id: this.currentStationId++, name: "Isolo", x: 0.32, y: 0.28, zone: 2, passengerCount: 280, trafficCondition: "moderate", accessibility: true, amenities: ["shelter", "atm"] },
      { id: this.currentStationId++, name: "Ikeja GRA", x: 0.35, y: 0.25, zone: 2, passengerCount: 320, trafficCondition: "heavy", accessibility: true, amenities: ["restroom", "security"] },
      { id: this.currentStationId++, name: "Ikeja City Mall", x: 0.38, y: 0.22, zone: 2, passengerCount: 450, trafficCondition: "heavy", accessibility: true, amenities: ["restroom", "food court", "shopping", "wifi"] }
    ];

    lagosStations.forEach(station => this.stations.set(station.id, station));

    // Seed buses with Lagos BRT fleet
    const lagosBuses: Bus[] = [
      { id: this.currentBusId++, routeId: 1, busNumber: "BRT001", currentX: 0.5, currentY: 0.3, status: "active", direction: "northbound", lastUpdated: new Date() },
      { id: this.currentBusId++, routeId: 1, busNumber: "BRT002", currentX: 0.45, currentY: 0.22, status: "active", direction: "southbound", lastUpdated: new Date() },
      { id: this.currentBusId++, routeId: 2, busNumber: "BRT003", currentX: 0.58, currentY: 0.38, status: "delayed", direction: "eastbound", lastUpdated: new Date() },
      { id: this.currentBusId++, routeId: 2, busNumber: "BRT004", currentX: 0.48, currentY: 0.40, status: "active", direction: "westbound", lastUpdated: new Date() },
      { id: this.currentBusId++, routeId: 3, busNumber: "BRT005", currentX: 0.62, currentY: 0.52, status: "active", direction: "northwest", lastUpdated: new Date() },
      { id: this.currentBusId++, routeId: 3, busNumber: "BRT006", currentX: 0.40, currentY: 0.36, status: "maintenance", direction: "southeast", lastUpdated: new Date() },
      { id: this.currentBusId++, routeId: 4, busNumber: "BRT007", currentX: 0.68, currentY: 0.58, status: "active", direction: "northwest", lastUpdated: new Date() },
      { id: this.currentBusId++, routeId: 5, busNumber: "BRT008", currentX: 0.32, currentY: 0.28, status: "active", direction: "southwest", lastUpdated: new Date() }
    ];

    lagosBuses.forEach(bus => this.buses.set(bus.id, bus));

    // Seed realistic alerts
    const lagosAlerts: Alert[] = [
      {
        id: this.currentAlertId++,
        type: "traffic",
        message: "Heavy traffic congestion at Ojota Station - expect 15-minute delays",
        routeId: 2,
        busId: null,
        isActive: true,
        priority: "P2",
        severity: "medium",
        driverName: null,
        driverNumber: null,
        lastStopId: 11,
        nextStopId: 12,
        zoneNumber: "Zone 3",
        createdAt: new Date()
      }
    ];

    lagosAlerts.forEach(alert => this.alerts.set(alert.id, alert));

    // Seed route-station relationships
    const routeStationMappings = [
      // Route 1 stations
      { routeId: 1, stationId: 1, sequence: 1 },
      { routeId: 1, stationId: 2, sequence: 2 },
      { routeId: 1, stationId: 3, sequence: 3 },
      { routeId: 1, stationId: 4, sequence: 4 },
      { routeId: 1, stationId: 5, sequence: 5 },
      { routeId: 1, stationId: 6, sequence: 6 },
      { routeId: 1, stationId: 7, sequence: 7 },
      { routeId: 1, stationId: 8, sequence: 8 },
      
      // Route 3 stations
      { routeId: 3, stationId: 19, sequence: 1 },
      { routeId: 3, stationId: 20, sequence: 2 },
      { routeId: 3, stationId: 21, sequence: 3 },
      { routeId: 3, stationId: 22, sequence: 4 },
      { routeId: 3, stationId: 23, sequence: 5 },
      { routeId: 3, stationId: 24, sequence: 6 },
      { routeId: 3, stationId: 25, sequence: 7 },
      { routeId: 3, stationId: 26, sequence: 8 },
      { routeId: 3, stationId: 27, sequence: 9 },
      { routeId: 3, stationId: 28, sequence: 10 },
      { routeId: 3, stationId: 29, sequence: 11 },
      { routeId: 3, stationId: 30, sequence: 12 },
      { routeId: 3, stationId: 31, sequence: 13 },
      { routeId: 3, stationId: 32, sequence: 14 },
      { routeId: 3, stationId: 33, sequence: 15 }
    ];

    routeStationMappings.forEach(mapping => {
      const routeStation: RouteStation = {
        id: this.currentRouteStationId++,
        ...mapping
      };
      this.routeStations.set(routeStation.id, routeStation);
    });

    // Start bus simulation
    this.simulateBusMovement();
  }

  private seedCrowdData() {
    // Seed initial crowd density readings for major stations
    const majorStations = [1, 2, 3, 4, 6, 11, 12, 14, 17, 19, 22, 33, 41, 46];
    majorStations.forEach((stationId) => {
      // Create readings for the last 24 hours
      for (let i = 0; i < 24; i++) {
        const hour = new Date().getHours() - i;
        const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
        const basePassengers = Math.floor(Math.random() * 30) + 15;
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
          sensorType: Math.random() > 0.6 ? "camera" : "infrared",
          timestamp: new Date(Date.now() - (i * 60 * 60 * 1000))
        };
        this.crowdDensityReadings.set(reading.id, reading);
      }
    });

    // Seed historical patterns for all major stations
    majorStations.forEach((stationId) => {
      [1, 2, 3, 4, 5].forEach((routeId) => {
        for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
          for (let hour = 5; hour < 23; hour++) {
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
            
            let avgDensity = Math.random() * 0.4 + 0.25; // Base 25-65%
            if (!isWeekend && isRushHour) {
              avgDensity = Math.min(0.95, avgDensity * 2.3);
            }
            
            const pattern: HistoricalPattern = {
              id: this.currentHistoricalPatternId++,
              stationId,
              routeId,
              dayOfWeek,
              hourOfDay: hour,
              avgPassengerCount: Math.floor(avgDensity * 70),
              avgDensityLevel: this.calculateDensityLevel(Math.floor(avgDensity * 70), 70),
              peakMultiplier: isRushHour ? 2.3 : 1,
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
    // Simulate new crowd readings every 90 seconds
    setInterval(() => {
      const majorStations = [1, 2, 3, 4, 6, 11, 12, 14, 17, 19, 22, 33, 41, 46];
      const randomStation = majorStations[Math.floor(Math.random() * majorStations.length)];
      
      const currentHour = new Date().getHours();
      const isRushHour = (currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 19);
      const basePassengers = Math.floor(Math.random() * 35) + 15;
      const rushMultiplier = isRushHour ? 2.1 : 1;
      const passengerCount = Math.min(70, Math.floor(basePassengers * rushMultiplier));
      
      this.createCrowdDensityReading({
        stationId: randomStation,
        passengerCount,
        capacity: 70,
        densityLevel: this.calculateDensityLevel(passengerCount, 70),
        sensorType: "automatic"
      });
    }, 90000); // Every 90 seconds
  }

  public simulateBusMovement() {
    setInterval(() => {
      this.buses.forEach((bus) => {
        const routePoints = this.getRoutePoints(bus.routeId);
        if (routePoints.length > 0) {
          const randomPoint = routePoints[Math.floor(Math.random() * routePoints.length)];
          bus.currentX = randomPoint.x + (Math.random() - 0.5) * 0.02;
          bus.currentY = randomPoint.y + (Math.random() - 0.5) * 0.02;
          bus.lastUpdated = new Date();
        }
      });
    }, 15000);
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
    
    return filtered
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50); // Return last 50 readings
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
      .sort((a, b) => new Date(a.predictedTime).getTime() - new Date(b.predictedTime).getTime())
      .slice(0, 10); // Return next 10 predictions
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
    const predictions = await this.generateCrowdPredictions(stationId, 1);
    const patterns = await this.getHistoricalPatterns(stationId, 1);
    
    // Calculate historical average
    const historicalAverage = patterns.length > 0
      ? patterns.reduce((sum, p) => sum + p.avgPassengerCount, 0) / patterns.length
      : 35;
    
    // Get peak times from patterns
    const peakTimes = patterns
      .filter(p => p.peakMultiplier > 1.5)
      .map(p => ({ hour: p.hourOfDay, avgDensity: p.avgDensityLevel }))
      .slice(0, 6);
    
    return {
      stationId,
      currentDensity: latestReading?.densityLevel || "low",
      passengerCount: latestReading?.passengerCount || 25,
      capacity: latestReading?.capacity || 70,
      utilizationRate: latestReading ? Math.round((latestReading.passengerCount / latestReading.capacity) * 100) : 35,
      predictions,
      historicalAverage: Math.round(historicalAverage),
      peakTimes
    };
  }

  async generateCrowdPredictions(stationId: number, routeId: number): Promise<CrowdPrediction[]> {
    const predictions: CrowdPrediction[] = [];
    const currentTime = new Date();
    const patterns = await this.getHistoricalPatterns(stationId, routeId);
    const currentDayOfWeek = currentTime.getDay();
    
    // Generate predictions for the next 4 hours
    for (let i = 1; i <= 4; i++) {
      const futureTime = new Date(currentTime.getTime() + (i * 60 * 60 * 1000));
      const futureHour = futureTime.getHours();
      
      // Find matching historical pattern
      const pattern = patterns.find(p => 
        p.dayOfWeek === currentDayOfWeek && 
        p.hourOfDay === futureHour
      );
      
      const baseCount = pattern?.avgPassengerCount || 30;
      const variance = Math.floor(Math.random() * 12) - 6; // ±6 variance
      const predictedCount = Math.max(8, Math.min(70, baseCount + variance));
      
      const prediction: CrowdPrediction = {
        id: this.currentCrowdPredictionId++,
        stationId,
        routeId,
        predictedTime: futureTime,
        predictedDensity: this.calculateDensityLevel(predictedCount, 70),
        predictedPassengerCount: predictedCount,
        confidence: 0.78 + (Math.random() * 0.17), // 78-95% confidence
        modelVersion: "v2.3",
        createdAt: new Date()
      };
      
      predictions.push(prediction);
      this.crowdPredictions.set(prediction.id, prediction);
    }
    
    return predictions;
  }

  // Existing methods
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
    const predictions = activeRoutes.length > 0 
      ? await this.getCrowdPredictions(id, activeRoutes[0].id) 
      : [];

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
    const recentReadings = Array.from(this.crowdDensityReadings.values())
      .filter(r => new Date(r.timestamp).getTime() > Date.now() - (2 * 60 * 60 * 1000)); // Last 2 hours
    
    const avgCrowdDensity = recentReadings.length > 0
      ? Math.round(recentReadings.reduce((sum, r) => sum + (r.passengerCount / r.capacity), 0) / recentReadings.length * 100)
      : 45;
    
    const highDensityCount = recentReadings.filter(r => 
      r.densityLevel === "high" || r.densityLevel === "critical"
    ).length;

    return {
      totalBuses: allBuses.length,
      activeRoutes: activeRoutes.length,
      onTimePercentage: allBuses.length > 0 ? Math.round((onTimeBuses / allBuses.length) * 100) : 0,
      onTimeBuses,
      delayedBuses,
      alertBuses,
      avgCrowdDensity,
      peakStations: highDensityCount
    };
  }

  private getRoutePoints(routeId: number): Array<{x: number, y: number}> {
    const routePointsMap: Record<number, Array<{x: number, y: number}>> = {
      1: [
        { x: 0.5, y: 0.3 }, { x: 0.52, y: 0.28 }, { x: 0.48, y: 0.25 }, 
        { x: 0.45, y: 0.22 }, { x: 0.42, y: 0.20 }, { x: 0.38, y: 0.15 }, 
        { x: 0.35, y: 0.12 }, { x: 0.32, y: 0.08 }
      ],
      2: [
        { x: 0.65, y: 0.45 }, { x: 0.62, y: 0.42 }, { x: 0.58, y: 0.38 }, 
        { x: 0.55, y: 0.35 }, { x: 0.52, y: 0.32 }, { x: 0.48, y: 0.40 }, 
        { x: 0.45, y: 0.43 }, { x: 0.42, y: 0.45 }, { x: 0.40, y: 0.47 }, 
        { x: 0.38, y: 0.50 }
      ],
      3: [
        { x: 0.75, y: 0.65 }, { x: 0.72, y: 0.62 }, { x: 0.68, y: 0.58 }, 
        { x: 0.62, y: 0.52 }, { x: 0.55, y: 0.48 }, { x: 0.52, y: 0.45 }, 
        { x: 0.48, y: 0.42 }, { x: 0.45, y: 0.40 }, { x: 0.42, y: 0.38 }, 
        { x: 0.40, y: 0.36 }, { x: 0.38, y: 0.35 }, { x: 0.36, y: 0.33 }, 
        { x: 0.34, y: 0.32 }, { x: 0.32, y: 0.30 }, { x: 0.30, y: 0.28 }, 
        { x: 0.28, y: 0.25 }
      ],
      4: [
        { x: 0.85, y: 0.75 }, { x: 0.82, y: 0.72 }, { x: 0.78, y: 0.68 }, 
        { x: 0.75, y: 0.65 }, { x: 0.72, y: 0.62 }, { x: 0.68, y: 0.58 }, 
        { x: 0.65, y: 0.55 }, { x: 0.62, y: 0.52 }, { x: 0.58, y: 0.48 }, 
        { x: 0.55, y: 0.45 }, { x: 0.52, y: 0.42 }
      ],
      5: [
        { x: 0.25, y: 0.35 }, { x: 0.28, y: 0.32 }, { x: 0.32, y: 0.28 }, 
        { x: 0.35, y: 0.25 }, { x: 0.38, y: 0.22 }
      ]
    };

    return routePointsMap[routeId] || [];
  }
}

export const storage = new MemStorage();