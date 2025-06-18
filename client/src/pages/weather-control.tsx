import { useTheme } from "@/hooks/use-theme";
import { useWeather } from "@/contexts/weather-context";
import WeatherOverlay from "@/components/weather-overlay";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cloud, Sun, CloudRain, CloudSnow, Wind } from "lucide-react";
import { Link } from "wouter";

export default function WeatherControl() {
  const { theme } = useTheme();
  const { weather: currentWeather, updateWeather } = useWeather();

  const weatherPresets = [
    {
      name: "Sunny",
      icon: Sun,
      condition: "sunny",
      temperature: 32,
      humidity: 45,
      windSpeed: 8,
      visibility: 15,
      color: "bg-yellow-500"
    },
    {
      name: "Cloudy",
      icon: Cloud,
      condition: "cloudy",
      temperature: 26,
      humidity: 70,
      windSpeed: 15,
      visibility: 12,
      color: "bg-gray-500"
    },
    {
      name: "Rainy",
      icon: CloudRain,
      condition: "rainy",
      temperature: 22,
      humidity: 85,
      windSpeed: 20,
      visibility: 8,
      color: "bg-blue-500"
    },
    {
      name: "Stormy",
      icon: CloudRain,
      condition: "stormy",
      temperature: 20,
      humidity: 90,
      windSpeed: 35,
      visibility: 5,
      color: "bg-purple-600"
    },
    {
      name: "Windy",
      icon: Wind,
      condition: "windy",
      temperature: 29,
      humidity: 55,
      windSpeed: 45,
      visibility: 10,
      color: "bg-teal-500"
    }
  ];

  const handleWeatherChange = (preset: typeof weatherPresets[0]) => {
    console.log('🌩️ Weather Control: Setting weather to', preset.name);
    updateWeather({
      condition: preset.condition,
      temperature: preset.temperature,
      humidity: preset.humidity,
      windSpeed: preset.windSpeed,
      visibility: preset.visibility
    });
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <header className={`bg-gradient-to-r from-blue-600 via-white to-blue-600 dark:from-blue-800 dark:via-gray-900 dark:to-blue-800 border-b border-blue-200 dark:border-blue-700 px-6 py-4 shadow-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Monitor
              </Button>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-2xl">🌤️</div>
              <div>
                <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-100 drop-shadow-lg">
                  Weather Control Center
                </h1>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Lagos Metropolitan Weather Management
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Weather Preview */}
        <div className="flex-1 relative">
          <WeatherOverlay 
            isVisible={true}
            onToggle={() => {}}
          />
          
          {/* Current Weather Display */}
          <div className={`absolute top-4 left-4 ${theme === 'dark' ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm rounded-lg p-4 shadow-lg`}>
            <h3 className="text-lg font-semibold mb-3">Current Weather</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Condition:</span>
                <span className="font-medium capitalize">{currentWeather.condition}</span>
              </div>
              <div className="flex justify-between">
                <span>Temperature:</span>
                <span className="font-medium">{currentWeather.temperature}°C</span>
              </div>
              <div className="flex justify-between">
                <span>Humidity:</span>
                <span className="font-medium">{currentWeather.humidity}%</span>
              </div>
              <div className="flex justify-between">
                <span>Wind Speed:</span>
                <span className="font-medium">{currentWeather.windSpeed} km/h</span>
              </div>
              <div className="flex justify-between">
                <span>Visibility:</span>
                <span className="font-medium">{currentWeather.visibility} km</span>
              </div>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className={`w-80 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'} border-l p-6 overflow-y-auto`}>
          <h2 className="text-xl font-semibold mb-6">Weather Presets</h2>
          
          <div className="space-y-4">
            {weatherPresets.map((preset) => {
              const IconComponent = preset.icon;
              const isActive = currentWeather.condition === preset.condition;
              
              return (
                <Button
                  key={preset.name}
                  onClick={() => handleWeatherChange(preset)}
                  variant={isActive ? "default" : "outline"}
                  className={`w-full h-auto p-4 flex flex-col items-start space-y-2 ${
                    isActive ? preset.color + ' text-white' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <IconComponent className="h-6 w-6" />
                    <span className="text-lg font-medium">{preset.name}</span>
                  </div>
                  <div className="text-left text-sm opacity-80 space-y-1">
                    <div>Temp: {preset.temperature}°C</div>
                    <div>Humidity: {preset.humidity}%</div>
                    <div>Wind: {preset.windSpeed} km/h</div>
                  </div>
                </Button>
              );
            })}
          </div>

          {/* Custom Weather Controls */}
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold">Custom Settings</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Temperature (°C)</label>
                <input
                  type="range"
                  min="15"
                  max="40"
                  value={currentWeather.temperature}
                  onChange={(e) => updateWeather({ ...currentWeather, temperature: parseInt(e.target.value) })}
                  className="w-full"
                />
                <span className="text-sm text-gray-500">{currentWeather.temperature}°C</span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Humidity (%)</label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={currentWeather.humidity}
                  onChange={(e) => updateWeather({ ...currentWeather, humidity: parseInt(e.target.value) })}
                  className="w-full"
                />
                <span className="text-sm text-gray-500">{currentWeather.humidity}%</span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Wind Speed (km/h)</label>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={currentWeather.windSpeed}
                  onChange={(e) => updateWeather({ ...currentWeather, windSpeed: parseInt(e.target.value) })}
                  className="w-full"
                />
                <span className="text-sm text-gray-500">{currentWeather.windSpeed} km/h</span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Visibility (km)</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={currentWeather.visibility}
                  onChange={(e) => updateWeather({ ...currentWeather, visibility: parseInt(e.target.value) })}
                  className="w-full"
                />
                <span className="text-sm text-gray-500">{currentWeather.visibility} km</span>
              </div>
            </div>
          </div>

          {/* Weather Impact Info */}
          <div className={`mt-8 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <h4 className="font-semibold mb-2">Weather Impact on Transit</h4>
            <div className="text-sm space-y-1">
              {currentWeather.condition === 'rainy' && (
                <p className="text-blue-600 dark:text-blue-400">⚠️ Rain may affect bus schedules and passenger comfort</p>
              )}
              {currentWeather.condition === 'stormy' && (
                <p className="text-red-600 dark:text-red-400">🚨 Severe weather - potential service disruptions</p>
              )}
              {currentWeather.windSpeed > 30 && (
                <p className="text-orange-600 dark:text-orange-400">💨 High winds may affect bus stability</p>
              )}
              {currentWeather.visibility < 8 && (
                <p className="text-yellow-600 dark:text-yellow-400">🌫️ Reduced visibility - slower speeds recommended</p>
              )}
              {currentWeather.condition === 'sunny' && currentWeather.temperature > 30 && (
                <p className="text-green-600 dark:text-green-400">☀️ Hot weather - ensure adequate AC in buses</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}