
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Bus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StraetoArrival, StraetoStop } from '@/services/straeto';

interface BusArrivalsListProps {
  selectedStop?: StraetoStop;
  arrivals: StraetoArrival[];
  loading: boolean;
  routeName?: string;
  onSelectBus?: (busId: string, latitude: number, longitude: number) => void;
}

const BusArrivalsList: React.FC<BusArrivalsListProps> = ({
  selectedStop,
  arrivals,
  loading,
  routeName,
  onSelectBus
}) => {
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

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {routeName ? `Route ${routeName}` : 'Arrivals'}
            </CardTitle>
            <CardDescription>
              {selectedStop?.name || 'Loading stop information...'}
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
        {loading ? (
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
  );
};

export default BusArrivalsList;
