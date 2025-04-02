
/**
 * Types for maps-related services
 */

export interface PlaceResult {
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  rating?: number;
  types: string[];
  openingHours?: {
    isOpen: boolean;
    periods: Array<{
      day: number;
      open: string;
      close: string;
    }>;
  };
}

export type TransportMode = 'driving' | 'walking' | 'bicycling' | 'transit';

export interface DirectionsResult {
  origin: string;
  destination: string;
  distance: string;
  duration: string;
  steps: Array<{
    instruction: string;
    distance: string;
    duration: string;
  }>;
}

// Common types for location data
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationResult extends Coordinates {
  accuracy: number;
}

// Mock Google Maps API key (would need a real key in production)
export const GOOGLE_MAPS_API_KEY = "mock_key";
