import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Cloud, CloudRain, Sun, Wind, Thermometer, Eye, CloudSnow } from "lucide-react";

interface WeatherOverlayProps {
  isVisible: boolean;
  onToggle: (visible: boolean) => void;
}

type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'foggy';

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
  const [currentWeather, setCurrentWeather] = useState<WeatherData>(lagosWeatherConditions[0]);
  const [weatherIntensity, setWeatherIntensity] = useState(0.7);

  // Simulate weather changes every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const randomCondition = lagosWeatherConditions[Math.floor(Math.random() * lagosWeatherConditions.length)];
      setCurrentWeather(randomCondition);
      setWeatherIntensity(Math.random() * 0.8 + 0.2); // 0.2 to 1.0
    }, 30000);

    return () => clearInterval(interval);
  }, []);

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
              className="absolute w-0.5 h-8 bg-blue-400 opacity-60 animate-pulse"
              style={{
                left: `${left}%`,
                top: '-10px',
                animationDelay: `${animationDelay}s`,
                animationDuration: `${animationDuration}s`,
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
            <Switch
              checked={isVisible}
              onCheckedChange={onToggle}
              className="ml-2"
            />
          </CardTitle>
        </CardHeader>
        
        {isVisible && (
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
                Intensity: {Math.round(weatherIntensity * 100)}%
              </div>
            </div>

            {/* Weather Impact Alert */}
            {(currentWeather.condition === 'rainy' || currentWeather.condition === 'stormy' || currentWeather.condition === 'foggy') && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                  ⚠️ Weather Alert: Reduced visibility affecting bus operations
                </p>
              </div>
            )}

            {/* Quick Weather Change Buttons */}
            <div className="flex gap-2 flex-wrap">
              {lagosWeatherConditions.map((weather) => (
                <Button
                  key={weather.condition}
                  variant={currentWeather.condition === weather.condition ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentWeather(weather)}
                  className="text-xs"
                >
                  {getWeatherIcon(weather.condition)}
                </Button>
              ))}
            </div>
          </CardContent>
        )}
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

      {/* CSS Animation for Rain */}
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
        `
      }} />
    </>
  );
}