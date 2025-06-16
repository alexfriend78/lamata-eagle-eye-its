import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-clean";
import { insertAlertSchema, insertBusSchema } from "@shared/schema";
import { z } from "zod";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Video serving route
  app.get("/attached_assets/:filename", (req: Request, res: Response) => {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'attached_assets', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Video file not found' });
    }
    
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
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
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  });

  // Routes API
  app.get("/api/routes", async (req: Request, res: Response) => {
    try {
      const routes = await storage.getRoutes();
      res.json(routes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch routes" });
    }
  });

  app.get("/api/routes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const route = await storage.getRoute(id);
      if (!route) {
        res.status(404).json({ error: "Route not found" });
        return;
      }
      res.json(route);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch route" });
    }
  });

  // Stations API
  app.get("/api/stations", async (req: Request, res: Response) => {
    try {
      const stations = await storage.getStations();
      res.json(stations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stations" });
    }
  });

  app.get("/api/stations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const station = await storage.getStationDetails(id);
      if (!station) {
        res.status(404).json({ error: "Station not found" });
        return;
      }
      res.json(station);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch station details" });
    }
  });

  // Buses API
  app.get("/api/buses", async (req: Request, res: Response) => {
    try {
      const buses = await storage.getBusesWithRoutes();
      res.json(buses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch buses" });
    }
  });

  app.get("/api/buses/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const bus = await storage.getBus(id);
      if (!bus) {
        res.status(404).json({ error: "Bus not found" });
        return;
      }
      res.json(bus);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bus" });
    }
  });

  // Update bus position
  app.patch("/api/buses/:id/position", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { x, y } = req.body;
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
  app.patch("/api/buses/:id/status", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
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

  // Alerts API
  app.get("/api/alerts", async (req: Request, res: Response) => {
    try {
      const alerts = await storage.getActiveAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  app.post("/api/alerts", async (req: Request, res: Response) => {
    try {
      const result = insertAlertSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ error: "Invalid alert data" });
        return;
      }
      const alert = await storage.createAlert(result.data);
      res.status(201).json(alert);
    } catch (error) {
      res.status(500).json({ error: "Failed to create alert" });
    }
  });

  app.patch("/api/alerts/:id/acknowledge", async (req: Request, res: Response) => {
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

  app.patch("/api/alerts/:id/clear", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const alert = await storage.clearAlert(id);
      if (!alert) {
        res.status(404).json({ error: "Alert not found" });
        return;
      }
      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: "Failed to clear alert" });
    }
  });

  // System stats API
  app.get("/api/system/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch system stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}