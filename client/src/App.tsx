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
  
  // Simple test render to check if React is working
  const isSimpleTest = false; // Set to true for testing
  
  if (isSimpleTest) {
    return (
      <div className="min-h-screen bg-blue-900 text-white p-8">
        <h1 className="text-4xl font-bold mb-4">🚌 Lagos BRT System</h1>
        <p className="text-xl">Simple test - React is working!</p>
        <div className="mt-4 p-4 bg-green-800 rounded">
          <p>If you can see this, the basic app structure is working.</p>
        </div>
      </div>
    );
  }
  
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
