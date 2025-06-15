import { type BusWithRoute, type Route, type Station } from "@shared/schema";
import BusIcon from "./bus-icon";

interface MapContainerProps {
  buses: BusWithRoute[];
  routes: Route[];
  stations: Station[];
  selectedRoutes: number[];
  theme: "light" | "dark";
}

export default function MapContainer({ buses, routes, stations, selectedRoutes, theme }: MapContainerProps) {
  const getRoutePoints = (routeId: number) => {
    // Define route paths for Lagos BRT system
    const routePaths: Record<number, { x: number; y: number }[]> = {
      1: [ // Oshodi - Abule-Egba
        { x: 400, y: 300 }, { x: 380, y: 280 }, { x: 360, y: 260 }, { x: 340, y: 240 },
        { x: 320, y: 220 }, { x: 300, y: 200 }, { x: 280, y: 180 }, { x: 260, y: 160 },
        { x: 240, y: 140 }, { x: 220, y: 120 }, { x: 200, y: 100 }, { x: 180, y: 80 },
        { x: 160, y: 60 }, { x: 140, y: 40 }, { x: 120, y: 20 }, { x: 100, y: 10 }, { x: 80, y: 5 }
      ],
      2: [ // Abule Egba - TBS/Obalende
        { x: 80, y: 5 }, { x: 100, y: 10 }, { x: 120, y: 20 }, { x: 140, y: 40 },
        { x: 160, y: 60 }, { x: 180, y: 80 }, { x: 200, y: 100 }, { x: 220, y: 120 },
        { x: 240, y: 140 }, { x: 260, y: 160 }, { x: 280, y: 180 }, { x: 300, y: 200 },
        { x: 320, y: 220 }, { x: 340, y: 240 }, { x: 360, y: 260 }, { x: 380, y: 280 },
        { x: 400, y: 300 }, { x: 420, y: 350 }, { x: 580, y: 480 }, { x: 600, y: 500 }, { x: 650, y: 520 }
      ],
      3: [ // Ikorodu - TBS
        { x: 100, y: 600 }, { x: 200, y: 580 }, { x: 300, y: 500 }, { x: 350, y: 460 },
        { x: 400, y: 420 }, { x: 460, y: 380 }, { x: 500, y: 420 }, { x: 600, y: 500 }, { x: 650, y: 520 }
      ],
      4: [ // Ikorodu - Fadeyi
        { x: 100, y: 600 }, { x: 200, y: 580 }, { x: 300, y: 500 }, { x: 350, y: 460 },
        { x: 400, y: 420 }, { x: 460, y: 380 }, { x: 500, y: 420 }
      ],
      5: [ // Ikorodu - Oshodi
        { x: 100, y: 600 }, { x: 200, y: 580 }, { x: 300, y: 500 }, { x: 350, y: 460 },
        { x: 400, y: 420 }, { x: 420, y: 350 }, { x: 400, y: 300 }
      ]
    };
    return routePaths[routeId] || [];
  };

  const renderRouteLine = (route: Route) => {
    const points = getRoutePoints(route.id);
    if (points.length < 2) return null;

    const isHighlighted = selectedRoutes.includes(route.id);
    const opacity = selectedRoutes.length === 0 || isHighlighted ? 1 : 0.3;
    
    return (
      <svg
        key={route.id}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity }}
      >
        <polyline
          points={points.map(p => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke={route.color}
          strokeWidth={isHighlighted ? "4" : "2"}
          strokeDasharray={isHighlighted ? "none" : "5,5"}
          className={isHighlighted ? "animate-pulse" : ""}
        />
      </svg>
    );
  };

  return (
    <div className={`h-full relative overflow-hidden ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="absolute top-4 left-4 z-10">
        <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Lagos BRT Network
        </h2>
      </div>
      
      {/* Route Network Visualization */}
      <div className="relative w-full h-full overflow-hidden">
        
        {/* Route Lines */}
        {routes.map(renderRouteLine)}
        
        {/* Major Stations */}
        {stations.map((station) => (
          <div 
            key={station.id}
            className="absolute z-20"
            style={{ 
              top: `${station.y - 4}px`, 
              left: `${station.x - 4}px` 
            }}
          >
            <div 
              className={`w-2 h-2 rounded-full border-2 ${
                theme === 'dark' 
                  ? 'bg-blue-400 border-white' 
                  : 'bg-blue-600 border-gray-900'
              }`}
            ></div>
            <span 
              className={`text-xs ml-3 whitespace-nowrap ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              {station.name}
            </span>
          </div>
        ))}

        {/* Bus Icons with Animations */}
        {buses.map((bus) => (
          <BusIcon
            key={bus.id}
            bus={bus}
            style={{
              position: 'absolute',
              top: `${bus.currentY - 12}px`,
              left: `${bus.currentX - 12}px`,
              zIndex: 30
            }}
          />
        ))}

        {/* Route Labels */}
        {routes.map((route) => {
          const points = getRoutePoints(route.id);
          if (points.length === 0) return null;
          
          const midPoint = points[Math.floor(points.length / 2)];
          const isHighlighted = selectedRoutes.includes(route.id);
          const opacity = selectedRoutes.length === 0 || isHighlighted ? 1 : 0.5;
          
          return (
            <div 
              key={route.id}
              className="absolute text-xs px-2 py-1 rounded-full font-semibold z-25"
              style={{
                top: `${midPoint.y - 15}px`,
                left: `${midPoint.x - 15}px`,
                backgroundColor: route.color,
                color: 'white',
                opacity,
                transform: isHighlighted ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.2s ease'
              }}
            >
              {route.routeNumber}
            </div>
          );
        })}

        {/* Grid Background */}
        <div 
          className={`absolute inset-0 opacity-10 pointer-events-none ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-blue-900/20 to-purple-900/20' 
              : 'bg-gradient-to-br from-blue-100/50 to-purple-100/50'
          }`}
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${
              theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            } 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}
        />
      </div>
    </div>
  );
}
