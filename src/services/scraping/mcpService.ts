
import { supabase } from "@/integrations/supabase/client";
import { ScrapingResult } from "./types";
import { databaseService } from "./databaseService";

/**
 * Service for interacting with Model Context Protocol (MCP) servers
 */
export const mcpService = {
  /**
   * Scrape a website using an MCP server
   * @param qualifiedName The MCP server name
   * @param url The URL to scrape
   * @param maxPages Maximum number of pages to scrape
   * @returns The scraping result
   */
  async scrapeWithMcp(qualifiedName: string, url: string, maxPages: number = 20): Promise<ScrapingResult> {
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
      const savedRecord = await databaseService.saveScrapedData(url, scrapedData);
      
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
  }
};
