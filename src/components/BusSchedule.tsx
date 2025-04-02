
import React, { useEffect, useState } from 'react';
import { getStraetoArrivals, getStraetoStops, StraetoArrival, StraetoStop } from '@/services/straeto';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Bus, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BusScheduleProps {
  routeId: string;
  routeName?: string;
  onSelectBus?: (busId: string, latitude: number, longitude: number) => void;
}

const BusSchedule: React.FC<BusScheduleProps> = ({ 
  routeId, 
  routeName,
  onSelectBus
}) => {
  const [stops, setStops] = useState<StraetoStop[]>([]);
  const [selectedStopId, setSelectedStopId] = useState<string>('');
  const [arrivals, setArrivals] = useState<StraetoArrival[]>([]);
  const [loadingStops, setLoadingStops] = useState<boolean>(true);
  const [loadingArrivals, setLoadingArrivals] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load stops when route changes
  useEffect(() => {
    loadStops();
  }, [routeId]);

  // Load arrivals when selected stop changes
  useEffect(() => {
    if (selectedStopId) {
      loadArrivals();
    }
  }, [selectedStopId]);

  const loadStops = async () => {
    if (!routeId) return;
    
    setLoadingStops(true);
    setError(null);
    
    try {
      const response = await getStraetoStops(routeId);
      
      if ('error' in response) {
        setError(response.error);
      } else {
        setStops(response);
        
        // Select first stop by default
        if (response.length > 0 && !selectedStopId) {
          setSelectedStopId(response[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading stops:', err);
      setError('Unexpected error loading bus stops');
    } finally {
      setLoadingStops(false);
    }
  };

  const loadArrivals = async () => {
    if (!selectedStopId) return;
    
    setLoadingArrivals(true);
    setError(null);
    
    try {
      const response = await getStraetoArrivals(selectedStopId);
      
      if ('error' in response) {
        setError(response.error);
      } else {
        // Filter arrivals for the selected route if routeId is provided
        const filteredArrivals = routeId 
          ? response.filter(arrival => arrival.routeId === routeId)
          : response;
          
        setArrivals(filteredArrivals);
      }
    } catch (err) {
      console.error('Error loading arrivals:', err);
      setError('Unexpected error loading bus arrivals');
    } finally {
      setLoadingArrivals(false);
    }
  };

  const handleStopChange = (stopId: string) => {
    setSelectedStopId(stopId);
  };

  const calculateTimeRemaining = (arrivalTime: string): string => {
    const arrivalDate = new Date(arrivalTime);
    const now = new Date();
    
    const diffMs = arrivalDate.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 0) {
      return 'Departed';
    }
    
    if (diffMinutes < 1) {
      return 'Now';
    }
    
    return `${diffMinutes} min`;
  };

  const getSelectedStop = (): StraetoStop | undefined => {
    return stops.find(stop => stop.id === selectedStopId);
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2">
          <h3 className="font-medium">Select Bus Stop</h3>
          <p className="text-sm text-muted-foreground">
            Choose a stop to see upcoming arrivals
          </p>
        </div>
        
        {loadingStops ? (
          <Skeleton className="h-10 w-full" />
        ) : stops.length === 0 ? (
          <div className="text-center p-4 border rounded-md">
            <p className="text-muted-foreground">No stops available for this route</p>
          </div>
        ) : (
          <Select 
            value={selectedStopId} 
            onValueChange={handleStopChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a bus stop" />
            </SelectTrigger>
            <SelectContent>
              {stops.map(stop => (
                <SelectItem key={stop.id} value={stop.id}>
                  {stop.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      
      {error && (
        <div className="bg-destructive/15 border border-destructive/30 text-destructive p-3 rounded-md">
          <p className="text-sm flex items-center">
            <X size={16} className="mr-2" />
            {error}
          </p>
        </div>
      )}
      
      {selectedStopId && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">
                  {routeName ? `Route ${routeName}` : 'Arrivals'}
                </CardTitle>
                <CardDescription>
                  {getSelectedStop()?.name || 'Loading stop information...'}
                </CardDescription>
              </div>
              {routeName && (
                <Badge className="bg-blue-500">
                  {routeName}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loadingArrivals ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full" />
                ))}
              </div>
            ) : arrivals.length === 0 ? (
              <div className="text-center py-6">
                <Clock className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="font-medium">No upcoming arrivals</p>
                <p className="text-sm text-muted-foreground mt-1">
                  There are no scheduled arrivals for this stop at this time
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {arrivals.map((arrival, index) => (
                  <div 
                    key={`${arrival.tripId}-${index}`} 
                    className="flex items-center justify-between p-2 rounded-md hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="bg-slate-100 p-2 rounded-full mr-3">
                        <Bus size={18} className="text-slate-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">
                            {arrival.routeNumber}
                          </Badge>
                          <span className="font-medium">{arrival.headSign}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(arrival.arrivalTime).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                          {arrival.realTimeArrival && (
                            <span className="ml-1">
                              ({calculateTimeRemaining(arrival.realTimeArrival)})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    {onSelectBus && (
                      <Button variant="ghost" size="sm" onClick={() => {
                        // This is a placeholder - in a real app, this would select the bus on the map
                        // We should show the bus location when clicked
                        onSelectBus(arrival.tripId, 0, 0);
                      }}>
                        View
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BusSchedule;
