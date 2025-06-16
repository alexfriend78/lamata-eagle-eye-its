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
    // Convert hex to RGB and make it much deeper and more saturated
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Make color significantly deeper with more dramatic reduction
    const deepnessMultiplier = 0.3 - (intensity - 1) * 0.05; // Much more aggressive
    const deepR = Math.max(20, Math.floor(r * deepnessMultiplier));
    const deepG = Math.max(20, Math.floor(g * deepnessMultiplier));
    const deepB = Math.max(20, Math.floor(b * deepnessMultiplier));
    
    return `rgb(${deepR}, ${deepG}, ${deepB})`;
  };

  const getGlowStyles = () => {
    if (activeGlow === "acknowledged-alert" && highestAcknowledgedAlert) {
      const baseColor = getAlertColor(highestAcknowledgedAlert.priority || "medium");
      const intensity = getTimeBasedIntensity(highestAcknowledgedAlert);
      
      // Extract RGB values from color
      const colorMatch = baseColor.match(/rgb\((\d+), (\d+), (\d+)\)/);
      const [r, g, b] = colorMatch ? [colorMatch[1], colorMatch[2], colorMatch[3]] : [255, 0, 0];
      
      const baseSize = 30 * intensity;
      
      return {
        background: `
          radial-gradient(
            circle,
            rgba(${r}, ${g}, ${b}, 0.9) 0%,
            rgba(${r}, ${g}, ${b}, 0.7) 20%,
            rgba(${r}, ${g}, ${b}, 0.5) 40%,
            rgba(${r}, ${g}, ${b}, 0.3) 60%,
            rgba(${r}, ${g}, ${b}, 0.1) 80%,
            transparent 100%
          )
        `,
        boxShadow: `
          0 0 ${baseSize}px rgba(${r}, ${g}, ${b}, 0.8),
          0 0 ${baseSize * 2}px rgba(${r}, ${g}, ${b}, 0.6),
          0 0 ${baseSize * 3}px rgba(${r}, ${g}, ${b}, 0.4),
          0 0 ${baseSize * 4}px rgba(${r}, ${g}, ${b}, 0.2)
        `,
        borderRadius: '50%'
      };
    } else if (activeGlow === "emergency" && highestPriorityAlert) {
      const color = getAlertColor(highestPriorityAlert.priority || "medium");
      const colorMatch = color.match(/rgb\((\d+), (\d+), (\d+)\)/);
      const [r, g, b] = colorMatch ? [colorMatch[1], colorMatch[2], colorMatch[3]] : [255, 0, 0];
      
      return {
        background: `
          radial-gradient(
            circle,
            rgba(${r}, ${g}, ${b}, 0.8) 0%,
            rgba(${r}, ${g}, ${b}, 0.6) 30%,
            rgba(${r}, ${g}, ${b}, 0.3) 60%,
            transparent 100%
          )
        `,
        boxShadow: `
          0 0 20px rgba(${r}, ${g}, ${b}, 0.7),
          0 0 40px rgba(${r}, ${g}, ${b}, 0.5),
          0 0 60px rgba(${r}, ${g}, ${b}, 0.3)
        `,
        borderRadius: '50%'
      };
    }
    return {};
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

  const glowStyles = getGlowStyles();

  return (
    <div className="relative" style={style}>
      {/* Glow background element */}
      {activeGlow !== "none" && (
        <div
          className={`absolute inset-0 rounded-full ${pulseAnimation}`}
          style={{
            ...glowStyles,
            width: '200%',
            height: '200%',
            top: '-50%',
            left: '-50%',
            zIndex: 10,
            pointerEvents: 'none'
          }}
        />
      )}
      
      {/* Bus icon */}
      <div
        className={`text-2xl transition-all duration-500 relative z-20 ${pulseAnimation}`}
        style={{
          color: getBusColor(bus.status)
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
    </div>
  );
}

const MemoizedBusIcon = memo(BusIcon);
export default MemoizedBusIcon;
