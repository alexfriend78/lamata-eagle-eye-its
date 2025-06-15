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
    // Define extended routes that go beyond 1280x720 for a larger transit network
    const routePaths: Record<number, { x: number; y: number }[]> = {
      1: [ // Blue Line - Extended northern corridor
        { x: -200, y: 80 }, { x: -50, y: 75 }, { x: 160, y: 70 }, { x: 320, y: 85 }, { x: 480, y: 90 }, 
        { x: 640, y: 95 }, { x: 800, y: 100 }, { x: 960, y: 105 }, { x: 1120, y: 110 }, { x: 1280, y: 115 },
        { x: 1450, y: 120 }, { x: 1600, y: 125 }
      ],
      2: [ // Red Line - Extended diagonal from far northwest to far southeast
        { x: -150, y: -100 }, { x: 40, y: 40 }, { x: 180, y: 120 }, { x: 320, y: 200 }, { x: 460, y: 280 }, 
        { x: 600, y: 360 }, { x: 740, y: 440 }, { x: 880, y: 520 }, { x: 1020, y: 600 }, { x: 1160, y: 680 },
        { x: 1320, y: 780 }, { x: 1480, y: 880 }
      ],
      3: [ // Green Line - Extended upper horizontal with suburban reach
        { x: -300, y: 180 }, { x: -100, y: 175 }, { x: 200, y: 170 }, { x: 370, y: 175 }, { x: 540, y: 180 }, 
        { x: 710, y: 185 }, { x: 880, y: 190 }, { x: 1050, y: 195 }, { x: 1220, y: 200 }, { x: 1400, y: 205 },
        { x: 1580, y: 210 }
      ],
      4: [ // Orange Line - Extended central spine coast to coast
        { x: -250, y: 300 }, { x: -80, y: 295 }, { x: 180, y: 295 }, { x: 335, y: 305 }, { x: 490, y: 300 }, 
        { x: 645, y: 310 }, { x: 800, y: 305 }, { x: 955, y: 315 }, { x: 1110, y: 310 }, { x: 1280, y: 320 },
        { x: 1450, y: 325 }, { x: 1620, y: 330 }
      ],
      5: [ // Purple Line - Extended southern corridor
        { x: -180, y: 520 }, { x: 35, y: 520 }, { x: 190, y: 515 }, { x: 345, y: 525 }, { x: 500, y: 520 }, 
        { x: 655, y: 530 }, { x: 810, y: 525 }, { x: 965, y: 535 }, { x: 1120, y: 530 }, { x: 1280, y: 540 },
        { x: 1440, y: 545 }, { x: 1600, y: 550 }
      ],
      6: [ // Teal Line - Extended coastal edge
        { x: -100, y: 650 }, { x: 50, y: 650 }, { x: 220, y: 640 }, { x: 390, y: 645 }, { x: 560, y: 650 }, 
        { x: 730, y: 655 }, { x: 900, y: 660 }, { x: 1070, y: 665 }, { x: 1240, y: 670 }, { x: 1410, y: 675 },
        { x: 1580, y: 680 }
      ],
      7: [ // Yellow Line - Extended western spine
        { x: 120, y: -150 }, { x: 125, y: 30 }, { x: 130, y: 140 }, { x: 135, y: 250 }, { x: 140, y: 360 }, 
        { x: 145, y: 470 }, { x: 150, y: 580 }, { x: 155, y: 690 }, { x: 160, y: 800 }, { x: 165, y: 920 }
      ],
      8: [ // Pink Line - Extended central axis
        { x: 640, y: -200 }, { x: 642, y: 25 }, { x: 645, y: 130 }, { x: 648, y: 235 }, { x: 650, y: 340 }, 
        { x: 652, y: 445 }, { x: 655, y: 550 }, { x: 658, y: 655 }, { x: 660, y: 720 }, { x: 662, y: 850 },
        { x: 665, y: 980 }
      ],
      9: [ // Cyan Line - Extended eastern spine
        { x: 1100, y: -120 }, { x: 1102, y: 35 }, { x: 1105, y: 145 }, { x: 1108, y: 255 }, { x: 1110, y: 365 }, 
        { x: 1112, y: 475 }, { x: 1115, y: 585 }, { x: 1118, y: 695 }, { x: 1120, y: 800 }, { x: 1122, y: 920 }
      ],
      10: [ // Brown Line - Extended cross diagonal
        { x: 1400, y: -80 }, { x: 1200, y: 60 }, { x: 1050, y: 140 }, { x: 900, y: 220 }, { x: 750, y: 300 }, 
        { x: 600, y: 380 }, { x: 450, y: 460 }, { x: 300, y: 540 }, { x: 150, y: 620 }, { x: 0, y: 700 },
        { x: -150, y: 780 }, { x: -300, y: 860 }
      ],
      11: [ // Lime Line - Extended orbital ring
        { x: 100, y: -50 }, { x: 200, y: 100 }, { x: 400, y: 80 }, { x: 600, y: 90 }, { x: 800, y: 100 }, { x: 1000, y: 120 }, 
        { x: 1200, y: 150 }, { x: 1350, y: 200 }, { x: 1450, y: 350 }, { x: 1400, y: 500 }, { x: 1300, y: 620 }, 
        { x: 1100, y: 720 }, { x: 900, y: 780 }, { x: 700, y: 770 }, { x: 500, y: 760 }, { x: 300, y: 750 }, 
        { x: 100, y: 720 }, { x: -50, y: 580 }, { x: -100, y: 450 }, { x: -80, y: 300 }, { x: 0, y: 180 }
      ],
      12: [ // Indigo Line - Extended figure-8 pattern
        { x: 100, y: 150 }, { x: 320, y: 150 }, { x: 480, y: 180 }, { x: 640, y: 220 }, { x: 800, y: 260 }, { x: 960, y: 300 },
        { x: 1150, y: 340 }, { x: 960, y: 380 }, { x: 800, y: 340 }, { x: 640, y: 380 }, { x: 480, y: 420 }, { x: 320, y: 460 },
        { x: 150, y: 500 }, { x: 320, y: 540 }, { x: 480, y: 500 }, { x: 640, y: 540 }, { x: 800, y: 580 }, { x: 960, y: 620 },
        { x: 1150, y: 660 }
      ],
      13: [ // Violet Line - Extended complex curve
        { x: -80, y: 200 }, { x: 60, y: 200 }, { x: 180, y: 160 }, { x: 320, y: 140 }, { x: 480, y: 160 }, { x: 640, y: 200 },
        { x: 800, y: 250 }, { x: 960, y: 320 }, { x: 1100, y: 400 }, { x: 1250, y: 500 }, { x: 1350, y: 600 },
        { x: 1250, y: 700 }, { x: 1100, y: 750 }, { x: 900, y: 780 }, { x: 700, y: 770 }, { x: 500, y: 760 },
        { x: 300, y: 740 }, { x: 150, y: 680 }, { x: 50, y: 580 }, { x: 0, y: 480 }, { x: -50, y: 350 }
      ],
      14: [ // Gold Line - Extended mountain range
        { x: -150, y: 120 }, { x: 100, y: 120 }, { x: 250, y: 80 }, { x: 400, y: 130 }, { x: 550, y: 70 }, 
        { x: 700, y: 140 }, { x: 850, y: 90 }, { x: 1000, y: 150 }, { x: 1150, y: 100 }, { x: 1300, y: 160 },
        { x: 1450, y: 110 }
      ],
      15: [ // Silver Line - Extended river meander
        { x: -120, y: 400 }, { x: 80, y: 400 }, { x: 220, y: 420 }, { x: 360, y: 450 }, { x: 500, y: 480 }, 
        { x: 640, y: 500 }, { x: 780, y: 520 }, { x: 920, y: 550 }, { x: 1060, y: 580 }, { x: 1200, y: 600 },
        { x: 1340, y: 620 }, { x: 1480, y: 640 }
      ],
      16: [ // Coral Line - Extended wave pattern
        { x: -160, y: 580 }, { x: 40, y: 580 }, { x: 160, y: 600 }, { x: 280, y: 620 }, { x: 400, y: 640 }, 
        { x: 520, y: 660 }, { x: 640, y: 680 }, { x: 760, y: 700 }, { x: 880, y: 690 }, { x: 1000, y: 680 }, 
        { x: 1120, y: 670 }, { x: 1240, y: 660 }, { x: 1360, y: 650 }, { x: 1480, y: 640 }
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