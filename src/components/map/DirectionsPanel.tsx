
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DirectionStep {
  instruction: string;
  distance: string;
  duration: string;
}

interface DirectionsPanelProps {
  destinationAddress: string;
  setDestinationAddress: (value: string) => void;
  transportMode: 'driving' | 'walking' | 'bicycling' | 'transit';
  setTransportMode: (value: 'driving' | 'walking' | 'bicycling' | 'transit') => void;
  handleDirectionsSearch: (e: React.FormEvent) => void;
  directionSteps: DirectionStep[];
}

const DirectionsPanel: React.FC<DirectionsPanelProps> = ({
  destinationAddress,
  setDestinationAddress,
  transportMode,
  setTransportMode,
  handleDirectionsSearch,
  directionSteps
}) => {
  return (
    <div>
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
            onValueChange={(value: 'driving' | 'walking' | 'bicycling' | 'transit') => setTransportMode(value)}
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
    </div>
  );
};

export default DirectionsPanel;
