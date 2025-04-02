
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Straeto function booting up...');

// Straeto API endpoints
const STRAETO_GRAPHQL_API = 'https://api.straeto.is/graphql';
const STRAETO_REST_API = 'https://straeto.is/api';

// Common headers for Straeto API requests
const STRAETO_HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'ReykjavikCityApp/1.0',
  'Referer': 'https://www.straeto.is/',
  'Accept': '*/*',
};

// GraphQL query to get bus locations by route
const BUS_LOCATION_QUERY = {
  operationName: 'BusLocationByRoute',
  extensions: {
    persistedQuery: {
      version: 1,
      sha256Hash: '8f9ee84171961f8a3b9a9d1a7b2a7ac49e7e122e1ba1727e75cfe3a94ff3edb8'
    }
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace('/functions/v1/straeto', ''); // Normalize path

    console.log(`Request received for path: ${path}`);

    // --- Route: Get all routes ---
    if (path === '/routes' && req.method === 'GET') {
      console.log('Fetching routes...');
      
      const response = await fetch(`${STRAETO_REST_API}/routes`, { 
        headers: STRAETO_HEADERS 
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch routes: ${response.statusText}`);
      }
      
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // --- Route: Get real-time locations ---
    if (path === '/realtime' && req.method === 'GET') {
      const routeIdsParam = url.searchParams.get('routeIds');
      const routeIds = routeIdsParam ? routeIdsParam.split(',') : [];
      
      console.log(`Fetching real-time locations for routes: ${routeIds.length > 0 ? routeIds.join(', ') : 'all'}`);
      
      // Build GraphQL query with variables
      const queryData = {
        ...BUS_LOCATION_QUERY,
        variables: {
          trips: [],
          routes: routeIds.length > 0 ? routeIds : undefined
        }
      };
      
      // URL encode the query for the GraphQL API
      const queryString = new URLSearchParams({
        operationName: queryData.operationName,
        variables: JSON.stringify(queryData.variables),
        extensions: JSON.stringify(queryData.extensions)
      }).toString();
      
      const response = await fetch(`${STRAETO_GRAPHQL_API}?${queryString}`, {
        method: 'GET',
        headers: STRAETO_HEADERS
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch real-time data: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform the data to our expected format
      const transformedData = transformBusLocations(data);
      
      return new Response(JSON.stringify(transformedData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }
    
    // --- Route: Get stops for a route ---
    if (path.startsWith('/stops') && req.method === 'GET') {
      const routeId = url.searchParams.get('routeId');
      if (!routeId) {
        return new Response(JSON.stringify({ error: 'routeId query parameter is required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
      
      console.log(`Fetching stops for route: ${routeId}`);
      
      const response = await fetch(`${STRAETO_REST_API}/routes/${routeId}/stops`, {
        headers: STRAETO_HEADERS
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stops for route ${routeId}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform the data to our expected format
      const transformedData = transformStops(data);
      
      return new Response(JSON.stringify(transformedData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // --- Route: Get arrival times for a stop ---
    if (path.startsWith('/arrivals') && req.method === 'GET') {
      const stopId = url.searchParams.get('stopId');
      if (!stopId) {
        return new Response(JSON.stringify({ error: 'stopId query parameter is required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
      
      console.log(`Fetching arrivals for stop: ${stopId}`);
      
      const response = await fetch(`${STRAETO_REST_API}/stops/${stopId}/arrivals`, {
        headers: STRAETO_HEADERS
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch arrivals for stop ${stopId}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform the data to our expected format
      const transformedData = transformArrivals(data);
      
      return new Response(JSON.stringify(transformedData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // --- Route: Sync data to database ---
    if (path === '/sync' && req.method === 'POST') {
      console.log('Running data sync to database...');
      
      // Get all routes first
      const routesResponse = await fetch(`${STRAETO_REST_API}/routes`, { 
        headers: STRAETO_HEADERS 
      });
      
      if (!routesResponse.ok) {
        throw new Error(`Failed to fetch routes for sync: ${routesResponse.statusText}`);
      }
      
      const routesData = await routesResponse.json();
      
      // Here we would normally process the data and store it in the database
      // This is a placeholder for the actual implementation
      const syncResult = {
        message: 'Data sync initiated',
        routesCount: routesData.length,
        timestamp: new Date().toISOString()
      };
      
      return new Response(JSON.stringify(syncResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // --- Fallback for unknown routes ---
    console.log(`Unknown path requested: ${path}`);
    return new Response(JSON.stringify({ error: 'Not Found' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 404,
    });

  } catch (error) {
    console.error('Error processing request:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// Helper function to transform bus location data from Straeto API format
function transformBusLocations(apiData: any) {
  if (!apiData.data || !apiData.data.buses) {
    return [];
  }
  
  return apiData.data.buses.map((bus: any) => ({
    busId: bus.id,
    routeId: bus.trip?.route?.id,
    routeNumber: bus.trip?.route?.shortName || '',
    latitude: bus.latitude,
    longitude: bus.longitude,
    heading: bus.bearing,
    speed: bus.speed,
    timestamp: new Date().toISOString(),
    nextStop: bus.nextStop ? {
      id: bus.nextStop.id,
      name: bus.nextStop.name,
      scheduledArrival: bus.nextStop.scheduledArrival
    } : null
  }));
}

// Helper function to transform stops data
function transformStops(apiData: any) {
  if (!Array.isArray(apiData)) {
    return [];
  }
  
  return apiData.map((stop: any) => ({
    id: stop.id,
    name: stop.name,
    coordinates: {
      lat: stop.latitude,
      lng: stop.longitude
    },
    address: stop.address || ''
  }));
}

// Helper function to transform arrivals data
function transformArrivals(apiData: any) {
  if (!Array.isArray(apiData)) {
    return [];
  }
  
  return apiData.map((arrival: any) => ({
    routeId: arrival.trip?.route?.id,
    routeNumber: arrival.trip?.route?.shortName,
    routeName: arrival.trip?.route?.longName,
    arrivalTime: arrival.scheduledArrival,
    realTimeArrival: arrival.realtimeArrival,
    headSign: arrival.headSign,
    tripId: arrival.trip?.id
  }));
}
