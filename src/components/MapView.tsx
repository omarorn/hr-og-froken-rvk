
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useMap } from '@/hooks/useMap';
import { useDirections } from '@/hooks/useDirections';
import SearchBar from '@/components/map/SearchBar';
import DirectionsPanel from '@/components/map/DirectionsPanel';
import MapDisplay from '@/components/map/MapDisplay';

interface MapViewProps {
  initialLat?: number;
  initialLng?: number;
  initialZoom?: number;
  showSearchBar?: boolean;
  showDirections?: boolean;
  onLocationSelected?: (lat: number, lng: number, address?: string) => void;
}

const MapView: React.FC<MapViewProps> = ({
  initialLat = 64.1466,
  initialLng = -21.9426,
  initialZoom = 13,
  showSearchBar = true,
  showDirections = false,
  onLocationSelected
}) => {
  // Use our custom hooks
  const mapState = useMap(initialLat, initialLng, initialZoom);
  const directionsState = useDirections(mapState.center);
  
  // Handle search with callback for location selection
  const handleSearchWithCallback = (e: React.FormEvent) => {
    const searchResult = mapState.handleSearch(e);
    if (onLocationSelected) {
      onLocationSelected(searchResult.lat, searchResult.lng, searchResult.address);
    }
  };

  return (
    <div className="space-y-4">
      {showSearchBar && (
        <Card>
          <CardContent className="p-4">
            <SearchBar 
              searchQuery={mapState.searchQuery}
              setSearchQuery={mapState.setSearchQuery}
              handleSearch={handleSearchWithCallback}
              handleGetCurrentLocation={mapState.handleGetCurrentLocation}
            />
          </CardContent>
        </Card>
      )}
      
      {showDirections && (
        <Card>
          <CardContent className="p-4">
            <DirectionsPanel 
              destinationAddress={directionsState.destinationAddress}
              setDestinationAddress={directionsState.setDestinationAddress}
              transportMode={directionsState.transportMode}
              setTransportMode={directionsState.setTransportMode}
              handleDirectionsSearch={directionsState.handleDirectionsSearch}
              directionSteps={directionsState.directionSteps}
            />
          </CardContent>
        </Card>
      )}
      
      <MapDisplay 
        mapRef={mapState.mapRef}
        mapLoaded={mapState.mapLoaded}
        center={mapState.center}
        zoom={mapState.zoom}
      />
    </div>
  );
};

export default MapView;
