
import { supabase } from "@/integrations/supabase/client";
import { SmitheryServer, ServerDetails } from "./types";

/**
 * Service for searching and retrieving MCP servers from the Smithery registry
 */
export const smitheryService = {
  /**
   * Search for MCP servers in the Smithery registry
   * @param query Search query
   * @returns List of matching servers
   */
  async searchSmitheryServers(query: string = ""): Promise<SmitheryServer[]> {
    try {
      const { data, error } = await supabase.functions.invoke('smithery-mcp', {
        body: {
          action: 'search',
          query
        }
      });
      
      if (error || !data.success) {
        console.error('Error searching Smithery servers:', error || data.error);
        return [];
      }
      
      return data.data || [];
    } catch (error) {
      console.error('Error searching Smithery servers:', error);
      return [];
    }
  },
  
  /**
   * Get server details from Smithery registry
   * @param qualifiedName The qualified name of the server
   * @returns Server details including connection info
   */
  async getServerDetails(qualifiedName: string): Promise<ServerDetails | null> {
    try {
      const { data, error } = await supabase.functions.invoke('smithery-mcp', {
        body: {
          action: 'details',
          qualifiedName
        }
      });
      
      if (error || !data.success) {
        console.error('Error getting server details:', error || data.error);
        return null;
      }
      
      return data.data;
    } catch (error) {
      console.error('Error getting server details:', error);
      return null;
    }
  }
};
