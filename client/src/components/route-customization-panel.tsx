import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Palette, Settings, Zap, Eye, EyeOff } from "lucide-react";
import { Route } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface RouteCustomizationPanelProps {
  routes: Route[];
  isOpen: boolean;
  onClose: () => void;
  theme: "light" | "dark";
}

export default function RouteCustomizationPanel({ routes, isOpen, onClose, theme }: RouteCustomizationPanelProps) {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [customizations, setCustomizations] = useState<{
    lineStyle: string;
    lineWidth: number;
    opacity: number;
    pattern: string;
    animation: string;
    color: string;
    glowColor: string;
    gradientEnd: string;
  }>({
    lineStyle: "solid",
    lineWidth: 3,
    opacity: 1.0,
    pattern: "none",
    animation: "none",
    color: "#1976D2",
    glowColor: "",
    gradientEnd: ""
  });

  const queryClient = useQueryClient();

  const updateRouteMutation = useMutation({
    mutationFn: async (updatedRoute: Partial<Route>) => {
      if (!selectedRoute) return;
      const response = await apiRequest(`/api/routes/${selectedRoute.id}`, {
        method: "PATCH",
        body: JSON.stringify(updatedRoute)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routes"] });
    }
  });

  const handleRouteSelect = (route: Route) => {
    setSelectedRoute(route);
    setCustomizations({
      lineStyle: route.lineStyle || "solid",
      lineWidth: route.lineWidth || 3,
      opacity: route.opacity || 1.0,
      pattern: route.pattern || "none",
      animation: route.animation || "none",
      color: route.color,
      glowColor: route.glowColor || "",
      gradientEnd: route.gradientEnd || ""
    });
  };

  const handleApplyChanges = () => {
    if (!selectedRoute) return;
    
    const updatedRoute = {
      ...customizations,
      glowColor: customizations.glowColor || null,
      gradientEnd: customizations.gradientEnd || null
    };
    
    updateRouteMutation.mutate(updatedRoute);
  };

  const resetToDefaults = () => {
    setCustomizations({
      lineStyle: "solid",
      lineWidth: 3,
      opacity: 1.0,
      pattern: "none",
      animation: "none",
      color: selectedRoute?.color || "#1976D2",
      glowColor: "",
      gradientEnd: ""
    });
  };

  const presetStyles = [
    { name: "Classic", lineStyle: "solid", lineWidth: 4, opacity: 1.0, pattern: "none", animation: "none" },
    { name: "Modern", lineStyle: "solid", lineWidth: 6, opacity: 0.9, pattern: "gradient", animation: "glow" },
    { name: "Express", lineStyle: "solid", lineWidth: 5, opacity: 1.0, pattern: "arrows", animation: "flow" },
    { name: "Subway", lineStyle: "double", lineWidth: 4, opacity: 0.8, pattern: "none", animation: "none" },
    { name: "Tram", lineStyle: "dashed", lineWidth: 3, opacity: 0.9, pattern: "dots", animation: "pulse" },
    { name: "Minimal", lineStyle: "dotted", lineWidth: 2, opacity: 0.7, pattern: "none", animation: "none" }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className={`w-[800px] max-h-[90vh] overflow-y-auto ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white"}`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Transit Line Aesthetic Customization
          </CardTitle>
          <Button variant="ghost" onClick={onClose}>
            ×
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Route Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Select Route to Customize</Label>
            <div className="grid grid-cols-4 gap-2">
              {routes.map((route) => (
                <Button
                  key={route.id}
                  variant={selectedRoute?.id === route.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRouteSelect(route)}
                  className="flex items-center gap-2 justify-start"
                >
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: route.color }}
                  />
                  <span className="truncate text-xs">{route.routeNumber}</span>
                </Button>
              ))}
            </div>
          </div>

          {selectedRoute && (
            <>
              {/* Quick Presets */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Quick Style Presets</Label>
                <div className="grid grid-cols-3 gap-2">
                  {presetStyles.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      onClick={() => setCustomizations({
                        ...customizations,
                        ...preset
                      })}
                      className="text-xs"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Color Customization */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customizations.color}
                      onChange={(e) => setCustomizations({ ...customizations, color: e.target.value })}
                      className="w-12 h-8 rounded border"
                    />
                    <span className="text-sm text-gray-500">{customizations.color}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Gradient End (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customizations.gradientEnd || customizations.color}
                      onChange={(e) => setCustomizations({ ...customizations, gradientEnd: e.target.value })}
                      className="w-12 h-8 rounded border"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCustomizations({ ...customizations, gradientEnd: "" })}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>

              {/* Line Style */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Line Style</Label>
                  <Select 
                    value={customizations.lineStyle} 
                    onValueChange={(value) => setCustomizations({ ...customizations, lineStyle: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="dashed">Dashed</SelectItem>
                      <SelectItem value="dotted">Dotted</SelectItem>
                      <SelectItem value="double">Double Line</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Pattern</Label>
                  <Select 
                    value={customizations.pattern} 
                    onValueChange={(value) => setCustomizations({ ...customizations, pattern: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="arrows">Arrows</SelectItem>
                      <SelectItem value="dots">Dots</SelectItem>
                      <SelectItem value="gradient">Gradient</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Line Width and Opacity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Line Width: {customizations.lineWidth}px
                  </Label>
                  <Slider
                    value={[customizations.lineWidth]}
                    onValueChange={([value]) => setCustomizations({ ...customizations, lineWidth: value })}
                    min={1}
                    max={12}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Opacity: {Math.round(customizations.opacity * 100)}%
                  </Label>
                  <Slider
                    value={[customizations.opacity]}
                    onValueChange={([value]) => setCustomizations({ ...customizations, opacity: value })}
                    min={0.1}
                    max={1.0}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Animation */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Animation Effect</Label>
                <Select 
                  value={customizations.animation} 
                  onValueChange={(value) => setCustomizations({ ...customizations, animation: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="flow">Flow</SelectItem>
                    <SelectItem value="pulse">Pulse</SelectItem>
                    <SelectItem value="glow">Glow</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Glow Color (if glow animation is selected) */}
              {customizations.animation === "glow" && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Glow Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customizations.glowColor || customizations.color}
                      onChange={(e) => setCustomizations({ ...customizations, glowColor: e.target.value })}
                      className="w-12 h-8 rounded border"
                    />
                    <span className="text-sm text-gray-500">{customizations.glowColor || "Auto"}</span>
                  </div>
                </div>
              )}

              {/* Preview */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Preview</Label>
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  <svg width="200" height="60" className="border rounded">
                    <defs>
                      {customizations.pattern === "gradient" && customizations.gradientEnd && (
                        <linearGradient id="preview-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor={customizations.color} />
                          <stop offset="100%" stopColor={customizations.gradientEnd} />
                        </linearGradient>
                      )}
                    </defs>
                    <line
                      x1="20"
                      y1="30"
                      x2="180"
                      y2="30"
                      stroke={customizations.pattern === "gradient" ? "url(#preview-gradient)" : customizations.color}
                      strokeWidth={customizations.lineWidth}
                      strokeOpacity={customizations.opacity}
                      strokeDasharray={
                        customizations.lineStyle === "dashed" ? "12,6" :
                        customizations.lineStyle === "dotted" ? "3,4" : undefined
                      }
                    />
                  </svg>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleApplyChanges}
                  disabled={updateRouteMutation.isPending}
                  className="flex-1"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {updateRouteMutation.isPending ? "Applying..." : "Apply Changes"}
                </Button>
                <Button variant="outline" onClick={resetToDefaults}>
                  Reset
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}