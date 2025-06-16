import { type BusWithRoute } from "@shared/schema";
import { CSSProperties, memo } from "react";

interface BusIconProps {
  bus: BusWithRoute;
  style?: CSSProperties;
}

function BusIcon({ bus, style }: BusIconProps) {
  const getBusColor = (status: string) => {
    switch (status) {
      case "on_time": return "#22c55e"; // green-500
      case "delayed": return "#eab308"; // yellow-500
      case "alert": return "#22c55e"; // green-500 (show as active)
      case "active": return "#22c55e"; // green-500
      case "off-route": return "#dc2626"; // red-600 - deep red for off-route
      default: return "#22c55e";
    }
  };

  const isAlertBus = bus.status === "alert";

  return (
    <div
      className={`text-2xl transition-all duration-500 ${
        isAlertBus ? "animate-pulse" : ""
      }`}
      style={{
        ...style,
        color: getBusColor(bus.status),
        filter: isAlertBus 
          ? "drop-shadow(0 0 12px #ef4444) drop-shadow(0 0 20px #ef4444)" 
          : "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
        zIndex: 30
      }}
      title={`Bus ${bus.busNumber} - Route ${bus.route.routeNumber} - Direction: ${bus.direction || 'Unknown'} - Status: ${isAlertBus ? 'Active (with alerts)' : bus.status === 'active' ? 'Active' : bus.status}`}
    >
      🚌
    </div>
  );
}

const MemoizedBusIcon = memo(BusIcon);
export default MemoizedBusIcon;
