import { useQuery } from "@tanstack/react-query";
import { type BusWithRoute, type Route, type Station, type AlertWithDetails, type SystemStats } from "@shared/schema";

export function useBusData() {
  const busesQuery = useQuery<BusWithRoute[]>({
    queryKey: ['/api/buses'],
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });

  const routesQuery = useQuery<Route[]>({
    queryKey: ['/api/routes'],
  });

  const stationsQuery = useQuery<Station[]>({
    queryKey: ['/api/stations'],
  });

  const alertsQuery = useQuery<AlertWithDetails[]>({
    queryKey: ['/api/alerts'],
    refetchInterval: 2000, // Refetch every 2 seconds for alerts
  });

  const statsQuery = useQuery<SystemStats>({
    queryKey: ['/api/stats'],
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const refetch = () => {
    busesQuery.refetch();
    routesQuery.refetch();
    stationsQuery.refetch();
    alertsQuery.refetch();
    statsQuery.refetch();
  };

  return {
    buses: busesQuery.data,
    routes: routesQuery.data,
    stations: stationsQuery.data,
    alerts: alertsQuery.data,
    stats: statsQuery.data,
    isLoading: busesQuery.isLoading || routesQuery.isLoading || stationsQuery.isLoading,
    error: busesQuery.error || routesQuery.error || stationsQuery.error,
    refetch,
  };
}
