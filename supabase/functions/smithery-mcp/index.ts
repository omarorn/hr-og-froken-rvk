
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Interface for SmitheryMCP request
interface SmitheryMCPRequest {
  qualifiedName?: string;
  query?: string;
  config?: Record<string, any>;
  action: 'search' | 'details' | 'scrape';
}

// Function to search for MCP servers in the Smithery registry
async function searchSmitheryServers(query: string = "") {
  const apiKey = "be9b826e-bb74-4063-ae2a-ccf6091d0311"; // Registry API key
  const url = `https://registry.smithery.ai/servers?q=${encodeURIComponent(query)}`;
  
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to search servers: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.servers || [];
}

// Function to get server details from Smithery registry
async function getServerDetails(qualifiedName: string) {
  const apiKey = "be9b826e-bb74-4063-ae2a-ccf6091d0311";
  const url = `https://registry.smithery.ai/servers/${qualifiedName}`;
  
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get server details: ${response.statusText}`);
  }
  
  return await response.json();
}

// Function to send request to Smithery MCP WebSocket
async function websocketRequest(wsUrl: string, config: Record<string, any>, timeout = 60000) {
  try {
    // Encode the config to base64
    const configBase64 = btoa(JSON.stringify(config));
    const fullWsUrl = `${wsUrl}?config=${configBase64}`;
    
    console.log(`Connecting to WebSocket: ${fullWsUrl}`);
    
    const ws = new WebSocket(fullWsUrl);
    
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        ws.close();
        reject(new Error("WebSocket request timed out"));
      }, timeout);
      
      ws.onopen = () => {
        console.log("WebSocket connection opened");
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log("Received message:", message);
          
          if (message.type === 'result') {
            clearTimeout(timeoutId);
            ws.close();
            resolve(message.data);
          } else if (message.type === 'error') {
            clearTimeout(timeoutId);
            ws.close();
            reject(new Error(message.message || "Unknown WebSocket error"));
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };
      
      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        clearTimeout(timeoutId);
        reject(new Error("WebSocket connection error"));
      };
      
      ws.onclose = () => {
        console.log("WebSocket connection closed");
      };
    });
  } catch (error) {
    console.error("Error in websocketRequest:", error);
    throw error;
  }
}

// Main serve function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, qualifiedName, query, config } = await req.json() as SmitheryMCPRequest;
    
    if (!action) {
      throw new Error('Action is required');
    }
    
    console.log(`Processing ${action} request`);
    
    let responseData;
    
    switch (action) {
      case 'search':
        if (!query) {
          throw new Error('Query is required for search action');
        }
        responseData = await searchSmitheryServers(query);
        break;
        
      case 'details':
        if (!qualifiedName) {
          throw new Error('Qualified name is required for details action');
        }
        responseData = await getServerDetails(qualifiedName);
        break;
        
      case 'scrape':
        if (!qualifiedName || !config) {
          throw new Error('Qualified name and config are required for scrape action');
        }
        
        const serverDetails = await getServerDetails(qualifiedName);
        if (!serverDetails || !serverDetails.deploymentUrl) {
          throw new Error('Server details not found or deployment URL missing');
        }
        
        // Get WebSocket URL from server details
        const wsUrl = `${serverDetails.deploymentUrl}/ws`;
        responseData = await websocketRequest(wsUrl, config);
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    return new Response(JSON.stringify({
      success: true,
      data: responseData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in smithery-mcp function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
