
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BusRouteMap from '@/components/BusRouteMap';
import { BusSchedule } from '@/components/bus';
import { getStraetoRoutes, StraetoRoute } from '@/services/straeto';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw, Bus, MapPin, Info } from 'lucide-react';

const BusTracking: React.FC = () => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  
  const { 
    data: routes,
    isLoading: loadingRoutes,
    error: routesError,
    refetch: refetchRoutes
  } = useQuery({
    queryKey: ['bus-routes'],
    queryFn: async () => {
      const response = await getStraetoRoutes();
      if ('error' in response) {
        throw new Error(response.error);
      }
      return response;
    }
  });

  const handleRouteChange = (routeId: string) => {
    setSelectedRouteId(routeId);
  };

  const getSelectedRoute = (): StraetoRoute | undefined => {
    return routes?.find(route => route.id === selectedRouteId);
  };

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Bus Tracking</h1>
        <p className="text-muted-foreground mt-2">
          Track real-time bus locations and schedules in Reykjavík
        </p>
      </header>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bus className="mr-2 h-5 w-5" />
            Select a Bus Route
          </CardTitle>
          <CardDescription>
            Choose a bus route to see real-time locations and schedules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="w-full sm:w-80">
              <Select
                value={selectedRouteId}
                onValueChange={handleRouteChange}
                disabled={loadingRoutes}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a bus route" />
                </SelectTrigger>
                <SelectContent>
                  {routes?.map(route => (
                    <SelectItem key={route.id} value={route.id}>
                      <span className="flex items-center">
                        <span 
                          className="inline-block w-4 h-4 mr-2 rounded-full"
                          style={{ backgroundColor: route.color || '#1d4ed8' }}
                        ></span>
                        {route.shortName}: {route.longName}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => refetchRoutes()}
              disabled={loadingRoutes}
              className="shrink-0"
            >
              <RefreshCw size={16} className={loadingRoutes ? 'animate-spin' : ''} />
            </Button>
          </div>
          
          {routesError && (
            <div className="mt-4 p-3 bg-destructive/15 border border-destructive/30 rounded-md text-sm text-destructive">
              Error loading bus routes: {routesError instanceof Error ? routesError.message : 'Unknown error'}
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedRouteId ? (
        <Tabs defaultValue="map" className="space-y-6">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="map" className="flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              Live Map
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center">
              <Info className="mr-2 h-4 w-4" />
              Bus Schedule
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="map" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <BusRouteMap 
                  defaultRoute={selectedRouteId} 
                  showControls={false}
                  height="600px"
                />
              </div>
              <div>
                <BusSchedule 
                  routeId={selectedRouteId} 
                  routeName={getSelectedRoute()?.shortName}
                  onSelectBus={(busId, lat, lng) => {
                    console.log(`Select bus ${busId} at ${lat},${lng}`);
                    // In a real app, this would focus the map on this bus
                  }}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="schedule" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BusSchedule 
                routeId={selectedRouteId}
                routeName={getSelectedRoute()?.shortName}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bus className="mr-2 h-5 w-5" />
                    Route Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getSelectedRoute() && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                          style={{ 
                            backgroundColor: getSelectedRoute()?.color || '#1d4ed8',
                            color: getSelectedRoute()?.textColor || '#ffffff'
                          }}
                        >
                          {getSelectedRoute()?.shortName}
                        </div>
                        <div>
                          <h3 className="font-medium">{getSelectedRoute()?.longName}</h3>
                          <p className="text-sm text-muted-foreground">Route {getSelectedRoute()?.shortName}</p>
                        </div>
                      </div>
                      
                      {getSelectedRoute()?.description && (
                        <div>
                          <h4 className="font-medium mb-1">Description</h4>
                          <p className="text-sm">{getSelectedRoute()?.description}</p>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-medium mb-1">Route Information</h4>
                        <ul className="text-sm space-y-1">
                          <li><span className="text-muted-foreground">Route ID:</span> {getSelectedRoute()?.id}</li>
                          <li><span className="text-muted-foreground">Type:</span> City Bus</li>
                          <li>
                            <span className="text-muted-foreground">Color:</span> 
                            <span 
                              className="inline-block w-3 h-3 ml-2 rounded-full"
                              style={{ backgroundColor: getSelectedRoute()?.color || '#1d4ed8' }}
                            ></span> 
                            {getSelectedRoute()?.color || 'Default'}
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="bg-muted/40 border rounded-lg p-8 text-center">
          <Bus size={64} className="mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">Select a bus route to begin</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Choose a bus route from the dropdown above to see real-time locations 
            and schedule information for Reykjavík's buses.
          </p>
        </div>
      )}
    </div>
  );
};

export default BusTracking;
