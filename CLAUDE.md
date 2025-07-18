# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server (runs both frontend and backend)
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema to PostgreSQL using Drizzle

### Testing
- No specific test commands configured - verify test framework setup before adding tests

## Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript  
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: Wouter (lightweight React router)

### Project Structure
```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components including shadcn/ui
│   │   ├── pages/       # Route pages
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and query client
├── server/              # Express backend
│   ├── index.ts         # Main server entry point
│   ├── routes.ts        # API routes
│   └── storage*.ts      # Database operations
├── shared/              # Shared TypeScript types and schemas
│   └── schema.ts        # Drizzle database schema
└── attached_assets/     # CCTV video files for the application
```

### Key Components
- **Interactive SVG Map**: Real-time Lagos BRT transit network visualization
- **AI Insights Panel**: 8 categories of ML-powered operational insights
- **Emergency Alert System**: P1-P5 priority alerts with video integration
- **Route Optimization**: Dynamic routing and traffic analysis
- **Predictive Maintenance**: AI-powered vehicle health monitoring
- **CCTV Integration**: Real-time video streaming from bus cameras

### Database Schema
The system uses comprehensive tables for:
- `routes` - BRT route definitions with aesthetic customization
- `stations` - Station locations and passenger data
- `buses` - Real-time bus positions and AI health scores
- `alerts` - Emergency and operational alerts
- `route_stations` - Route-station relationships
- `bus_arrivals` - Arrival predictions and tracking
- `crowd_density_readings` - Passenger density analytics
- `crowd_predictions` - AI-powered crowd forecasting
- `historical_patterns` - Historical usage patterns
- `ai_predictions` - Predictive maintenance insights

### API Patterns
- RESTful endpoints under `/api/`
- Real-time updates via 5-second polling
- Video streaming with range request support at `/api/video/:filename`
- Express middleware for request logging and error handling
- Server runs on port 5000 (serves both API and client)

### Development Workflow
1. Database operations go through Drizzle ORM in `server/storage*.ts`
2. API routes defined in `server/routes.ts`
3. Frontend components use TanStack Query for data fetching
4. Shared types in `shared/schema.ts` ensure type safety across client/server
5. Videos stored in `attached_assets/` directory for CCTV integration

### Lagos BRT Context
This is a real-time transit monitoring system for Lagos Metropolitan Area Transport Authority (LAMATA). It monitors 13 buses across 5 BRT routes with 102 stations, providing AI-powered insights for fleet optimization, emergency management, and passenger experience enhancement.

### Environment Setup
- Requires PostgreSQL database with `DATABASE_URL` environment variable
- Uses Replit-specific Vite plugins for development
- Designed for deployment on Replit, Vercel, or similar platforms