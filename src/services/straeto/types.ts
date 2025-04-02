
/**
 * Type definitions for Straeto API responses and database models
 */

// API response type definitions
export interface StraetoRoute {
  id: string;
  shortName: string;
  longName: string;
  color: string;
  textColor: string;
  type: number;
  description?: string;
}

export interface StraetoStop {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address?: string;
}

export interface StraetoArrival {
  routeId: string;
  routeNumber: string;
  routeName: string;
  arrivalTime: string;
  realTimeArrival?: string;
  headSign: string;
  tripId: string;
}

export interface StraetoRealtimeData {
  busId: string;
  routeId: string;
  routeNumber: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp: string;
  nextStop?: {
    id: string;
    name: string;
    scheduledArrival: string;
  };
}

// Database model type definitions
export interface BusRoute {
  id: number;
  route_number: string;
  name: string;
  description?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface BusLocation {
  id: number;
  bus_id: string;
  route_id?: number;
  route_number: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp: string;
  updated_at: string;
}

// Error interface
export interface StraetoError {
  error: string;
}
