import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import BusMonitor from "@/pages/bus-monitor";
import AlertSimulator from "@/pages/alert-simulator";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={BusMonitor} />
      <Route path="/alert-simulator" component={AlertSimulator} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  console.log('🚀 App component rendering');
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="transit-monitor-theme">
        <TooltipProvider>
          <Toaster />
          <div className="min-h-screen bg-gray-900 text-white">
            <Router />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
