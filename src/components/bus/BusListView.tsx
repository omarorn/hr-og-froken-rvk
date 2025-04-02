
import React from 'react';
import { Bus, MapPin, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StraetoRealtimeData, StraetoRoute } from '@/services/straeto';

interface BusListViewProps {
  loading: boolean;
  busLocations: StraetoRealtimeData[];
  selectedRoute: StraetoRoute | undefined;
  refreshing: boolean;
  onRefresh: () => void;
  height: string;
}

const BusListView: React.FC<BusListViewProps> = ({
  loading,
  busLocations,
  selectedRoute,
  refreshing,
  onRefresh,
  height
}) => {
  return (
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
              onClick={onRefresh}
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
  );
};

export default BusListView;
