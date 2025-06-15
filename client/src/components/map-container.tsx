import { type BusWithRoute, type Route, type Station } from "@shared/schema";
import BusIcon from "./bus-icon";

interface MapContainerProps {
  buses: BusWithRoute[];
  routes: Route[];
  stations: Station[];
  selectedRoutes: number[];
  theme: "light" | "dark";
  selectedZone: number | null;
  onZoneSelect: (zone: number | null) => void;
}

export default function MapContainer({ buses, routes, stations, selectedRoutes, theme, selectedZone, onZoneSelect }: MapContainerProps) {
  const getRoutePoints = (routeId: number) => {
    // Define route paths for Lagos BRT system - spread across full screen
    const routePaths: Record<number, { x: number; y: number }[]> = {
      1: [ // Oshodi - Abule-Egba (diagonal northwest)
        { x: 800, y: 400 }, { x: 750, y: 370 }, { x: 700, y: 340 }, { x: 650, y: 310 },
        { x: 600, y: 280 }, { x: 550, y: 250 }, { x: 500, y: 220 }, { x: 450, y: 190 },
        { x: 400, y: 160 }, { x: 350, y: 130 }, { x: 300, y: 100 }, { x: 250, y: 70 },
        { x: 200, y: 50 }, { x: 150, y: 30 }, { x: 100, y: 20 }, { x: 50, y: 15 }, { x: 20, y: 10 }
      ],
      2: [ // Abule Egba - TBS/Obalende (northwest to southeast)
        { x: 20, y: 10 }, { x: 50, y: 15 }, { x: 100, y: 20 }, { x: 150, y: 30 },
        { x: 200, y: 50 }, { x: 250, y: 70 }, { x: 300, y: 100 }, { x: 350, y: 130 },
        { x: 400, y: 160 }, { x: 450, y: 190 }, { x: 500, y: 220 }, { x: 550, y: 250 },
        { x: 600, y: 280 }, { x: 650, y: 310 }, { x: 700, y: 340 }, { x: 750, y: 370 },
        { x: 800, y: 400 }, { x: 900, y: 450 }, { x: 950, y: 470 }, { x: 1000, y: 490 },
        { x: 1150, y: 480 }, { x: 1200, y: 500 }, { x: 1250, y: 520 }
      ],
      3: [ // Ikorodu - TBS (southwest to southeast)
        { x: 50, y: 600 }, { x: 120, y: 580 }, { x: 200, y: 560 }, { x: 280, y: 540 },
        { x: 360, y: 520 }, { x: 440, y: 500 }, { x: 520, y: 480 }, { x: 600, y: 460 },
        { x: 680, y: 440 }, { x: 720, y: 420 }, { x: 800, y: 400 }, { x: 900, y: 450 },
        { x: 1000, y: 490 }, { x: 1200, y: 500 }, { x: 1250, y: 520 }
      ],
      4: [ // Ikorodu - Fadeyi (southwest to center)
        { x: 50, y: 600 }, { x: 120, y: 580 }, { x: 200, y: 560 }, { x: 280, y: 540 },
        { x: 360, y: 520 }, { x: 440, y: 500 }, { x: 520, y: 480 }, { x: 600, y: 460 },
        { x: 680, y: 440 }, { x: 720, y: 420 }, { x: 800, y: 400 }, { x: 900, y: 450 },
        { x: 1000, y: 490 }
      ],
      5: [ // Ikorodu - Oshodi (southwest to center)
        { x: 50, y: 600 }, { x: 120, y: 580 }, { x: 200, y: 560 }, { x: 280, y: 540 },
        { x: 360, y: 520 }, { x: 440, y: 500 }, { x: 520, y: 480 }, { x: 600, y: 460 },
        { x: 680, y: 440 }, { x: 720, y: 420 }, { x: 800, y: 400 }
      ],
      6: [ // Berger - Ajah (west to east)
        { x: 100, y: 350 }, { x: 200, y: 340 }, { x: 300, y: 330 }, { x: 400, y: 325 },
        { x: 500, y: 320 }, { x: 600, y: 315 }, { x: 700, y: 310 }, { x: 800, y: 305 },
        { x: 900, y: 300 }, { x: 1000, y: 295 }, { x: 1100, y: 290 }, { x: 1200, y: 285 }
      ],
      7: [ // Lekki - Victoria Island (east coast)
        { x: 1200, y: 200 }, { x: 1150, y: 220 }, { x: 1100, y: 240 }, { x: 1050, y: 260 },
        { x: 1000, y: 280 }, { x: 950, y: 300 }, { x: 900, y: 320 }, { x: 850, y: 340 }
      ],
      8: [ // Yaba - Surulere (central)
        { x: 600, y: 150 }, { x: 650, y: 170 }, { x: 700, y: 190 }, { x: 750, y: 210 },
        { x: 800, y: 230 }, { x: 850, y: 250 }, { x: 900, y: 270 }
      ],
      9: [ // Ikeja - Lagos Island (central diagonal)
        { x: 400, y: 250 }, { x: 450, y: 270 }, { x: 500, y: 290 }, { x: 550, y: 310 },
        { x: 600, y: 330 }, { x: 650, y: 350 }, { x: 700, y: 370 }, { x: 750, y: 390 },
        { x: 800, y: 410 }, { x: 850, y: 430 }
      ]
    };
    return routePaths[routeId] || [];
  };

  const renderRouteLine = (route: Route) => {
    const points = getRoutePoints(route.id);
    const isHighlighted = selectedRoutes.includes(route.id);
    
    if (points.length < 2) return null;

    return (
      <svg
        key={route.id}
        className="absolute inset-0 pointer-events-none"
        width="1280"
        height="720"
        style={{ zIndex: 10 }}
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

  // Calculate zoom parameters for selected zone
  const getZoomTransform = () => {
    if (selectedZone === null) return "scale(1) translate(0, 0)";
    
    const row = Math.floor((selectedZone - 1) / 4);
    const col = (selectedZone - 1) % 4;
    
    const zoneWidth = 1280 / 4;
    const zoneHeight = 720 / 4;
    
    const centerX = col * zoneWidth + zoneWidth / 2;
    const centerY = row * zoneHeight + zoneHeight / 2;
    
    const scale = 2;
    const translateX = (640 - centerX);
    const translateY = (360 - centerY);
    
    return `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
  };

  return (
    <div className="relative w-full h-full overflow-hidden border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900">
      {/* Grid zones overlay */}
      <div className="absolute inset-0 pointer-events-none z-40">
        {Array.from({ length: 16 }, (_, i) => {
          const row = Math.floor(i / 4);
          const col = i % 4;
          const zoneNumber = i + 1;
          
          return (
            <div
              key={zoneNumber}
              className={`absolute border-2 transition-all duration-200 ${
                selectedZone === zoneNumber 
                  ? 'border-blue-500 bg-blue-500/20' 
                  : 'border-gray-400/30 hover:border-blue-400/50 hover:bg-blue-400/10'
              }`}
              style={{
                left: `${col * 25}%`,
                top: `${row * 25}%`,
                width: '25%',
                height: '25%',
                pointerEvents: 'auto',
                cursor: 'pointer'
              }}
              onClick={() => onZoneSelect(selectedZone === zoneNumber ? null : zoneNumber)}
              title={`Zone ${zoneNumber}`}
            >
              <div className={`absolute top-1 left-1 text-xs font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                {zoneNumber}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main map content */}
      <div 
        className="relative transition-all duration-500 ease-in-out"
        style={{ 
          width: '1280px',
          height: '720px',
          transform: getZoomTransform(),
          transformOrigin: 'center center'
        }}
      >
        {/* Background grid */}
        <svg
          width="1280"
          height="720"
          className="absolute inset-0"
          style={{ background: theme === "dark" ? "#1f2937" : "#f9fafb" }}
        >
          <defs>
            <pattern id="grid" width="80" height="45" patternUnits="userSpaceOnUse">
              <path 
                d="M 80 0 L 0 0 0 45" 
                fill="none" 
                stroke={theme === "dark" ? "#374151" : "#d1d5db"} 
                strokeWidth="0.5"
                opacity="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

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
              title={station.name}
            />
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
      </div>
    </div>
  );
}