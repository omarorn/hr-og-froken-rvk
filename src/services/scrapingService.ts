
import { supabase } from "@/integrations/supabase/client";
import { WebSocketClientTransport } from "@modelcontextprotocol/sdk/client/websocket.js";
import { createSmitheryUrl } from "@smithery/sdk/config.js";

export interface ScrapedDataRecord {
  id: string;
  url: string;
  domain: string;
  pages_scraped: number;
  scraped_at: string;
  data: any[];
}

/**
 * Service for scraping web data and interacting with the scraped data in Supabase
 */
export const scrapingService = {
  /**
   * Search for MCP servers in the Smithery registry
   * @param query Search query
   * @returns List of matching servers
   */
  async searchSmitheryServers(query: string = "") {
    try {
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
  async getServerDetails(qualifiedName: string) {
    try {
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
    } catch (error) {
      console.error('Error getting server details:', error);
      return null;
    }
  },
  
  /**
   * Connect to an MCP server for web scraping
   * @param qualifiedName The qualified name of the MCP server
   * @param config Configuration for the server
   * @returns WebSocket transport client
   */
  async connectToMcpServer(qualifiedName: string, config: any) {
    try {
      const serverDetails = await this.getServerDetails(qualifiedName);
      
      if (!serverDetails || !serverDetails.deploymentUrl) {
        throw new Error('Server details not found or deployment URL missing');
      }
      
      const wsUrl = `${serverDetails.deploymentUrl}/ws`;
      const smitheryUrl = createSmitheryUrl(wsUrl, config);
      return new WebSocketClientTransport(smitheryUrl);
    } catch (error) {
      console.error('Error connecting to MCP server:', error);
      throw error;
    }
  },
  
  /**
   * Scrape a website and store the results in Supabase
   * @param url The URL to scrape
   * @param maxPages Maximum number of pages to scrape
   * @returns The scraping result
   */
  async scrapeWebsite(url: string, maxPages: number = 20) {
    try {
      // First try to use MCP server if available
      try {
        const mcpServers = await this.searchSmitheryServers("web scraper");
        
        if (mcpServers.length > 0) {
          return await this.scrapeWithMcp(mcpServers[0].qualifiedName, url, maxPages);
        }
      } catch (mcpError) {
        console.log('MCP scraping failed, falling back to Supabase function:', mcpError);
      }
      
      // Fall back to Supabase edge function
      const { data, error } = await supabase.functions.invoke('web-scraper', {
        body: {
          url,
          maxPages
        }
      });
      
      if (error) {
        console.error('Error invoking web-scraper function:', error);
        throw new Error(`Scraping failed: ${error.message}`);
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Scraping failed');
      }
      
      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Error in scrapeWebsite:', error);
      return {
        success: false,
        error: error.message || 'Scraping failed'
      };
    }
  },
  
  /**
   * Scrape a website using an MCP server
   * @param serverName The MCP server name
   * @param url The URL to scrape
   * @param maxPages Maximum number of pages to scrape
   * @returns The scraping result
   */
  async scrapeWithMcp(serverName: string, url: string, maxPages: number = 20) {
    try {
      const config = {
        url: url,
        maxPages: maxPages
      };
      
      const transport = await this.connectToMcpServer(serverName, config);
      await transport.connect();
      
      // Wait for data to be received
      return new Promise((resolve, reject) => {
        let receivedData = null;
        
        transport.onMessage(message => {
          if (message.type === 'result') {
            receivedData = {
              domain: new URL(url).hostname,
              pagesScraped: message.data.pagesScraped || 0,
              data: message.data.results || []
            };
            
            // Save to Supabase
            this.saveScrapedData(url, receivedData)
              .then(savedRecord => {
                transport.disconnect();
                resolve({
                  success: true,
                  data: {
                    ...receivedData,
                    recordId: savedRecord?.id
                  }
                });
              })
              .catch(error => {
                transport.disconnect();
                reject(error);
              });
          } else if (message.type === 'error') {
            transport.disconnect();
            reject(new Error(message.message || 'MCP scraping failed'));
          }
        });
        
        // Set timeout for the request
        setTimeout(() => {
          if (!receivedData) {
            transport.disconnect();
            reject(new Error('MCP scraping timed out'));
          }
        }, 60000); // 1 minute timeout
      });
    } catch (error) {
      console.error('Error in scrapeWithMcp:', error);
      throw error;
    }
  },
  
  /**
   * Save scraped data to Supabase
   * @param url The URL that was scraped
   * @param scrapedData The data from scraping
   * @returns The saved record or null
   */
  async saveScrapedData(url: string, scrapedData: any): Promise<ScrapedDataRecord | null> {
    try {
      const { data, error } = await supabase
        .from('scraped_data')
        .insert({
          url,
          domain: scrapedData.domain,
          pages_scraped: scrapedData.pagesScraped,
          data: scrapedData.data
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error saving scraped data:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in saveScrapedData:', error);
      return null;
    }
  },
  
  /**
   * Get all scraped data records from Supabase
   * @returns Array of scraped data records
   */
  async getAllScrapedData(): Promise<ScrapedDataRecord[]> {
    try {
      const { data, error } = await supabase
        .from('scraped_data')
        .select('*')
        .order('scraped_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching scraped data:', error);
        throw new Error(`Failed to fetch scraped data: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getAllScrapedData:', error);
      return [];
    }
  },
  
  /**
   * Get a single scraped data record by ID
   * @param id The record ID
   * @returns The scraped data record or null
   */
  async getScrapedDataById(id: string): Promise<ScrapedDataRecord | null> {
    try {
      const { data, error } = await supabase
        .from('scraped_data')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching scraped data by ID:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getScrapedDataById:', error);
      return null;
    }
  },
  
  /**
   * Delete a scraped data record
   * @param id The record ID
   * @returns Success status
   */
  async deleteScrapedData(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('scraped_data')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting scraped data:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in deleteScrapedData:', error);
      return false;
    }
  }
};
