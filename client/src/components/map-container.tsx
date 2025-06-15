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
  // Dynamic screen dimensions accounting for header
  const mapWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const mapHeight = typeof window !== 'undefined' ? window.innerHeight - 64 : 1016; // Subtract header height

  const getRoutePoints = (routeId: number) => {
    // Define routes using dynamic resolution for consistent coverage
    const routePaths: Record<number, { x: number; y: number }[]> = {
      1: [ // Northern Line - Main north-south spine
        { x: mapWidth * 0.4, y: 0 }, { x: mapWidth * 0.42, y: mapHeight * 0.2 }, 
        { x: mapWidth * 0.44, y: mapHeight * 0.4 }, { x: mapWidth * 0.46, y: mapHeight * 0.6 }, 
        { x: mapWidth * 0.48, y: mapHeight * 0.8 }, { x: mapWidth * 0.5, y: mapHeight }
      ],
      2: [ // Central Line - Main east-west artery
        { x: 0, y: mapHeight * 0.5 }, { x: mapWidth * 0.2, y: mapHeight * 0.48 }, 
        { x: mapWidth * 0.4, y: mapHeight * 0.5 }, { x: mapWidth * 0.6, y: mapHeight * 0.52 }, 
        { x: mapWidth * 0.8, y: mapHeight * 0.5 }, { x: mapWidth, y: mapHeight * 0.52 }
      ],
      3: [ // Circle Line - Inner ring
        { x: mapWidth * 0.35, y: mapHeight * 0.25 }, { x: mapWidth * 0.6, y: mapHeight * 0.3 }, 
        { x: mapWidth * 0.7, y: mapHeight * 0.5 }, { x: mapWidth * 0.6, y: mapHeight * 0.7 }, 
        { x: mapWidth * 0.35, y: mapHeight * 0.75 }, { x: mapWidth * 0.25, y: mapHeight * 0.5 }
      ],
      4: [ // District Line - Southern cross-city
        { x: 0, y: mapHeight * 0.75 }, { x: mapWidth * 0.25, y: mapHeight * 0.74 }, 
        { x: mapWidth * 0.5, y: mapHeight * 0.75 }, { x: mapWidth * 0.75, y: mapHeight * 0.76 }, 
        { x: mapWidth, y: mapHeight * 0.75 }
      ],
      5: [ // Piccadilly Line - Northwest diagonal
        { x: 0, y: mapHeight * 0.2 }, { x: mapWidth * 0.2, y: mapHeight * 0.3 }, 
        { x: mapWidth * 0.4, y: mapHeight * 0.4 }, { x: mapWidth * 0.6, y: mapHeight * 0.5 }, 
        { x: mapWidth * 0.8, y: mapHeight * 0.6 }
      ],
      6: [ // Metropolitan Line - Northern express
        { x: 0, y: mapHeight * 0.3 }, { x: mapWidth * 0.25, y: mapHeight * 0.25 }, 
        { x: mapWidth * 0.5, y: mapHeight * 0.2 }, { x: mapWidth * 0.75, y: mapHeight * 0.15 }, 
        { x: mapWidth, y: mapHeight * 0.1 }
      ],
      7: [ // Jubilee Line - Southeast curve
        { x: mapWidth * 0.3, y: mapHeight * 0.6 }, { x: mapWidth * 0.45, y: mapHeight * 0.65 }, 
        { x: mapWidth * 0.6, y: mapHeight * 0.7 }, { x: mapWidth * 0.75, y: mapHeight * 0.75 }, 
        { x: mapWidth * 0.9, y: mapHeight * 0.8 }
      ],
      8: [ // Victoria Line - Express north-south
        { x: mapWidth * 0.6, y: 0 }, { x: mapWidth * 0.61, y: mapHeight * 0.25 }, 
        { x: mapWidth * 0.62, y: mapHeight * 0.5 }, { x: mapWidth * 0.63, y: mapHeight * 0.75 }, 
        { x: mapWidth * 0.64, y: mapHeight }
      ],
      9: [ // Waterloo & City - Short connector
        { x: mapWidth * 0.5, y: mapHeight * 0.48 }, { x: mapWidth * 0.55, y: mapHeight * 0.49 }, 
        { x: mapWidth * 0.6, y: mapHeight * 0.51 }, { x: mapWidth * 0.65, y: mapHeight * 0.52 }
      ],
      10: [ // Hammersmith & City - Western branch
        { x: 0, y: mapHeight * 0.4 }, { x: mapWidth * 0.2, y: mapHeight * 0.39 }, 
        { x: mapWidth * 0.4, y: mapHeight * 0.4 }, { x: mapWidth * 0.6, y: mapHeight * 0.41 }, 
        { x: mapWidth * 0.8, y: mapHeight * 0.4 }
      ],
      11: [ // Bakerloo Line - Southwest diagonal
        { x: mapWidth * 0.15, y: mapHeight * 0.2 }, { x: mapWidth * 0.3, y: mapHeight * 0.35 }, 
        { x: mapWidth * 0.45, y: mapHeight * 0.5 }, { x: mapWidth * 0.6, y: mapHeight * 0.65 }, 
        { x: mapWidth * 0.75, y: mapHeight * 0.8 }
      ],
      12: [ // DLR - Eastern branch network
        { x: mapWidth * 0.7, y: mapHeight * 0.4 }, { x: mapWidth * 0.75, y: mapHeight * 0.42 }, 
        { x: mapWidth * 0.8, y: mapHeight * 0.45 }, { x: mapWidth * 0.9, y: mapHeight * 0.48 }, 
        { x: mapWidth, y: mapHeight * 0.5 }
      ],
      13: [ // Elizabeth Line - East-west express
        { x: 0, y: mapHeight * 0.6 }, { x: mapWidth * 0.2, y: mapHeight * 0.59 }, 
        { x: mapWidth * 0.4, y: mapHeight * 0.6 }, { x: mapWidth * 0.6, y: mapHeight * 0.61 }, 
        { x: mapWidth * 0.8, y: mapHeight * 0.6 }, { x: mapWidth, y: mapHeight * 0.61 }
      ],
      14: [ // GO Transit Outer Ring - Suburban orbital
        { x: mapWidth * 0.1, y: mapHeight * 0.1 }, { x: mapWidth * 0.4, y: mapHeight * 0.05 }, 
        { x: mapWidth * 0.7, y: mapHeight * 0.1 }, { x: mapWidth * 0.9, y: mapHeight * 0.3 }, 
        { x: mapWidth * 0.95, y: mapHeight * 0.6 }, { x: mapWidth * 0.9, y: mapHeight * 0.9 }, 
        { x: mapWidth * 0.6, y: mapHeight * 0.95 }, { x: mapWidth * 0.3, y: mapHeight * 0.9 }, 
        { x: mapWidth * 0.05, y: mapHeight * 0.6 }, { x: mapWidth * 0.1, y: mapHeight * 0.3 }
      ],
      15: [ // GO Transit Radial - Airport express
        { x: mapWidth * 0.5, y: mapHeight * 0.5 }, { x: mapWidth * 0.65, y: mapHeight * 0.35 }, 
        { x: mapWidth * 0.8, y: mapHeight * 0.2 }, { x: mapWidth * 0.95, y: mapHeight * 0.05 }
      ],
      16: [ // Overground - Orbital connector
        { x: mapWidth * 0.2, y: mapHeight * 0.5 }, { x: mapWidth * 0.25, y: mapHeight * 0.35 }, 
        { x: mapWidth * 0.35, y: mapHeight * 0.25 }, { x: mapWidth * 0.5, y: mapHeight * 0.2 }, 
        { x: mapWidth * 0.65, y: mapHeight * 0.25 }, { x: mapWidth * 0.75, y: mapHeight * 0.35 }, 
        { x: mapWidth * 0.8, y: mapHeight * 0.5 }, { x: mapWidth * 0.75, y: mapHeight * 0.65 }, 
        { x: mapWidth * 0.65, y: mapHeight * 0.75 }, { x: mapWidth * 0.5, y: mapHeight * 0.8 }, 
        { x: mapWidth * 0.35, y: mapHeight * 0.75 }, { x: mapWidth * 0.25, y: mapHeight * 0.65 }
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
    <div className="relative w-full h-full overflow-hidden bg-white dark:bg-gray-900"
         style={{ minWidth: mapWidth, minHeight: mapHeight }}>
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
          width: `${mapWidth}px`,
          height: `${mapHeight}px`,
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
          width={mapWidth}
          height={mapHeight}
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

        {/* Major Interchange Stations - London Underground style */}
        {(() => {
          const interchanges = [
            // King's Cross / St. Pancras equivalent - Major north-south hub
            { x: mapWidth * 0.42, y: mapHeight * 0.4, routes: [1, 2, 8, 10], name: "Lagos Central" },
            // Oxford Circus equivalent - Central interchange  
            { x: mapWidth * 0.5, y: mapHeight * 0.5, routes: [2, 8, 13], name: "Victoria Island Hub" },
            // Liverpool Street equivalent - Eastern interchange
            { x: mapWidth * 0.7, y: mapHeight * 0.45, routes: [2, 5, 12], name: "Mainland Terminal" },
            // Waterloo equivalent - Southern hub
            { x: mapWidth * 0.45, y: mapHeight * 0.7, routes: [3, 4, 7], name: "Ikorodu Interchange" },
            // Paddington equivalent - Western terminus
            { x: mapWidth * 0.2, y: mapHeight * 0.4, routes: [2, 6, 10, 11], name: "Ikeja Gateway" },
            // Bank/Monument equivalent - Financial district
            { x: mapWidth * 0.6, y: mapHeight * 0.55, routes: [2, 8, 9, 13], name: "Business District" },
            // Circle Line connections
            { x: mapWidth * 0.35, y: mapHeight * 0.25, routes: [3, 6], name: "Northern Gate" },
            { x: mapWidth * 0.7, y: mapHeight * 0.5, routes: [3, 12], name: "Eastern Cross" },
            { x: mapWidth * 0.5, y: mapHeight * 0.75, routes: [3, 4], name: "Southern Bridge" },
            { x: mapWidth * 0.3, y: mapHeight * 0.45, routes: [1, 3, 10], name: "Western Junction" }
          ];

          return interchanges
            .filter(interchange => {
              // Show only if at least one route is selected or no routes selected
              if (selectedRoutes.length === 0) return true;
              return interchange.routes.some(routeId => selectedRoutes.includes(routeId));
            })
            .map((interchange, index) => (
              <div
                key={`interchange-${index}`}
                className="absolute z-30"
                style={{
                  left: `${interchange.x - 8}px`,
                  top: `${interchange.y - 8}px`,
                }}
              >
                {/* Interchange circle */}
                <div className={`w-4 h-4 rounded-full border-3 ${
                  theme === 'dark' 
                    ? 'bg-white border-gray-900 shadow-lg' 
                    : 'bg-gray-900 border-white shadow-lg'
                }`} />
                
                {/* Route count indicator */}
                <div 
                  className={`absolute -top-1 -right-1 w-3 h-3 rounded-full text-xs flex items-center justify-center ${
                    theme === 'dark' 
                      ? 'bg-blue-400 text-white' 
                      : 'bg-blue-600 text-white'
                  }`}
                  style={{ fontSize: '8px' }}
                >
                  {interchange.routes.filter(routeId => 
                    selectedRoutes.length === 0 || selectedRoutes.includes(routeId)
                  ).length}
                </div>

                {/* Station name on hover */}
                <div 
                  className={`absolute top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity ${
                    theme === 'dark' 
                      ? 'bg-gray-800 text-white border border-gray-600' 
                      : 'bg-white text-gray-900 border border-gray-300'
                  }`}
                  style={{
                    whiteSpace: 'nowrap',
                    fontSize: '9px',
                    filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.3))'
                  }}
                >
                  {interchange.name}
                </div>
              </div>
            ));
        })()}
        
        {/* Bus Stations - only for selected routes or all if none selected */}
        {stations.filter(station => {
          // Show all stations if no routes are selected
          if (selectedRoutes.length === 0) return true;
          // Show station if it belongs to any selected route (simplified - in real app would have route-station mapping)
          return selectedRoutes.length > 0;
        }).map((station) => (
          <div 
            key={station.id}
            className="absolute z-20 cursor-pointer"
            style={{ 
              top: `${station.y - 8}px`, 
              left: `${station.x - 8}px` 
            }}
            onClick={() => onStationClick && onStationClick(station)}
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