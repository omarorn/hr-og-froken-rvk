
import React, { useEffect, useState, useRef } from 'react';
import { getStraetoRealtime, getStraetoRoutes, StraetoRealtimeData, StraetoRoute } from '@/services/straeto';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { MapPin, Bus, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface BusRouteMapProps {
  defaultRoute?: string;
  showControls?: boolean;
  height?: string;
}

const BusRouteMap: React.FC<BusRouteMapProps> = ({ 
  defaultRoute, 
  showControls = true,
  height = '500px'
}) => {
  const [routes, setRoutes] = useState<StraetoRoute[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | undefined>(defaultRoute);
  const [busLocations, setBusLocations] = useState<StraetoRealtimeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const refreshTimerRef = useRef<number | null>(null);

  // Fetch routes on initial load
  useEffect(() => {
    loadRoutes();
    
    // Start the refresh timer for bus locations
    startRefreshTimer();
    
    return () => {
      // Clear refresh timer on unmount
      if (refreshTimerRef.current) {
        window.clearInterval(refreshTimerRef.current);
      }
    };
  }, []);

  // Fetch bus locations when selected route changes
  useEffect(() => {
    if (routes.length > 0) {
      loadBusLocations();
    }
  }, [selectedRouteId, routes]);

  const loadRoutes = async () => {
    setLoading(true);
    try {
      const response = await getStraetoRoutes();
      
      if ('error' in response) {
        setError(response.error);
        toast({
          title: "Failed to load bus routes",
          description: response.error,
          variant: "destructive"
        });
      } else {
        setRoutes(response);
        
        // Set default route if not already set
        if (!selectedRouteId && response.length > 0) {
          setSelectedRouteId(response[0].id);
        }
        
        setError(null);
      }
    } catch (err) {
      console.error('Error loading routes:', err);
      setError('Unexpected error loading bus routes');
    } finally {
      setLoading(false);
    }
  };

  const loadBusLocations = async () => {
    try {
      setRefreshing(true);
      const routeIds = selectedRouteId ? [selectedRouteId] : undefined;
      const response = await getStraetoRealtime(routeIds);
      
      if ('error' in response) {
        console.error('Error fetching bus locations:', response.error);
        // Don't show toast for location errors to avoid spam
      } else {
        setBusLocations(response);
      }
    } catch (err) {
      console.error('Error loading bus locations:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const startRefreshTimer = () => {
    // Refresh bus locations every 15 seconds
    refreshTimerRef.current = window.setInterval(() => {
      loadBusLocations();
    }, 15000);
  };

  const handleRouteChange = (routeId: string) => {
    setSelectedRouteId(routeId);
  };

  const handleRefresh = () => {
    loadBusLocations();
  };

  // Get the selected route object
  const selectedRoute = routes.find(route => route.id === selectedRouteId);

  return (
    <div className="space-y-4">
      {showControls && (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:w-64">
            <Select 
              value={selectedRouteId} 
              onValueChange={handleRouteChange}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a bus route" />
              </SelectTrigger>
              <SelectContent>
                {routes.map(route => (
                  <SelectItem key={route.id} value={route.id}>
                    <span className="flex items-center gap-2">
                      <Badge
                        style={{ 
                          backgroundColor: route.color || '#1d4ed8',
                          color: route.textColor || '#ffffff'
                        }}
                      >
                        {route.shortName}
                      </Badge>
                      {route.longName}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="whitespace-nowrap"
          >
            <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      )}

      <Tabs defaultValue="map">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="map">Map</TabsTrigger>
          <TabsTrigger value="list">Bus List</TabsTrigger>
        </TabsList>
        
        <TabsContent value="map">
          <div 
            ref={mapRef} 
            className="rounded-md border overflow-hidden"
            style={{ height }}
          >
            {loading ? (
              <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center">
                <p className="text-muted-foreground">Loading map...</p>
              </div>
            ) : (
              <div className="w-full h-full bg-slate-100 relative">
                <div className="absolute top-2 right-2 z-10 bg-white p-2 rounded-md shadow-md">
                  {selectedRoute && (
                    <Badge
                      style={{ 
                        backgroundColor: selectedRoute.color || '#1d4ed8',
                        color: selectedRoute.textColor || '#ffffff'
                      }}
                      className="text-lg px-3 py-1.5"
                    >
                      <Bus size={16} className="mr-1.5" />
                      {selectedRoute.shortName}
                    </Badge>
                  )}
                </div>
                
                <div className="absolute bottom-2 left-2 z-10 bg-white p-2 rounded-md shadow-md">
                  <p className="text-xs text-muted-foreground">
                    {busLocations.length} active buses 
                    {refreshing && ' • Refreshing...'}
                  </p>
                </div>
                
                {/* This is a placeholder for the map. In a real implementation, 
                    you would use a mapping library like Google Maps, Leaflet, or Mapbox */}
                <div className="w-full h-full flex items-center justify-center bg-blue-50">
                  <div className="text-center">
                    <Bus size={64} className="mx-auto text-blue-500 mb-4" />
                    <p className="font-medium text-lg">Map View</p>
                    <p className="text-sm text-muted-foreground max-w-md">
                      {busLocations.length > 0 
                        ? `Showing ${busLocations.length} buses on ${selectedRoute?.shortName || 'all routes'}`
                        : 'No active buses found for this route'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="list">
          <div className="rounded-md border overflow-hidden" style={{ height, overflowY: 'auto' }}>
            {loading ? (
              <div className="p-4 space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : busLocations.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center p-8">
                <div className="text-center">
                  <Bus size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-xl font-medium">No active buses</p>
                  <p className="text-muted-foreground mt-2">
                    There are currently no active buses for {selectedRoute?.shortName 
                      ? `route ${selectedRoute.shortName}` 
                      : 'the selected routes'}
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 p-4">
                {busLocations.map((bus) => (
                  <Card key={bus.busId} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base flex items-center">
                          <Bus size={18} className="mr-2" />
                          Bus ID: {bus.busId}
                        </CardTitle>
                        <Badge
                          style={{ 
                            backgroundColor: selectedRoute?.color || '#1d4ed8',
                            color: selectedRoute?.textColor || '#ffffff'
                          }}
                        >
                          Route {bus.routeNumber}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-muted-foreground">Coordinates:</p>
                            <p className="font-mono">{bus.latitude.toFixed(6)}, {bus.longitude.toFixed(6)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Last Updated:</p>
                            <p>{new Date(bus.timestamp).toLocaleTimeString()}</p>
                          </div>
                          {bus.heading !== undefined && (
                            <div>
                              <p className="text-muted-foreground">Heading:</p>
                              <p>{bus.heading}°</p>
                            </div>
                          )}
                          {bus.speed !== undefined && (
                            <div>
                              <p className="text-muted-foreground">Speed:</p>
                              <p>{bus.speed} km/h</p>
                            </div>
                          )}
                        </div>
                        
                        {bus.nextStop && (
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-muted-foreground flex items-center">
                              <MapPin size={14} className="mr-1" /> 
                              Next Stop:
                            </p>
                            <p className="font-medium">{bus.nextStop.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Scheduled arrival: {new Date(bus.nextStop.scheduledArrival).toLocaleTimeString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusRouteMap;
