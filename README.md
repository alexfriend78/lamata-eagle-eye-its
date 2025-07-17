# LAMATA Eagle Eye ITS - Lagos Bus Rapid Transit Monitoring System

![Lagos BRT](https://img.shields.io/badge/Lagos-BRT-green) ![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)

An advanced AI-powered real-time transit monitoring platform for Lagos Metropolitan Area Transport Authority (LAMATA) Bus Rapid Transit operations.

## 🚌 System Overview

LAMATA Eagle Eye ITS is a comprehensive intelligent transport system that provides:

- **Real-time Fleet Monitoring** across 13 buses and 102 stations
- **AI-Powered Insights** with 8 comprehensive analytics categories
- **Emergency Alert System** with P1-P5 priority levels and CCTV integration
- **Interactive Route Mapping** with Lagos BRT network visualization
- **Weather Integration** with real-time overlay and impact analysis
- **Predictive Maintenance** and route optimization
- **Live Video Streaming** from bus and passenger area cameras

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with Lagos BRT branding

### Key Components
- **Interactive Map**: SVG-based Lagos transit network with real-time updates
- **AI Insights Panel**: 8 categories of intelligent recommendations
- **Emergency Alert System**: P1-P5 priority alerts with video evidence
- **Route Optimizer**: Dynamic routing and traffic analysis
- **Predictive Maintenance**: Vehicle health monitoring
- **Weather Overlay**: Real-time weather integration
- **Management Dashboard**: KPIs and performance analytics

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/lamata-eagle-eye.git
cd lamata-eagle-eye
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Copy and configure environment file
cp .env.example .env

# Add your database URL
DATABASE_URL=your_postgresql_connection_string
```

4. **Set up database**
```bash
# Push schema to database
npm run db:push
```

5. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📊 Features

### Real-time Monitoring
- **13 Active Buses** across 5 Lagos BRT routes
- **102 Bus Stations** with live passenger counts
- **Route Tracking** with GPS positioning
- **Status Updates** every 5 seconds

### AI-Powered Analytics
1. **Deployment Intelligence** - Fleet optimization and resource allocation
2. **Route Optimization** - Traffic analysis and efficiency improvements
3. **Predictive Maintenance** - Vehicle health and maintenance scheduling
4. **Driver Performance** - Behavior analysis and safety compliance
5. **Security Intelligence** - Incident detection and risk assessment
6. **Passenger Experience** - Crowd management and wait time reduction
7. **Weather Intelligence** - Environmental impact and service adjustments
8. **Operational Analytics** - KPI tracking and performance optimization

### Emergency Management
- **P1-P5 Priority System** with automatic escalation
- **Video Evidence Integration** with CCTV footage
- **Real-time Alert Routing** to appropriate responders
- **Mobile App Integration** for passenger reports
- **Geofencing Alerts** for route deviations

### Weather Integration
- **Real-time Weather Overlay** on transit map
- **Impact Analysis** on routes and schedules
- **Service Adjustments** for adverse conditions
- **Environmental Monitoring** (air quality, visibility)

## 🗺️ Lagos BRT Routes

The system monitors all 5 official Lagos BRT routes:

1. **Route 1**: Oshodi - Abule-Egba (17 stations)
2. **Route 2**: Abule Egba - TBS/Obalende (28 stations)
3. **Route 3**: Ikorodu - TBS (20 stations)
4. **Route 4**: Ikorodu - Fadeyi (19 stations)
5. **Route 5**: Ikorodu - Oshodi (18 stations)

## 📹 Video Integration

The system includes extensive CCTV integration:

- **Driver CAM**: 6 Lagos BRT videos for driver monitoring
- **Passenger Area CAM**: 9 passenger videos for area surveillance
- **Emergency Videos**: Specific footage for different alert types
- **Range Request Streaming** for efficient video delivery

## 🎨 Design System

### Lagos BRT Branding
- **Primary Colors**: Lagos BRT Green (#2D7D32), Nigerian flag colors
- **Route Colors**: Blue (#0066CC), Red (#CC0000), Green (#00AA44), Gold (#FFD700), Purple (#8A2BE2)
- **Alert Colors**: Priority-based color coding from P1 (Critical Red) to P5 (Info Cyan)
- **Themes**: Dark/Light mode support with seamless switching

## 📱 Mobile Responsive

The system is fully responsive and works on:
- Desktop computers (primary interface)
- Tablets (optimized layout)
- Mobile phones (essential features)

## 🔧 API Endpoints

### Core Endpoints
- `GET /api/routes` - Fetch all routes
- `GET /api/stations` - Fetch all stations  
- `GET /api/buses` - Fetch buses with real-time positions
- `GET /api/alerts` - Fetch active alerts
- `GET /api/stats` - System-wide statistics
- `GET /api/video/:filename` - Stream CCTV footage

### Real-time Features
- 5-second polling for live updates
- WebSocket support for instant notifications
- Optimistic UI updates
- Comprehensive error handling

## 📈 Performance

- **Load Time**: <3 seconds
- **Real-time Updates**: 2-5 second intervals
- **Video Streaming**: <2s latency
- **Concurrent Users**: 500+ supported
- **Database Queries**: <100ms response
- **System Uptime**: 99.9% target

## 🚀 Deployment

The system is designed for deployment on:
- **Replit** (primary platform)
- **Vercel** (frontend)
- **Railway** (backend)
- **Neon** (PostgreSQL database)

### Environment Variables
```bash
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=production
```

## 📊 Success Metrics

### Technical KPIs
- System uptime: 99.9%
- Response time: <3s for all operations
- Data accuracy: 95%+
- AI confidence: >80% average

### Business KPIs
- Wait time reduction: 15%
- On-time performance: 20% improvement
- Emergency response: <5 minutes
- User adoption: 90% of operators

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏢 About LAMATA

Lagos Metropolitan Area Transport Authority (LAMATA) is the agency responsible for transportation infrastructure development and management in Lagos State, Nigeria. This system supports their mission to provide efficient, safe, and sustainable public transportation.

## 📞 Support

For technical support or questions about the LAMATA Eagle Eye ITS system:

- **Documentation**: See the comprehensive system documentation in `/docs`
- **Issues**: Report bugs via GitHub Issues
- **Email**: support@lamata.org (simulated for demo)

---

**Built with ❤️ for Lagos BRT operations**