import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { type AlertWithDetails } from "@shared/schema";

interface EmergencyAlertProps {
  alert: AlertWithDetails;
  onAcknowledge: () => void;
}

export default function EmergencyAlert({ alert, onAcknowledge }: EmergencyAlertProps) {
  const acknowledgeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('PATCH', `/api/alerts/${alert.id}/acknowledge`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      onAcknowledge();
    }
  });

  const handleAcknowledge = () => {
    acknowledgeMutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 emergency-overlay flex items-center justify-center">
      <div className="bg-white text-red-600 p-8 rounded-lg shadow-2xl max-w-md mx-4 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold mb-4">EMERGENCY ALERT</h2>
        <div className="mb-2">
          {alert.route && (
            <span className="text-lg font-semibold">Route {alert.route.routeNumber}</span>
          )}
        </div>
        <p className="text-lg mb-6">{alert.message}</p>
        <Button 
          onClick={handleAcknowledge}
          disabled={acknowledgeMutation.isPending}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 font-semibold"
        >
          {acknowledgeMutation.isPending ? "ACKNOWLEDGING..." : "ACKNOWLEDGE ALERT"}
        </Button>
      </div>
    </div>
  );
}
