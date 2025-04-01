import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Straeto function booting up...');

// TODO: Add Straeto API Key from environment variables
const STRAETO_API_KEY = Deno.env.get('STRAETO_API_KEY') || 'YOUR_PLACEHOLDER_KEY'; 
const STRAETO_API_BASE_URL = 'https://straeto.is/api'; // Assuming base URL

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
      // TODO: Implement actual API call to Straeto /routes endpoint
      // const response = await fetch(`${STRAETO_API_BASE_URL}/routes`, { headers: { 'Authorization': `Bearer ${STRAETO_API_KEY}` } });
      // if (!response.ok) throw new Error('Failed to fetch routes');
      // const data = await response.json();
      const data = { message: 'Route data placeholder' }; // Placeholder
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // --- Route: Get real-time locations ---
    if (path === '/realtime' && req.method === 'GET') {
      const routeId = url.searchParams.get('routeId');
      console.log(`Fetching real-time locations... Route ID: ${routeId || 'all'}`);
      // TODO: Implement actual API call to Straeto real-time endpoint
      // const apiUrl = routeId ? `${STRAETO_API_BASE_URL}/realtime?routeId=${routeId}` : `${STRAETO_API_BASE_URL}/realtime`;
      // const response = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${STRAETO_API_KEY}` } });
      // if (!response.ok) throw new Error('Failed to fetch real-time data');
      // const data = await response.json();
      const data = { message: `Real-time data placeholder for route ${routeId || 'all'}` }; // Placeholder
      return new Response(JSON.stringify(data), {
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
        // TODO: Implement actual API call to Straeto stops endpoint for a specific route
        // const response = await fetch(`${STRAETO_API_BASE_URL}/routes/${routeId}/stops`, { headers: { 'Authorization': `Bearer ${STRAETO_API_KEY}` } });
        // if (!response.ok) throw new Error(`Failed to fetch stops for route ${routeId}`);
        // const data = await response.json();
        const data = { message: `Stops data placeholder for route ${routeId}` }; // Placeholder
        return new Response(JSON.stringify(data), {
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
        // TODO: Implement actual API call to Straeto arrivals endpoint for a specific stop
        // const response = await fetch(`${STRAETO_API_BASE_URL}/stops/${stopId}/arrivals`, { headers: { 'Authorization': `Bearer ${STRAETO_API_KEY}` } });
        // if (!response.ok) throw new Error(`Failed to fetch arrivals for stop ${stopId}`);
        // const data = await response.json();
        const data = { message: `Arrivals data placeholder for stop ${stopId}` }; // Placeholder
        return new Response(JSON.stringify(data), {
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