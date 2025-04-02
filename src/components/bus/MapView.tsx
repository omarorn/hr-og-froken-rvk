
import React from 'react';
import { Bus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StraetoRoute, StraetoRealtimeData } from '@/services/straeto';

interface MapViewProps {
  loading: boolean;
  selectedRoute: StraetoRoute | undefined;
  busLocations: StraetoRealtimeData[];
  refreshing: boolean;
  height: string;
}

const MapView: React.FC<MapViewProps> = ({
  loading,
  selectedRoute,
  busLocations,
  refreshing,
  height
}) => {
  return (
    <div className="rounded-md border overflow-hidden" style={{ height }}>
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
  );
};

export default MapView;
