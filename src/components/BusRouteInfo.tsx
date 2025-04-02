
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Bus, Clock, Map, Navigation } from 'lucide-react';
import { findBusTrips, BusTrip } from '@/services/transportationService';
import { getCurrentLocation } from '@/services/maps';
import { getCurrentTime, formatIcelandicDate } from '@/services/timeService';

interface BusRouteInfoProps {
  destinationLat?: number;
  destinationLng?: number;
  destinationName?: string;
  showMap?: boolean;
  onViewOnMap?: (originLat: number, originLng: number, destLat: number, destLng: number) => void;
}

const BusRouteInfo: React.FC<BusRouteInfoProps> = ({
  destinationLat = 64.1306, // Default: Kringlan
  destinationLng = -21.8937,
  destinationName = "Kringlan",
  showMap = true,
  onViewOnMap
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [tripInfo, setTripInfo] = useState<BusTrip | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [originLat, setOriginLat] = useState<number | null>(null);
  const [originLng, setOriginLng] = useState<number | null>(null);

  // Get current time
  const currentTime = getCurrentTime();
  const currentDate = formatIcelandicDate(new Date(), "medium");

  // Get current location and find bus trips
  useEffect(() => {
    const fetchBusTrips = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get current location
        const location = await getCurrentLocation();
        
        if (!location) {
          throw new Error("Could not determine your location");
        }
        
        setOriginLat(location.lat);
        setOriginLng(location.lng);
        
        // Find bus trips
        const trips = await findBusTrips(
          location.lat,
          location.lng,
          destinationLat,
          destinationLng
        );
        
        setTripInfo(trips);
      } catch (error) {
        console.error("Error fetching bus trips:", error);
        setError("Could not find bus routes. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBusTrips();
  }, [destinationLat, destinationLng]);

  // Handler for refreshing routes
  const handleRefresh = () => {
    if (originLat && originLng) {
      setLoading(true);
      
      findBusTrips(originLat, originLng, destinationLat, destinationLng)
        .then(trips => {
          setTripInfo(trips);
          setError(null);
        })
        .catch(err => {
          console.error("Error refreshing bus trips:", err);
          setError("Could not refresh bus routes. Please try again.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  // Handler for view on map
  const handleViewOnMap = () => {
    if (originLat && originLng && onViewOnMap) {
      onViewOnMap(originLat, originLng, destinationLat, destinationLng);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bus className="h-5 w-5" />
            <span>Bus Routes</span>
          </CardTitle>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{currentTime.formatted}</span>
          </div>
        </div>
        <CardDescription>
          {currentDate}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-red-500 mb-2">{error}</p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        ) : tripInfo ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <div className="font-medium">From: Your Location</div>
                <div className="text-muted-foreground">
                  {tripInfo.origin.name !== "Unknown" 
                    ? `Nearest stop: ${tripInfo.origin.name}` 
                    : "Finding nearest stop..."}
                </div>
              </div>
              <div className="text-sm text-right">
                <div className="font-medium">To: {destinationName}</div>
                <div className="text-muted-foreground">
                  {tripInfo.destination.name !== "Unknown" 
                    ? `Nearest stop: ${tripInfo.destination.name}` 
                    : "Finding nearest stop..."}
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg divide-y">
              {tripInfo.options.length > 0 ? (
                tripInfo.options.map((option, index) => (
                  <div key={index} className="p-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">Option {index + 1}</div>
                      <div className="text-sm text-muted-foreground">
                        {option.totalDuration} min • {option.transfers} {option.transfers === 1 ? 'transfer' : 'transfers'}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {option.routes.map((route, routeIndex) => (
                        <div key={routeIndex} className="flex items-center gap-2">
                          <div className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                            {route.routeNumber}
                          </div>
                          <div className="text-sm flex-1">
                            {route.departureTime} → {route.arrivalTime}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {option.walkingDistance > 0 && (
                      <div className="text-xs text-muted-foreground mt-2">
                        Walking distance: {option.walkingDistance}m
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No routes found. Try changing your destination.
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleRefresh} variant="outline" className="w-full">
                Refresh
              </Button>
              
              {showMap && onViewOnMap && (
                <Button onClick={handleViewOnMap} variant="default" className="w-full">
                  <Map className="h-4 w-4 mr-2" />
                  View on Map
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No route information available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BusRouteInfo;
