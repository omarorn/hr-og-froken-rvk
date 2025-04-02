
import { supabase, SUPABASE_PUBLIC_URL, SUPABASE_PUBLIC_KEY } from '@/integrations/supabase/client';

// Type definitions for Straeto API responses
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

// Define interfaces for database tables
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

/**
 * Fetches all bus routes from the Straeto API via edge function.
 */
export const getStraetoRoutes = async (): Promise<StraetoRoute[] | StraetoError> => {
  try {
    const { data, error } = await supabase.functions.invoke('straeto/routes', {
      method: 'GET',
    });

    if (error) {
      console.error('Error fetching Straeto routes:', error);
      return { error: error.message };
    }

    return data as StraetoRoute[];
  } catch (error) {
    console.error('Unexpected error in getStraetoRoutes:', error);
    return { error: 'Unexpected error fetching routes' };
  }
};

/**
 * Fetches real-time bus locations from the Straeto API via edge function.
 * @param routeIds - Optional array of route IDs to filter locations.
 */
export const getStraetoRealtime = async (routeIds?: string[]): Promise<StraetoRealtimeData[] | StraetoError> => {
  try {
    let path = 'straeto/realtime';
    if (routeIds && routeIds.length > 0) {
      path += `?routeIds=${routeIds.join(',')}`;
    }

    const { data, error } = await supabase.functions.invoke(path, {
      method: 'GET',
    });

    if (error) {
      console.error('Error fetching Straeto real-time data:', error);
      return { error: error.message };
    }

    return data as StraetoRealtimeData[];
  } catch (error) {
    console.error('Unexpected error in getStraetoRealtime:', error);
    return { error: 'Unexpected error fetching real-time data' };
  }
};

/**
 * Fetches stops for a specific route from the Straeto API via edge function.
 * @param routeId - The ID of the route.
 */
export const getStraetoStops = async (routeId: string): Promise<StraetoStop[] | StraetoError> => {
  if (!routeId) return { error: 'Route ID is required' };

  try {
    const path = `straeto/stops?routeId=${encodeURIComponent(routeId)}`;

    const { data, error } = await supabase.functions.invoke(path, {
      method: 'GET',
    });

    if (error) {
      console.error(`Error fetching Straeto stops for route ${routeId}:`, error);
      return { error: error.message };
    }

    return data as StraetoStop[];
  } catch (error) {
    console.error('Unexpected error in getStraetoStops:', error);
    return { error: `Unexpected error fetching stops for route ${routeId}` };
  }
};

/**
 * Fetches arrival times for a specific stop from the Straeto API via edge function.
 * @param stopId - The ID of the stop.
 */
export const getStraetoArrivals = async (stopId: string): Promise<StraetoArrival[] | StraetoError> => {
  if (!stopId) return { error: 'Stop ID is required' };

  try {
    const path = `straeto/arrivals?stopId=${encodeURIComponent(stopId)}`;

    const { data, error } = await supabase.functions.invoke(path, {
      method: 'GET',
    });

    if (error) {
      console.error(`Error fetching Straeto arrivals for stop ${stopId}:`, error);
      return { error: error.message };
    }

    return data as StraetoArrival[];
  } catch (error) {
    console.error('Unexpected error in getStraetoArrivals:', error);
    return { error: `Unexpected error fetching arrivals for stop ${stopId}` };
  }
};

/**
 * Triggers a data sync operation to refresh the database with the latest Straeto data.
 */
export const syncStraetoData = async (): Promise<{ message: string } | StraetoError> => {
  try {
    const { data, error } = await supabase.functions.invoke('straeto/sync', {
      method: 'POST',
    });

    if (error) {
      console.error('Error syncing Straeto data:', error);
      return { error: error.message };
    }

    return data as { message: string };
  } catch (error) {
    console.error('Unexpected error in syncStraetoData:', error);
    return { error: 'Unexpected error syncing Straeto data' };
  }
};

/**
 * Fetches bus route data from local database.
 */
export const getLocalBusRoutes = async (): Promise<StraetoRoute[] | StraetoError> => {
  try {
    const response = await fetch(`${SUPABASE_PUBLIC_URL}/rest/v1/bus_routes?select=*`, {
      headers: {
        'apikey': SUPABASE_PUBLIC_KEY,
        'Authorization': `Bearer ${SUPABASE_PUBLIC_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as BusRoute[];

    // Transform database format to StraetoRoute format
    const routes = data.map(route => ({
      id: route.id.toString(),
      shortName: route.route_number,
      longName: route.name,
      color: route.color || '#0000FF',
      textColor: '#FFFFFF',
      type: 3, // Bus route type
      description: route.description
    }));

    return routes;
  } catch (error) {
    console.error('Unexpected error in getLocalBusRoutes:', error);
    return { error: 'Unexpected error fetching local bus routes' };
  }
};

/**
 * Fetches real-time bus location data from local database.
 */
export const getLocalBusLocations = async (routeId?: string): Promise<StraetoRealtimeData[] | StraetoError> => {
  try {
    let url = `${SUPABASE_PUBLIC_URL}/rest/v1/bus_locations?select=*&order=updated_at.desc`;
    
    if (routeId) {
      url += `&route_id=eq.${routeId}`;
    }

    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_PUBLIC_KEY,
        'Authorization': `Bearer ${SUPABASE_PUBLIC_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as BusLocation[];

    // Transform database format to StraetoRealtimeData format
    const locations = data.map(location => ({
      busId: location.bus_id,
      routeId: location.route_id ? location.route_id.toString() : '',
      routeNumber: location.route_number,
      latitude: location.latitude,
      longitude: location.longitude,
      heading: location.heading,
      speed: location.speed,
      timestamp: location.timestamp
    }));

    return locations;
  } catch (error) {
    console.error('Unexpected error in getLocalBusLocations:', error);
    return { error: 'Unexpected error fetching local bus locations' };
  }
};
