import { type BusWithRoute, type AlertWithDetails } from "@shared/schema";
import { CSSProperties, memo } from "react";

interface BusIconProps {
  bus: BusWithRoute;
  style?: CSSProperties;
  alerts?: AlertWithDetails[];
}

function BusIcon({ bus, style, alerts = [] }: BusIconProps) {
  // Check for different alert states
  const busAlerts = alerts.filter(alert => alert.busId === bus.id);
  const activeAlerts = busAlerts.filter(alert => alert.isActive);
  const closedAlerts = busAlerts.filter(alert => alert.status === "closed" && alert.isActive);
  
  const highestPriorityAlert = activeAlerts.sort((a, b) => {
    const priorityOrder = { P1: 5, P2: 4, P3: 3, P4: 2, P5: 1, critical: 5, high: 4, medium: 3, low: 2 };
    return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
           (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
  })[0];

  const highestClosedAlert = closedAlerts.sort((a, b) => {
    const priorityOrder = { P1: 5, P2: 4, P3: 3, P4: 2, P5: 1, critical: 5, high: 4, medium: 3, low: 2 };
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
      case "P1": return "#dc2626"; // red-600 - critical
      case "P2": return "#ea580c"; // orange-600 - high
      case "P3": return "#eab308"; // yellow-500 - medium
      case "P4": return "#3b82f6"; // blue-500 - low
      case "P5": return "#6b7280"; // gray-500 - very low
      // Legacy support
      case "critical": return "#dc2626"; // red-600
      case "high": return "#ea580c"; // orange-600
      case "medium": return "#eab308"; // yellow-500
      case "low": return "#3b82f6"; // blue-500
      default: return "#ef4444"; // red-500
    }
  };

  const isAlertBus = bus.status === "alert";
  const hasEmergencyAlert = highestPriorityAlert !== undefined;
  const hasClosedAlert = highestClosedAlert !== undefined;

  // Determine if bus should show off-route glow or emergency alert glow
  const showOffRouteGlow = bus.status === "off-route";
  const showEmergencyGlow = hasEmergencyAlert;
  const showClosedAlertGlow = hasClosedAlert;

  // Priority: Closed alerts override everything, then emergency alerts, then off-route glows
  const activeGlow = showClosedAlertGlow ? "closed-alert" : showEmergencyGlow ? "emergency" : showOffRouteGlow ? "off-route" : "none";

  const getGlowEffect = () => {
    if (activeGlow === "closed-alert" && highestClosedAlert) {
      // Bright, intense pulsing glow for closed alerts until cleared
      const color = getAlertColor(highestClosedAlert.priority || "medium");
      return `drop-shadow(0 0 12px ${color}) drop-shadow(0 0 24px ${color}) drop-shadow(0 0 36px ${color}) drop-shadow(0 0 48px ${color})`;
    } else if (activeGlow === "emergency" && highestPriorityAlert) {
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
