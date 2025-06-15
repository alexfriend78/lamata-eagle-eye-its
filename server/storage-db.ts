import type { 
  Route, Station, Bus, Alert, RouteStation, BusArrival, 
  CrowdDensityReading, CrowdPrediction, HistoricalPattern,
  InsertRoute, InsertStation, InsertBus, InsertAlert, InsertRouteStation, InsertBusArrival,
  InsertCrowdDensityReading, InsertCrowdPrediction, InsertHistoricalPattern,
  BusWithRoute, AlertWithDetails, BusArrivalWithDetails, StationDetails, SystemStats, CrowdAnalytics
} from "../shared/schema.js";
import { db } from "./db.js";
import { 
  routes, stations, buses, alerts, routeStations, busArrivals,
  crowdDensityReadings, crowdPredictions, historicalPatterns 
} from "../shared/schema.js";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import type { IStorage } from "./storage.js";

export class DatabaseStorage implements IStorage {
  constructor() {
    this.seedData();
  }

  private async seedData() {
    try {
      // Check if data already exists
      const existingRoutes = await db.select().from(routes).limit(1);
      if (existingRoutes.length > 0) return;

      // Seed routes
      const routesData = [
        { routeNumber: "1", name: "Oshodi - Abule-Egba", color: "#0066CC", isActive: true },
        { routeNumber: "2", name: "Abule Egba - TBS/Obalende", color: "#CC0000", isActive: true },
        { routeNumber: "3", name: "Ikorodu - TBS", color: "#00AA44", isActive: true },
        { routeNumber: "4", name: "Ikorodu - Fadeyi", color: "#FFD700", isActive: true },
        { routeNumber: "5", name: "Ikorodu - Oshodi", color: "#8A2BE2", isActive: true }
      ];

      const insertedRoutes = await db.insert(routes).values(routesData).returning();

      // Seed stations for Route 1 (Oshodi - Abule-Egba)
      const route1Stations = [
        { name: "Oshodi Terminal 2", x: 0.5, y: 0.8, passengerCount: 45 },
        { name: "Bolade", x: 0.52, y: 0.75, passengerCount: 23 },
        { name: "Ladipo", x: 0.54, y: 0.7, passengerCount: 31 },
        { name: "Shogunle", x: 0.56, y: 0.65, passengerCount: 28 },
        { name: "Ikeja Along", x: 0.58, y: 0.6, passengerCount: 52 },
        { name: "Ijaiye", x: 0.6, y: 0.55, passengerCount: 19 },
        { name: "Ogba", x: 0.62, y: 0.5, passengerCount: 37 },
        { name: "Agege", x: 0.64, y: 0.45, passengerCount: 41 },
        { name: "Pen Cinema", x: 0.66, y: 0.4, passengerCount: 26 },
        { name: "Mangoro", x: 0.68, y: 0.35, passengerCount: 33 },
        { name: "Abule-Egba Terminal", x: 0.7, y: 0.3, passengerCount: 48 }
      ];

      const insertedStations = await db.insert(stations).values(route1Stations).returning();

      // Link stations to route 1
      const routeStationData = insertedStations.map((station, index) => ({
        routeId: insertedRoutes[0].id,
        stationId: station.id,
        sequence: index + 1
      }));
      await db.insert(routeStations).values(routeStationData);

      // Seed buses
      const busData = Array.from({ length: 15 }, (_, i) => ({
        routeId: insertedRoutes[Math.floor(i / 3)].id,
        busNumber: `BRT-${String(i + 1).padStart(3, '0')}`,
        currentX: 0.5 + (Math.random() * 0.4),
        currentY: 0.3 + (Math.random() * 0.5),
        status: "active",
        direction: "forward",
        capacity: 65
      }));

      await db.insert(buses).values(busData);

      // Seed crowd density readings
      const now = new Date();
      const crowdData = insertedStations.map(station => ({
        stationId: station.id,
        passengerCount: Math.floor(Math.random() * 80) + 10,
        capacity: 100,
        densityLevel: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
        sensorType: "automatic"
      }));

      await db.insert(crowdDensityReadings).values(crowdData);

      console.log("Database seeded successfully with crowd analytics data");
    } catch (error) {
      console.error("Error seeding database:", error);
    }
  }

  // Routes
  async getRoutes(): Promise<Route[]> {
    return await db.select().from(routes);
  }

  async getRoute(id: number): Promise<Route | undefined> {
    const [route] = await db.select().from(routes).where(eq(routes.id, id));
    return route;
  }

  async createRoute(route: InsertRoute): Promise<Route> {
    const [newRoute] = await db.insert(routes).values(route).returning();
    return newRoute;
  }

  async updateRouteAesthetics(id: number, aesthetics: Partial<Route>): Promise<Route | undefined> {
    const [updatedRoute] = await db
      .update(routes)
      .set(aesthetics)
      .where(eq(routes.id, id))
      .returning();
    return updatedRoute;
  }

  // Stations
  async getStations(): Promise<Station[]> {
    return await db.select().from(stations);
  }

  async getStation(id: number): Promise<Station | undefined> {
    const [station] = await db.select().from(stations).where(eq(stations.id, id));
    return station;
  }

  async createStation(station: InsertStation): Promise<Station> {
    const [newStation] = await db.insert(stations).values(station).returning();
    return newStation;
  }

  async updateStationPassengerCount(id: number, count: number): Promise<Station | undefined> {
    const [updatedStation] = await db
      .update(stations)
      .set({ passengerCount: count })
      .where(eq(stations.id, id))
      .returning();
    return updatedStation;
  }

  // Buses
  async getBuses(): Promise<Bus[]> {
    return await db.select().from(buses);
  }

  async getBusesWithRoutes(): Promise<BusWithRoute[]> {
    const result = await db
      .select()
      .from(buses)
      .leftJoin(routes, eq(buses.routeId, routes.id));
    
    return result.map(row => ({
      ...row.buses,
      route: row.routes!
    }));
  }

  async getBus(id: number): Promise<Bus | undefined> {
    const [bus] = await db.select().from(buses).where(eq(buses.id, id));
    return bus;
  }

  async createBus(bus: InsertBus): Promise<Bus> {
    const [newBus] = await db.insert(buses).values(bus).returning();
    return newBus;
  }

  async updateBusPosition(id: number, x: number, y: number): Promise<Bus | undefined> {
    const [updatedBus] = await db
      .update(buses)
      .set({ currentX: x, currentY: y, lastUpdated: new Date() })
      .where(eq(buses.id, id))
      .returning();
    return updatedBus;
  }

  async updateBusStatus(id: number, status: string): Promise<Bus | undefined> {
    const [updatedBus] = await db
      .update(buses)
      .set({ status })
      .where(eq(buses.id, id))
      .returning();
    return updatedBus;
  }

  // Alerts
  async getActiveAlerts(): Promise<AlertWithDetails[]> {
    const result = await db
      .select()
      .from(alerts)
      .leftJoin(buses, eq(alerts.busId, buses.id))
      .leftJoin(routes, eq(alerts.routeId, routes.id))
      .where(eq(alerts.isActive, true))
      .orderBy(desc(alerts.createdAt));

    return result.map(row => ({
      ...row.alerts,
      bus: row.buses || undefined,
      route: row.routes || undefined
    }));
  }

  async getAlert(id: number): Promise<Alert | undefined> {
    const [alert] = await db.select().from(alerts).where(eq(alerts.id, id));
    return alert;
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [newAlert] = await db.insert(alerts).values(alert).returning();
    return newAlert;
  }

  async acknowledgeAlert(id: number): Promise<Alert | undefined> {
    const [updatedAlert] = await db
      .update(alerts)
      .set({ isActive: false })
      .where(eq(alerts.id, id))
      .returning();
    return updatedAlert;
  }

  // Route Stations
  async getRouteStations(routeId: number): Promise<Station[]> {
    const result = await db
      .select({ station: stations })
      .from(routeStations)
      .innerJoin(stations, eq(routeStations.stationId, stations.id))
      .where(eq(routeStations.routeId, routeId))
      .orderBy(asc(routeStations.sequence));

    return result.map(row => row.station);
  }

  async addStationToRoute(routeStation: InsertRouteStation): Promise<RouteStation> {
    const [newRouteStation] = await db.insert(routeStations).values(routeStation).returning();
    return newRouteStation;
  }

  // Bus Arrivals
  async getBusArrivals(stationId: number): Promise<BusArrivalWithDetails[]> {
    const result = await db
      .select()
      .from(busArrivals)
      .leftJoin(buses, eq(busArrivals.busId, buses.id))
      .leftJoin(routes, eq(busArrivals.routeId, routes.id))
      .where(eq(busArrivals.stationId, stationId))
      .orderBy(asc(busArrivals.estimatedArrival));

    return result.map(row => ({
      ...row.bus_arrivals,
      bus: { ...row.buses!, route: row.routes! },
      route: row.routes!
    }));
  }

  async createBusArrival(arrival: InsertBusArrival): Promise<BusArrival> {
    const [newArrival] = await db.insert(busArrivals).values(arrival).returning();
    return newArrival;
  }

  async updateArrivalStatus(id: number, status: string): Promise<BusArrival | undefined> {
    const [updatedArrival] = await db
      .update(busArrivals)
      .set({ status })
      .where(eq(busArrivals.id, id))
      .returning();
    return updatedArrival;
  }

  async getStationDetails(id: number): Promise<StationDetails | undefined> {
    const station = await this.getStation(id);
    if (!station) return undefined;

    const upcomingArrivals = await this.getBusArrivals(id);
    const routeStationData = await db
      .select({ route: routes })
      .from(routeStations)
      .innerJoin(routes, eq(routeStations.routeId, routes.id))
      .where(eq(routeStations.stationId, id));

    const activeRoutes = routeStationData.map(row => row.route);
    const currentDensity = await this.getLatestCrowdDensity(id);
    const predictions = await this.getCrowdPredictions(id, activeRoutes[0]?.id || 1);

    return {
      ...station,
      upcomingArrivals,
      activeRoutes,
      currentDensity,
      predictions
    };
  }

  // Crowd Density Analytics
  async getCrowdDensityReadings(stationId?: number, busId?: number): Promise<CrowdDensityReading[]> {
    if (stationId && busId) {
      return await db.select().from(crowdDensityReadings)
        .where(and(eq(crowdDensityReadings.stationId, stationId), eq(crowdDensityReadings.busId, busId)))
        .orderBy(desc(crowdDensityReadings.timestamp));
    } else if (stationId) {
      return await db.select().from(crowdDensityReadings)
        .where(eq(crowdDensityReadings.stationId, stationId))
        .orderBy(desc(crowdDensityReadings.timestamp));
    } else if (busId) {
      return await db.select().from(crowdDensityReadings)
        .where(eq(crowdDensityReadings.busId, busId))
        .orderBy(desc(crowdDensityReadings.timestamp));
    }
    
    return await db.select().from(crowdDensityReadings).orderBy(desc(crowdDensityReadings.timestamp));
  }

  async getLatestCrowdDensity(stationId: number): Promise<CrowdDensityReading | undefined> {
    const [reading] = await db
      .select()
      .from(crowdDensityReadings)
      .where(eq(crowdDensityReadings.stationId, stationId))
      .orderBy(desc(crowdDensityReadings.timestamp))
      .limit(1);
    return reading;
  }

  async createCrowdDensityReading(reading: InsertCrowdDensityReading): Promise<CrowdDensityReading> {
    const [newReading] = await db.insert(crowdDensityReadings).values(reading).returning();
    return newReading;
  }

  async getCrowdPredictions(stationId: number, routeId: number): Promise<CrowdPrediction[]> {
    return await db
      .select()
      .from(crowdPredictions)
      .where(and(eq(crowdPredictions.stationId, stationId), eq(crowdPredictions.routeId, routeId)))
      .orderBy(asc(crowdPredictions.predictedTime));
  }

  async createCrowdPrediction(prediction: InsertCrowdPrediction): Promise<CrowdPrediction> {
    const [newPrediction] = await db.insert(crowdPredictions).values(prediction).returning();
    return newPrediction;
  }

  async getHistoricalPatterns(stationId: number, routeId: number): Promise<HistoricalPattern[]> {
    return await db
      .select()
      .from(historicalPatterns)
      .where(and(eq(historicalPatterns.stationId, stationId), eq(historicalPatterns.routeId, routeId)));
  }

  async updateHistoricalPattern(pattern: InsertHistoricalPattern): Promise<HistoricalPattern> {
    const [newPattern] = await db.insert(historicalPatterns).values(pattern).returning();
    return newPattern;
  }

  async getCrowdAnalytics(stationId: number): Promise<CrowdAnalytics> {
    const currentDensity = await this.getLatestCrowdDensity(stationId);
    const predictions = await this.getCrowdPredictions(stationId, 1); // Default to route 1
    
    const historicalData = await db
      .select()
      .from(historicalPatterns)
      .where(eq(historicalPatterns.stationId, stationId));

    const peakTimes = historicalData.map(pattern => ({
      hour: pattern.hourOfDay,
      avgDensity: pattern.avgDensityLevel
    }));

    const historicalAverage = historicalData.reduce((sum, pattern) => 
      sum + pattern.avgPassengerCount, 0) / Math.max(historicalData.length, 1);

    return {
      stationId,
      currentDensity: currentDensity?.densityLevel || "low",
      passengerCount: currentDensity?.passengerCount || 0,
      capacity: currentDensity?.capacity || 100,
      utilizationRate: currentDensity ? (currentDensity.passengerCount / currentDensity.capacity) * 100 : 0,
      predictions,
      historicalAverage,
      peakTimes
    };
  }

  async generateCrowdPredictions(stationId: number, routeId: number): Promise<CrowdPrediction[]> {
    const now = new Date();
    const predictions: InsertCrowdPrediction[] = [];

    // Generate predictions for next 6 hours
    for (let i = 1; i <= 6; i++) {
      const predictedTime = new Date(now.getTime() + i * 60 * 60 * 1000);
      const hour = predictedTime.getHours();
      
      // Simple prediction based on time of day
      let predictedCount = 30;
      let predictedDensity = "low";
      
      if (hour >= 7 && hour <= 9) { // Morning rush
        predictedCount = 65;
        predictedDensity = "high";
      } else if (hour >= 17 && hour <= 19) { // Evening rush
        predictedCount = 70;
        predictedDensity = "high";
      } else if (hour >= 10 && hour <= 16) { // Daytime
        predictedCount = 45;
        predictedDensity = "medium";
      }

      predictions.push({
        stationId,
        routeId,
        predictedTime,
        predictedDensity,
        predictedPassengerCount: predictedCount,
        confidence: 0.8,
        modelVersion: "v1.0"
      });
    }

    const insertedPredictions = await db.insert(crowdPredictions).values(predictions).returning();
    return insertedPredictions;
  }

  async getSystemStats(): Promise<SystemStats> {
    const totalBuses = await db.select({ count: sql<number>`count(*)` }).from(buses);
    const activeRoutes = await db.select({ count: sql<number>`count(*)` }).from(routes).where(eq(routes.isActive, true));
    
    const allBuses = await db.select().from(buses);
    const onTimeBuses = allBuses.filter(bus => bus.status === "active").length;
    const delayedBuses = allBuses.filter(bus => bus.status === "maintenance").length;
    const alertBuses = allBuses.filter(bus => bus.status === "idle").length;
    
    // Calculate crowd density average
    const densityReadings = await db.select().from(crowdDensityReadings);
    const avgCrowdDensity = densityReadings.reduce((sum, reading) => 
      sum + (reading.passengerCount / reading.capacity), 0) / Math.max(densityReadings.length, 1);
    
    const peakStations = densityReadings.filter(reading => 
      reading.densityLevel === "high" || reading.densityLevel === "critical").length;

    return {
      totalBuses: totalBuses[0].count,
      activeRoutes: activeRoutes[0].count,
      onTimePercentage: totalBuses[0].count > 0 ? Math.round((onTimeBuses / totalBuses[0].count) * 100) : 0,
      onTimeBuses,
      delayedBuses,
      alertBuses,
      avgCrowdDensity: Math.round(avgCrowdDensity * 100),
      peakStations
    };
  }
}

export const storage = new DatabaseStorage();