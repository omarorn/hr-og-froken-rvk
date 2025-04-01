
import { supabase } from "@/integrations/supabase/client";

/**
 * Service for interacting with the Smithery Registry API
 * to access Model Context Protocol (MCP) servers
 */

// API authentication and settings
const SMITHERY_API_KEY = "be9b826e-bb74-4063-ae2a-ccf6091d0311";
const SMITHERY_API_URL = "https://registry.smithery.ai";

interface Server {
  qualifiedName: string;
  displayName: string;
  description: string;
  homepage: string;
  useCount: string;
  isDeployed: boolean;
  createdAt: string;
}

interface ServerDetail {
  qualifiedName: string;
  displayName: string;
  deploymentUrl: string;
  connections: Array<{
    type: string;
    url?: string;
    configSchema: any;
  }>;
}

interface SearchResponse {
  servers: Server[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
  };
}

/**
 * Search for servers in the Smithery Registry
 * @param query Search query
 * @param page Page number
 * @param pageSize Items per page
 * @returns Promise with search results
 */
export const searchServers = async (
  query: string,
  page: number = 1,
  pageSize: number = 10
): Promise<SearchResponse> => {
  try {
    const response = await fetch(
      `${SMITHERY_API_URL}/servers?q=${encodeURIComponent(
        query
      )}&page=${page}&pageSize=${pageSize}`,
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
  } catch (error) {
    console.error("Error searching Smithery servers:", error);
    throw error;
  }
};

/**
 * Get details of a specific server
 * @param qualifiedName The qualified name of the server
 * @returns Promise with server details
 */
export const getServerDetails = async (
  qualifiedName: string
): Promise<ServerDetail> => {
  try {
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
  } catch (error) {
    console.error("Error getting server details:", error);
    throw error;
  }
};

/**
 * Create a connection URL to a Smithery MCP server
 * @param serverUrl The server's WebSocket URL
 * @param config Configuration object matching the server's schema
 * @returns Encoded URL for connection
 */
export const createConnectionUrl = (
  serverUrl: string,
  config: any
): string => {
  const encodedConfig = btoa(JSON.stringify(config));
  return `${serverUrl}?config=${encodedConfig}`;
};
