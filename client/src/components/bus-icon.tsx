import { type BusWithRoute, type AlertWithDetails } from "@shared/schema";
import { CSSProperties, memo } from "react";

interface BusIconProps {
  bus: BusWithRoute;
  style?: CSSProperties;
  alerts?: AlertWithDetails[];
}

function BusIcon({ bus, style, alerts = [] }: BusIconProps) {
  // Check if this bus has any active emergency alerts
  const busAlerts = alerts.filter(alert => alert.busId === bus.id && alert.isActive);
  const highestPriorityAlert = busAlerts.sort((a, b) => {
    const priorityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
    return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
           (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
  })[0];

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

  const getAlertColor = (priority: string) => {
    switch (priority) {
      case "critical": return "#dc2626"; // red-600
      case "high": return "#ea580c"; // orange-600
      case "medium": return "#eab308"; // yellow-500
      case "low": return "#3b82f6"; // blue-500
      default: return "#ef4444"; // red-500
    }
  };

  const isAlertBus = bus.status === "alert";
  const hasEmergencyAlert = highestPriorityAlert !== undefined;

  // Determine if bus should show off-route glow or emergency alert glow
  const showOffRouteGlow = bus.status === "off-route";
  const showEmergencyGlow = hasEmergencyAlert;

  // Priority: Emergency alerts override off-route glows
  const activeGlow = showEmergencyGlow ? "emergency" : showOffRouteGlow ? "off-route" : "none";

  const getGlowEffect = () => {
    if (activeGlow === "emergency" && highestPriorityAlert) {
      const color = getAlertColor(highestPriorityAlert.priority || "medium");
      return `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 16px ${color}) drop-shadow(0 0 24px ${color})`;
    } else if (activeGlow === "off-route") {
      return "drop-shadow(0 0 8px #1e40af) drop-shadow(0 0 16px #1e40af) drop-shadow(0 0 24px #1e40af)";
    }
    return "drop-shadow(0 1px 2px rgba(0,0,0,0.3))";
  };

  const shouldPulse = activeGlow !== "none";

  return (
    <div
      className={`text-2xl transition-all duration-500 ${
        shouldPulse ? "animate-pulse" : ""
      }`}
      style={{
        ...style,
        color: getBusColor(bus.status),
        filter: getGlowEffect(),
        zIndex: 30
      }}
      title={`Bus ${bus.busNumber} - Route ${bus.route.routeNumber} - Direction: ${bus.direction || 'Unknown'} - Status: ${
        hasEmergencyAlert ? `Emergency Alert (${highestPriorityAlert?.priority})` :
        bus.status === "off-route" ? "Off Route" :
        bus.status === "alert" ? "Active (with alerts)" : 
        bus.status === "active" ? "Active" : bus.status
      }`}
    >
      🚌
    </div>
  );
}

const MemoizedBusIcon = memo(BusIcon);
export default MemoizedBusIcon;
