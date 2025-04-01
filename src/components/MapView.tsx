
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCurrentLocation } from '@/services/mapsService';
import { MapPin, Navigation, Search, Bus, Car, Bike, Person } from 'lucide-react';

// Define types for props
interface MapViewProps {
  initialLat?: number;
  initialLng?: number;
  initialZoom?: number;
  showSearchBar?: boolean;
  showDirections?: boolean;
  onLocationSelected?: (lat: number, lng: number, address?: string) => void;
}

// Mock map component (replace with actual Google Maps integration)
const MapView: React.FC<MapViewProps> = ({
  initialLat = 64.1466,
  initialLng = -21.9426,
  initialZoom = 13,
  showSearchBar = true,
  showDirections = false,
  onLocationSelected
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: initialLat, lng: initialLng });
  const [zoom, setZoom] = useState<number>(initialZoom);
  const [transportMode, setTransportMode] = useState<string>('driving');
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [directionSteps, setDirectionSteps] = useState<Array<{ instruction: string; distance: string; duration: string }>>([]);

  // Effect to initialize map (simulated)
  useEffect(() => {
    if (mapRef.current) {
      // In a real implementation, this would initialize the Google Maps API
      console.log(`Initializing map at [${center.lat}, ${center.lng}] with zoom ${zoom}`);
      
      // Simulate map loading
      setTimeout(() => {
        setMapLoaded(true);
      }, 500);
    }
  }, []);

  // Effect to update map when center or zoom changes (simulated)
  useEffect(() => {
    if (mapLoaded) {
      console.log(`Moving map to [${center.lat}, ${center.lng}] with zoom ${zoom}`);
      // In a real implementation, this would update the Google Map
    }
  }, [center, zoom, mapLoaded]);

  // Handler for getting current location
  const handleGetCurrentLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      setCenter({ lat: location.lat, lng: location.lng });
      setZoom(15);
      
      if (onLocationSelected) {
        onLocationSelected(location.lat, location.lng);
      }
    }
  };

  // Handler for search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulated search - in real implementation, this would use Google Places API
    console.log(`Searching for: ${searchQuery}`);
    
    // Mock search result - random location near Reykjavik
    const randomOffset = () => (Math.random() - 0.5) * 0.02;
    const searchResult = {
      lat: 64.1466 + randomOffset(),
      lng: -21.9426 + randomOffset(),
      address: searchQuery + ', Reykjavík, Iceland'
    };
    
    setCenter({ lat: searchResult.lat, lng: searchResult.lng });
    setZoom(16);
    
    if (onLocationSelected) {
      onLocationSelected(searchResult.lat, searchResult.lng, searchResult.address);
    }
  };

  // Handler for directions search
  const handleDirectionsSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulated directions - in real implementation, this would use Google Directions API
    console.log(`Getting directions to: ${destinationAddress} via ${transportMode}`);
    
    // Mock directions result
    const mockDirections = [
      { instruction: "Head south on Laugavegur", distance: "300 m", duration: "1 min" },
      { instruction: "Turn right onto Snorrabraut", distance: "700 m", duration: "2 mins" },
      { instruction: "Continue onto Hringbraut", distance: "1.5 km", duration: "3 mins" },
      { instruction: "Turn left onto Hofsvallagata", distance: "800 m", duration: "2 mins" }
    ];
    
    setDirectionSteps(mockDirections);
  };

  // Transport mode icon
  const getTransportIcon = () => {
    switch (transportMode) {
      case 'driving': return <Car size={16} />;
      case 'walking': return <Person size={16} />;
      case 'bicycling': return <Bike size={16} />;
      case 'transit': return <Bus size={16} />;
      default: return <Car size={16} />;
    }
  };

  return (
    <div className="space-y-4">
      {showSearchBar && (
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex space-x-2">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search for a place"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" variant="default" size="icon" className="h-10 w-10">
                <Search size={16} />
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                className="h-10 w-10"
                onClick={handleGetCurrentLocation}
              >
                <Navigation size={16} />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
      
      {showDirections && (
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleDirectionsSearch} className="space-y-2">
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <Input
                  type="text"
                  placeholder="Enter destination"
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                />
                <Select
                  value={transportMode}
                  onValueChange={setTransportMode}
                >
                  <SelectTrigger className="w-[110px]">
                    <SelectValue placeholder="Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="driving">Driving</SelectItem>
                    <SelectItem value="walking">Walking</SelectItem>
                    <SelectItem value="bicycling">Cycling</SelectItem>
                    <SelectItem value="transit">Transit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" variant="default" className="w-full">
                Get Directions
              </Button>
            </form>
            
            {directionSteps.length > 0 && (
              <div className="mt-4 space-y-2">
                <Label className="text-sm font-semibold">Directions:</Label>
                <ol className="space-y-2 list-decimal list-inside text-sm">
                  {directionSteps.map((step, index) => (
                    <li key={index} className="pl-1">
                      <div className="flex justify-between">
                        <span>{step.instruction}</span>
                        <span className="text-muted-foreground">{step.distance} ({step.duration})</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      <div 
        ref={mapRef} 
        className="h-[400px] bg-gray-100 rounded-lg shadow-md relative overflow-hidden"
        style={{
          backgroundImage: 'url(https://maps.googleapis.com/maps/api/staticmap?center=64.1466,-21.9426&zoom=13&size=600x400&key=AIzaSyBcDCUWnGpQGfhmPQ1CjY5zqxn1FXpqJyg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
        
        {/* Center pin marker */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary">
          <MapPin size={36} className="animate-bounce" />
        </div>
        
        {/* Map attribution */}
        <div className="absolute bottom-1 right-1 text-xs text-muted-foreground bg-background/80 px-1 rounded">
          Map data © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};

export default MapView;
