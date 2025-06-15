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
  showStationNames: boolean;
  onStationClick: (station: Station) => void;
  onStationHover?: (station: Station | null) => void;
  onBusHover?: (bus: BusWithRoute | null) => void;
  showLiveFeed: boolean;
}

export default function MapContainer({ buses, routes, stations, selectedRoutes, theme, selectedZone, onZoneSelect, showMap, showStationNames, onStationClick, onStationHover, onBusHover, showLiveFeed }: MapContainerProps) {
  const getRoutePoints = (routeId: number) => {
    // Define route paths for Lagos BRT system - utilizing full landscape screen (1280x720)
    const routePaths: Record<number, { x: number; y: number }[]> = {
      1: [ // Oshodi - Abule-Egba (northwest diagonal - full width)
        { x: 1260, y: 680 }, { x: 1180, y: 620 }, { x: 1100, y: 560 }, { x: 1020, y: 500 },
        { x: 940, y: 440 }, { x: 860, y: 380 }, { x: 780, y: 320 }, { x: 700, y: 260 },
        { x: 620, y: 200 }, { x: 540, y: 140 }, { x: 460, y: 100 }, { x: 380, y: 80 },
        { x: 300, y: 60 }, { x: 220, y: 50 }, { x: 140, y: 40 }, { x: 80, y: 30 }, { x: 20, y: 20 }
      ],
      2: [ // Abule Egba - TBS/Obalende (northwest to southeast - full screen)
        { x: 20, y: 20 }, { x: 80, y: 30 }, { x: 140, y: 40 }, { x: 220, y: 50 },
        { x: 300, y: 60 }, { x: 380, y: 80 }, { x: 460, y: 100 }, { x: 540, y: 140 },
        { x: 620, y: 200 }, { x: 700, y: 260 }, { x: 780, y: 320 }, { x: 860, y: 380 },
        { x: 940, y: 440 }, { x: 1020, y: 500 }, { x: 1100, y: 560 }, { x: 1180, y: 620 },
        { x: 1260, y: 680 }
      ],
      3: [ // Ikorodu - TBS (southwest to southeast - bottom traverse)
        { x: 40, y: 700 }, { x: 160, y: 680 }, { x: 280, y: 660 }, { x: 400, y: 640 },
        { x: 520, y: 620 }, { x: 640, y: 600 }, { x: 760, y: 580 }, { x: 880, y: 560 },
        { x: 1000, y: 540 }, { x: 1120, y: 520 }, { x: 1240, y: 500 }
      ],
      4: [ // Berger - Lekki (horizontal traverse - upper middle)
        { x: 30, y: 200 }, { x: 150, y: 190 }, { x: 270, y: 180 }, { x: 390, y: 170 },
        { x: 510, y: 160 }, { x: 630, y: 150 }, { x: 750, y: 140 }, { x: 870, y: 130 },
        { x: 990, y: 120 }, { x: 1110, y: 110 }, { x: 1230, y: 100 }
      ],
      5: [ // Lagos Island - Mainland (east-west central)
        { x: 1250, y: 360 }, { x: 1150, y: 350 }, { x: 1050, y: 340 }, { x: 950, y: 330 },
        { x: 850, y: 320 }, { x: 750, y: 310 }, { x: 650, y: 300 }, { x: 550, y: 290 },
        { x: 450, y: 280 }, { x: 350, y: 270 }, { x: 250, y: 260 }, { x: 150, y: 250 }, { x: 50, y: 240 }
      ],
      6: [ // Victoria Island - Ajah (coastal route)
        { x: 1260, y: 600 }, { x: 1180, y: 580 }, { x: 1100, y: 560 }, { x: 1020, y: 540 },
        { x: 940, y: 520 }, { x: 860, y: 500 }, { x: 780, y: 480 }, { x: 700, y: 460 },
        { x: 620, y: 440 }, { x: 540, y: 420 }
      ],
      7: [ // Yaba - Surulere (central north)
        { x: 300, y: 150 }, { x: 420, y: 140 }, { x: 540, y: 130 }, { x: 660, y: 120 },
        { x: 780, y: 110 }, { x: 900, y: 100 }, { x: 1020, y: 90 }, { x: 1140, y: 80 }
      ],
      8: [ // Ikeja - Airport (northwest curve)
        { x: 200, y: 300 }, { x: 280, y: 280 }, { x: 360, y: 260 }, { x: 440, y: 240 },
        { x: 520, y: 220 }, { x: 600, y: 200 }, { x: 680, y: 180 }, { x: 760, y: 160 },
        { x: 840, y: 140 }, { x: 920, y: 120 }
      ],
      9: [ // Outer Ring Road (partial circle)
        { x: 100, y: 500 }, { x: 200, y: 480 }, { x: 300, y: 460 }, { x: 400, y: 440 },
        { x: 500, y: 420 }, { x: 600, y: 400 }, { x: 700, y: 420 }, { x: 800, y: 440 },
        { x: 900, y: 460 }, { x: 1000, y: 480 }, { x: 1100, y: 500 }, { x: 1180, y: 520 }
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
          <div 
            className="absolute inset-0"
            style={{
              zIndex: 1,
              backgroundColor: theme === 'dark' ? '#0f172a' : '#e2e8f0',
              border: `2px solid ${theme === 'dark' ? '#1e293b' : '#cbd5e1'}`,
            }}
          >
            {/* Clear visual indicator that map is active */}
            <div className="absolute top-4 left-4">
              <div className={`px-3 py-1 rounded ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'} text-sm font-medium`}>
                MAP VIEW ACTIVE
              </div>
            </div>
            
            {/* Lagos geographical features */}
            <div className="w-full h-full relative">
              {/* Water bodies */}
              <div 
                className="absolute"
                style={{
                  left: '600px',
                  top: '300px',
                  width: '400px',
                  height: '200px',
                  backgroundColor: theme === 'dark' ? '#1e40af' : '#3b82f6',
                  opacity: 0.3,
                  borderRadius: '50%',
                  transform: 'rotate(-15deg)'
                }}
              />
              <div 
                className="absolute"
                style={{
                  left: '1000px',
                  top: '500px',
                  width: '280px',
                  height: '220px',
                  backgroundColor: theme === 'dark' ? '#1e40af' : '#3b82f6',
                  opacity: 0.2,
                }}
              />
              
              {/* Land masses */}
              <div 
                className="absolute"
                style={{
                  left: '50px',
                  top: '200px',
                  width: '500px',
                  height: '300px',
                  backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                  opacity: 0.4,
                  borderRadius: '30px',
                  transform: 'rotate(5deg)'
                }}
              />
              
              {/* Area labels with clear backgrounds */}
              <div className="absolute" style={{ left: '250px', top: '220px' }}>
                <div className={`px-2 py-1 rounded text-sm font-bold ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                  IKEJA
                </div>
              </div>
              <div className="absolute" style={{ left: '150px', top: '470px' }}>
                <div className={`px-2 py-1 rounded text-sm font-bold ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                  IKORODU
                </div>
              </div>
              <div className="absolute" style={{ left: '1050px', top: '370px' }}>
                <div className={`px-2 py-1 rounded text-sm font-bold ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                  LAGOS ISLAND
                </div>
              </div>
              <div className="absolute" style={{ left: '1100px', top: '520px' }}>
                <div className={`px-2 py-1 rounded text-xs font-bold ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                  VICTORIA ISLAND
                </div>
              </div>
              <div className="absolute" style={{ left: '750px', top: '390px' }}>
                <div className={`px-2 py-1 rounded text-xs italic ${theme === 'dark' ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                  Lagos Lagoon
                </div>
              </div>
              
              {/* Roads */}
              <div 
                className="absolute"
                style={{
                  left: '0px',
                  top: '200px',
                  width: '1200px',
                  height: '4px',
                  backgroundColor: theme === 'dark' ? '#6b7280' : '#9ca3af',
                  opacity: 0.6,
                  transform: 'rotate(2deg)'
                }}
              />
              <div 
                className="absolute"
                style={{
                  left: '100px',
                  top: '400px',
                  width: '1000px',
                  height: '4px',
                  backgroundColor: theme === 'dark' ? '#6b7280' : '#9ca3af',
                  opacity: 0.6,
                  transform: 'rotate(1deg)'
                }}
              />
            </div>
            
            {/* Bottom right label */}
            <div className="absolute bottom-4 right-4">
              <div className={`px-3 py-2 rounded text-lg font-bold ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                LAGOS, NIGERIA
              </div>
            </div>
          </div>
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
        
        {/* Bus Stations */}
        {stations.map((station) => (
          <div 
            key={station.id}
            className="absolute z-20 cursor-pointer"
            style={{ 
              top: `${station.y - 8}px`, 
              left: `${station.x - 8}px` 
            }}
            onClick={() => onStationClick(station)}
          >
            {/* Bus Stop Icon - Unicode */}
            <div className="relative">
              <span 
                className={`text-2xl ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} hover:scale-110 transition-transform select-none`}
                style={{ 
                  filter: theme === 'dark' ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                }}
              >
                🚏
              </span>
              
              {/* Station indicator dot */}
              <div 
                className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 ${
                  theme === 'dark' 
                    ? 'bg-yellow-400 border-gray-800' 
                    : 'bg-yellow-500 border-white'
                }`}
              />

              {/* Live feed indicator */}
              {showLiveFeed && (
                <div 
                  className={`absolute -bottom-1 -left-1 w-2 h-2 rounded-full ${
                    station.id % 2 === 0 ? 'bg-green-500' : 'bg-red-500'
                  } animate-pulse`}
                />
              )}
            </div>

            {/* Station name label */}
            {showStationNames && (
              <div 
                className={`absolute top-5 left-1/2 transform -translate-x-1/2 text-xs font-medium px-2 py-1 rounded ${
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
            )}
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