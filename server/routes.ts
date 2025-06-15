import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAlertSchema, insertBusSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all buses with routes
  app.get("/api/buses", async (_req, res) => {
    try {
      const buses = await storage.getBusesWithRoutes();
      res.json(buses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch buses" });
    }
  });

  // Get all routes
  app.get("/api/routes", async (_req, res) => {
    try {
      const routes = await storage.getRoutes();
      res.json(routes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch routes" });
    }
  });

  // Get all stations
  app.get("/api/stations", async (_req, res) => {
    try {
      const stations = await storage.getStations();
      res.json(stations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stations" });
    }
  });

  // Get station details
  app.get("/api/stations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const stationDetails = await storage.getStationDetails(id);
      if (!stationDetails) {
        res.status(404).json({ error: "Station not found" });
        return;
      }
      res.json(stationDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch station details" });
    }
  });

  // Get active alerts
  app.get("/api/alerts", async (_req, res) => {
    try {
      const alerts = await storage.getActiveAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  // Get system stats
  app.get("/api/stats", async (_req, res) => {
    try {
      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Get stations for a specific route
  app.get("/api/routes/:id/stations", async (req, res) => {
    try {
      const stations = await storage.getRouteStations(parseInt(req.params.id));
      res.json(stations);
    } catch (error) {
      console.error("Error fetching route stations:", error);
      res.status(500).json({ error: "Failed to fetch route stations" });
    }
  });

  // Create alert
  app.post("/api/alerts", async (req, res) => {
    try {
      const alertData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(alertData);
      res.status(201).json(alert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid alert data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create alert" });
      }
    }
  });

  // Acknowledge alert
  app.patch("/api/alerts/:id/acknowledge", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const alert = await storage.acknowledgeAlert(id);
      if (!alert) {
        res.status(404).json({ error: "Alert not found" });
        return;
      }
      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: "Failed to acknowledge alert" });
    }
  });

  // Update route aesthetics
  app.patch("/api/routes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const route = await storage.updateRouteAesthetics(id, updates);
      if (!route) {
        res.status(404).json({ error: "Route not found" });
        return;
      }
      res.json(route);
    } catch (error) {
      res.status(500).json({ error: "Failed to update route aesthetics" });
    }
  });

  // Update bus position (for simulation)
  app.patch("/api/buses/:id/position", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { x, y } = req.body;
      
      if (typeof x !== "number" || typeof y !== "number") {
        res.status(400).json({ error: "Invalid position data" });
        return;
      }
      
      const bus = await storage.updateBusPosition(id, x, y);
      if (!bus) {
        res.status(404).json({ error: "Bus not found" });
        return;
      }
      res.json(bus);
    } catch (error) {
      res.status(500).json({ error: "Failed to update bus position" });
    }
  });

  // Update bus status
  app.patch("/api/buses/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["on_time", "delayed", "alert"].includes(status)) {
        res.status(400).json({ error: "Invalid status" });
        return;
      }
      
      const bus = await storage.updateBusStatus(id, status);
      if (!bus) {
        res.status(404).json({ error: "Bus not found" });
        return;
      }
      res.json(bus);
    } catch (error) {
      res.status(500).json({ error: "Failed to update bus status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
