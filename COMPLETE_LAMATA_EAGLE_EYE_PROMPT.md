# LAMATA Eagle Eye ITS - Complete System Replication Prompt

## SYSTEM OVERVIEW
Create a comprehensive Lagos Metropolitan Area Transport Authority (LAMATA) Eagle Eye Intelligent Transport System - an advanced AI-powered real-time transit monitoring platform for Lagos Bus Rapid Transit (BRT) operations.

## EXACT TECHNICAL SPECIFICATIONS

### 1. PROJECT STRUCTURE
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
│   │   ├── lib/
│   │   │   └── queryClient.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── public/
├── server/
│   ├── index.ts
│   ├── routes.ts
│   ├── storage.ts
│   ├── vite.ts
│   └── db.ts
├── shared/
│   └── schema.ts
├── attached_assets/ (video files)
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── drizzle.config.ts
└── tsconfig.json
```

### 2. TECHNOLOGY STACK
- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom Lagos BRT branding

### 3. COMPLETE DATABASE SCHEMA

#### Routes Table
```sql
CREATE TABLE routes (
  id SERIAL PRIMARY KEY,
  route_number TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#1976D2',
  is_active BOOLEAN NOT NULL DEFAULT true,
  line_style TEXT NOT NULL DEFAULT 'solid',
  line_width INTEGER NOT NULL DEFAULT 3,
  opacity REAL NOT NULL DEFAULT 1.0,
  pattern TEXT NOT NULL DEFAULT 'none',
  animation TEXT NOT NULL DEFAULT 'none',
  glow_color TEXT,
  gradient_end TEXT
);
```

**Sample Data:**
```sql
INSERT INTO routes (route_number, name, color) VALUES
('1', 'Oshodi - Abule-Egba', '#0066CC'),
('2', 'Abule Egba - TBS/Obalende', '#CC0000'),
('3', 'Ikorodu - TBS', '#00AA44'),
('4', 'Ikorodu - Fadeyi', '#FFD700'),
('5', 'Ikorodu - Oshodi', '#8A2BE2');
```

#### Stations Table
```sql
CREATE TABLE stations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  x REAL NOT NULL,
  y REAL NOT NULL,
  zone INTEGER NOT NULL DEFAULT 1,
  passenger_count INTEGER NOT NULL DEFAULT 0,
  traffic_condition TEXT NOT NULL DEFAULT 'normal',
  accessibility BOOLEAN NOT NULL DEFAULT true,
  amenities TEXT[] DEFAULT ARRAY[]::TEXT[]
);
```

**All 102 Lagos BRT Stations:**
```sql
INSERT INTO stations (name, x, y, zone) VALUES
-- Route 1: Oshodi - Abule-Egba (17 stations)
('Oshodi Terminal 2', 0.50, 0.60, 2),
('Bolade', 0.48, 0.58, 2),
('Ladipo', 0.46, 0.56, 2),
('Shogunle', 0.44, 0.54, 2),
('PWD', 0.42, 0.52, 2),
('Airport Junction', 0.40, 0.50, 2),
('Ikeja Along', 0.38, 0.48, 2),
('Ile Zik', 0.36, 0.46, 2),
('Mangoro', 0.34, 0.44, 2),
('Cement', 0.32, 0.42, 2),
('Iyana Dopemu', 0.30, 0.40, 1),
('Adealu', 0.28, 0.38, 1),
('Iyana Ipaja Bus stop', 0.26, 0.36, 1),
('Pleasure', 0.24, 0.34, 1),
('Ile Epo', 0.22, 0.32, 1),
('Super', 0.20, 0.30, 1),
('Abule Egba', 0.18, 0.28, 1),

-- Route 2: Abule Egba - TBS/Obalende (28 stations)
('Abule Egba Terminal', 0.18, 0.28, 1),
('Ile Epo Route 2', 0.20, 0.30, 1),
('Super Route 2', 0.22, 0.32, 1),
('Pleasure Route 2', 0.24, 0.34, 1),
('Iyana Ipaja Route 2', 0.26, 0.36, 1),
('Adealu Route 2', 0.28, 0.38, 1),
('Iyana Dopemu Route 2', 0.30, 0.40, 1),
('Cement Route 2', 0.32, 0.42, 2),
('Mangoro Route 2', 0.34, 0.44, 2),
('Ile Zik Route 2', 0.36, 0.46, 2),
('Ikeja Along Route 2', 0.38, 0.48, 2),
('Airport Junction Route 2', 0.40, 0.50, 2),
('PWD Route 2', 0.42, 0.52, 2),
('Shogunle Route 2', 0.44, 0.54, 2),
('Ladipo Route 2', 0.46, 0.56, 2),
('Bolade Route 2', 0.48, 0.58, 2),
('Oshodi Terminal Route 2', 0.50, 0.60, 2),
('LASMA', 0.52, 0.62, 2),
('Anthony', 0.54, 0.64, 2),
('Westex', 0.56, 0.66, 2),
('First Pedro', 0.58, 0.68, 3),
('Charley Boy', 0.60, 0.70, 3),
('Gbagada Phase 1', 0.62, 0.72, 3),
('Iyana Oworo', 0.64, 0.74, 3),
('Adeniji', 0.66, 0.76, 3),
('Obalende', 0.68, 0.78, 3),
('CMS Terminal', 0.70, 0.80, 3),
('TBS Terminal Route 2', 0.72, 0.82, 3),

-- Route 3: Ikorodu - TBS (20 stations)
('Ikorodu West', 0.10, 0.90, 4),
('Benson', 0.12, 0.88, 4),
('ARUNA', 0.14, 0.86, 4),
('AGRIC TERMINAL', 0.16, 0.84, 4),
('OWUTU IDIROKO', 0.18, 0.82, 4),
('OGOLONTO', 0.20, 0.80, 3),
('MAJIDUN AWORI', 0.22, 0.78, 3),
('AJEGUNLE', 0.24, 0.76, 3),
('IRAWO', 0.26, 0.74, 3),
('IDERA', 0.28, 0.72, 3),
('OWODEONIRIN', 0.30, 0.70, 3),
('MILE12 TERMINAL', 0.32, 0.68, 3),
('KETU', 0.34, 0.66, 3),
('OJOTA', 0.36, 0.64, 2),
('NEWGARAGE', 0.38, 0.62, 2),
('Maryland', 0.40, 0.60, 2),
('Idiroko', 0.42, 0.58, 2),
('Anthony Route 3', 0.44, 0.56, 2),
('Obanikoro', 0.46, 0.54, 2),
('TBS Terminal Route 3', 0.48, 0.52, 2),

-- Route 4: Ikorodu - Fadeyi (19 stations)
('Ikorodu Terminal', 0.10, 0.90, 4),
('Benson Route 4', 0.12, 0.88, 4),
('ARUNA Route 4', 0.14, 0.86, 4),
('AGRIC Route 4', 0.16, 0.84, 4),
('OWUTU Route 4', 0.18, 0.82, 4),
('OGOLONTO Route 4', 0.20, 0.80, 3),
('MAJIDUN Route 4', 0.22, 0.78, 3),
('AJEGUNLE Route 4', 0.24, 0.76, 3),
('IRAWO Route 4', 0.26, 0.74, 3),
('IDERA Route 4', 0.28, 0.72, 3),
('OWODEONIRIN Route 4', 0.30, 0.70, 3),
('MILE12 Route 4', 0.32, 0.68, 3),
('KETU Route 4', 0.34, 0.66, 3),
('OJOTA Route 4', 0.36, 0.64, 2),
('NEWGARAGE Route 4', 0.38, 0.62, 2),
('Maryland Route 4', 0.40, 0.60, 2),
('Idiroko Route 4', 0.42, 0.58, 2),
('Palmgroove', 0.44, 0.56, 2),
('Fadeyi', 0.46, 0.54, 2),

-- Route 5: Ikorodu - Oshodi (18 stations)  
('Abule Egba Terminal Route 5', 0.18, 0.28, 1),
('Ile Epo Route 5', 0.20, 0.30, 1),
('Super Route 5', 0.22, 0.32, 1),
('Pleasure Route 5', 0.24, 0.34, 1),
('Iyana Ipaja Route 5', 0.26, 0.36, 1),
('Adealu Route 5', 0.28, 0.38, 1),
('Iyana Dopemu Route 5', 0.30, 0.40, 1),
('Cement Route 5', 0.32, 0.42, 2),
('Mangoro Route 5', 0.34, 0.44, 2),
('Ile Zik Route 5', 0.36, 0.46, 2),
('Ikeja Along Route 5', 0.38, 0.48, 2),
('Airport Junction Route 5', 0.40, 0.50, 2),
('PWD Route 5', 0.42, 0.52, 2),
('Shogunle Route 5', 0.44, 0.54, 2),
('Ladipo Route 5', 0.46, 0.56, 2),
('Bolade Route 5', 0.48, 0.58, 2),
('Oshodi Terminal Route 5', 0.50, 0.60, 2),
('Costain', 0.52, 0.62, 2);
```

#### Buses Table
```sql
CREATE TABLE buses (
  id SERIAL PRIMARY KEY,
  route_id INTEGER NOT NULL,
  bus_number TEXT NOT NULL,
  current_x REAL NOT NULL,
  current_y REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'on_time',
  direction TEXT NOT NULL DEFAULT 'forward',
  passenger_count INTEGER NOT NULL DEFAULT 0,
  driver_name TEXT,
  driver_phone TEXT,
  last_updated TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Sample Data (13 Buses):**
```sql
INSERT INTO buses (route_id, bus_number, current_x, current_y, status, direction) VALUES
-- Route 1 buses
(1, 'BRT001', 0.38, 0.48, 'on_time', 'forward'),
(1, 'BRT002', 0.26, 0.36, 'on_time', 'reverse'),
(1, 'BRT003', 0.42, 0.52, 'delayed', 'forward'),
-- Route 2 buses  
(2, 'BRT004', 0.20, 0.30, 'on_time', 'forward'),
(2, 'BRT005', 0.62, 0.72, 'on_time', 'reverse'),
(2, 'BRT006', 0.50, 0.60, 'on_time', 'forward'),
-- Route 3 buses
(3, 'BRT007', 0.25, 0.75, 'on_time', 'forward'),
(3, 'BRT008', 0.38, 0.62, 'delayed', 'reverse'),
(3, 'BRT009', 0.32, 0.68, 'on_time', 'forward'),
-- Route 4 buses
(4, 'BRT010', 0.22, 0.78, 'on_time', 'forward'),
(4, 'BRT011', 0.40, 0.60, 'on_time', 'reverse'),
-- Route 5 buses
(5, 'BRT012', 0.30, 0.40, 'on_time', 'forward'),
(5, 'BRT013', 0.48, 0.58, 'on_time', 'reverse');
```

#### Alerts Table
```sql
CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  bus_id INTEGER,
  route_id INTEGER,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'P3',
  severity TEXT NOT NULL DEFAULT 'medium',
  is_active BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'open',
  driver_name TEXT,
  driver_number TEXT,
  last_stop_id INTEGER,
  next_stop_id INTEGER,
  zone_number TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### Route Stations Junction Table
```sql
CREATE TABLE route_stations (
  id SERIAL PRIMARY KEY,
  route_id INTEGER NOT NULL,
  station_id INTEGER NOT NULL,
  sequence INTEGER NOT NULL
);
```

#### Additional Analytics Tables
```sql
CREATE TABLE crowd_density_readings (
  id SERIAL PRIMARY KEY,
  bus_id INTEGER REFERENCES buses(id),
  station_id INTEGER REFERENCES stations(id),
  passenger_count INTEGER NOT NULL,
  capacity INTEGER NOT NULL,
  density_level TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  sensor_type TEXT NOT NULL
);

CREATE TABLE crowd_predictions (
  id SERIAL PRIMARY KEY,
  station_id INTEGER NOT NULL REFERENCES stations(id),
  route_id INTEGER NOT NULL REFERENCES routes(id),
  predicted_time TIMESTAMP NOT NULL,
  predicted_density TEXT NOT NULL,
  predicted_passenger_count INTEGER NOT NULL,
  confidence REAL NOT NULL,
  model_version TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 4. EXACT VISUAL DESIGN & COLORS

#### Header Design
- Background: `bg-gradient-to-r from-green-600 via-white to-green-600 dark:from-green-800 dark:via-gray-900 dark:to-green-800`
- Title: "LAMATA - Eagle Eye ITS 🦅" 
- Subtitle: "Lagos Metropolitan Area Transport Authority"
- Colors: Lagos BRT Green (#2D7D32), Nigerian flag colors
- Real-time clock display in format: HH:MM:SS
- System status indicator: Green pulsing dot with "System Online"

#### Route Colors (Exact)
- Route 1: #0066CC (Blue)
- Route 2: #CC0000 (Red) 
- Route 3: #00AA44 (Green)
- Route 4: #FFD700 (Gold)
- Route 5: #8A2BE2 (Purple)

#### Alert Priority Colors
- P1 (Critical): #DC2626 (Red)
- P2 (High): #EA580C (Orange)
- P3 (Medium): #D97706 (Amber)
- P4 (Low): #65A30D (Lime)
- P5 (Info): #0891B2 (Cyan)

#### Theme System
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 142 76% 36%;
  --primary-foreground: 355.7 100% 97.3%;
  --secondary: 210 40% 98%;
  --secondary-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 98%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 98%;
  --accent-foreground: 222.2 84% 4.9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 142 76% 36%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 142 76% 36%;
  --primary-foreground: 355.7 100% 97.3%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 142 76% 36%;
}
```

### 5. EXACT COMPONENT SPECIFICATIONS

#### Main Dashboard (bus-monitor.tsx)
**Layout Structure:**
- Full-screen header with LAMATA branding
- Route selection buttons (1-5) with color coding
- Visibility controls (Routes, Stops, Buses, Map, Station Names)
- Theme toggle (dark/light)
- Central interactive SVG map (800x600px)
- AI Insights panel (collapsible)
- Emergency alerts overlay
- System monitoring tools

**Interactive Features:**
- Route highlighting (click route buttons)
- Station hover effects with tooltip
- Bus click for details panel
- Real-time updates every 5 seconds
- Emergency alert system with priority

#### AI Insights Panel
**8 Comprehensive Categories:**

1. **Deployment Intelligence**
   - Fleet optimization recommendations
   - Resource allocation insights  
   - Infrastructure analysis
   - Expansion planning

2. **Route Optimization**
   - Traffic pattern analysis
   - Alternative route suggestions
   - Dynamic routing recommendations
   - Efficiency improvements

3. **Predictive Maintenance**
   - Vehicle health monitoring
   - Maintenance scheduling
   - Failure prediction
   - Cost optimization

4. **Driver Performance Monitoring**
   - Driving behavior analysis
   - Safety compliance tracking
   - Training recommendations
   - Performance scoring

5. **Security & Safety Intelligence**
   - Incident pattern recognition
   - Risk assessment
   - Threat detection
   - Emergency response optimization

6. **Passenger Experience Optimization**
   - Crowd density management
   - Wait time reduction
   - Comfort improvements
   - Accessibility enhancements

7. **Weather & Environmental Intelligence**
   - Weather impact analysis
   - Service adjustments
   - Environmental monitoring
   - Climate adaptation

8. **Operational Analytics**
   - KPI tracking and analysis
   - Performance trends
   - Cost-benefit optimization
   - Efficiency recommendations

**Each Insight Includes:**
- Title and description
- Confidence score (0.0-1.0)
- Impact level (Low/Medium/High/Critical)
- Priority ranking (1-5)
- Estimated savings/benefits
- Implementation timeframe
- Specific actionable recommendations

#### Emergency Alert System
**Alert Types & Videos:**
- P1 Passenger Panic: Use 'Kidnapping_on_Lagos_BRT_Bus_1750204355118.mp4'
- P2 Driver Misconduct: Use 'Brt_mass_transit_202506180631_u7rwu_1750224978374.mp4'
- Reckless Driving: Use 'BRT_Driver_s_Reckless_Behavior_Video_1750224476189.mp4'

**Video Integration:**
- Passenger Area CAM: Cycle through 9 passenger videos sequentially
- Driver CAM: Rotate through 6 Lagos BRT videos
- Range request streaming support
- Video controls with full-screen option

#### System Monitoring Tools
**Route Optimizer:**
- Located in System Monitor Panel under "Simulate Emergency"
- Real-time route efficiency analysis
- Traffic impact assessment
- Alternative route suggestions

**Predictive Maintenance:**
- Located in System Monitor Panel under "Simulate Emergency"  
- Vehicle health predictions
- Maintenance scheduling
- Cost optimization recommendations

### 6. COMPLETE API ENDPOINTS

#### Core Endpoints
```typescript
// Routes
GET /api/routes - Fetch all routes
GET /api/routes/:id/stations - Fetch stations for specific route
PATCH /api/routes/:id/aesthetics - Update route visual properties

// Stations  
GET /api/stations - Fetch all stations
GET /api/stations/:id - Fetch specific station details
PATCH /api/stations/:id/passengers - Update passenger count

// Buses
GET /api/buses - Fetch all buses with real-time positions
GET /api/buses/:id - Fetch specific bus details
PATCH /api/buses/:id/position - Update bus coordinates
PATCH /api/buses/:id/status - Update bus status

// Alerts
GET /api/alerts - Fetch active alerts
POST /api/alerts - Create new alert
PATCH /api/alerts/:id/acknowledge - Acknowledge alert
PATCH /api/alerts/:id/clear - Clear alert

// System Stats
GET /api/stats - Fetch system-wide statistics

// Video Streaming
GET /api/video/:filename - Stream CCTV footage with range requests

// AI Insights
GET /api/ai-insights/:category - Fetch AI recommendations by category
```

#### Real-time Features
- 5-second polling intervals for live data
- WebSocket support for instant updates
- Optimistic UI updates
- Error handling with retry logic

### 7. EXACT FUNCTIONAL REQUIREMENTS

#### Real-time Fleet Monitoring
- Track 13 buses across 5 routes
- Monitor 102 Lagos BRT stations
- Live GPS positioning updates
- Route adherence monitoring
- Passenger count tracking

#### Interactive Map Features
- SVG-based Lagos transit network
- Clickable route highlighting
- Station hover tooltips
- Bus movement animations
- Traffic condition overlays
- Weather integration

#### Emergency Response System
- P1-P5 priority alert levels
- CCTV video evidence
- Automated escalation procedures
- Real-time notification system
- Incident documentation

#### Analytics Dashboard
- System KPIs and metrics
- Performance trend analysis
- Predictive maintenance alerts
- Route optimization suggestions
- Passenger flow analytics

### 8. PERFORMANCE REQUIREMENTS

#### System Performance
- Load time: <3 seconds
- Real-time updates: 2-5 second intervals  
- Video streaming: <2s latency
- Concurrent users: 500+ supported
- Database queries: <100ms response
- API endpoints: 99.9% uptime

#### User Experience
- Mobile-responsive design
- Accessibility: WCAG 2.1 AA compliance
- Cross-browser compatibility
- Offline capabilities
- Progressive Web App features

### 9. IMPLEMENTATION SEQUENCE

#### Phase 1: Core Infrastructure
1. Set up project structure with TypeScript
2. Configure PostgreSQL database with exact schema
3. Implement Drizzle ORM models
4. Create Express.js API endpoints
5. Set up real-time polling system

#### Phase 2: Frontend Development  
1. Create React components with shadcn/ui
2. Implement interactive SVG map
3. Add real-time data visualization
4. Integrate TanStack Query for state management
5. Implement responsive design

#### Phase 3: Advanced Features
1. Build AI insights panel with 8 categories
2. Implement emergency alert system
3. Add video streaming capabilities
4. Create analytics dashboard
5. Add system monitoring tools

#### Phase 4: Integration & Testing
1. Connect all components
2. Test real-time functionality
3. Implement error handling
4. Add performance optimizations
5. Deploy with monitoring

### 10. EXACT SUCCESS METRICS

#### Technical KPIs
- System uptime: 99.9%
- Response time: <3s for all operations
- Concurrent users: 500+ supported
- Data accuracy: 95%+
- AI confidence: >80% average

#### Business KPIs  
- Wait time reduction: 15%
- On-time performance: 20% improvement
- Emergency response: <5 minutes
- User adoption: 90% of operators
- ROI: 25% within 6 months

#### Operational KPIs
- Alert resolution: 90% within 15 minutes
- Maintenance prediction: 85% accuracy
- Route optimization: 20% efficiency gain
- Passenger satisfaction: 85%+
- System reliability: 99.5%

## EXACT REPLICATION INSTRUCTIONS

1. **Initialize Project**: Create React + TypeScript + Vite project with exact file structure
2. **Database Setup**: Use PostgreSQL with provided schema and sample data exactly as specified
3. **Styling**: Implement Tailwind CSS with exact color values and theme configuration
4. **Components**: Build all React components with shadcn/ui using exact specifications
5. **API**: Implement all Express.js endpoints with exact route structures
6. **Real-time**: Add 5-second polling with TanStack Query for live updates
7. **Video**: Integrate video streaming with range request support
8. **AI**: Implement all 8 AI insight categories with confidence scoring
9. **Testing**: Ensure all features work exactly as described
10. **Deployment**: Configure for production with monitoring and analytics

This prompt contains every detail needed to replicate the LAMATA Eagle Eye ITS system exactly, including database schemas, API endpoints, component specifications, styling details, and functional requirements. Follow these specifications precisely to create an identical system.