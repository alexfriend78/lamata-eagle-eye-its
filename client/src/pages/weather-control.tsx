import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useWeather } from "@/hooks/use-weather";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Cloud, Sun, CloudRain, CloudSnow, Wind, Thermometer, Eye } from "lucide-react";
import { Link } from "wouter";

export default function WeatherControl() {
  const { theme } = useTheme();
  const { weather, intensity, isVisible, updateWeather, updateIntensity, updateVisibility, weatherConditions } = useWeather();
  const [localIntensity, setLocalIntensity] = useState(intensity);

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

  const handleIntensityChange = (value: number[]) => {
    const newIntensity = value[0];
    setLocalIntensity(newIntensity);
    updateIntensity(newIntensity);
  };

  const getWeatherOverlayClass = () => {
    const baseClass = "absolute inset-0 pointer-events-none";
    const opacityValue = localIntensity * 0.3;
    
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
          {Array.from({ length: Math.floor(localIntensity * 50) }).map((_, i) => (
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
          {Array.from({ length: Math.floor(localIntensity * 30) }).map((_, i) => (
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

    return null;
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-4`}>
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Weather Control Center</h1>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Weather Preview */}
        <div className="flex-1 relative overflow-hidden">
          {/* Weather Overlay Effects */}
          {isVisible && (
            <>
              <div className={getWeatherOverlayClass()} style={{ opacity: localIntensity * 0.3 }} />
              <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 5 }}>
                {getWeatherParticles()}
              </div>
            </>
          )}
          
          {/* Lagos Map Simulation */}
          <div className={`w-full h-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} relative`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`text-6xl font-bold opacity-20 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
                LAGOS BRT NETWORK
              </div>
            </div>
          </div>
          
          {/* Current Weather Display */}
          <div className={`absolute top-4 left-4 ${theme === 'dark' ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm rounded-lg p-4 shadow-lg`}>
            <h3 className="text-lg font-semibold mb-3">Current Weather Preview</h3>
            <div className="flex items-center gap-3 mb-3">
              {getWeatherIcon(weather.condition)}
              <span className="text-xl font-medium capitalize">{weather.condition}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4" />
                <span>{weather.temperature}°C</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4" />
                <span>{weather.windSpeed} km/h</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{weather.visibility} km</span>
              </div>
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                <span>{weather.humidity}%</span>
              </div>
            </div>
            
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
              {weather.description}
            </p>
          </div>
        </div>

        {/* Control Panel */}
        <div className={`w-80 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-l p-6 overflow-y-auto`}>
          
          {/* Weather Visibility Toggle */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Weather Display</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="weather-visibility">Show Weather Effects</Label>
                <Switch
                  id="weather-visibility"
                  checked={isVisible}
                  onCheckedChange={updateVisibility}
                />
              </div>
            </CardContent>
          </Card>

          {/* Weather Conditions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Weather Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {weatherConditions.map((weatherData) => (
                <Button
                  key={weatherData.condition}
                  variant={weather.condition === weatherData.condition ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => updateWeather(weatherData)}
                >
                  <div className="flex items-center gap-3">
                    {getWeatherIcon(weatherData.condition)}
                    <div className="text-left">
                      <div className="font-medium capitalize">{weatherData.condition}</div>
                      <div className="text-xs opacity-70">{weatherData.temperature}°C, {weatherData.windSpeed} km/h</div>
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Weather Intensity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weather Intensity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Intensity</Label>
                  <span className="text-sm font-medium">{Math.round(localIntensity * 100)}%</span>
                </div>
                <Slider
                  value={[localIntensity]}
                  onValueChange={handleIntensityChange}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Controls the strength of weather effects and animations
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <p>• Select weather conditions to change the atmosphere</p>
                <p>• Adjust intensity to control effect strength</p>
                <p>• Weather changes are applied instantly to the main dashboard</p>
                <p>• Use the toggle to show/hide weather effects</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}