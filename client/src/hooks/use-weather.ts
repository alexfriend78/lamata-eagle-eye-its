import { useState, useEffect } from "react";

export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'foggy';

export interface WeatherData {
  condition: WeatherCondition;
  temperature: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  description: string;
}

// Lagos-specific weather patterns
export const lagosWeatherConditions: WeatherData[] = [
  {
    condition: 'sunny',
    temperature: 32,
    humidity: 75,
    windSpeed: 12,
    visibility: 10,
    description: 'Clear skies with high humidity typical of Lagos'
  },
  {
    condition: 'cloudy',
    temperature: 28,
    humidity: 85,
    windSpeed: 8,
    visibility: 8,
    description: 'Overcast with high humidity - common during rainy season'
  },
  {
    condition: 'rainy',
    temperature: 25,
    humidity: 95,
    windSpeed: 15,
    visibility: 3,
    description: 'Heavy tropical rainfall affecting visibility'
  },
  {
    condition: 'stormy',
    temperature: 24,
    humidity: 98,
    windSpeed: 25,
    visibility: 2,
    description: 'Thunderstorm with strong winds - exercise caution'
  },
  {
    condition: 'foggy',
    temperature: 26,
    humidity: 90,
    windSpeed: 5,
    visibility: 1,
    description: 'Dense harmattan fog reducing visibility significantly'
  }
];

// Global weather state
let globalWeatherState: WeatherData = lagosWeatherConditions[0];
let globalWeatherIntensity = 0.7;
let globalWeatherVisible = true;
const weatherListeners: Set<() => void> = new Set();

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData>(globalWeatherState);
  const [intensity, setIntensity] = useState(globalWeatherIntensity);
  const [isVisible, setIsVisible] = useState(globalWeatherVisible);

  useEffect(() => {
    const listener = () => {
      setWeather(globalWeatherState);
      setIntensity(globalWeatherIntensity);
      setIsVisible(globalWeatherVisible);
    };

    weatherListeners.add(listener);
    return () => {
      weatherListeners.delete(listener);
    };
  }, []);

  const updateWeather = (newWeather: WeatherData) => {
    globalWeatherState = newWeather;
    weatherListeners.forEach(listener => listener());
  };

  const updateIntensity = (newIntensity: number) => {
    globalWeatherIntensity = newIntensity;
    weatherListeners.forEach(listener => listener());
  };

  const updateVisibility = (visible: boolean) => {
    globalWeatherVisible = visible;
    weatherListeners.forEach(listener => listener());
  };

  return {
    weather,
    intensity,
    isVisible,
    updateWeather,
    updateIntensity,
    updateVisibility,
    weatherConditions: lagosWeatherConditions
  };
}