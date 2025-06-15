
import { type BusWithRoute, type Route, type Station } from "@shared/schema";
import BusIcon from "./bus-icon";
import { useRouteStations } from "@/hooks/use-route-stations";

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
  showRoutes: boolean;
  showStations: boolean;
  showBuses: boolean;
}

export default function MapContainer({ buses, routes, stations, selectedRoutes, theme, selectedZone, onZoneSelect, showMap, showStationNames, onStationClick, onStationHover, onBusHover, showLiveFeed, showRoutes, showStations, showBuses }: MapContainerProps) {
  // Dynamic screen dimensions accounting for header
  const mapWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const mapHeight = typeof window !== 'undefined' ? window.innerHeight - 64 : 1016; // Subtract header height
  
  // Fetch stations for selected routes
  const { data: routeStations = [] } = useRouteStations(selectedRoutes);

  const getRoutePoints = (routeId: number) => {
    // Fixed coordinates to prevent oscillation - no dynamic calculations
    const routePaths: Record<number, { x: number; y: number }[]> = {
      1: [ // Route 1: Oshodi - Abule-Egba (North-South line)
        { x: 400, y: 360 }, // Oshodi Terminal 2
        { x: 384, y: 348 }, // Bolade
        { x: 368, y: 336 }, // Ladipo
        { x: 352, y: 324 }, // Shogunle
        { x: 336, y: 312 }, // PWD
        { x: 320, y: 300 }, // Airport Junction
        { x: 304, y: 288 }, // Ikeja Along
        { x: 288, y: 276 }, // Ile Zik
        { x: 272, y: 264 }, // Mangoro
        { x: 256, y: 252 }, // Cement
        { x: 240, y: 240 }, // Iyana Dopemu
        { x: 224, y: 228 }, // Adealu
        { x: 208, y: 216 }, // Iyana Ipaja Bus stop
        { x: 192, y: 204 }, // Pleasure
        { x: 176, y: 192 }, // Ile Epo
        { x: 160, y: 180 }, // Super
        { x: 144, y: 168 }  // Abule Egba
      ],
      2: [ // Route 2: Abule Egba - TBS/Obalende (Full north-south-central)
        { x: 144, y: 168 }, // Abule Egba
        { x: 160, y: 180 }, // Super
        { x: 176, y: 192 }, // Ile Epo
        { x: 192, y: 204 }, // Pleasure
        { x: 208, y: 216 }, // Iyana Ipaja Bus stop
        { x: 224, y: 228 }, // Adealu
        { x: 240, y: 240 }, // Iyana Dopemu
        { x: 256, y: 252 }, // Cement
        { x: 272, y: 264 }, // Mangoro
        { x: 288, y: 276 }, // Ile Zik
        { x: 304, y: 288 }, // Ikeja Along
        { x: 320, y: 300 }, // Airport Junction
        { x: 336, y: 312 }, // PWD
        { x: 352, y: 324 }, // Shogunle
        { x: 368, y: 336 }, // Ladipo
        { x: 384, y: 348 }, // Bolade
        { x: 400, y: 360 }, // Oshodi Terminal 2
        { x: 416, y: 372 }, // LASMA
        { x: 432, y: 384 }, // Anthony
        { x: 448, y: 396 }, // Westex
        { x: 464, y: 408 }, // First Pedro
        { x: 480, y: 420 }, // Charley Boy
        { x: 496, y: 432 }, // Gbagada Phase 1
        { x: 512, y: 444 }, // Iyana Oworo
        { x: 528, y: 456 }, // Adeniji
        { x: 544, y: 468 }, // Obalende
        { x: 560, y: 480 }  // CMS Terminal
      ],
      3: [ // Route 3: Ikorodu - TBS (Southwest to Central)
        { x: 120, y: 510 }, // Ikorodu Terminal
        { x: 136, y: 498 }, // Benson
        { x: 152, y: 486 }, // ARUNA
        { x: 168, y: 474 }, // AGRIC TERMINAL
        { x: 184, y: 462 }, // OWUTU IDIROKO
        { x: 200, y: 450 }, // OGOLONTO
        { x: 216, y: 438 }, // MAJIDUN AWORI
        { x: 232, y: 426 }, // AJEGUNLE
        { x: 248, y: 414 }, // IRAWO
        { x: 264, y: 402 }, // IDERA
        { x: 280, y: 390 }, // OWODEONIRIN
        { x: 296, y: 378 }, // MILE12 TERMINAL
        { x: 312, y: 366 }, // KETU
        { x: 328, y: 354 }, // OJOTA
        { x: 344, y: 342 }, // NEWGARAGE
        { x: 360, y: 330 }, // Maryland
        { x: 376, y: 318 }, // Idiroko
        { x: 392, y: 306 }, // Anthony
        { x: 408, y: 294 }, // Obanikoro
        { x: 424, y: 282 }, // Palmgroove
        { x: 440, y: 270 }, // Onipanu
        { x: 456, y: 258 }, // Fadeyi
        { x: 472, y: 246 }, // MOSALASI TERMINAL
        { x: 488, y: 234 }, // BARRAKS
        { x: 504, y: 222 }, // Stadium
        { x: 520, y: 210 }, // Iponri
        { x: 536, y: 198 }, // Costain
        { x: 552, y: 186 }, // Leventis
        { x: 568, y: 174 }, // CMS Terminal
        { x: 584, y: 162 }, // MARINA TRAIN STATION
        { x: 600, y: 150 }  // TBS Terminal
      ],
      4: [ // Route 4: Ikorodu - Fadeyi (Southwest to Mid-Central)
        { x: 120, y: 510 }, // Ikorodu Terminal
        { x: 136, y: 498 }, // Benson
        { x: 152, y: 486 }, // ARUNA
        { x: 168, y: 474 }, // AGRIC TERMINAL
        { x: 184, y: 462 }, // OWUTU IDIROKO
        { x: 200, y: 450 }, // OGOLONTO
        { x: 216, y: 438 }, // MAJIDUN AWORI
        { x: 232, y: 426 }, // AJEGUNLE
        { x: 248, y: 414 }, // IRAWO
        { x: 264, y: 402 }, // IDERA
        { x: 280, y: 390 }, // OWODEONIRIN
        { x: 296, y: 378 }, // MILE12 TERMINAL
        { x: 312, y: 366 }, // KETU
        { x: 328, y: 354 }, // OJOTA
        { x: 344, y: 342 }, // NEWGARAGE
        { x: 360, y: 330 }, // Maryland
        { x: 376, y: 318 }, // Idiroko
        { x: 392, y: 306 }, // Anthony
        { x: 408, y: 294 }, // Obanikoro
        { x: 424, y: 282 }, // Palmgroove
        { x: 440, y: 270 }, // Onipanu
        { x: 456, y: 258 }  // Fadeyi
      ],
      5: [ // Route 5: Ikorodu - Oshodi (Southwest to Central)
        { x: 120, y: 510 }, // Ikorodu Terminal
        { x: 136, y: 498 }, // Benson
        { x: 152, y: 486 }, // ARUNA
        { x: 168, y: 474 }, // AGRIC TERMINAL
        { x: 184, y: 462 }, // OWUTU IDIROKO
        { x: 200, y: 450 }, // OGOLONTO
        { x: 216, y: 438 }, // MAJIDUN AWORI
        { x: 232, y: 426 }, // AJEGUNLE
        { x: 248, y: 414 }, // IRAWO
        { x: 264, y: 402 }, // IDERA
        { x: 280, y: 390 }, // OWODEONIRIN
        { x: 296, y: 378 }, // MILE12 TERMINAL
        { x: 312, y: 366 }, // KETU
        { x: 328, y: 354 }, // OJOTA
        { x: 344, y: 342 }, // NEWGARAGE
        { x: 360, y: 330 }, // Maryland
        { x: 376, y: 318 }, // Anthony
        { x: 400, y: 360 }  // Oshodi Terminal 2
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

  const renderRouteLine = (route: Route) => {
    // Only render if route is selected or no specific routes are selected
    if (selectedRoutes.length > 0 && !selectedRoutes.includes(route.id)) {
      return null;
    }

    const points = getRoutePoints(route.id);
    const isHighlighted = selectedRoutes.includes(route.id);
    
    if (points.length < 2) return null;

    // No offset calculations to prevent any movement/oscillation
    const offsetPoints = points;

    return (
      <svg
        key={route.id}
        className="absolute inset-0 pointer-events-none"
        width="100%"
        height="100%"
        viewBox={`0 0 ${mapWidth} ${mapHeight}`}
        preserveAspectRatio="xMidYMid slice"
        style={{ zIndex: 10 + route.id }}
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
        {showRoutes && routes
          .filter(route => selectedRoutes.length === 0 || selectedRoutes.includes(route.id))
          .map((route) => renderRouteLine(route))}

        {/* Major Interchange Stations - London Underground style */}
        {(() => {
          const interchanges = [
            // Oshodi - Major central hub connecting Routes 1, 2, and 5
            { x: mapWidth * 0.50, y: mapHeight * 0.60, routes: [1, 2, 5], name: "Oshodi Terminal" },
            // Anthony - Key interchange for Routes 2, 3, 4, and 5
            { x: mapWidth * 0.49, y: mapHeight * 0.51, routes: [2, 3, 4, 5], name: "Anthony" },
            // Abule Egba - Northern terminus for Routes 1 and 2
            { x: mapWidth * 0.18, y: mapHeight * 0.28, routes: [1, 2], name: "Abule Egba" },
            // Ikorodu - Southern terminus for Routes 3, 4, and 5
            { x: mapWidth * 0.15, y: mapHeight * 0.85, routes: [3, 4, 5], name: "Ikorodu Terminal" },
            // Fadeyi - Connection point for Routes 3 and 4
            { x: mapWidth * 0.57, y: mapHeight * 0.43, routes: [3, 4], name: "Fadeyi" },
            // Maryland - Shared station for Routes 3, 4, and 5
            { x: mapWidth * 0.45, y: mapHeight * 0.55, routes: [3, 4, 5], name: "Maryland" },
            // Ikeja Along - Airport connection on Routes 1 and 2
            { x: mapWidth * 0.38, y: mapHeight * 0.48, routes: [1, 2], name: "Ikeja Along" }
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
        
        {/* Bus Stations - only show if stations visibility is enabled */}
        {showStations && (() => {
          // Show all stations if no routes are selected
          if (selectedRoutes.length === 0) return stations;
          
          // Show only stations that belong to selected routes
          if (routeStations.length > 0) {
            const routeStationIds = new Set(routeStations.map(rs => rs.id));
            return stations.filter(station => routeStationIds.has(station.id));
          }
          
          // Fallback: show all stations if route stations are still loading
          return stations;
        })().map((station) => {
          const stationPixelX = station.x * mapWidth;
          const stationPixelY = station.y * mapHeight;
          
          return (
            <div 
              key={station.id}
              className="absolute z-20 cursor-pointer"
              style={{ 
                top: `${stationPixelY - 8}px`, 
                left: `${stationPixelX - 8}px` 
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
          );
        })}

        {/* Bus Icons with Animations - only show if buses visibility is enabled */}
        {showBuses && buses
          .filter(bus => selectedRoutes.length === 0 || selectedRoutes.includes(bus.routeId))
          .map((bus) => (
            <div
              key={bus.id}
              style={{
                position: 'absolute',
                top: `${(bus.currentY * mapHeight) - 12}px`,
                left: `${(bus.currentX * mapWidth) - 12}px`,
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