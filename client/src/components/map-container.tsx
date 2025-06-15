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
  showMap: boolean;
}

export default function MapContainer({ buses, routes, stations, selectedRoutes, theme, selectedZone, onZoneSelect, showMap }: MapContainerProps) {
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

  const calculatePerpendicularOffset = (p1: {x: number, y: number}, p2: {x: number, y: number}, offset: number) => {
    // Calculate direction vector
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return { x: p1.x, y: p1.y };
    
    // Normalize and get perpendicular vector
    const perpX = -dy / length;
    const perpY = dx / length;
    
    return {
      x: p1.x + perpX * offset,
      y: p1.y + perpY * offset
    };
  };

  const renderRouteLine = (route: Route, routeIndex: number) => {
    const points = getRoutePoints(route.id);
    const isHighlighted = selectedRoutes.includes(route.id);
    
    if (points.length < 2) return null;

    // Calculate offset for overlapping routes - spread them more
    const offsetDistance = (routeIndex % 5 - 2) * 12; // -24, -12, 0, 12, 24 pixel offset
    
    // Apply perpendicular offset to create parallel lines
    const offsetPoints = points.map((point, i) => {
      if (i === points.length - 1) {
        // For last point, use previous segment direction
        return calculatePerpendicularOffset(points[i-1], point, offsetDistance);
      }
      // Use current segment direction
      return calculatePerpendicularOffset(point, points[i+1], offsetDistance);
    });

    return (
      <svg
        key={route.id}
        className="absolute inset-0 pointer-events-none"
        width="1280"
        height="720"
        style={{ zIndex: 10 + routeIndex }}
      >
        {/* Route line with shadow effect */}
        <polyline
          points={offsetPoints.map(p => `${p.x + 2},${p.y + 2}`).join(' ')}
          fill="none"
          stroke="rgba(0,0,0,0.3)"
          strokeWidth={isHighlighted ? "10" : "8"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points={offsetPoints.map(p => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke={route.color}
          strokeWidth={isHighlighted ? "8" : "6"}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isHighlighted ? "animate-pulse" : ""}
          opacity={isHighlighted ? "1" : "0.9"}
        />
        
        {/* Route number label at multiple points */}
        {offsetPoints.length > 4 && [
          Math.floor(offsetPoints.length * 0.3),
          Math.floor(offsetPoints.length * 0.7)
        ].map((pointIndex, labelIndex) => (
          <text
            key={labelIndex}
            x={offsetPoints[pointIndex].x}
            y={offsetPoints[pointIndex].y - 8}
            fill="white"
            fontSize="11"
            fontWeight="bold"
            textAnchor="middle"
            style={{
              filter: "drop-shadow(0px 1px 3px rgba(0,0,0,0.9))"
            }}
          >
            {route.routeNumber}
          </text>
        ))}
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
        {/* Background Map Layer */}
        {showMap && (
          <svg
            width="1280"
            height="720"
            className="absolute inset-0 z-0"
            viewBox="0 0 1280 720"
            style={{ opacity: 0.7 }}
          >
            <defs>
              <linearGradient id="water" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#3b82f6", stopOpacity: 0.4 }} />
                <stop offset="100%" style={{ stopColor: "#1e40af", stopOpacity: 0.5 }} />
              </linearGradient>
              <linearGradient id="land" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: theme === 'dark' ? '#374151' : '#f3f4f6', stopOpacity: 0.8 }} />
                <stop offset="100%" style={{ stopColor: theme === 'dark' ? '#1f2937' : '#e5e7eb', stopOpacity: 0.9 }} />
              </linearGradient>
            </defs>
            
            {/* Lagos Mainland */}
            <path 
              d="M 50 200 Q 300 150 600 180 Q 800 200 1000 250 Q 1100 300 1200 400 L 1200 600 Q 1000 650 800 620 Q 600 600 400 580 Q 200 550 50 500 Z" 
              fill="url(#land)" 
              stroke={theme === 'dark' ? '#6b7280' : '#9ca3af'} 
              strokeWidth="2"
            />
            
            {/* Lagos Island */}
            <ellipse 
              cx="1150" 
              cy="480" 
              rx="80" 
              ry="40" 
              fill="url(#land)" 
              stroke={theme === 'dark' ? '#6b7280' : '#9ca3af'} 
              strokeWidth="2"
            />
            
            {/* Victoria Island */}
            <ellipse 
              cx="1200" 
              cy="520" 
              rx="60" 
              ry="25" 
              fill="url(#land)" 
              stroke={theme === 'dark' ? '#6b7280' : '#9ca3af'} 
              strokeWidth="2"
            />
            
            {/* Ikorodu Peninsula */}
            <path 
              d="M 50 550 Q 150 580 250 600 Q 350 620 400 580 L 380 560 Q 300 580 200 560 Q 100 540 50 520 Z" 
              fill="url(#land)" 
              stroke={theme === 'dark' ? '#6b7280' : '#9ca3af'} 
              strokeWidth="2"
            />
            
            {/* Lagos Lagoon */}
            <path 
              d="M 800 400 Q 1000 420 1150 450 Q 1200 480 1250 500 Q 1200 520 1150 540 Q 1000 560 800 540 Q 700 520 650 480 Q 700 440 800 400 Z" 
              fill="url(#water)" 
              stroke={theme === 'dark' ? '#1e40af' : '#3b82f6'} 
              strokeWidth="1"
            />
            
            {/* Atlantic Ocean */}
            <rect 
              x="1100" 
              y="550" 
              width="180" 
              height="170" 
              fill="url(#water)" 
              stroke={theme === 'dark' ? '#1e40af' : '#3b82f6'} 
              strokeWidth="1"
            />
            
            {/* Major Roads */}
            <path 
              d="M 100 300 Q 400 280 800 300 Q 1000 320 1200 350" 
              stroke={theme === 'dark' ? '#4b5563' : '#6b7280'} 
              strokeWidth="3" 
              fill="none" 
              opacity="0.6"
            />
            <path 
              d="M 200 250 Q 500 230 800 250" 
              stroke={theme === 'dark' ? '#4b5563' : '#6b7280'} 
              strokeWidth="2" 
              fill="none" 
              opacity="0.5"
            />
            <path 
              d="M 100 400 Q 600 380 1000 400" 
              stroke={theme === 'dark' ? '#4b5563' : '#6b7280'} 
              strokeWidth="2" 
              fill="none" 
              opacity="0.5"
            />
            
            {/* Area Labels */}
            <text 
              x="300" 
              y="320" 
              fill={theme === 'dark' ? '#d1d5db' : '#374151'} 
              fontSize="14" 
              fontWeight="bold" 
              opacity="0.8"
            >
              IKEJA
            </text>
            <text 
              x="150" 
              y="570" 
              fill={theme === 'dark' ? '#d1d5db' : '#374151'} 
              fontSize="14" 
              fontWeight="bold" 
              opacity="0.8"
            >
              IKORODU
            </text>
            <text 
              x="1120" 
              y="470" 
              fill={theme === 'dark' ? '#d1d5db' : '#374151'} 
              fontSize="12" 
              fontWeight="bold" 
              opacity="0.8"
            >
              LAGOS ISLAND
            </text>
            <text 
              x="1140" 
              y="530" 
              fill={theme === 'dark' ? '#d1d5db' : '#374151'} 
              fontSize="10" 
              opacity="0.8"
            >
              V.I.
            </text>
            <text 
              x="950" 
              y="490" 
              fill={theme === 'dark' ? '#60a5fa' : '#2563eb'} 
              fontSize="12" 
              opacity="0.9"
            >
              Lagos Lagoon
            </text>
          </svg>
        )}

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
        {routes
          .filter(route => selectedRoutes.length === 0 || selectedRoutes.includes(route.id))
          .map((route, index) => renderRouteLine(route, index))}
        
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
              className={`w-3 h-3 rounded-full border-2 ${
                theme === 'dark' 
                  ? 'bg-blue-400 border-white' 
                  : 'bg-blue-600 border-gray-900'
              }`}
              title={station.name}
            />
            {/* Station name label */}
            <div 
              className={`absolute top-4 left-1/2 transform -translate-x-1/2 text-xs font-medium px-2 py-1 rounded ${
                theme === 'dark' 
                  ? 'bg-gray-800 text-white border border-gray-600' 
                  : 'bg-white text-gray-900 border border-gray-300'
              }`}
              style={{
                whiteSpace: 'nowrap',
                fontSize: '10px',
                filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.3))'
              }}
            >
              {station.name}
            </div>
          </div>
        ))}

        {/* Bus Icons with Animations */}
        {buses
          .filter(bus => selectedRoutes.length === 0 || selectedRoutes.includes(bus.routeId))
          .map((bus) => (
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