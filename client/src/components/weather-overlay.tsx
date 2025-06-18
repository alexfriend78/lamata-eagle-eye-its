import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Cloud, CloudRain, Sun, Wind, Thermometer, Eye, CloudSnow } from "lucide-react";
import { useWeather } from "@/contexts/weather-context";

interface WeatherOverlayProps {
  isVisible: boolean;
  onToggle: (visible: boolean) => void;
}

type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'foggy' | 'windy';

interface WeatherData {
  condition: WeatherCondition;
  temperature: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  description: string;
}

// Lagos-specific weather patterns
const lagosWeatherConditions: WeatherData[] = [
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

export default function WeatherOverlay({ isVisible, onToggle }: WeatherOverlayProps) {
  const { weather } = useWeather();
  const [weatherIntensity, setWeatherIntensity] = useState(0.7);
  
  // Map weather context data to local WeatherData format
  const currentWeather: WeatherData = {
    condition: weather.condition as WeatherCondition,
    temperature: weather.temperature,
    humidity: weather.humidity,
    windSpeed: weather.windSpeed,
    visibility: weather.visibility,
    description: getWeatherDescription(weather.condition)
  };
  
  function getWeatherDescription(condition: string): string {
    switch (condition) {
      case 'sunny':
        return 'Clear skies with high humidity typical of Lagos';
      case 'cloudy':
        return 'Overcast with high humidity - common during rainy season';
      case 'rainy':
        return 'Heavy tropical rainfall affecting visibility';
      case 'stormy':
        return 'Thunderstorm with strong winds - exercise caution';
      case 'windy':
        return 'Strong winds affecting bus operations';
      default:
        return 'Current weather conditions in Lagos';
    }
  }

  const getWeatherIcon = (condition: WeatherCondition) => {
    switch (condition) {
      case 'sunny':
        return <Sun className="w-6 h-6 text-yellow-500" />;
      case 'cloudy':
        return <Cloud className="w-6 h-6 text-gray-500" />;
      case 'rainy':
        return <CloudRain className="w-6 h-6 text-blue-500" />;
      case 'stormy':
        return <CloudRain className="w-6 h-6 text-purple-600" />;
      case 'foggy':
        return <CloudSnow className="w-6 h-6 text-gray-400" />;
      case 'windy':
        return <Wind className="w-6 h-6 text-teal-500" />;
      default:
        return <Sun className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getConditionColor = (condition: WeatherCondition) => {
    switch (condition) {
      case 'sunny':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'cloudy':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'rainy':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'stormy':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'foggy':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'windy':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getWeatherParticles = () => {
    if (!isVisible) return null;

    const particles = [];
    const particleCount = Math.floor(weatherIntensity * 150);

    for (let i = 0; i < particleCount; i++) {
      const left = Math.random() * 100;
      const animationDelay = Math.random() * 2;
      const animationDuration = 1 + Math.random() * 2;

      switch (currentWeather.condition) {
        case 'rainy':
        case 'stormy':
          particles.push(
            <div
              key={i}
              className="absolute w-0.5 h-8 bg-blue-400 opacity-60"
              style={{
                left: `${left}%`,
                top: '-10px',
                animationDelay: `${animationDelay}s`,
                transform: 'rotate(15deg)',
                animation: `rainDrop ${animationDuration}s linear infinite`
              }}
            />
          );
          break;
        case 'foggy':
          particles.push(
            <div
              key={i}
              className="absolute w-20 h-20 bg-gray-300 rounded-full opacity-20 animate-pulse"
              style={{
                left: `${left}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${animationDelay}s`,
                animationDuration: `${animationDuration + 2}s`,
              }}
            />
          );
          break;
        case 'windy':
          particles.push(
            <div
              key={i}
              className="absolute w-12 h-1 bg-teal-300 opacity-40"
              style={{
                left: `${left}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${animationDelay}s`,
                animation: `windStreak ${animationDuration}s linear infinite`
              }}
            />
          );
          break;
        case 'sunny':
          if (i % 10 === 0) { // Less frequent sparkles for sunny weather
            particles.push(
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-60 animate-pulse"
                style={{
                  left: `${left}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${animationDelay}s`,
                  animationDuration: `${animationDuration + 1}s`,
                }}
              />
            );
          }
          break;
      }
    }

    return particles;
  };

  const getWeatherOverlayClass = () => {
    if (!isVisible) return '';

    switch (currentWeather.condition) {
      case 'sunny':
        return 'bg-gradient-to-b from-yellow-100/20 to-transparent';
      case 'cloudy':
        return 'bg-gradient-to-b from-gray-200/40 to-transparent';
      case 'rainy':
        return 'bg-gradient-to-b from-blue-200/50 to-blue-100/20';
      case 'stormy':
        return 'bg-gradient-to-b from-purple-300/60 to-blue-200/30';
      case 'foggy':
        return 'bg-gradient-to-b from-gray-300/70 to-gray-200/40';
      case 'windy':
        return 'bg-gradient-to-b from-teal-100/30 to-transparent';
      default:
        return '';
    }
  };

  return (
    <>
      {/* Weather Control Panel */}
      <Card className="absolute top-4 right-4 z-50 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getWeatherIcon(currentWeather.condition)}
              <span className="text-lg">Lagos Weather</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Animations</span>
              <Switch
                checked={isVisible}
                onCheckedChange={onToggle}
                className="ml-2"
              />
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Current Condition */}
          <div className="flex items-center justify-between">
            <Badge className={getConditionColor(currentWeather.condition)}>
              {currentWeather.condition.toUpperCase()}
            </Badge>
            <span className="text-2xl font-bold">{currentWeather.temperature}°C</span>
          </div>

          {/* Weather Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
            {currentWeather.description}
          </p>

          {/* Weather Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-red-500" />
              <span>Humidity: {currentWeather.humidity}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-blue-500" />
              <span>Wind: {currentWeather.windSpeed} km/h</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-green-500" />
              <span>Visibility: {currentWeather.visibility} km</span>
            </div>
            <div className="text-gray-500">
              Animations: {isVisible ? 'On' : 'Off'}
            </div>
          </div>

          {/* Weather Impact Alert */}
          {(currentWeather.condition === 'rainy' || currentWeather.condition === 'stormy' || currentWeather.condition === 'foggy' || currentWeather.condition === 'windy') && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                ⚠️ Weather Alert: {currentWeather.condition === 'windy' ? 'High winds' : 'Reduced visibility'} affecting bus operations
              </p>
            </div>
          )}

          {/* Weather Control Info */}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Weather controlled from Weather Control Centre
          </div>
        </CardContent>
      </Card>

      {/* Weather Overlay Effects */}
      {isVisible && (
        <>
          {/* Background Weather Overlay */}
          <div className={`absolute inset-0 pointer-events-none z-10 ${getWeatherOverlayClass()}`} />
          
          {/* Weather Particles */}
          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
            {getWeatherParticles()}
          </div>
        </>
      )}

      {/* CSS Animations for Weather Effects */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes rainDrop {
            0% {
              transform: translateY(-100vh) rotate(15deg);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(15deg);
              opacity: 0;
            }
          }
          
          @keyframes windStreak {
            0% {
              transform: translateX(-100vw) translateY(0);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateX(100vw) translateY(-20px);
              opacity: 0;
            }
          }
        `
      }} />
    </>
  );
}