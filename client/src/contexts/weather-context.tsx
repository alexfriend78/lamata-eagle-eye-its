import { createContext, useContext, useState, ReactNode } from 'react';

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

  const updateWeather = (newWeather: WeatherData) => {
    const updatedWeather = {
      ...newWeather,
      lastUpdated: Date.now()
    };
    setWeather(updatedWeather);
    
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('weather-state', JSON.stringify(updatedWeather));
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