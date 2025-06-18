import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [weather, setWeather] = useState<WeatherData>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('weather-state');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.warn('Failed to parse stored weather state');
        }
      }
    }
    return {
      condition: "sunny",
      temperature: 28,
      humidity: 65,
      windSpeed: 12,
      visibility: 10
    };
  });

  // Listen for storage changes from other tabs/components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'weather-state' && e.newValue) {
        try {
          const newWeatherData = JSON.parse(e.newValue);
          console.log('🌦️ Weather sync from storage:', newWeatherData);
          setWeather(newWeatherData);
        } catch (error) {
          console.warn('Failed to parse weather data from storage');
        }
      }
    };

    // Listen for custom weather change events
    const handleWeatherChange = (e: CustomEvent) => {
      console.log('🌦️ Weather sync from event:', e.detail);
      setWeather(e.detail);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('weather-change', handleWeatherChange as EventListener);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('weather-change', handleWeatherChange as EventListener);
      }
    };
  }, []);

  const updateWeather = (newWeather: WeatherData) => {
    const updatedWeather = {
      ...newWeather,
      lastUpdated: Date.now()
    };
    
    console.log('🌦️ Updating weather:', updatedWeather);
    setWeather(updatedWeather);
    
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('weather-state', JSON.stringify(updatedWeather));
      
      // Dispatch custom event for cross-component sync
      window.dispatchEvent(new CustomEvent('weather-change', { 
        detail: updatedWeather 
      }));
    }
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