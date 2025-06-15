import { pgTable, text, serial, integer, boolean, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  routeNumber: text("route_number").notNull(),
  name: text("name").notNull(),
  color: text("color").notNull().default("#1976D2"),
  isActive: boolean("is_active").notNull().default(true),
});

export const stations = pgTable("stations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  x: real("x").notNull(), // X coordinate for positioning
  y: real("y").notNull(), // Y coordinate for positioning
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
  severity: text("severity").notNull().default("medium"), // low, medium, high, critical
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const routeStations = pgTable("route_stations", {
  id: serial("id").primaryKey(),
  routeId: integer("route_id").notNull(),
  stationId: integer("station_id").notNull(),
  sequence: integer("sequence").notNull(),
});

// Insert schemas
export const insertRouteSchema = createInsertSchema(routes).omit({ id: true });
export const insertStationSchema = createInsertSchema(stations).omit({ id: true });
export const insertBusSchema = createInsertSchema(buses).omit({ id: true, lastUpdated: true });
export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true, createdAt: true });
export const insertRouteStationSchema = createInsertSchema(routeStations).omit({ id: true });

// Types
export type Route = typeof routes.$inferSelect;
export type Station = typeof stations.$inferSelect;
export type Bus = typeof buses.$inferSelect;
export type Alert = typeof alerts.$inferSelect;
export type RouteStation = typeof routeStations.$inferSelect;

export type InsertRoute = z.infer<typeof insertRouteSchema>;
export type InsertStation = z.infer<typeof insertStationSchema>;
export type InsertBus = z.infer<typeof insertBusSchema>;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type InsertRouteStation = z.infer<typeof insertRouteStationSchema>;

// Extended types for API responses
export type BusWithRoute = Bus & { route: Route };
export type RouteWithStations = Route & { stations: Station[] };
export type AlertWithDetails = Alert & { bus?: Bus; route?: Route };

export type SystemStats = {
  totalBuses: number;
  activeRoutes: number;
  onTimePercentage: number;
  onTimeBuses: number;
  delayedBuses: number;
  alertBuses: number;
};
