import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';

interface WeatherData {
  condition: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  description?: string;
  lastUpdated?: number;
}

interface WeatherContextType {
  weather: WeatherData;
  updateWeather: (weather: WeatherData) => void;
}

// Global weather state for cross-component synchronization
let globalWeatherState: WeatherData = {
  condition: "sunny",
  temperature: 28,
  humidity: 65,
  windSpeed: 12,
  visibility: 10
};

const weatherListeners: Set<(weather: WeatherData) => void> = new Set();

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [weather, setWeather] = useState<WeatherData>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('weather-state');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          globalWeatherState = parsed;
          return parsed;
        } catch (e) {
          console.warn('Failed to parse stored weather state');
        }
      }
    }
    return globalWeatherState;
  });

  // Initialize from localStorage on mount and register listener
  useEffect(() => {
    // Load current state from localStorage on component mount
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('weather-state');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.lastUpdated !== weather.lastUpdated) {
            console.log('🌦️ Loading weather from localStorage on mount:', parsed);
            globalWeatherState = parsed;
            setWeather(parsed);
          }
        } catch (e) {
          console.warn('Failed to parse stored weather state on mount');
        }
      }
    }

    const listener = (newWeather: WeatherData) => {
      console.log('🌦️ Weather sync to component:', newWeather);
      setWeather(newWeather);
    };

    weatherListeners.add(listener);

    // Listen for multiple types of weather sync events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'weather-state' && e.newValue) {
        try {
          const newWeatherData = JSON.parse(e.newValue);
          console.log('🌦️ Weather sync from storage event:', newWeatherData);
          globalWeatherState = newWeatherData;
          setWeather(newWeatherData);
        } catch (error) {
          console.warn('Failed to parse weather data from storage event');
        }
      }
    };

    const handleCustomWeatherUpdate = (e: CustomEvent) => {
      console.log('🌦️ Weather sync from custom event:', e.detail);
      globalWeatherState = e.detail;
      setWeather(e.detail);
    };

    // Poll localStorage for changes as backup
    const pollForChanges = () => {
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('weather-state');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.lastUpdated !== globalWeatherState.lastUpdated) {
              console.log('🌦️ Weather sync from polling:', parsed);
              globalWeatherState = parsed;
              setWeather(parsed);
            }
          }
        } catch (error) {
          console.warn('Error polling for weather changes');
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('weather-updated', handleCustomWeatherUpdate as EventListener);
      
      // Poll every 1 second for changes
      const pollInterval = setInterval(pollForChanges, 1000);
      
      return () => {
        weatherListeners.delete(listener);
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('weather-updated', handleCustomWeatherUpdate as EventListener);
        clearInterval(pollInterval);
      };
    }

  }, []);

  const updateWeather = (newWeather: WeatherData) => {
    const updatedWeather = {
      ...newWeather,
      lastUpdated: Date.now()
    };
    
    console.log('🌦️ Context: Updating global weather:', updatedWeather);
    console.log('🌦️ Context: Current listeners count:', weatherListeners.size);
    
    // Update global state
    globalWeatherState = updatedWeather;
    
    // Update local state
    setWeather(updatedWeather);
    
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('weather-state', JSON.stringify(updatedWeather));
      console.log('🌦️ Context: Saved to localStorage');
      
      // Force a storage event by updating a secondary key
      localStorage.setItem('weather-sync-trigger', Date.now().toString());
      
      // Dispatch multiple types of events for maximum compatibility
      window.dispatchEvent(new CustomEvent('weather-updated', { 
        detail: updatedWeather 
      }));
      
      // Simulate storage event for same-page components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'weather-state',
        newValue: JSON.stringify(updatedWeather),
        oldValue: null,
        storageArea: localStorage
      }));
    }
    
    // Notify all listeners
    let notifiedCount = 0;
    weatherListeners.forEach(listener => {
      try {
        listener(updatedWeather);
        notifiedCount++;
        console.log('🌦️ Context: Notified listener', notifiedCount);
      } catch (error) {
        console.warn('Error notifying weather listener:', error);
      }
    });
    
    console.log('🌦️ Context: Total listeners notified:', notifiedCount);
  };

  return (
    <WeatherContext.Provider value={{ weather, updateWeather }}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}