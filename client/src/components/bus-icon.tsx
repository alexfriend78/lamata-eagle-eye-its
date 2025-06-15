import { type BusWithRoute } from "@shared/schema";
import { CSSProperties, useEffect, useState } from "react";

interface BusIconProps {
  bus: BusWithRoute;
  style?: CSSProperties;
}

export default function BusIcon({ bus, style }: BusIconProps) {
  const [animatedPosition, setAnimatedPosition] = useState({ x: bus.currentX, y: bus.currentY });

  useEffect(() => {
    const interval = setInterval(() => {
      // Get route path points for the bus's route
      const routePaths: Record<number, { x: number; y: number }[]> = {
        1: [ // Oshodi - Abule-Egba
          { x: 400, y: 300 }, { x: 380, y: 280 }, { x: 360, y: 260 }, { x: 340, y: 240 },
          { x: 320, y: 220 }, { x: 300, y: 200 }, { x: 280, y: 180 }, { x: 260, y: 160 },
          { x: 240, y: 140 }, { x: 220, y: 120 }, { x: 200, y: 100 }, { x: 180, y: 80 },
          { x: 160, y: 60 }, { x: 140, y: 40 }, { x: 120, y: 20 }, { x: 100, y: 10 }, { x: 80, y: 5 }
        ],
        2: [ // Abule Egba - TBS/Obalende
          { x: 80, y: 5 }, { x: 100, y: 10 }, { x: 120, y: 20 }, { x: 140, y: 40 },
          { x: 160, y: 60 }, { x: 180, y: 80 }, { x: 200, y: 100 }, { x: 220, y: 120 },
          { x: 240, y: 140 }, { x: 260, y: 160 }, { x: 280, y: 180 }, { x: 300, y: 200 },
          { x: 320, y: 220 }, { x: 340, y: 240 }, { x: 360, y: 260 }, { x: 380, y: 280 },
          { x: 400, y: 300 }, { x: 420, y: 350 }, { x: 580, y: 480 }, { x: 600, y: 500 }, { x: 650, y: 520 }
        ],
        3: [ // Ikorodu - TBS
          { x: 100, y: 600 }, { x: 200, y: 580 }, { x: 300, y: 500 }, { x: 350, y: 460 },
          { x: 400, y: 420 }, { x: 460, y: 380 }, { x: 500, y: 420 }, { x: 600, y: 500 }, { x: 650, y: 520 }
        ],
        4: [ // Ikorodu - Fadeyi
          { x: 100, y: 600 }, { x: 200, y: 580 }, { x: 300, y: 500 }, { x: 350, y: 460 },
          { x: 400, y: 420 }, { x: 460, y: 380 }, { x: 500, y: 420 }
        ],
        5: [ // Ikorodu - Oshodi
          { x: 100, y: 600 }, { x: 200, y: 580 }, { x: 300, y: 500 }, { x: 350, y: 460 },
          { x: 400, y: 420 }, { x: 420, y: 350 }, { x: 400, y: 300 }
        ]
      };

      const routePoints = routePaths[bus.routeId] || [];
      if (routePoints.length > 1) {
        // Find current position on route and move to next point
        const currentIndex = routePoints.findIndex(point => 
          Math.abs(point.x - animatedPosition.x) < 30 && Math.abs(point.y - animatedPosition.y) < 30
        );
        
        let nextIndex;
        if (bus.direction === "forward") {
          nextIndex = currentIndex < routePoints.length - 1 ? currentIndex + 1 : 0;
        } else {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : routePoints.length - 1;
        }
        
        if (nextIndex >= 0 && nextIndex < routePoints.length) {
          const nextPoint = routePoints[nextIndex];
          const speed = bus.status === "delayed" ? 0.5 : bus.status === "alert" ? 0.2 : 1;
          
          setAnimatedPosition(prev => ({
            x: prev.x + (nextPoint.x - prev.x) * 0.02 * speed,
            y: prev.y + (nextPoint.y - prev.y) * 0.02 * speed
          }));
        }
      }
    }, 100); // Update every 100ms for smooth animation

    return () => clearInterval(interval);
  }, [bus.routeId, bus.direction, bus.status, animatedPosition]);

  const getBusColor = (status: string) => {
    switch (status) {
      case "on_time": return "#22c55e"; // green-500
      case "delayed": return "#eab308"; // yellow-500
      case "alert": return "#ef4444"; // red-500
      default: return "#22c55e";
    }
  };

  const isAlertBus = bus.status === "alert";

  return (
    <div
      className={`text-2xl transition-all duration-100 ease-linear ${
        isAlertBus ? "animate-pulse" : ""
      }`}
      style={{
        ...style,
        transform: `translate(${animatedPosition.x - bus.currentX}px, ${animatedPosition.y - bus.currentY}px)`,
        color: getBusColor(bus.status),
        filter: isAlertBus ? "drop-shadow(0 0 8px currentColor)" : "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
        zIndex: 30
      }}
      title={`Bus ${bus.busNumber} - Route ${bus.route.routeNumber} - Status: ${bus.status}`}
    >
      🚌
    </div>
  );
}
