# LAMATA Eagle Eye ITS - Technical Implementation Specification

## Complete System Architecture

### 1. Project Structure
```
lamata-eagle-eye/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/ (shadcn/ui components)
│   │   │   ├── map-container.tsx
│   │   │   ├── bus-details-panel.tsx
│   │   │   ├── emergency-alert-system.tsx
│   │   │   ├── ai-insights-panel.tsx
│   │   │   ├── route-optimizer.tsx
│   │   │   ├── predictive-maintenance.tsx
│   │   │   └── route-aesthetics-panel.tsx
│   │   ├── pages/
│   │   │   └── bus-monitor.tsx
│   │   ├── hooks/
│   │   │   ├── use-bus-data.ts
│   │   │   ├── use-route-stations.ts
│   │   │   └── use-theme.ts
│   │   └── lib/
│   │       └── queryClient.ts
│   └── public/
├── server/
│   ├── index.ts
│   ├── routes.ts
│   ├── storage.ts
│   └── vite.ts
├── shared/
│   └── schema.ts
└── attached_assets/ (CCTV video files)
```

### 2. Complete Database Schema

```typescript
// Routes Table
export const routes = pgTable('routes', {
  id: serial('id').primaryKey(),
  routeNumber: varchar('route_number', { length: 10 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  color: varchar('color', { length: 7 }).default('#2D7D32'),
  lineStyle: varchar('line_style', { length: 20 }).default('solid'),
  animations: boolean('animations').default(true),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Stations Table
export const stations = pgTable('stations', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  x: decimal('x', { precision: 5, scale: 3 }).notNull(),
  y: decimal('y', { precision: 5, scale: 3 }).notNull(),
  routeId: integer('route_id').references(() => routes.id),
  passengerCount: integer('passenger_count').default(0),
  maxCapacity: integer('max_capacity').default(100),
  amenities: text('amenities').array(),
  accessibility: boolean('accessibility').default(true),
  isActive: boolean('is_active').default(true),
  lastUpdated: timestamp('last_updated').defaultNow(),
});

// Buses Table
export const buses = pgTable('buses', {
  id: serial('id').primaryKey(),
  routeId: integer('route_id').references(() => routes.id),
  busNumber: varchar('bus_number', { length: 20 }).notNull(),
  currentX: decimal('current_x', { precision: 5, scale: 3 }),
  currentY: decimal('current_y', { precision: 5, scale: 3 }),
  status: varchar('status', { length: 20 }).default('active'),
  driver: varchar('driver', { length: 100 }),
  speed: decimal('speed', { precision: 5, scale: 2 }).default(0),
  direction: decimal('direction', { precision: 5, scale: 2 }).default(0),
  fuel: decimal('fuel', { precision: 5, scale: 2 }).default(100),
  passengers: integer('passengers').default(0),
  maxCapacity: integer('max_capacity').default(50),
  lastMaintenance: timestamp('last_maintenance'),
  nextMaintenance: timestamp('next_maintenance'),
  isActive: boolean('is_active').default(true),
  lastUpdated: timestamp('last_updated').defaultNow(),
});

// Alerts Table
export const alerts = pgTable('alerts', {
  id: serial('id').primaryKey(),
  routeId: integer('route_id').references(() => routes.id),
  busId: integer('bus_id').references(() => buses.id),
  stationId: integer('station_id').references(() => stations.id),
  type: varchar('type', { length: 50 }).notNull(),
  message: text('message').notNull(),
  severity: varchar('severity', { length: 20 }).notNull(),
  priority: varchar('priority', { length: 5 }).notNull(),
  videoUrl: varchar('video_url', { length: 255 }),
  location: varchar('location', { length: 255 }),
  reportedBy: varchar('reported_by', { length: 100 }),
  acknowledgedBy: varchar('acknowledged_by', { length: 100 }),
  acknowledgedAt: timestamp('acknowledged_at'),
  resolvedBy: varchar('resolved_by', { length: 100 }),
  resolvedAt: timestamp('resolved_at'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// System Statistics Table
export const systemStats = pgTable('system_stats', {
  id: serial('id').primaryKey(),
  totalBuses: integer('total_buses').default(0),
  activeBuses: integer('active_buses').default(0),
  totalRoutes: integer('total_routes').default(0),
  activeRoutes: integer('active_routes').default(0),
  totalStations: integer('total_stations').default(0),
  onTimePercentage: decimal('on_time_percentage', { precision: 5, scale: 2 }).default(0),
  avgWaitTime: decimal('avg_wait_time', { precision: 5, scale: 2 }).default(0),
  totalPassengers: integer('total_passengers').default(0),
  emergencyAlerts: integer('emergency_alerts').default(0),
  lastUpdated: timestamp('last_updated').defaultNow(),
});
```

### 3. Complete API Endpoints

```typescript
// Routes API
app.get('/api/routes', async (req, res) => {
  const routes = await storage.getRoutes();
  res.json(routes);
});

app.get('/api/routes/:id/stations', async (req, res) => {
  const stations = await storage.getStationsByRoute(parseInt(req.params.id));
  res.json(stations);
});

// Stations API
app.get('/api/stations', async (req, res) => {
  const stations = await storage.getStations();
  res.json(stations);
});

app.get('/api/stations/:id', async (req, res) => {
  const station = await storage.getStation(parseInt(req.params.id));
  res.json(station);
});

// Buses API
app.get('/api/buses', async (req, res) => {
  const buses = await storage.getBuses();
  res.json(buses);
});

app.get('/api/buses/:id', async (req, res) => {
  const bus = await storage.getBus(parseInt(req.params.id));
  res.json(bus);
});

// Alerts API
app.get('/api/alerts', async (req, res) => {
  const alerts = await storage.getAlerts();
  res.json(alerts);
});

app.post('/api/alerts', async (req, res) => {
  const alert = await storage.createAlert(req.body);
  res.json(alert);
});

app.patch('/api/alerts/:id', async (req, res) => {
  const alert = await storage.updateAlert(parseInt(req.params.id), req.body);
  res.json(alert);
});

// Statistics API
app.get('/api/stats', async (req, res) => {
  const stats = await storage.getSystemStats();
  res.json(stats);
});

// Video Streaming API
app.get('/api/video/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '..', 'attached_assets', filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Video not found' });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
      return;
    }

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
```

### 4. AI Insights Implementation

```typescript
// AI Insights Service
class AIInsightsService {
  // Deployment Intelligence
  async getDeploymentIntelligence(): Promise<AIInsight[]> {
    return [
      {
        id: 'deploy_1',
        category: 'Deployment Intelligence',
        title: 'Fleet Optimization Opportunity',
        description: 'Route 1 requires 2 additional buses during peak hours',
        recommendation: 'Deploy BRT014 and BRT015 to Route 1 between 7-9 AM',
        confidence: 0.89,
        impact: 'High',
        priority: 1,
        estimatedSavings: '₦2.4M monthly',
        implementationTime: '2 weeks'
      },
      // ... more insights
    ];
  }

  // Route Optimization
  async getRouteOptimization(): Promise<AIInsight[]> {
    return [
      {
        id: 'route_1',
        category: 'Route Optimization',
        title: 'Alternative Route Recommendation',
        description: 'Traffic congestion on Ikorodu Road affecting Route 3',
        recommendation: 'Implement dynamic routing via Allen Avenue during peak hours',
        confidence: 0.76,
        impact: 'Medium',
        priority: 2,
        estimatedSavings: '15% travel time reduction',
        implementationTime: '1 week'
      },
      // ... more insights
    ];
  }

  // Predictive Maintenance
  async getPredictiveMaintenance(): Promise<AIInsight[]> {
    return [
      {
        id: 'maint_1',
        category: 'Predictive Maintenance',
        title: 'Critical Maintenance Alert',
        description: 'BRT007 brake system showing early warning signs',
        recommendation: 'Schedule immediate brake inspection and replacement',
        confidence: 0.94,
        impact: 'Critical',
        priority: 1,
        estimatedSavings: 'Prevent ₦8M accident costs',
        implementationTime: '24 hours'
      },
      // ... more insights
    ];
  }

  // Driver Performance
  async getDriverPerformance(): Promise<AIInsight[]> {
    return [
      {
        id: 'driver_1',
        category: 'Driver Performance',
        title: 'Driver Training Opportunity',
        description: 'Driver efficiency improvements identified',
        recommendation: 'Provide fuel-efficient driving training to 3 drivers',
        confidence: 0.82,
        impact: 'Medium',
        priority: 3,
        estimatedSavings: '12% fuel cost reduction',
        implementationTime: '1 week'
      },
      // ... more insights
    ];
  }

  // Security Intelligence
  async getSecurityIntelligence(): Promise<AIInsight[]> {
    return [
      {
        id: 'security_1',
        category: 'Security Intelligence',
        title: 'Incident Pattern Detection',
        description: 'Increased petty theft incidents at evening rush hour',
        recommendation: 'Deploy additional security personnel at high-risk stations',
        confidence: 0.71,
        impact: 'High',
        priority: 2,
        estimatedSavings: '40% incident reduction',
        implementationTime: '3 days'
      },
      // ... more insights
    ];
  }

  // Passenger Experience
  async getPassengerExperience(): Promise<AIInsight[]> {
    return [
      {
        id: 'passenger_1',
        category: 'Passenger Experience',
        title: 'Comfort Enhancement Opportunity',
        description: 'Overcrowding during peak hours affecting passenger satisfaction',
        recommendation: 'Implement express services during rush hours',
        confidence: 0.85,
        impact: 'High',
        priority: 2,
        estimatedSavings: '25% passenger satisfaction increase',
        implementationTime: '2 weeks'
      },
      // ... more insights
    ];
  }

  // Weather Intelligence
  async getWeatherIntelligence(): Promise<AIInsight[]> {
    return [
      {
        id: 'weather_1',
        category: 'Weather Intelligence',
        title: 'Rainy Season Preparation',
        description: 'Heavy rainfall expected next week may affect operations',
        recommendation: 'Pre-position additional buses and implement weather protocols',
        confidence: 0.78,
        impact: 'Medium',
        priority: 2,
        estimatedSavings: '30% weather-related delays reduction',
        implementationTime: '5 days'
      },
      // ... more insights
    ];
  }

  // Operational Analytics
  async getOperationalAnalytics(): Promise<AIInsight[]> {
    return [
      {
        id: 'ops_1',
        category: 'Operational Analytics',
        title: 'Cost Optimization Opportunity',
        description: 'Fuel consumption patterns show inefficiencies',
        recommendation: 'Optimize route scheduling and implement eco-driving protocols',
        confidence: 0.87,
        impact: 'High',
        priority: 1,
        estimatedSavings: '₦1.8M monthly fuel savings',
        implementationTime: '2 weeks'
      },
      // ... more insights
    ];
  }
}
```

### 5. Video Integration System

```typescript
// Video Asset Management
const videoAssets = {
  passengerCam: [
    'Calm_passengers_on_202506180643_6a4zf_1750225588423.mp4',
    'Calm_passengers_on_202506180643_9a8wd_1750225588422.mp4',
    'Calm_passengers_on_202506180643_hilzc_1750225588422.mp4',
    'Calm_passengers_on_202506180643_ja5r3_1750225588422.mp4',
    'Calm_passengers_on_202506180643_upaxz_1750225588422.mp4',
    'Professionally_dressed_passengers_20250618064 (1)_1750225588421.mp4',
    'Professionally_dressed_passengers_20250618064 (2)_1750225588421.mp4',
    'Professionally_dressed_passengers_20250618064 (3)_1750225588419.mp4',
    'Professionally_dressed_passengers_20250618064_1750225588422.mp4'
  ],
  driverCam: [
    'Lagos_nigeria_brt_202506172026_1uk53_1750223955238.mp4',
    'Lagos_nigeria_brt_202506172026_4luor_1750223955238.mp4',
    'Lagos_nigeria_brt_202506172026_irrqx_1750223955238.mp4',
    'Lagos_nigeria_brt_202506172026_mgn4v_1750223955238.mp4',
    'Lagos_nigeria_brt_202506172237_9g5ph_1750223955237.mp4',
    'Lagos_nigeria_brt_202506172239_nvi7d_1750223955235.mp4'
  ],
  emergencyVideos: {
    p1: 'Kidnapping_on_Lagos_BRT_Bus_1750204355118.mp4',
    p2: 'Brt_mass_transit_202506180631_u7rwu_1750224978374.mp4',
    reckless: 'BRT_Driver_s_Reckless_Behavior_Video_1750224476189.mp4'
  }
};

// Video Service
class VideoService {
  getPassengerCamVideo(index: number): string {
    return videoAssets.passengerCam[index % videoAssets.passengerCam.length];
  }

  getDriverCamVideo(index: number): string {
    return videoAssets.driverCam[index % videoAssets.driverCam.length];
  }

  getEmergencyVideo(alertType: string): string {
    switch (alertType) {
      case 'passenger_panic':
        return videoAssets.emergencyVideos.p1;
      case 'driver_misconduct':
        return videoAssets.emergencyVideos.p2;
      case 'reckless_driving':
        return videoAssets.emergencyVideos.reckless;
      default:
        return videoAssets.passengerCam[0];
    }
  }
}
```

### 6. Complete Component Architecture

```typescript
// Main Dashboard Component
export function BusMonitor() {
  // State management
  const [selectedRoutes, setSelectedRoutes] = useState<number[]>([1, 2, 3, 4, 5]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [hoveredStation, setHoveredStation] = useState<Station | null>(null);
  const [hoveredBus, setHoveredBus] = useState<Bus | null>(null);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [showAlertsManager, setShowAlertsManager] = useState(false);
  const [showRouteOptimizer, setShowRouteOptimizer] = useState(false);
  const [showPredictiveMaintenance, setShowPredictiveMaintenance] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Data fetching
  const { buses, routes, stations, alerts, stats, refetch, isLoading, error } = useBusData();
  const { data: filteredStations = [] } = useRouteStations(selectedRoutes);

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Component rendering logic
  // ... (complete implementation)
}
```

## Implementation Guidelines

### 1. Development Workflow
1. Set up project structure with TypeScript and React
2. Configure Drizzle ORM with PostgreSQL
3. Implement data models and API endpoints
4. Create UI components with shadcn/ui
5. Add real-time functionality with TanStack Query
6. Integrate AI insights and video streaming
7. Implement responsive design and accessibility
8. Add comprehensive error handling
9. Write tests and documentation
10. Deploy with proper monitoring

### 2. Performance Optimization
- Implement React.memo for expensive components
- Use useCallback and useMemo for optimization
- Lazy load heavy components
- Optimize database queries with proper indexing
- Use connection pooling for database
- Implement caching strategies
- Compress video files for streaming

### 3. Security Implementation
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF tokens
- Rate limiting
- Secure video streaming
- Audit logging

### 4. Testing Strategy
- Unit tests for utilities and hooks
- Integration tests for API endpoints
- Component tests with React Testing Library
- End-to-end tests with Playwright
- Performance testing with Lighthouse
- Security testing with OWASP tools

This specification provides the complete technical foundation for building the LAMATA Eagle Eye ITS system with all required features and capabilities.