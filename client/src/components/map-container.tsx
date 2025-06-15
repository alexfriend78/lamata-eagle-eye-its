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
    // Define comprehensive route paths covering all 16 zones with internal connectivity
    const routePaths: Record<number, { x: number; y: number }[]> = {
      1: [ // Zone 1 comprehensive coverage
        { x: 20, y: 20 }, { x: 80, y: 30 }, { x: 140, y: 40 }, { x: 200, y: 50 }, { x: 260, y: 60 },
        { x: 300, y: 80 }, { x: 280, y: 120 }, { x: 240, y: 160 }, { x: 180, y: 150 }, 
        { x: 120, y: 140 }, { x: 60, y: 130 }, { x: 40, y: 100 }, { x: 20, y: 70 }
      ],
      2: [ // Zone 2 comprehensive coverage  
        { x: 320, y: 20 }, { x: 380, y: 30 }, { x: 440, y: 40 }, { x: 500, y: 50 }, { x: 560, y: 60 },
        { x: 600, y: 80 }, { x: 580, y: 120 }, { x: 540, y: 160 }, { x: 480, y: 150 },
        { x: 420, y: 140 }, { x: 360, y: 130 }, { x: 340, y: 100 }, { x: 320, y: 70 }
      ],
      3: [ // Zone 3 comprehensive coverage
        { x: 640, y: 20 }, { x: 700, y: 30 }, { x: 760, y: 40 }, { x: 820, y: 50 }, { x: 880, y: 60 },
        { x: 920, y: 80 }, { x: 900, y: 120 }, { x: 860, y: 160 }, { x: 800, y: 150 },
        { x: 740, y: 140 }, { x: 680, y: 130 }, { x: 660, y: 100 }, { x: 640, y: 70 }
      ],
      4: [ // Zone 4 comprehensive coverage
        { x: 960, y: 20 }, { x: 1020, y: 30 }, { x: 1080, y: 40 }, { x: 1140, y: 50 }, { x: 1200, y: 60 },
        { x: 1240, y: 80 }, { x: 1220, y: 120 }, { x: 1180, y: 160 }, { x: 1120, y: 150 },
        { x: 1060, y: 140 }, { x: 1000, y: 130 }, { x: 980, y: 100 }, { x: 960, y: 70 }
      ],
      5: [ // Zone 5 comprehensive coverage
        { x: 20, y: 200 }, { x: 80, y: 210 }, { x: 140, y: 220 }, { x: 200, y: 230 }, { x: 260, y: 240 },
        { x: 300, y: 260 }, { x: 280, y: 300 }, { x: 240, y: 340 }, { x: 180, y: 330 },
        { x: 120, y: 320 }, { x: 60, y: 310 }, { x: 40, y: 280 }, { x: 20, y: 250 }
      ],
      6: [ // Zone 6 comprehensive coverage
        { x: 320, y: 200 }, { x: 380, y: 210 }, { x: 440, y: 220 }, { x: 500, y: 230 }, { x: 560, y: 240 },
        { x: 600, y: 260 }, { x: 580, y: 300 }, { x: 540, y: 340 }, { x: 480, y: 330 },
        { x: 420, y: 320 }, { x: 360, y: 310 }, { x: 340, y: 280 }, { x: 320, y: 250 }
      ],
      7: [ // Zone 7 comprehensive coverage
        { x: 640, y: 200 }, { x: 700, y: 210 }, { x: 760, y: 220 }, { x: 820, y: 230 }, { x: 880, y: 240 },
        { x: 920, y: 260 }, { x: 900, y: 300 }, { x: 860, y: 340 }, { x: 800, y: 330 },
        { x: 740, y: 320 }, { x: 680, y: 310 }, { x: 660, y: 280 }, { x: 640, y: 250 }
      ],
      8: [ // Zone 8 comprehensive coverage
        { x: 960, y: 200 }, { x: 1020, y: 210 }, { x: 1080, y: 220 }, { x: 1140, y: 230 }, { x: 1200, y: 240 },
        { x: 1240, y: 260 }, { x: 1220, y: 300 }, { x: 1180, y: 340 }, { x: 1120, y: 330 },
        { x: 1060, y: 320 }, { x: 1000, y: 310 }, { x: 980, y: 280 }, { x: 960, y: 250 }
      ],
      9: [ // Zone 9 comprehensive coverage
        { x: 20, y: 380 }, { x: 80, y: 390 }, { x: 140, y: 400 }, { x: 200, y: 410 }, { x: 260, y: 420 },
        { x: 300, y: 440 }, { x: 280, y: 480 }, { x: 240, y: 520 }, { x: 180, y: 510 },
        { x: 120, y: 500 }, { x: 60, y: 490 }, { x: 40, y: 460 }, { x: 20, y: 430 }
      ],
      10: [ // Zone 10 comprehensive coverage
        { x: 320, y: 380 }, { x: 380, y: 390 }, { x: 440, y: 400 }, { x: 500, y: 410 }, { x: 560, y: 420 },
        { x: 600, y: 440 }, { x: 580, y: 480 }, { x: 540, y: 520 }, { x: 480, y: 510 },
        { x: 420, y: 500 }, { x: 360, y: 490 }, { x: 340, y: 460 }, { x: 320, y: 430 }
      ],
      11: [ // Zone 11 comprehensive coverage
        { x: 640, y: 380 }, { x: 700, y: 390 }, { x: 760, y: 400 }, { x: 820, y: 410 }, { x: 880, y: 420 },
        { x: 920, y: 440 }, { x: 900, y: 480 }, { x: 860, y: 520 }, { x: 800, y: 510 },
        { x: 740, y: 500 }, { x: 680, y: 490 }, { x: 660, y: 460 }, { x: 640, y: 430 }
      ],
      12: [ // Zone 12 comprehensive coverage
        { x: 960, y: 380 }, { x: 1020, y: 390 }, { x: 1080, y: 400 }, { x: 1140, y: 410 }, { x: 1200, y: 420 },
        { x: 1240, y: 440 }, { x: 1220, y: 480 }, { x: 1180, y: 520 }, { x: 1120, y: 510 },
        { x: 1060, y: 500 }, { x: 1000, y: 490 }, { x: 980, y: 460 }, { x: 960, y: 430 }
      ],
      13: [ // Zone 13 comprehensive coverage
        { x: 20, y: 560 }, { x: 80, y: 570 }, { x: 140, y: 580 }, { x: 200, y: 590 }, { x: 260, y: 600 },
        { x: 300, y: 620 }, { x: 280, y: 660 }, { x: 240, y: 700 }, { x: 180, y: 690 },
        { x: 120, y: 680 }, { x: 60, y: 670 }, { x: 40, y: 640 }, { x: 20, y: 610 }
      ],
      14: [ // Zone 14 comprehensive coverage
        { x: 320, y: 560 }, { x: 380, y: 570 }, { x: 440, y: 580 }, { x: 500, y: 590 }, { x: 560, y: 600 },
        { x: 600, y: 620 }, { x: 580, y: 660 }, { x: 540, y: 700 }, { x: 480, y: 690 },
        { x: 420, y: 680 }, { x: 360, y: 670 }, { x: 340, y: 640 }, { x: 320, y: 610 }
      ],
      15: [ // Zone 15 comprehensive coverage
        { x: 640, y: 560 }, { x: 700, y: 570 }, { x: 760, y: 580 }, { x: 820, y: 590 }, { x: 880, y: 600 },
        { x: 920, y: 620 }, { x: 900, y: 660 }, { x: 860, y: 700 }, { x: 800, y: 690 },
        { x: 740, y: 680 }, { x: 680, y: 670 }, { x: 660, y: 640 }, { x: 640, y: 610 }
      ],
      16: [ // Zone 16 comprehensive coverage
        { x: 960, y: 560 }, { x: 1020, y: 570 }, { x: 1080, y: 580 }, { x: 1140, y: 590 }, { x: 1200, y: 600 },
        { x: 1240, y: 620 }, { x: 1220, y: 660 }, { x: 1180, y: 700 }, { x: 1120, y: 690 },
        { x: 1060, y: 680 }, { x: 1000, y: 670 }, { x: 980, y: 640 }, { x: 960, y: 610 }
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

  // Calculate zoom transform for selected zone
  const getZoomTransform = () => {
    if (!selectedZone) return 'scale(1) translate(0px, 0px)';
    
    // Zone layout: 4x4 grid (zones 1-16)
    const row = Math.floor((selectedZone - 1) / 4);
    const col = (selectedZone - 1) % 4;
    
    // Each zone is 320x180 pixels (1280/4 x 720/4)
    const zoneWidth = 320;
    const zoneHeight = 180;
    
    // Calculate center of the selected zone
    const zoneCenterX = col * zoneWidth + zoneWidth / 2;
    const zoneCenterY = row * zoneHeight + zoneHeight / 2;
    
    // Zoom scale and translation to center the zone
    const scale = 2.5;
    const translateX = (640 - zoneCenterX); // 640 is half of 1280
    const translateY = (360 - zoneCenterY); // 360 is half of 720
    
    return `scale(${scale}) translate(${translateX / scale}px, ${translateY / scale}px)`;
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
                pointerEvents: 'none'
              }}
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
            onMouseEnter={() => onStationHover?.(station)}
            onMouseLeave={() => onStationHover?.(null)}
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
            <div
              key={bus.id}
              style={{
                position: 'absolute',
                top: `${bus.currentY - 12}px`,
                left: `${bus.currentX - 12}px`,
                zIndex: 30
              }}
              onMouseEnter={() => onBusHover?.(bus)}
              onMouseLeave={() => onBusHover?.(null)}
              className="cursor-pointer"
            >
              <BusIcon
                bus={bus}
                style={{}}
              />
            </div>
          ))}
      </div>
    </div>
  );
}