
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// The Smithery API key from environment
const SMITHERY_API_KEY = "be9b826e-bb74-4063-ae2a-ccf6091d0311";
const SMITHERY_API_URL = "https://registry.smithery.ai";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action } = await req.json();
    
    console.log(`Time-MCP request received: ${action}`);
    
    if (action === 'get-time') {
      return await getTimeFromMCP(req);
    } else {
      throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Error in time-mcp endpoint:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

/**
 * Get time information from a time-related MCP server
 */
async function getTimeFromMCP(req: Request) {
  try {
    // First search for time-related servers
    const timeServers = await searchServers("time server is:deployed");
    
    if (!timeServers.servers || timeServers.servers.length === 0) {
      console.warn("No time servers found in Smithery registry");
      // Fallback to local time
      return getLocalTimeResponse();
    }
    
    // Get the first available server
    const server = timeServers.servers[0];
    const serverDetails = await getServerDetails(server.qualifiedName);
    
    if (!serverDetails || !serverDetails.connections || serverDetails.connections.length === 0) {
      console.warn("No connection details available for the time server");
      return getLocalTimeResponse();
    }
    
    // Find WebSocket connection
    const wsConnection = serverDetails.connections.find(c => c.type === 'ws');
    if (!wsConnection || !wsConnection.url) {
      console.warn("No WebSocket connection available for the time server");
      return getLocalTimeResponse();
    }
    
    // Create connection URL with empty config (or appropriate config)
    const config = {}; // Adjust if specific config is needed
    const url = createSmitheryUrl(wsConnection.url, config);
    
    // Since we can't directly use WebSockets in Deno Edge Functions for now,
    // we'll use a workaround - let's make a REST API call to our own custom endpoint
    // that provides time info. In a real implementation, we would connect to the MCP server.
    
    console.log("Would connect to MCP server at:", url);
    console.log("Using local time as fallback for now");
    
    // In a real implementation, we would use the MCP server's time
    // but for now we'll use local time as a fallback
    return getLocalTimeResponse();
  } catch (error) {
    console.error("Error communicating with MCP server:", error);
    return getLocalTimeResponse();
  }
}

/**
 * Fallback function to get local time response
 */
function getLocalTimeResponse() {
  const now = new Date();
  const hour = now.getUTCHours(); // Use UTC for Iceland time (approx)
  
  // Format time string
  const timeString = `${hour.toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}`;
  
  return new Response(JSON.stringify({
    success: true,
    data: {
      source: "local",
      timeString: timeString,
      hour: hour,
      minute: now.getUTCMinutes(),
      timestamp: now.getTime()
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

/**
 * Search for servers in the Smithery Registry
 */
async function searchServers(query: string, page = 1, pageSize = 10) {
  const response = await fetch(
    `${SMITHERY_API_URL}/servers?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`,
    {
      headers: {
        Authorization: `Bearer ${SMITHERY_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Smithery API error: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get details of a specific server
 */
async function getServerDetails(qualifiedName: string) {
  const response = await fetch(
    `${SMITHERY_API_URL}/servers/${qualifiedName}`,
    {
      headers: {
        Authorization: `Bearer ${SMITHERY_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Smithery API error: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Create a connection URL to a Smithery MCP server
 */
function createSmitheryUrl(serverUrl: string, config: any): string {
  const encodedConfig = btoa(JSON.stringify(config));
  return `${serverUrl}?config=${encodedConfig}`;
}
