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
  const closedAlerts = busAlerts.filter(alert => alert.status === "closed" && !alert.isActive);
  const acknowledgedAlerts = busAlerts.filter(alert => alert.status === "acknowledged" && !alert.isActive);
  
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

  const highestAcknowledgedAlert = acknowledgedAlerts.sort((a, b) => {
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
  const hasAcknowledgedAlert = highestAcknowledgedAlert !== undefined;

  // Determine if bus should show off-route glow or emergency alert glow
  const showOffRouteGlow = bus.status === "off-route";
  const showEmergencyGlow = hasEmergencyAlert;
  const showClosedAlertGlow = hasClosedAlert;
  const showAcknowledgedAlertGlow = hasAcknowledgedAlert;

  // Priority: Closed alerts override everything, then emergency alerts, then acknowledged alerts, then off-route glows
  const activeGlow = showClosedAlertGlow ? "closed-alert" : showEmergencyGlow ? "emergency" : showAcknowledgedAlertGlow ? "acknowledged-alert" : showOffRouteGlow ? "off-route" : "none";

  const getTimeBasedIntensity = (alert: AlertWithDetails) => {
    const now = new Date();
    const alertTime = new Date(alert.createdAt);
    const timeDiffMinutes = (now.getTime() - alertTime.getTime()) / (1000 * 60);
    
    // Escalating intensity based on time since alert was created
    if (timeDiffMinutes < 2) return 1; // First 2 minutes: normal intensity
    if (timeDiffMinutes < 5) return 1.5; // 2-5 minutes: 50% increase
    if (timeDiffMinutes < 10) return 2; // 5-10 minutes: 2x intensity
    if (timeDiffMinutes < 20) return 2.5; // 10-20 minutes: 2.5x intensity
    return 3; // 20+ minutes: 3x intensity (maximum)
  };

  const getDeeperColor = (baseColor: string, intensity: number) => {
    // Convert hex to RGB and make it deeper/more saturated
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Make color deeper by reducing brightness while maintaining saturation
    const deepR = Math.max(0, Math.floor(r * (0.7 - (intensity - 1) * 0.1)));
    const deepG = Math.max(0, Math.floor(g * (0.7 - (intensity - 1) * 0.1)));
    const deepB = Math.max(0, Math.floor(b * (0.7 - (intensity - 1) * 0.1)));
    
    return `rgb(${deepR}, ${deepG}, ${deepB})`;
  };

  const getGlowEffect = () => {
    if (activeGlow === "closed-alert" && highestClosedAlert) {
      // Bright, intense pulsing glow for closed alerts until cleared
      const color = getAlertColor(highestClosedAlert.priority || "medium");
      return `drop-shadow(0 0 12px ${color}) drop-shadow(0 0 24px ${color}) drop-shadow(0 0 36px ${color}) drop-shadow(0 0 48px ${color})`;
    } else if (activeGlow === "acknowledged-alert" && highestAcknowledgedAlert) {
      // Time-based escalating glow for acknowledged alerts
      const baseColor = getAlertColor(highestAcknowledgedAlert.priority || "medium");
      const intensity = getTimeBasedIntensity(highestAcknowledgedAlert);
      const deepColor = getDeeperColor(baseColor, intensity);
      
      // Escalating glow size based on time
      const baseSize = 16;
      const size1 = baseSize * intensity;
      const size2 = baseSize * 2 * intensity;
      const size3 = baseSize * 3 * intensity;
      const size4 = baseSize * 4 * intensity;
      const size5 = baseSize * 5 * intensity;
      
      return `drop-shadow(0 0 ${size1}px ${deepColor}) drop-shadow(0 0 ${size2}px ${deepColor}) drop-shadow(0 0 ${size3}px ${deepColor}) drop-shadow(0 0 ${size4}px ${deepColor}) drop-shadow(0 0 ${size5}px ${deepColor})`;
    } else if (activeGlow === "emergency" && highestPriorityAlert) {
      const color = getAlertColor(highestPriorityAlert.priority || "medium");
      return `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 16px ${color}) drop-shadow(0 0 24px ${color})`;
    } else if (activeGlow === "off-route") {
      return "drop-shadow(0 0 8px #1e40af) drop-shadow(0 0 16px #1e40af) drop-shadow(0 0 24px #1e40af)";
    }
    return "drop-shadow(0 1px 2px rgba(0,0,0,0.3))";
  };

  const shouldPulse = activeGlow !== "none";
  
  const getPulseAnimation = () => {
    if (activeGlow === "closed-alert") {
      return "animate-pulse-intense";
    } else if (activeGlow === "acknowledged-alert" && highestAcknowledgedAlert) {
      const intensity = getTimeBasedIntensity(highestAcknowledgedAlert);
      if (intensity >= 3) return "animate-pulse-mega"; // 20+ minutes
      if (intensity >= 2.5) return "animate-pulse-ultra"; // 10-20 minutes
      if (intensity >= 2) return "animate-pulse-super"; // 5-10 minutes
      if (intensity >= 1.5) return "animate-pulse-intense"; // 2-5 minutes
      return "animate-pulse-strong"; // 0-2 minutes
    } else if (shouldPulse) {
      return "animate-pulse";
    }
    return "";
  };
  
  const pulseAnimation = getPulseAnimation();

  return (
    <div
      className={`text-2xl transition-all duration-500 ${pulseAnimation}`}
      style={{
        ...style,
        color: getBusColor(bus.status),
        filter: getGlowEffect(),
        zIndex: 30
      }}
      title={`Bus ${bus.busNumber} - Route ${bus.route.routeNumber} - Direction: ${bus.direction || 'Unknown'} - Status: ${
        hasClosedAlert ? `Closed Alert (${highestClosedAlert?.priority}) - Awaiting Clearance` :
        hasAcknowledgedAlert ? `Acknowledged Alert (${highestAcknowledgedAlert?.priority}) - Awaiting Clearance` :
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
