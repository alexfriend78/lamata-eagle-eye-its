import { useState, useEffect } from "react";
import { useBusData } from "@/hooks/use-bus-data";
import MapContainer from "@/components/map-container";
import ControlPanel from "@/components/control-panel";
import EmergencyAlert from "@/components/emergency-alert";

export default function BusMonitor() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { buses, routes, stations, alerts, stats, refetch } = useBusData();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000); // Refresh data every 5 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const criticalAlert = alerts?.find(alert => alert.severity === "critical");

  return (
    <div className="min-h-screen bus-monitor-bg text-white">
      {criticalAlert && (
        <EmergencyAlert 
          alert={criticalAlert}
          onAcknowledge={() => refetch()}
        />
      )}
      
      {/* Header */}
      <header className="bus-monitor-surface border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-2xl">🚌</div>
            <h1 className="text-xl font-semibold">London Bus Transit Monitor</h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">System Online</span>
            </div>
            <div className="text-sm text-gray-400">
              {formatTime(currentTime)}
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Map Area */}
        <div className="flex-1 p-6 relative overflow-hidden">
          <MapContainer 
            buses={buses || []}
            routes={routes || []}
            stations={stations || []}
          />
        </div>

        {/* Control Panel */}
        <div className="w-80 bus-monitor-surface border-l border-gray-700 p-6 overflow-y-auto">
          <ControlPanel 
            stats={stats}
            alerts={alerts || []}
            routes={routes || []}
            onRefresh={refetch}
          />
        </div>
      </div>
    </div>
  );
}
