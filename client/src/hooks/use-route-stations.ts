import { useQuery } from "@tanstack/react-query";
import type { Station } from "@shared/schema";

export function useRouteStations(routeIds: number[]) {
  return useQuery({
    queryKey: ['/api/route-stations', routeIds],
    queryFn: async () => {
      if (routeIds.length === 0) return [];
      
      const allStations: Station[] = [];
      
      // Fetch stations for each selected route
      for (const routeId of routeIds) {
        const response = await fetch(`/api/routes/${routeId}/stations`);
        if (response.ok) {
          const stations: Station[] = await response.json();
          allStations.push(...stations);
        }
      }
      
      // Remove duplicates based on station ID
      const uniqueStations = allStations.filter((station, index, self) => 
        index === self.findIndex(s => s.id === station.id)
      );
      
      return uniqueStations;
    },
    enabled: routeIds.length > 0,
  });
}