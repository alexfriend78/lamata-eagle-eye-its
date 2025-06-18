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

  // Register this component as a listener to global weather changes
  useEffect(() => {
    const listener = (newWeather: WeatherData) => {
      console.log('🌦️ Weather sync to component:', newWeather);
      setWeather(newWeather);
    };

    weatherListeners.add(listener);

    return () => {
      weatherListeners.delete(listener);
    };
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