import { type BusWithRoute, type Route, type Station } from "@shared/schema";
import BusIcon from "./bus-icon";

interface MapContainerProps {
  buses: BusWithRoute[];
  routes: Route[];
  stations: Station[];
}

export default function MapContainer({ buses, routes, stations }: MapContainerProps) {
  return (
    <div className="bus-monitor-surface rounded-xl p-6 h-full relative">
      <h2 className="text-lg font-semibold mb-4">Central London Routes</h2>
      
      {/* Route Network Visualization */}
      <div className="relative w-full h-full grid-background overflow-hidden">
        
        {/* Major Stations */}
        {stations.map((station) => (
          <div 
            key={station.id}
            className="absolute"
            style={{ 
              top: `${station.y}px`, 
              left: `${station.x}px` 
            }}
          >
            <div className="station-dot"></div>
            <span className="text-xs text-gray-400 ml-3 whitespace-nowrap">
              {station.name}
            </span>
          </div>
        ))}

        {/* Route Lines */}
        {/* Route 8: Horizontal from Paddington to Liverpool St */}
        <div className="absolute route-line" style={{ top: '128px', left: '96px', width: '384px' }}></div>
        
        {/* Route 25: Diagonal route */}
        <div className="absolute route-diagonal" style={{ top: '160px', left: '128px', width: '320px', transform: 'rotate(12deg)' }}></div>
        
        {/* Route 73: Vertical route */}
        <div className="absolute route-vertical" style={{ top: '80px', left: '320px', height: '160px' }}></div>
        
        {/* Route 205: Curved route simulation */}
        <div className="absolute route-line" style={{ top: '240px', left: '160px', width: '288px', transform: 'rotate(-6deg)' }}></div>

        {/* Bus Icons with Animations */}
        {buses.map((bus) => (
          <BusIcon
            key={bus.id}
            bus={bus}
            style={{
              position: 'absolute',
              top: `${bus.currentY}px`,
              left: `${bus.currentX}px`
            }}
          />
        ))}

        {/* Route Labels */}
        {routes.map((route, index) => {
          const positions = [
            { top: '96px', left: '128px' },
            { top: '128px', left: '192px' },
            { top: '48px', left: '288px' },
            { top: '208px', left: '208px' }
          ];
          const position = positions[index] || positions[0];
          
          return (
            <div 
              key={route.id}
              className="absolute text-xs bg-blue-600 px-2 py-1 rounded"
              style={position}
            >
              Route {route.routeNumber}
            </div>
          );
        })}
      </div>
    </div>
  );
}
