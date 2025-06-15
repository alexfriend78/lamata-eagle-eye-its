import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-fixed";
import { insertAlertSchema, insertBusSchema } from "@shared/schema";
import { z } from "zod";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Video serving route - must be before other routes to avoid conflicts
  app.get("/attached_assets/:filename", (req: Request, res: Response) => {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'attached_assets', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Video file not found' });
    }
    
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    if (range) {
      // Handle range requests for video streaming
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      // Serve full file
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes',
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  });

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

  // Update route aesthetics
  app.patch("/api/routes/:id/aesthetics", async (req, res) => {
    try {
      const routeId = parseInt(req.params.id);
      const aestheticUpdates = req.body;
      
      const updatedRoute = await storage.updateRouteAesthetics(routeId, aestheticUpdates);
      if (!updatedRoute) {
        return res.status(404).json({ error: "Route not found" });
      }
      
      res.json(updatedRoute);
    } catch (error) {
      console.error("Error updating route aesthetics:", error);
      res.status(500).json({ error: "Failed to update route aesthetics" });
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

  // Crowd density analytics endpoints
  app.get("/api/crowd-density", async (req, res) => {
    try {
      const { stationId, busId } = req.query;
      const readings = await storage.getCrowdDensityReadings(
        stationId ? Number(stationId) : undefined,
        busId ? Number(busId) : undefined
      );
      res.json(readings);
    } catch (error) {
      console.error('Error fetching crowd density readings:', error);
      res.status(500).json({ error: "Failed to fetch crowd density readings" });
    }
  });

  app.get("/api/stations/:id/crowd-analytics", async (req, res) => {
    try {
      const stationId = Number(req.params.id);
      const analytics = await storage.getCrowdAnalytics(stationId);
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching crowd analytics:', error);
      res.status(500).json({ error: "Failed to fetch crowd analytics" });
    }
  });

  app.get("/api/stations/:stationId/predictions/:routeId", async (req, res) => {
    try {
      const stationId = Number(req.params.stationId);
      const routeId = Number(req.params.routeId);
      const predictions = await storage.getCrowdPredictions(stationId, routeId);
      res.json(predictions);
    } catch (error) {
      console.error('Error fetching crowd predictions:', error);
      res.status(500).json({ error: "Failed to fetch crowd predictions" });
    }
  });

  // Get all crowd predictions for active stations
  app.get("/api/crowd/predictions", async (req, res) => {
    try {
      const stations = await storage.getStations();
      const predictions = [];
      
      for (const station of stations) {
        // Get predictions for station's primary route
        const routeId = station.id <= 17 ? 1 : 3; // Route assignment logic
        const stationPredictions = await storage.getCrowdPredictions(station.id, routeId);
        
        if (stationPredictions.length > 0) {
          predictions.push({
            stationId: station.id,
            stationName: station.name,
            x: station.x,
            y: station.y,
            routeId,
            predictions: stationPredictions
          });
        }
      }
      
      res.json(predictions);
    } catch (error) {
      console.error('Error fetching crowd predictions:', error);
      res.status(500).json({ error: "Failed to fetch crowd predictions" });
    }
  });

  app.post("/api/crowd-density", async (req, res) => {
    try {
      const reading = await storage.createCrowdDensityReading(req.body);
      res.status(201).json(reading);
    } catch (error) {
      console.error('Error creating crowd density reading:', error);
      res.status(500).json({ error: "Failed to create crowd density reading" });
    }
  });

  app.post("/api/predictions/generate", async (req, res) => {
    try {
      const { stationId, routeId } = req.body;
      const predictions = await storage.generateCrowdPredictions(stationId, routeId);
      res.status(201).json(predictions);
    } catch (error) {
      console.error('Error generating predictions:', error);
      res.status(500).json({ error: "Failed to generate predictions" });
    }
  });

  app.get("/api/crowd/latest/:stationId", async (req: Request, res: Response) => {
    try {
      const stationId = Number(req.params.stationId);
      const reading = await storage.getLatestCrowdDensity(stationId);
      res.json(reading);
    } catch (error) {
      console.error("Error fetching latest crowd density:", error);
      res.status(500).json({ error: "Failed to fetch latest crowd density" });
    }
  });

  app.get("/api/crowd/analytics/:stationId", async (req: Request, res: Response) => {
    try {
      const stationId = Number(req.params.stationId);
      const analytics = await storage.getCrowdAnalytics(stationId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching crowd analytics:", error);
      res.status(500).json({ error: "Failed to fetch crowd analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
