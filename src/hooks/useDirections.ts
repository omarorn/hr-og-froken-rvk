
import { useState, useCallback } from 'react';
import { getDirections } from '@/services/maps';

interface DirectionStep {
  instruction: string;
  distance: string;
  duration: string;
}

export const useDirections = (originCoords: { lat: number; lng: number }) => {
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [transportMode, setTransportMode] = useState<'driving' | 'walking' | 'bicycling' | 'transit'>('driving');
  const [directionSteps, setDirectionSteps] = useState<DirectionStep[]>([]);

  const handleDirectionsSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!destinationAddress || !originCoords) return;

    // In a real app, we would geocode the destination address
    // For now, we'll use a mock destination near Reykjavik
    const mockDestination = {
      lat: 64.1306, // Kringlan shopping mall
      lng: -21.8937
    };

    try {
      const directions = await getDirections(
        originCoords.lat,
        originCoords.lng,
        mockDestination.lat,
        mockDestination.lng,
        transportMode
      );

      setDirectionSteps(directions.steps);
    } catch (error) {
      console.error('Error getting directions:', error);
      setDirectionSteps([]);
    }
  }, [destinationAddress, originCoords, transportMode]);

  return {
    destinationAddress,
    setDestinationAddress,
    transportMode,
    setTransportMode,
    directionSteps,
    handleDirectionsSearch
  };
};
