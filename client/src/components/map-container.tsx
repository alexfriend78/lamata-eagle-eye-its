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
    // Define comprehensive routes using full 3456x2234 resolution with complete coverage
    const routePaths: Record<number, { x: number; y: number }[]> = {
      1: [ // Blue Line - Ultra-wide northern express corridor
        { x: 0, y: 200 }, { x: 432, y: 180 }, { x: 864, y: 185 }, { x: 1296, y: 190 }, { x: 1728, y: 195 }, 
        { x: 2160, y: 200 }, { x: 2592, y: 205 }, { x: 3024, y: 210 }, { x: 3456, y: 215 }
      ],
      2: [ // Red Line - Full diagonal transcontinental
        { x: 0, y: 100 }, { x: 432, y: 320 }, { x: 864, y: 540 }, { x: 1296, y: 760 }, { x: 1728, y: 980 }, 
        { x: 2160, y: 1200 }, { x: 2592, y: 1420 }, { x: 3024, y: 1640 }, { x: 3456, y: 1860 }
      ],
      3: [ // Green Line - Mid-latitude express spine
        { x: 0, y: 450 }, { x: 345, y: 440 }, { x: 690, y: 445 }, { x: 1035, y: 450 }, { x: 1380, y: 455 }, 
        { x: 1725, y: 460 }, { x: 2070, y: 465 }, { x: 2415, y: 470 }, { x: 2760, y: 475 }, { x: 3105, y: 480 }, { x: 3456, y: 485 }
      ],
      4: [ // Orange Line - Continental central backbone
        { x: 0, y: 800 }, { x: 384, y: 790 }, { x: 768, y: 810 }, { x: 1152, y: 800 }, { x: 1536, y: 820 }, 
        { x: 1920, y: 810 }, { x: 2304, y: 830 }, { x: 2688, y: 820 }, { x: 3072, y: 840 }, { x: 3456, y: 830 }
      ],
      5: [ // Purple Line - Southern mega-corridor (stable)
        { x: 0, y: 1400 }, { x: 432, y: 1400 }, { x: 864, y: 1400 }, { x: 1296, y: 1400 }, { x: 1728, y: 1400 }, 
        { x: 2160, y: 1400 }, { x: 2592, y: 1400 }, { x: 3024, y: 1400 }, { x: 3456, y: 1400 }
      ],
      6: [ // Teal Line - Coastal ultra-route
        { x: 0, y: 1800 }, { x: 345, y: 1790 }, { x: 690, y: 1795 }, { x: 1035, y: 1800 }, { x: 1380, y: 1805 }, 
        { x: 1725, y: 1810 }, { x: 2070, y: 1815 }, { x: 2415, y: 1820 }, { x: 2760, y: 1825 }, { x: 3105, y: 1830 }, { x: 3456, y: 1835 }
      ],
      7: [ // Yellow Line - Western mega-spine (full height)
        { x: 430, y: 0 }, { x: 435, y: 279 }, { x: 440, y: 558 }, { x: 445, y: 837 }, { x: 450, y: 1116 }, 
        { x: 455, y: 1395 }, { x: 460, y: 1674 }, { x: 465, y: 1953 }, { x: 470, y: 2234 }
      ],
      8: [ // Pink Line - Central ultra-axis (full height)
        { x: 1728, y: 0 }, { x: 1733, y: 248 }, { x: 1738, y: 496 }, { x: 1743, y: 744 }, { x: 1748, y: 992 }, 
        { x: 1753, y: 1240 }, { x: 1758, y: 1488 }, { x: 1763, y: 1736 }, { x: 1768, y: 1984 }, { x: 1773, y: 2234 }
      ],
      9: [ // Cyan Line - Eastern mega-spine (full height)  
        { x: 3000, y: 0 }, { x: 3005, y: 279 }, { x: 3010, y: 558 }, { x: 3015, y: 837 }, { x: 3020, y: 1116 }, 
        { x: 3025, y: 1395 }, { x: 3030, y: 1674 }, { x: 3035, y: 1953 }, { x: 3040, y: 2234 }
      ],
      10: [ // Brown Line - Ultra diagonal (northwest to southeast)
        { x: 3456, y: 200 }, { x: 3024, y: 450 }, { x: 2592, y: 700 }, { x: 2160, y: 950 }, { x: 1728, y: 1200 }, 
        { x: 1296, y: 1450 }, { x: 864, y: 1700 }, { x: 432, y: 1950 }, { x: 0, y: 2200 }
      ],
      11: [ // Lime Line - Continental orbital ring (stable)
        { x: 600, y: 300 }, { x: 1200, y: 250 }, { x: 1800, y: 300 }, { x: 2400, y: 400 }, { x: 2800, y: 600 }, 
        { x: 3000, y: 900 }, { x: 2800, y: 1200 }, { x: 2400, y: 1400 }, { x: 1800, y: 1500 }, 
        { x: 1200, y: 1450 }, { x: 600, y: 1350 }, { x: 400, y: 1050 }, { x: 500, y: 650 }
      ],
      12: [ // Indigo Line - Continental figure-8 pattern
        { x: 864, y: 450 }, { x: 1296, y: 600 }, { x: 1728, y: 750 }, { x: 2160, y: 900 }, { x: 2592, y: 1050 },
        { x: 2160, y: 1200 }, { x: 1728, y: 1350 }, { x: 1296, y: 1500 }, { x: 864, y: 1650 },
        { x: 1296, y: 1800 }, { x: 1728, y: 1950 }, { x: 2160, y: 2100 }, { x: 2592, y: 2234 }
      ],
      13: [ // Violet Line - Stable curved route
        { x: 300, y: 600 }, { x: 700, y: 550 }, { x: 1100, y: 520 }, { x: 1500, y: 550 }, { x: 1900, y: 600 },
        { x: 2300, y: 700 }, { x: 2700, y: 850 }, { x: 3000, y: 1050 }, { x: 2800, y: 1300 },
        { x: 2400, y: 1500 }, { x: 2000, y: 1600 }, { x: 1600, y: 1550 }, { x: 1200, y: 1450 },
        { x: 800, y: 1300 }, { x: 500, y: 1100 }, { x: 300, y: 850 }
      ],
      14: [ // Gold Line - Continental mountain range
        { x: 0, y: 350 }, { x: 432, y: 250 }, { x: 864, y: 400 }, { x: 1296, y: 200 }, { x: 1728, y: 450 }, 
        { x: 2160, y: 300 }, { x: 2592, y: 500 }, { x: 3024, y: 350 }, { x: 3456, y: 550 }
      ],
      15: [ // Silver Line - Continental river meander
        { x: 250, y: 1000 }, { x: 650, y: 1050 }, { x: 1050, y: 1150 }, { x: 1450, y: 1200 }, { x: 1850, y: 1250 }, 
        { x: 2250, y: 1350 }, { x: 2650, y: 1400 }, { x: 3050, y: 1500 }, { x: 3400, y: 1550 }
      ],
      16: [ // Coral Line - Stable wave formation
        { x: 0, y: 1700 }, { x: 432, y: 1700 }, { x: 864, y: 1700 }, { x: 1296, y: 1700 }, { x: 1728, y: 1700 }, 
        { x: 2160, y: 1700 }, { x: 2592, y: 1700 }, { x: 3024, y: 1700 }, { x: 3456, y: 1700 }
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
    // Only render if route is selected or no specific routes are selected
    if (selectedRoutes.length > 0 && !selectedRoutes.includes(route.id)) {
      return null;
    }

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
        viewBox="0 0 3456 2234"
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