import { pgTable, text, serial, integer, boolean, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  routeNumber: text("route_number").notNull(),
  name: text("name").notNull(),
  color: text("color").notNull().default("#1976D2"),
  isActive: boolean("is_active").notNull().default(true),
  // Aesthetic customization fields
  lineStyle: text("line_style").notNull().default("solid"), // solid, dashed, dotted, double
  lineWidth: integer("line_width").notNull().default(3), // 1-8 pixels
  opacity: real("opacity").notNull().default(1.0), // 0.1-1.0
  pattern: text("pattern").notNull().default("none"), // none, arrows, dots, gradient
  animation: text("animation").notNull().default("none"), // none, flow, pulse, glow
  glowColor: text("glow_color"), // optional glow effect color
  gradientEnd: text("gradient_end"), // optional gradient end color
});

export const stations = pgTable("stations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  x: real("x").notNull(), // X coordinate for positioning
  y: real("y").notNull(), // Y coordinate for positioning
  zone: integer("zone").notNull().default(1),
  passengerCount: integer("passenger_count").notNull().default(0),
  trafficCondition: text("traffic_condition").notNull().default("normal"), // light, normal, heavy, severe
  accessibility: boolean("accessibility").notNull().default(true),
  amenities: text("amenities").array().default([]), // ["shelter", "seating", "lighting", "cctv"]
});

export const buses = pgTable("buses", {
  id: serial("id").primaryKey(),
  routeId: integer("route_id").notNull(),
  busNumber: text("bus_number").notNull(),
  currentX: real("current_x").notNull(),
  currentY: real("current_y").notNull(),
  status: text("status").notNull().default("on_time"), // on_time, delayed, alert
  direction: text("direction").notNull().default("forward"), // forward, reverse
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  busId: integer("bus_id"),
  routeId: integer("route_id"),
  type: text("type").notNull(), // emergency, delay, breakdown, security
  message: text("message").notNull(),
  priority: text("priority").notNull().default("P3"), // P1, P2, P3, P4, P5
  severity: text("severity").notNull().default("medium"), // low, medium, high, critical
  isActive: boolean("is_active").notNull().default(true),
  status: text("status").notNull().default("open"), // open, closed, cleared
  driverName: text("driver_name"),
  driverNumber: text("driver_number"),
  lastStopId: integer("last_stop_id"),
  nextStopId: integer("next_stop_id"),
  zoneNumber: text("zone_number"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const routeStations = pgTable("route_stations", {
  id: serial("id").primaryKey(),
  routeId: integer("route_id").notNull(),
  stationId: integer("station_id").notNull(),
  sequence: integer("sequence").notNull(),
});

export const busArrivals = pgTable("bus_arrivals", {
  id: serial("id").primaryKey(),
  busId: integer("bus_id").notNull(),
  stationId: integer("station_id").notNull(),
  routeId: integer("route_id").notNull(),
  estimatedArrival: timestamp("estimated_arrival").notNull(),
  actualArrival: timestamp("actual_arrival"),
  status: text("status").notNull().default("scheduled"), // scheduled, approaching, arrived, departed
});

// Crowd density analytics tables
export const crowdDensityReadings = pgTable("crowd_density_readings", {
  id: serial("id").primaryKey(),
  busId: integer("bus_id").references(() => buses.id),
  stationId: integer("station_id").references(() => stations.id),
  passengerCount: integer("passenger_count").notNull(),
  capacity: integer("capacity").notNull(),
  densityLevel: text("density_level").notNull(), // low, medium, high, critical
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  sensorType: text("sensor_type").notNull(), // manual, automatic, estimated
});

export const crowdPredictions = pgTable("crowd_predictions", {
  id: serial("id").primaryKey(),
  stationId: integer("station_id").notNull().references(() => stations.id),
  routeId: integer("route_id").notNull().references(() => routes.id),
  predictedTime: timestamp("predicted_time").notNull(),
  predictedDensity: text("predicted_density").notNull(),
  predictedPassengerCount: integer("predicted_passenger_count").notNull(),
  confidence: real("confidence").notNull(), // 0.0 to 1.0
  modelVersion: text("model_version").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const historicalPatterns = pgTable("historical_patterns", {
  id: serial("id").primaryKey(),
  stationId: integer("station_id").notNull().references(() => stations.id),
  routeId: integer("route_id").notNull().references(() => routes.id),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  hourOfDay: integer("hour_of_day").notNull(), // 0-23
  avgPassengerCount: real("avg_passenger_count").notNull(),
  avgDensityLevel: text("avg_density_level").notNull(),
  peakMultiplier: real("peak_multiplier").notNull().default(1.0),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

// Insert schemas
export const insertRouteSchema = createInsertSchema(routes).omit({ id: true });
export const insertStationSchema = createInsertSchema(stations).omit({ id: true });
export const insertBusSchema = createInsertSchema(buses).omit({ id: true, lastUpdated: true });
export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true, createdAt: true });
export const insertRouteStationSchema = createInsertSchema(routeStations).omit({ id: true });
export const insertBusArrivalSchema = createInsertSchema(busArrivals).omit({ id: true });
export const insertCrowdDensityReadingSchema = createInsertSchema(crowdDensityReadings).omit({ id: true, timestamp: true });
export const insertCrowdPredictionSchema = createInsertSchema(crowdPredictions).omit({ id: true, createdAt: true });
export const insertHistoricalPatternSchema = createInsertSchema(historicalPatterns).omit({ id: true, lastUpdated: true });

// Types
export type Route = typeof routes.$inferSelect;
export type Station = typeof stations.$inferSelect;
export type Bus = typeof buses.$inferSelect;
export type Alert = typeof alerts.$inferSelect;
export type RouteStation = typeof routeStations.$inferSelect;
export type BusArrival = typeof busArrivals.$inferSelect;
export type CrowdDensityReading = typeof crowdDensityReadings.$inferSelect;
export type CrowdPrediction = typeof crowdPredictions.$inferSelect;
export type HistoricalPattern = typeof historicalPatterns.$inferSelect;

export type InsertRoute = z.infer<typeof insertRouteSchema>;
export type InsertStation = z.infer<typeof insertStationSchema>;
export type InsertBus = z.infer<typeof insertBusSchema>;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type InsertRouteStation = z.infer<typeof insertRouteStationSchema>;
export type InsertBusArrival = z.infer<typeof insertBusArrivalSchema>;
export type InsertCrowdDensityReading = z.infer<typeof insertCrowdDensityReadingSchema>;
export type InsertCrowdPrediction = z.infer<typeof insertCrowdPredictionSchema>;
export type InsertHistoricalPattern = z.infer<typeof insertHistoricalPatternSchema>;

// Extended types for API responses
export type BusWithRoute = Bus & { route: Route };
export type RouteWithStations = Route & { stations: Station[] };
export type AlertWithDetails = Alert & { bus?: Bus; route?: Route };
export type BusArrivalWithDetails = BusArrival & { bus: BusWithRoute; route: Route };

export type StationDetails = Station & {
  upcomingArrivals: BusArrivalWithDetails[];
  activeRoutes: Route[];
  currentDensity?: CrowdDensityReading;
  predictions?: CrowdPrediction[];
};

export type SystemStats = {
  totalBuses: number;
  activeRoutes: number;
  onTimePercentage: number;
  onTimeBuses: number;
  delayedBuses: number;
  alertBuses: number;
  avgCrowdDensity: number;
  peakStations: number;
};

export type CrowdAnalytics = {
  stationId: number;
  currentDensity: string;
  passengerCount: number;
  capacity: number;
  utilizationRate: number;
  predictions: CrowdPrediction[];
  historicalAverage: number;
  peakTimes: Array<{ hour: number; avgDensity: string }>;
};
