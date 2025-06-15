import { type BusWithRoute } from "@shared/schema";
import { CSSProperties } from "react";

interface BusIconProps {
  bus: BusWithRoute;
  style?: CSSProperties;
}

export default function BusIcon({ bus, style }: BusIconProps) {
  const getBusColor = (status: string) => {
    switch (status) {
      case "on_time": return "var(--bus-on-time)";
      case "delayed": return "var(--bus-delayed)";
      case "alert": return "var(--bus-alert)";
      default: return "var(--bus-on-time)";
    }
  };

  const getAnimationClass = (routeId: number, direction: string) => {
    const animations = [
      direction === "forward" ? "bus-animation-horizontal" : "bus-animation-reverse",
      "bus-animation-diagonal",
      "bus-animation-vertical",
      direction === "forward" ? "bus-animation-reverse" : "bus-animation-horizontal"
    ];
    
    return animations[(routeId - 1) % animations.length];
  };

  const isAlertBus = bus.status === "alert";

  return (
    <div
      className={`text-2xl ${getAnimationClass(bus.routeId, bus.direction)} ${
        isAlertBus ? "bus-alert-pulse" : ""
      }`}
      style={{
        ...style,
        color: getBusColor(bus.status),
        filter: isAlertBus ? "drop-shadow(0 0 8px currentColor)" : "none"
      }}
      title={`Bus ${bus.busNumber} - Route ${bus.route.routeNumber} - Status: ${bus.status}`}
    >
      🚌
    </div>
  );
}
