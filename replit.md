# Lagos BRT Transit Management System

## Overview

This is a full-stack real-time transit management system built for Lagos Bus Rapid Transit (BRT) monitoring. The application provides comprehensive bus fleet management, route optimization, emergency alert systems, and predictive analytics with live CCTV integration. It features a React-based frontend with an Express backend, utilizing PostgreSQL for data persistence and real-time updates for operational monitoring.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds
- **Theme System**: Custom dark/light theme provider with localStorage persistence

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with real-time capabilities
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Build Process**: esbuild for production bundling

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon Database serverless
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection Pooling**: @neondatabase/serverless with WebSocket support
- **Real-time Updates**: Polling-based updates for live data synchronization

### Authentication and Authorization
- **Session Management**: connect-pg-simple for PostgreSQL session storage
- **Security**: Express built-in security features with JSON parsing middleware
- **Access Control**: Route-based protection with error handling middleware

## Key Components

### Core Data Models
- **Routes**: Bus route definitions with aesthetic customization (colors, line styles, animations)
- **Stations**: Bus stop locations with passenger counts and amenities
- **Buses**: Fleet vehicles with real-time positioning and status tracking
- **Alerts**: Emergency and operational alert system with priority levels
- **Crowd Analytics**: Passenger density monitoring and predictions

### Real-time Monitoring Features
- **Live Bus Tracking**: Real-time bus positioning on interactive map
- **Emergency Alert System**: P1-P5 priority alert handling with CCTV integration
- **Station Monitoring**: Live passenger counts and crowd density analysis
- **Route Optimization**: AI-powered route efficiency recommendations
- **Predictive Maintenance**: Vehicle health monitoring and maintenance scheduling

### Advanced Analytics
- **Management Dashboard**: KPI tracking and performance metrics
- **AI Insights Panel**: Machine learning recommendations for operations
- **Crowd Prediction**: Passenger flow forecasting for better planning
- **Weather Integration**: Weather impact analysis on transit operations

### Media Integration
- **CCTV Feeds**: Real-time video monitoring for buses and stations
- **Video Streaming**: Range request support for efficient video delivery
- **Emergency Documentation**: Video evidence capture for incident response

## Data Flow

### Client-Server Communication
1. Frontend makes API requests to Express backend via fetch
2. Backend processes requests using Drizzle ORM database queries
3. Real-time updates achieved through aggressive polling (2-5 second intervals)
4. Error handling with toast notifications and fallback states

### Database Operations
1. Drizzle ORM provides type-safe database access
2. PostgreSQL stores all operational data with proper indexing
3. Session data managed in database for user state persistence
4. Migrations handled through Drizzle Kit for schema evolution

### Real-time Updates
1. Frontend polls multiple endpoints for live data
2. TanStack Query manages caching and background refetching
3. Optimistic updates for immediate UI feedback
4. Error boundaries for graceful degradation

## External Dependencies

### UI Framework Dependencies
- **@radix-ui/***: Accessible component primitives for form controls, dialogs, and interactive elements
- **class-variance-authority**: Type-safe CSS class composition
- **tailwindcss**: Utility-first CSS framework with PostCSS processing

### Data Management
- **@tanstack/react-query**: Server state management with caching and synchronization
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect support
- **zod**: Runtime type validation and schema parsing

### Development Tools
- **@replit/vite-plugin-***: Replit-specific development enhancements
- **tsx**: TypeScript execution for development server
- **esbuild**: Fast JavaScript bundler for production builds

### Database and Infrastructure
- **@neondatabase/serverless**: Serverless PostgreSQL connection with WebSocket support
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## Deployment Strategy

### Development Environment
- **Server**: tsx for TypeScript execution with hot reloading
- **Client**: Vite development server with HMR and React Fast Refresh
- **Database**: Neon serverless PostgreSQL with development connection string
- **Asset Serving**: Static file serving for CCTV videos and attachments

### Production Build Process
1. **Frontend**: Vite builds React app with TypeScript compilation and asset optimization
2. **Backend**: esbuild bundles Express server with external package handling
3. **Database**: Drizzle migrations applied to production PostgreSQL instance
4. **Assets**: Static files served through Express with range request support

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string for Neon database
- **NODE_ENV**: Environment flag for development/production behavior
- **File Paths**: Configured for Replit environment with proper asset resolution

### Scalability Considerations
- Serverless PostgreSQL for automatic scaling
- Aggressive caching strategy with TanStack Query
- Optimized video streaming with range requests
- Component-based architecture for maintainable scaling