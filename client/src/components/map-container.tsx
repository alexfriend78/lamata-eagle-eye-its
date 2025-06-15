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
    // Define stable routes that cover the full monitoring screen area (1600x1000 viewBox)
    const routePaths: Record<number, { x: number; y: number }[]> = {
      1: [ // Blue Line - Northern corridor spanning full width
        { x: 0, y: 100 }, { x: 200, y: 90 }, { x: 400, y: 95 }, { x: 600, y: 100 }, { x: 800, y: 105 }, 
        { x: 1000, y: 110 }, { x: 1200, y: 115 }, { x: 1400, y: 120 }, { x: 1600, y: 125 }
      ],
      2: [ // Red Line - Full diagonal coverage
        { x: 0, y: 50 }, { x: 200, y: 150 }, { x: 400, y: 250 }, { x: 600, y: 350 }, { x: 800, y: 450 }, 
        { x: 1000, y: 550 }, { x: 1200, y: 650 }, { x: 1400, y: 750 }, { x: 1600, y: 850 }
      ],
      3: [ // Green Line - Upper horizontal express
        { x: 0, y: 200 }, { x: 230, y: 190 }, { x: 460, y: 195 }, { x: 690, y: 200 }, { x: 920, y: 205 }, 
        { x: 1150, y: 210 }, { x: 1380, y: 215 }, { x: 1600, y: 220 }
      ],
      4: [ // Orange Line - Central spine coast to coast
        { x: 0, y: 350 }, { x: 230, y: 345 }, { x: 460, y: 355 }, { x: 690, y: 350 }, { x: 920, y: 360 }, 
        { x: 1150, y: 355 }, { x: 1380, y: 365 }, { x: 1600, y: 370 }
      ],
      5: [ // Purple Line - Southern express corridor
        { x: 0, y: 600 }, { x: 200, y: 590 }, { x: 400, y: 595 }, { x: 600, y: 600 }, { x: 800, y: 605 }, 
        { x: 1000, y: 610 }, { x: 1200, y: 615 }, { x: 1400, y: 620 }, { x: 1600, y: 625 }
      ],
      6: [ // Teal Line - Bottom edge route
        { x: 0, y: 800 }, { x: 230, y: 790 }, { x: 460, y: 795 }, { x: 690, y: 800 }, { x: 920, y: 805 }, 
        { x: 1150, y: 810 }, { x: 1380, y: 815 }, { x: 1600, y: 820 }
      ],
      7: [ // Yellow Line - Western vertical spine
        { x: 200, y: 0 }, { x: 205, y: 125 }, { x: 210, y: 250 }, { x: 215, y: 375 }, { x: 220, y: 500 }, 
        { x: 225, y: 625 }, { x: 230, y: 750 }, { x: 235, y: 875 }, { x: 240, y: 1000 }
      ],
      8: [ // Pink Line - Central vertical axis
        { x: 800, y: 0 }, { x: 805, y: 125 }, { x: 810, y: 250 }, { x: 815, y: 375 }, { x: 820, y: 500 }, 
        { x: 825, y: 625 }, { x: 830, y: 750 }, { x: 835, y: 875 }, { x: 840, y: 1000 }
      ],
      9: [ // Cyan Line - Eastern vertical spine
        { x: 1400, y: 0 }, { x: 1405, y: 125 }, { x: 1410, y: 250 }, { x: 1415, y: 375 }, { x: 1420, y: 500 }, 
        { x: 1425, y: 625 }, { x: 1430, y: 750 }, { x: 1435, y: 875 }, { x: 1440, y: 1000 }
      ],
      10: [ // Brown Line - Cross diagonal northwest to southeast
        { x: 1600, y: 100 }, { x: 1400, y: 200 }, { x: 1200, y: 300 }, { x: 1000, y: 400 }, { x: 800, y: 500 }, 
        { x: 600, y: 600 }, { x: 400, y: 700 }, { x: 200, y: 800 }, { x: 0, y: 900 }
      ],
      11: [ // Lime Line - Large orbital ring
        { x: 300, y: 150 }, { x: 600, y: 100 }, { x: 900, y: 120 }, { x: 1200, y: 180 }, { x: 1400, y: 300 }, 
        { x: 1450, y: 500 }, { x: 1350, y: 700 }, { x: 1100, y: 850 }, { x: 800, y: 900 }, 
        { x: 500, y: 880 }, { x: 200, y: 750 }, { x: 100, y: 500 }, { x: 150, y: 300 }
      ],
      12: [ // Indigo Line - Figure-8 through center
        { x: 400, y: 200 }, { x: 600, y: 250 }, { x: 800, y: 300 }, { x: 1000, y: 350 }, { x: 1200, y: 400 },
        { x: 1000, y: 450 }, { x: 800, y: 500 }, { x: 600, y: 550 }, { x: 400, y: 600 },
        { x: 600, y: 650 }, { x: 800, y: 700 }, { x: 1000, y: 750 }, { x: 1200, y: 800 }
      ],
      13: [ // Violet Line - Complex curved route through all quadrants
        { x: 100, y: 250 }, { x: 300, y: 200 }, { x: 500, y: 180 }, { x: 700, y: 220 }, { x: 900, y: 280 },
        { x: 1100, y: 350 }, { x: 1300, y: 450 }, { x: 1500, y: 600 }, { x: 1400, y: 750 },
        { x: 1200, y: 850 }, { x: 1000, y: 900 }, { x: 800, y: 880 }, { x: 600, y: 820 },
        { x: 400, y: 750 }, { x: 200, y: 650 }, { x: 50, y: 500 }, { x: 80, y: 350 }
      ],
      14: [ // Gold Line - Mountain range pattern
        { x: 0, y: 160 }, { x: 200, y: 120 }, { x: 400, y: 180 }, { x: 600, y: 100 }, { x: 800, y: 190 }, 
        { x: 1000, y: 130 }, { x: 1200, y: 200 }, { x: 1400, y: 140 }, { x: 1600, y: 210 }
      ],
      15: [ // Silver Line - River meander
        { x: 100, y: 450 }, { x: 300, y: 470 }, { x: 500, y: 510 }, { x: 700, y: 530 }, { x: 900, y: 550 }, 
        { x: 1100, y: 580 }, { x: 1300, y: 610 }, { x: 1500, y: 640 }
      ],
      16: [ // Coral Line - Wave pattern along bottom
        { x: 0, y: 700 }, { x: 200, y: 720 }, { x: 400, y: 740 }, { x: 600, y: 760 }, { x: 800, y: 780 }, 
        { x: 1000, y: 760 }, { x: 1200, y: 740 }, { x: 1400, y: 720 }, { x: 1600, y: 700 }
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
        width="100%"
        height="100%"
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
        style={{ zIndex: 10 + routeIndex }}
      >
        {/* Create gradients and filters for aesthetic effects */}
        <defs>
          {(route.pattern === "gradient" && route.gradientEnd) && (
            <linearGradient id={`gradient-${route.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={route.color} />
              <stop offset="100%" stopColor={route.gradientEnd} />
            </linearGradient>
          )}
          {route.glowColor && (
            <filter id={`glow-${route.id}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/> 
              </feMerge>
            </filter>
          )}
        </defs>

        {/* Build stroke pattern based on line style */}
        {(() => {
          const getStrokePattern = () => {
            switch (route.lineStyle || "solid") {
              case "dashed": return "12,6";
              case "dotted": return "3,4";
              default: return undefined;
            }
          };

          const getAnimationClass = () => {
            switch (route.animation || "none") {
              case "flow": return "animate-pulse";
              case "pulse": return "animate-bounce";
              case "glow": return "animate-pulse";
              default: return isHighlighted ? "animate-pulse" : "";
            }
          };

          const strokeColor = (route.pattern === "gradient" && route.gradientEnd) 
            ? `url(#gradient-${route.id})` 
            : route.color;

          const lineWidth = route.lineWidth || 6;
          const opacity = route.opacity || (isHighlighted ? 1 : 0.9);

          return (
            <>
              {/* Shadow effect */}
              <polyline
                points={offsetPoints.map(p => `${p.x + 2},${p.y + 2}`).join(' ')}
                fill="none"
                stroke="rgba(0,0,0,0.3)"
                strokeWidth={isHighlighted ? lineWidth + 2 : lineWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Double line background effect */}
              {route.lineStyle === "double" && (
                <polyline
                  points={offsetPoints.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke={route.color}
                  strokeWidth={lineWidth + 4}
                  strokeOpacity={opacity * 0.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Main route line */}
              <polyline
                points={offsetPoints.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke={strokeColor}
                strokeWidth={lineWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={getStrokePattern()}
                className={getAnimationClass()}
                opacity={opacity}
                filter={route.glowColor ? `url(#glow-${route.id})` : undefined}
              />

              {/* Pattern overlays */}
              {route.pattern === "arrows" && offsetPoints.map((point, index) => {
                if (index === 0 || index % 4 !== 0) return null;
                const prevPoint = offsetPoints[index - 1];
                const angle = Math.atan2(point.y - prevPoint.y, point.x - prevPoint.x) * 180 / Math.PI;
                
                return (
                  <polygon
                    key={`arrow-${index}`}
                    points="0,0 -10,-4 -10,4"
                    fill={route.color}
                    opacity={opacity}
                    transform={`translate(${point.x}, ${point.y}) rotate(${angle})`}
                  />
                );
              })}

              {route.pattern === "dots" && offsetPoints.map((point, index) => {
                if (index % 6 !== 0) return null;
                return (
                  <circle
                    key={`dot-${index}`}
                    cx={point.x}
                    cy={point.y}
                    r="3"
                    fill={route.color}
                    opacity={opacity}
                  />
                );
              })}
            </>
          );
        })()}
        
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