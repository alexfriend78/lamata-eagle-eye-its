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
      case "alert": return "#ef4444"; // red-500
      default: return "#22c55e";
    }
  };

  const isAlertBus = bus.status === "alert";

  return (
    <div
      className={`text-2xl transition-all duration-1000 ease-linear ${
        isAlertBus ? "animate-pulse" : ""
      }`}
      style={{
        ...style,
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

const MemoizedBusIcon = memo(BusIcon);
export default MemoizedBusIcon;
