import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Palette, Sparkles, Zap } from "lucide-react";
import type { Route } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface RouteAestheticsPanelProps {
  routes: Route[];
  theme: "light" | "dark";
}

interface AestheticSettings {
  color: string;
  lineStyle: "solid" | "dashed" | "dotted" | "double";
  lineWidth: number;
  opacity: number;
  pattern: "none" | "arrows" | "dots" | "pulse";
  animation: "none" | "flow" | "glow" | "gradient";
  glowColor?: string;
  gradientEnd?: string;
}

const colorOptions = [
  { name: "Blue", value: "#3b82f6", description: "Classic transit blue" },
  { name: "Red", value: "#ef4444", description: "Express service red" },
  { name: "Green", value: "#22c55e", description: "Eco-friendly green" },
  { name: "Purple", value: "#8b5cf6", description: "Premium purple" },
  { name: "Orange", value: "#f97316", description: "High-frequency orange" },
  { name: "Teal", value: "#14b8a6", description: "Modern teal" },
  { name: "Pink", value: "#ec4899", description: "Special service pink" },
  { name: "Yellow", value: "#eab308", description: "School service yellow" }
];

const lineStyles = [
  { value: "solid", label: "Solid", description: "Standard continuous line" },
  { value: "dashed", label: "Dashed", description: "Intermittent service indicator" },
  { value: "dotted", label: "Dotted", description: "Future or planned routes" },
  { value: "double", label: "Double", description: "High-capacity corridors" }
];

const patterns = [
  { value: "none", label: "None", description: "Clean, minimal appearance" },
  { value: "arrows", label: "Arrows", description: "Show direction of travel" },
  { value: "dots", label: "Dots", description: "Station location indicators" },
  { value: "pulse", label: "Pulse", description: "Live activity indicator" }
];

const animations = [
  { value: "none", label: "Static", description: "No animation" },
  { value: "flow", label: "Flow", description: "Flowing movement effect" },
  { value: "glow", label: "Glow", description: "Pulsing glow effect" },
  { value: "gradient", label: "Gradient", description: "Color gradient transition" }
];

export default function RouteAestheticsPanel({ routes, theme }: RouteAestheticsPanelProps) {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [aesthetics, setAesthetics] = useState<AestheticSettings>({
    color: "#3b82f6",
    lineStyle: "solid",
    lineWidth: 4,
    opacity: 1.0,
    pattern: "none",
    animation: "none"
  });
  const [isOpen, setIsOpen] = useState(false);

  const queryClient = useQueryClient();

  const updateRouteMutation = useMutation({
    mutationFn: async (updates: Partial<Route>) => {
      if (!selectedRoute) throw new Error("No route selected");
      return apiRequest("PATCH", `/api/routes/${selectedRoute.id}/aesthetics`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/routes'] });
      setIsOpen(false);
    }
  });

  const handleRouteSelect = (route: Route) => {
    setSelectedRoute(route);
    setAesthetics({
      color: route.color || "#3b82f6",
      lineStyle: (route.lineStyle as "solid" | "dashed" | "dotted" | "double") || "solid",
      lineWidth: route.lineWidth || 4,
      opacity: route.opacity || 1.0,
      pattern: (route.pattern as "none" | "arrows" | "dots" | "pulse") || "none",
      animation: (route.animation as "none" | "flow" | "glow" | "gradient") || "none",
      glowColor: route.glowColor || undefined,
      gradientEnd: route.gradientEnd || undefined
    });
  };

  const handleApplyChanges = () => {
    if (!selectedRoute) return;
    
    updateRouteMutation.mutate({
      ...aesthetics,
      // Convert null values to undefined for proper API handling
      glowColor: aesthetics.glowColor || null,
      gradientEnd: aesthetics.gradientEnd || null
    });
  };

  const resetToDefault = () => {
    setAesthetics({
      color: "#3b82f6",
      lineStyle: "solid",
      lineWidth: 4,
      opacity: 1.0,
      pattern: "none",
      animation: "none"
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className={`${theme === "dark" ? "border-gray-600 text-gray-200 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
        >
          <Palette className="h-4 w-4 mr-2" />
          Customize Routes
        </Button>
      </DialogTrigger>
      
      <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto ${theme === "dark" ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"}`}>
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            <Sparkles className="h-5 w-5" />
            Transit Line Aesthetic Customization
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Route Selection */}
          <div className="space-y-4">
            <div>
              <Label className={`text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                Select Route to Customize
              </Label>
              <div className="grid gap-2 mt-2">
                {routes.map(route => (
                  <button
                    key={route.id}
                    onClick={() => handleRouteSelect(route)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      selectedRoute?.id === route.id
                        ? theme === "dark" 
                          ? "border-blue-500 bg-blue-500/20" 
                          : "border-blue-500 bg-blue-50"
                        : theme === "dark"
                          ? "border-gray-600 hover:border-gray-500 bg-gray-700/50"
                          : "border-gray-200 hover:border-gray-300 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                          Route {route.routeNumber}
                        </div>
                        <div className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                          {route.name}
                        </div>
                      </div>
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white"
                        style={{ backgroundColor: route.color || "#3b82f6" }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Customization Controls */}
          <div className="lg:col-span-2 space-y-6">
            {selectedRoute ? (
              <>
                {/* Color Selection */}
                <div>
                  <Label className={`text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                    Route Color
                  </Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {colorOptions.map(color => (
                      <button
                        key={color.value}
                        onClick={() => setAesthetics(prev => ({ ...prev, color: color.value }))}
                        className={`p-2 rounded-lg border-2 transition-all ${
                          aesthetics.color === color.value
                            ? "border-white shadow-lg scale-105"
                            : "border-transparent hover:scale-102"
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.description}
                      >
                        <div className="h-8 w-full rounded" />
                        <div className="text-xs text-white font-medium mt-1">
                          {color.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Line Style */}
                <div>
                  <Label className={`text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                    Line Style
                  </Label>
                  <Select value={aesthetics.lineStyle} onValueChange={(value: any) => setAesthetics(prev => ({ ...prev, lineStyle: value }))}>
                    <SelectTrigger className={`mt-2 ${theme === "dark" ? "border-gray-600 bg-gray-700" : "border-gray-300"}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {lineStyles.map(style => (
                        <SelectItem key={style.value} value={style.value}>
                          <div>
                            <div className="font-medium">{style.label}</div>
                            <div className="text-xs text-gray-500">{style.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Line Width */}
                <div>
                  <Label className={`text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                    Line Width: {aesthetics.lineWidth}px
                  </Label>
                  <Slider
                    value={[aesthetics.lineWidth]}
                    onValueChange={(value) => setAesthetics(prev => ({ ...prev, lineWidth: value[0] }))}
                    min={1}
                    max={12}
                    step={1}
                    className="mt-2"
                  />
                </div>

                {/* Opacity */}
                <div>
                  <Label className={`text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                    Opacity: {Math.round(aesthetics.opacity * 100)}%
                  </Label>
                  <Slider
                    value={[aesthetics.opacity]}
                    onValueChange={(value) => setAesthetics(prev => ({ ...prev, opacity: value[0] }))}
                    min={0.1}
                    max={1.0}
                    step={0.1}
                    className="mt-2"
                  />
                </div>

                {/* Pattern */}
                <div>
                  <Label className={`text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                    Line Pattern
                  </Label>
                  <Select value={aesthetics.pattern} onValueChange={(value: any) => setAesthetics(prev => ({ ...prev, pattern: value }))}>
                    <SelectTrigger className={`mt-2 ${theme === "dark" ? "border-gray-600 bg-gray-700" : "border-gray-300"}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {patterns.map(pattern => (
                        <SelectItem key={pattern.value} value={pattern.value}>
                          <div>
                            <div className="font-medium">{pattern.label}</div>
                            <div className="text-xs text-gray-500">{pattern.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Animation */}
                <div>
                  <Label className={`text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                    Animation Effect
                  </Label>
                  <Select value={aesthetics.animation} onValueChange={(value: any) => setAesthetics(prev => ({ ...prev, animation: value }))}>
                    <SelectTrigger className={`mt-2 ${theme === "dark" ? "border-gray-600 bg-gray-700" : "border-gray-300"}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {animations.map(animation => (
                        <SelectItem key={animation.value} value={animation.value}>
                          <div>
                            <div className="font-medium">{animation.label}</div>
                            <div className="text-xs text-gray-500">{animation.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Advanced Options */}
                {(aesthetics.animation === "glow" || aesthetics.animation === "gradient") && (
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <Label className={`font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                        Advanced Effects
                      </Label>
                    </div>
                    
                    {aesthetics.animation === "glow" && (
                      <div>
                        <Label className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                          Glow Color
                        </Label>
                        <input
                          type="color"
                          value={aesthetics.glowColor || aesthetics.color}
                          onChange={(e) => setAesthetics(prev => ({ ...prev, glowColor: e.target.value }))}
                          className="mt-1 w-full h-10 rounded border"
                        />
                      </div>
                    )}
                    
                    {aesthetics.animation === "gradient" && (
                      <div>
                        <Label className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                          Gradient End Color
                        </Label>
                        <input
                          type="color"
                          value={aesthetics.gradientEnd || aesthetics.color}
                          onChange={(e) => setAesthetics(prev => ({ ...prev, gradientEnd: e.target.value }))}
                          className="mt-1 w-full h-10 rounded border"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Preview */}
                <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
                  <Label className={`text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                    Preview
                  </Label>
                  <div className="mt-2 p-4 bg-white dark:bg-gray-800 rounded border">
                    <svg width="100%" height="60" viewBox="0 0 300 60">
                      <defs>
                        {aesthetics.animation === "gradient" && (
                          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={aesthetics.color} />
                            <stop offset="100%" stopColor={aesthetics.gradientEnd || aesthetics.color} />
                          </linearGradient>
                        )}
                      </defs>
                      <line
                        x1="20"
                        y1="30"
                        x2="280"
                        y2="30"
                        stroke={aesthetics.animation === "gradient" ? "url(#routeGradient)" : aesthetics.color}
                        strokeWidth={aesthetics.lineWidth}
                        strokeOpacity={aesthetics.opacity}
                        strokeDasharray={
                          aesthetics.lineStyle === "dashed" ? "10,5" :
                          aesthetics.lineStyle === "dotted" ? "2,3" :
                          aesthetics.lineStyle === "double" ? undefined : "none"
                        }
                        filter={aesthetics.animation === "glow" ? "drop-shadow(0 0 8px " + (aesthetics.glowColor || aesthetics.color) + ")" : "none"}
                      />
                      {aesthetics.lineStyle === "double" && (
                        <line
                          x1="20"
                          y1="26"
                          x2="280"
                          y2="26"
                          stroke={aesthetics.color}
                          strokeWidth={Math.max(1, aesthetics.lineWidth - 2)}
                          strokeOpacity={aesthetics.opacity}
                        />
                      )}
                    </svg>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleApplyChanges}
                    disabled={updateRouteMutation.isPending}
                    className="flex-1"
                  >
                    {updateRouteMutation.isPending ? "Applying..." : "Apply Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetToDefault}
                    className="flex-1"
                  >
                    Reset to Default
                  </Button>
                </div>
              </>
            ) : (
              <div className={`text-center py-12 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a route from the left to customize its appearance</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}