
import { supabase, ScrapedDataRecord } from "@/integrations/supabase/client";
import { WebSocketClientTransport } from "@modelcontextprotocol/sdk/client/websocket.js";
import { createSmitheryUrl } from "@smithery/sdk/config.js";

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
  async getServerDetails(qualifiedName: string) {
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
  },
  
  /**
   * Scrape a website using an MCP server
   * @param qualifiedName The MCP server name
   * @param url The URL to scrape
   * @param maxPages Maximum number of pages to scrape
   * @returns The scraping result
   */
  async scrapeWithMcp(qualifiedName: string, url: string, maxPages: number = 20) {
    try {
      const config = {
        url: url,
        maxPages: maxPages
      };
      
      const { data, error } = await supabase.functions.invoke('smithery-mcp', {
        body: {
          action: 'scrape',
          qualifiedName,
          config
        }
      });
      
      if (error || !data.success) {
        throw new Error((error?.message || data?.error || 'MCP scraping failed'));
      }
      
      // Process the response
      const scrapedData = {
        domain: new URL(url).hostname,
        pagesScraped: data.data.pagesScraped || 0,
        data: data.data.results || []
      };
      
      // Save to Supabase
      const savedRecord = await this.saveScrapedData(url, scrapedData);
      
      return {
        success: true,
        data: {
          ...scrapedData,
          recordId: savedRecord?.id
        }
      };
    } catch (error) {
      console.error('Error in scrapeWithMcp:', error);
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
   * Save scraped data to Supabase
   * @param url The URL that was scraped
   * @param scrapedData The data from scraping
   * @returns The saved record or null
   */
  async saveScrapedData(url: string, scrapedData: any): Promise<ScrapedDataRecord | null> {
    try {
      // Use raw insert query to work around TypeScript issues
      const { data, error } = await supabase.rpc('insert_scraped_data', {
        p_url: url,
        p_domain: scrapedData.domain,
        p_pages_scraped: scrapedData.pagesScraped,
        p_data: scrapedData.data
      }).single();
      
      if (error) {
        console.error('Error saving scraped data:', error);
        
        // Fall back to direct insert if RPC doesn't exist
        const insertResult = await fetch(`${supabase.supabaseUrl}/rest/v1/scraped_data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabase.supabaseKey}`,
            'apikey': supabase.supabaseKey,
          },
          body: JSON.stringify({
            url,
            domain: scrapedData.domain,
            pages_scraped: scrapedData.pagesScraped,
            data: scrapedData.data
          })
        });
        
        if (!insertResult.ok) {
          console.error('Error with direct insert:', await insertResult.text());
          return null;
        }
        
        const insertData = await insertResult.json();
        return insertData[0] as ScrapedDataRecord;
      }
      
      return data as ScrapedDataRecord;
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
      // Use raw fetch to work around TypeScript issues
      const response = await fetch(`${supabase.supabaseUrl}/rest/v1/scraped_data?order=scraped_at.desc`, {
        headers: {
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'apikey': supabase.supabaseKey,
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch scraped data: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data as ScrapedDataRecord[];
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
      // Use raw fetch to work around TypeScript issues
      const response = await fetch(`${supabase.supabaseUrl}/rest/v1/scraped_data?id=eq.${id}&limit=1`, {
        headers: {
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'apikey': supabase.supabaseKey,
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch scraped data: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.length > 0 ? data[0] as ScrapedDataRecord : null;
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
      // Use raw fetch to work around TypeScript issues
      const response = await fetch(`${supabase.supabaseUrl}/rest/v1/scraped_data?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'apikey': supabase.supabaseKey,
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error in deleteScrapedData:', error);
      return false;
    }
  }
};
