
import { useState, useCallback } from 'react';

interface DirectionStep {
  instruction: string;
  distance: string;
  duration: string;
}

export const useDirections = (center: { lat: number; lng: number }) => {
  const [transportMode, setTransportMode] = useState<string>('driving');
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [directionSteps, setDirectionSteps] = useState<DirectionStep[]>([]);

  const handleDirectionsSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Getting directions to: ${destinationAddress} via ${transportMode}`);
    
    // Mock directions data
    const mockDirections = [
      { instruction: "Head south on Laugavegur", distance: "300 m", duration: "1 min" },
      { instruction: "Turn right onto Snorrabraut", distance: "700 m", duration: "2 mins" },
      { instruction: "Continue onto Hringbraut", distance: "1.5 km", duration: "3 mins" },
      { instruction: "Turn left onto Hofsvallagata", distance: "800 m", duration: "2 mins" }
    ];
    
    setDirectionSteps(mockDirections);
  }, [destinationAddress, transportMode]);

  const getTransportIcon = useCallback(() => {
    switch (transportMode) {
      case 'driving': return 'Car';
      case 'walking': return 'User';
      case 'bicycling': return 'Bike';
      case 'transit': return 'Bus';
      default: return 'Car';
    }
  }, [transportMode]);

  return {
    transportMode,
    setTransportMode,
    destinationAddress,
    setDestinationAddress,
    directionSteps,
    handleDirectionsSearch,
    getTransportIcon
  };
};
