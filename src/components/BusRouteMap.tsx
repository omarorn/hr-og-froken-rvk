
import React, { useEffect, useState, useRef } from 'react';
import { getStraetoRealtime, getStraetoRoutes, StraetoRealtimeData, StraetoRoute } from '@/services/straeto';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RouteSelector from './bus/RouteSelector';
import MapView from './bus/MapView';
import BusListView from './bus/BusListView';

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
        <RouteSelector
          routes={routes}
          selectedRouteId={selectedRouteId}
          onRouteChange={handleRouteChange}
          onRefresh={handleRefresh}
          loading={loading}
          refreshing={refreshing}
        />
      )}

      <Tabs defaultValue="map">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="map">Map</TabsTrigger>
          <TabsTrigger value="list">Bus List</TabsTrigger>
        </TabsList>
        
        <TabsContent value="map">
          <MapView
            loading={loading}
            selectedRoute={selectedRoute}
            busLocations={busLocations}
            refreshing={refreshing}
            height={height}
          />
        </TabsContent>
        
        <TabsContent value="list">
          <BusListView
            loading={loading}
            busLocations={busLocations}
            selectedRoute={selectedRoute}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            height={height}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusRouteMap;
