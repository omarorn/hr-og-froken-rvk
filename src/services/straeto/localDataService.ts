
/**
 * Service for fetching Straeto data from local database
 */

import { SUPABASE_URL, SUPABASE_PUBLIC_KEY } from '@/integrations/supabase/client';
import { BusRoute, BusLocation, StraetoRoute, StraetoRealtimeData, StraetoError } from './types';

/**
 * Fetches bus route data from local database.
 */
export const getLocalBusRoutes = async (): Promise<StraetoRoute[] | StraetoError> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/bus_routes?select=*`, {
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
    let url = `${SUPABASE_URL}/rest/v1/bus_locations?select=*&order=updated_at.desc`;
    
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
