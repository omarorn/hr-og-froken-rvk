
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { StraetoStop } from '@/services/straeto';

interface BusStopSelectorProps {
  stops: StraetoStop[];
  selectedStopId: string;
  onStopChange: (stopId: string) => void;
  loading: boolean;
}

const BusStopSelector: React.FC<BusStopSelectorProps> = ({
  stops,
  selectedStopId,
  onStopChange,
  loading
}) => {
  return (
    <div>
      <div className="mb-2">
        <h3 className="font-medium">Select Bus Stop</h3>
        <p className="text-sm text-muted-foreground">
          Choose a stop to see upcoming arrivals
        </p>
      </div>
      
      {loading ? (
        <Skeleton className="h-10 w-full" />
      ) : stops.length === 0 ? (
        <div className="text-center p-4 border rounded-md">
          <p className="text-muted-foreground">No stops available for this route</p>
        </div>
      ) : (
        <Select 
          value={selectedStopId} 
          onValueChange={onStopChange}
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
  );
};

export default BusStopSelector;
