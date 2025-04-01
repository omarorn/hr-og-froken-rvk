
import React from 'react';
import { MapPin } from 'lucide-react';

interface MapDisplayProps {
  mapRef: React.RefObject<HTMLDivElement>;
  mapLoaded: boolean;
  center: { lat: number; lng: number };
  zoom: number;
}

const MapDisplay: React.FC<MapDisplayProps> = ({
  mapRef,
  mapLoaded,
  center,
  zoom
}) => {
  return (
    <div 
      ref={mapRef} 
      className="h-[400px] bg-gray-100 rounded-lg shadow-md relative overflow-hidden"
      style={{
        backgroundImage: `url(https://maps.googleapis.com/maps/api/staticmap?center=${center.lat},${center.lng}&zoom=${zoom}&size=600x400&key=AIzaSyBcDCUWnGpQGfhmPQ1CjY5zqxn1FXpqJyg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}
      
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary">
        <MapPin size={36} className="animate-bounce" />
      </div>
      
      <div className="absolute bottom-1 right-1 text-xs text-muted-foreground bg-background/80 px-1 rounded">
        Map data © {new Date().getFullYear()}
      </div>
    </div>
  );
};

export default MapDisplay;
