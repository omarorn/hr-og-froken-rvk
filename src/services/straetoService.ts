import { supabase } from '@/integrations/supabase/supabaseClient'; // Assuming supabase client setup

const FUNCTION_NAME = 'straeto';

interface StraetoError {
  error: string;
}

// Placeholder types - Replace with actual types based on Straeto API response
interface StraetoRoute {
  id: string;
  name: string;
  // ... other route properties
}

interface StraetoRealtimeData {
  busId: string;
  routeId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  // ... other real-time properties
}

interface StraetoStop {
    id: string;
    name: string;
    // ... other stop properties
}

interface StraetoArrival {
    routeId: string;
    arrivalTime: string; // ISO string or similar
    // ... other arrival properties
}


/**
 * Fetches all bus routes from the Straeto API via edge function.
 */
export const getStraetoRoutes = async (): Promise<StraetoRoute[] | StraetoError> => {
  const { data, error } = await supabase.functions.invoke(`${FUNCTION_NAME}/routes`, {
    method: 'GET',
  });

  if (error) {
    console.error('Error fetching Straeto routes:', error);
    return { error: error.message };
  }
  // TODO: Add proper type validation for data
  return data as StraetoRoute[]; 
};

/**
 * Fetches real-time bus locations from the Straeto API via edge function.
 * @param routeId - Optional route ID to filter locations.
 */
export const getStraetoRealtime = async (routeId?: string): Promise<StraetoRealtimeData[] | StraetoError> => {
  let path = `${FUNCTION_NAME}/realtime`;
  if (routeId) {
    path += `?routeId=${encodeURIComponent(routeId)}`;
  }

  const { data, error } = await supabase.functions.invoke(path, {
    method: 'GET',
  });

  if (error) {
    console.error('Error fetching Straeto real-time data:', error);
    return { error: error.message };
  }
   // TODO: Add proper type validation for data
  return data as StraetoRealtimeData[];
};

/**
 * Fetches stops for a specific route from the Straeto API via edge function.
 * @param routeId - The ID of the route.
 */
export const getStraetoStops = async (routeId: string): Promise<StraetoStop[] | StraetoError> => {
    if (!routeId) return { error: 'Route ID is required' };

    const path = `${FUNCTION_NAME}/stops?routeId=${encodeURIComponent(routeId)}`;

    const { data, error } = await supabase.functions.invoke(path, {
        method: 'GET',
    });

    if (error) {
        console.error(`Error fetching Straeto stops for route ${routeId}:`, error);
        return { error: error.message };
    }
    // TODO: Add proper type validation for data
    return data as StraetoStop[];
};

/**
 * Fetches arrival times for a specific stop from the Straeto API via edge function.
 * @param stopId - The ID of the stop.
 */
export const getStraetoArrivals = async (stopId: string): Promise<StraetoArrival[] | StraetoError> => {
    if (!stopId) return { error: 'Stop ID is required' };

    const path = `${FUNCTION_NAME}/arrivals?stopId=${encodeURIComponent(stopId)}`;

    const { data, error } = await supabase.functions.invoke(path, {
        method: 'GET',
    });

    if (error) {
        console.error(`Error fetching Straeto arrivals for stop ${stopId}:`, error);
        return { error: error.message };
    }
    // TODO: Add proper type validation for data
    return data as StraetoArrival[];
};