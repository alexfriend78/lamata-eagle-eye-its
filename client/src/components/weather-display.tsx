import { useWeather } from "@/hooks/use-weather";
import { Cloud, CloudRain, Sun, Wind, Thermometer, Eye, CloudSnow } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface WeatherDisplayProps {
  className?: string;
  theme: "light" | "dark";
}

export default function WeatherDisplay({ className = "", theme }: WeatherDisplayProps) {
  const { weather, intensity, isVisible } = useWeather();

  if (!isVisible) return null;

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'cloudy': return <Cloud className="h-4 w-4 text-gray-500" />;
      case 'rainy': return <CloudRain className="h-4 w-4 text-blue-500" />;
      case 'stormy': return <CloudSnow className="h-4 w-4 text-purple-500" />;
      case 'foggy': return <Wind className="h-4 w-4 text-gray-400" />;
      default: return <Sun className="h-4 w-4" />;
    }
  };

  const getWeatherOverlayClass = () => {
    const baseClass = "absolute inset-0 pointer-events-none";
    const opacityValue = intensity * 0.3;
    
    switch (weather.condition) {
      case 'rainy':
        return `${baseClass} bg-gradient-to-b from-blue-900/20 to-blue-600/30`;
      case 'stormy':
        return `${baseClass} bg-gradient-to-b from-purple-900/40 to-gray-800/50`;
      case 'foggy':
        return `${baseClass} bg-gradient-to-b from-gray-500/30 to-gray-300/40`;
      case 'cloudy':
        return `${baseClass} bg-gradient-to-b from-gray-400/20 to-gray-600/30`;
      default:
        return `${baseClass}`;
    }
  };

  const getWeatherParticles = () => {
    if (weather.condition === 'rainy') {
      return (
        <>
          {Array.from({ length: Math.floor(intensity * 50) }).map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-8 bg-blue-400 opacity-60 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${0.5 + Math.random() * 1}s`,
                transform: `rotate(${10 + Math.random() * 10}deg)`
              }}
            />
          ))}
        </>
      );
    }

    if (weather.condition === 'stormy') {
      return (
        <>
          {Array.from({ length: Math.floor(intensity * 30) }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-12 bg-purple-300 opacity-70 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1}s`,
                animationDuration: `${0.3 + Math.random() * 0.5}s`,
                transform: `rotate(${15 + Math.random() * 15}deg)`
              }}
            />
          ))}
        </>
      );
    }

    if (weather.condition === 'foggy') {
      return (
        <div 
          className="absolute inset-0 bg-gradient-to-b from-gray-300/40 to-gray-500/20 animate-pulse"
          style={{
            animationDuration: '3s',
            opacity: intensity * 0.6
          }}
        />
      );
    }

    return null;
  };

  return (
    <>
      {/* Weather Overlay Effects */}
      <div className={getWeatherOverlayClass()} style={{ opacity: intensity * 0.3 }} />
      
      {/* Weather Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 5 }}>
        {getWeatherParticles()}
      </div>

      {/* Weather Info Card */}
      <Card className={`${className} ${theme === 'dark' ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            {getWeatherIcon(weather.condition)}
            <span className="text-sm font-medium capitalize">{weather.condition}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Thermometer className="h-3 w-3" />
              <span>{weather.temperature}°C</span>
            </div>
            <div className="flex items-center gap-1">
              <Wind className="h-3 w-3" />
              <span>{weather.windSpeed} km/h</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{weather.visibility} km</span>
            </div>
            <div className="flex items-center gap-1">
              <Cloud className="h-3 w-3" />
              <span>{weather.humidity}%</span>
            </div>
          </div>
          
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            {weather.description}
          </p>
        </CardContent>
      </Card>
    </>
  );
}