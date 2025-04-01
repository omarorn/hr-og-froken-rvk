
import { supabase, ScrapedDataRecord } from "@/integrations/supabase/client";
import { ScrapingResult } from "./types";
import { smitheryService } from "./smitheryService";
import { mcpService } from "./mcpService";
import { webScraperService } from "./webScraperService";
import { databaseService } from "./databaseService";

/**
 * Main service for scraping web data and interacting with the scraped data in Supabase
 */
export const scrapingService = {
  /**
   * Search for MCP servers in the Smithery registry
   */
  searchSmitheryServers: smitheryService.searchSmitheryServers,
  
  /**
   * Get server details from Smithery registry
   */
  getServerDetails: smitheryService.getServerDetails,
  
  /**
   * Scrape a website using an MCP server
   */
  scrapeWithMcp: mcpService.scrapeWithMcp,
  
  /**
   * Scrape a website and store the results in Supabase
   * @param url The URL to scrape
   * @param maxPages Maximum number of pages to scrape
   * @returns The scraping result
   */
  async scrapeWebsite(url: string, maxPages: number = 20): Promise<ScrapingResult> {
    try {
      // First try to use MCP server if available
      try {
        const mcpServers = await smitheryService.searchSmitheryServers("web scraper");
        
        if (mcpServers.length > 0) {
          return await mcpService.scrapeWithMcp(mcpServers[0].qualifiedName, url, maxPages);
        }
      } catch (mcpError) {
        console.log('MCP scraping failed, falling back to Supabase function:', mcpError);
      }
      
      // Fall back to Supabase edge function
      return await webScraperService.scrapeWebsite(url, maxPages);
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
   */
  saveScrapedData: databaseService.saveScrapedData,
  
  /**
   * Get all scraped data records from Supabase
   */
  getAllScrapedData: databaseService.getAllScrapedData,
  
  /**
   * Get a single scraped data record by ID
   */
  getScrapedDataById: databaseService.getScrapedDataById,
  
  /**
   * Delete a scraped data record
   */
  deleteScrapedData: databaseService.deleteScrapedData
};

// Export the service
export default scrapingService;
