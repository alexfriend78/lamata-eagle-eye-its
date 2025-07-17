# LAMATA Eagle Eye ITS - Comprehensive System Generation Prompt

## System Overview
Generate a complete Lagos Metropolitan Area Transport Authority (LAMATA) Eagle Eye Intelligent Transport System - an advanced AI-powered transit management platform for monitoring and optimizing Lagos Bus Rapid Transit (BRT) operations.

## Core System Architecture

### Frontend Requirements
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui components with Tailwind CSS
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side navigation
- **Theme**: Dark/light mode toggle with custom Lagos BRT branding
- **Real-time Updates**: Aggressive polling (2-5 second intervals)

### Backend Requirements
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **API**: RESTful endpoints with real-time capabilities
- **Authentication**: Session-based with PostgreSQL storage

## Data Models & Infrastructure

### Core Entities
1. **Routes** (5 total)
   - Route 1: Oshodi - Abule Egba (17 stations)
   - Route 2: Abule Egba - CMS (28 stations) 
   - Route 3: Ikorodu West - CMS (20 stations)
   - Route 4: Ikorodu - Abule Egba (19 stations)
   - Route 5: Abule Egba - Costain (18 stations)
   - Properties: routeNumber, name, color, lineStyle, animations

2. **Stations** (102 total)
   - Coordinates (x, y for SVG positioning)
   - Passenger counts and crowd density
   - Amenities and accessibility features
   - Real-time status monitoring

3. **Buses** (13 active vehicles)
   - Real-time GPS positioning
   - Route assignments and scheduling
   - Vehicle health monitoring
   - Driver performance tracking

4. **Alerts** (P1-P5 priority system)
   - Emergency incidents (P1: Critical)
   - Driver misconduct (P2: High)
   - Operational issues (P3-P5: Medium-Low)
   - CCTV video evidence integration

## Key Features Implementation

### 1. Real-time Fleet Monitoring Dashboard
- **Interactive Map**: SVG-based Lagos transit map with:
  - Route visualization with custom colors/styles
  - Station markers with passenger counts
  - Live bus positioning and movement
  - Weather overlay integration
  - Traffic congestion indicators

- **Control Panel**: 
  - Route highlighting toggles
  - Visibility controls (routes, stations, buses)
  - Station name overlays
  - Background map toggle
  - Theme switching

### 2. Emergency Alert System
- **Alert Management**: 
  - Priority-based alert queue (P1-P5)
  - Real-time alert notifications
  - CCTV video integration
  - Alert acknowledgment workflow
  - Escalation procedures

- **Video Integration**:
  - Passenger Area CAM (9 sequential videos)
  - Driver CAM (6 Lagos BRT videos + reckless behavior)
  - Incident documentation
  - Range request video streaming

### 3. AI Insights & Analytics Panel
Generate 8 comprehensive AI categories:

#### A. Deployment Intelligence
- Infrastructure optimization recommendations
- Fleet deployment strategies
- Resource allocation insights
- Expansion planning analysis

#### B. Route Optimization
- Traffic pattern analysis
- Route efficiency scoring
- Alternative route suggestions
- Passenger flow optimization

#### C. Predictive Maintenance
- Vehicle health monitoring
- Maintenance scheduling
- Failure prediction algorithms
- Cost optimization strategies

#### D. Driver Performance Monitoring
- Driving behavior analysis
- Safety compliance tracking
- Training recommendations
- Performance scoring

#### E. Security & Safety Intelligence
- Incident pattern recognition
- Risk assessment algorithms
- Security threat detection
- Emergency response optimization

#### F. Passenger Experience Optimization
- Crowd density management
- Wait time reduction strategies
- Comfort improvement recommendations
- Accessibility enhancements

#### G. Weather & Environmental Intelligence
- Weather impact analysis
- Service adjustment recommendations
- Environmental compliance monitoring
- Climate adaptation strategies

#### H. Operational Analytics
- KPI dashboard with metrics
- Performance trend analysis
- Cost-benefit optimization
- Efficiency recommendations

### 4. Management Analytics Dashboard
- **KPIs**: On-time performance, passenger satisfaction, fleet utilization
- **Visualizations**: Charts, graphs, and trend analysis
- **Reporting**: Automated reports and insights
- **Forecasting**: Predictive analytics for planning

### 5. System Monitoring Tools
- **Route Optimizer**: AI-powered route efficiency analysis
- **Predictive Maintenance**: Vehicle health predictions
- **Crowd Analytics**: Passenger density forecasting
- **Emergency Simulator**: Crisis response testing

## Technical Implementation Details

### API Endpoints
```
GET /api/routes - Fetch all routes
GET /api/stations - Fetch all stations  
GET /api/buses - Fetch bus fleet status
GET /api/alerts - Fetch active alerts
GET /api/stats - Fetch system statistics
GET /api/routes/:id/stations - Fetch route stations
POST /api/alerts - Create new alert
GET /api/video/:filename - Stream CCTV footage
```

### Database Schema
- Routes: id, routeNumber, name, color, lineStyle, animations
- Stations: id, name, x, y, routeId, passengerCount, amenities
- Buses: id, routeId, busNumber, currentX, currentY, status, driver
- Alerts: id, routeId, type, message, severity, priority, timestamp, isActive

### Real-time Features
- WebSocket connections for live updates
- Polling-based data synchronization
- Optimistic UI updates
- Error handling and retry mechanisms

## UI/UX Design Requirements

### Header Section
- LAMATA branding with Eagle Eye logo
- System status indicators
- Real-time clock
- Alert notifications badge
- Quick action buttons

### Main Dashboard
- Large interactive transit map (center)
- Route control panel (top)
- AI insights panel (collapsible)
- Emergency alerts overlay
- System monitoring tools

### Color Scheme
- Primary: Lagos BRT Green (#2D7D32)
- Secondary: Nigerian flag colors
- Dark mode: Gray-900 background
- Alert colors: Red (P1), Orange (P2), Yellow (P3-P5)

## Performance Requirements
- Load time: < 3 seconds
- Real-time updates: 2-5 second intervals
- Video streaming: Range request support
- Mobile responsiveness: Tablet and desktop optimized
- Accessibility: WCAG 2.1 AA compliance

## Security & Compliance
- Session-based authentication
- Data encryption in transit
- GDPR compliance for passenger data
- Audit logging for all actions
- Role-based access control

## Integration Requirements
- Weather API for environmental data
- Traffic API for congestion monitoring
- SMS/Email alerts for emergencies
- External CCTV system integration
- Government reporting interfaces

## Testing & Quality Assurance
- Unit tests for core functions
- Integration tests for APIs
- End-to-end testing for workflows
- Performance testing under load
- Security vulnerability scanning

## Deployment Strategy
- Containerized deployment
- Environment configuration
- Database migrations
- Static asset optimization
- CDN integration for media files

## Documentation Requirements
- API documentation
- User manual
- Administrator guide
- Technical architecture document
- Troubleshooting guide

## Success Metrics
- 15% reduction in passenger wait times
- 20% improvement in on-time performance
- 90% alert response within 5 minutes
- 95% system uptime
- 85% user satisfaction rating

Generate this complete system with all features, ensuring proper error handling, responsive design, and scalable architecture. Include sample data for testing and comprehensive documentation for deployment and maintenance.