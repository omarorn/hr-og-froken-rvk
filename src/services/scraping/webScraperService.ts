
import { supabase } from "@/integrations/supabase/client";
import { ScrapingResult } from "./types";

/**
 * Service for scraping websites using the edge function
 */
export const webScraperService = {
  /**
   * Scrape a website using the Supabase edge function
   * @param url The URL to scrape
   * @param maxPages Maximum number of pages to scrape
   * @returns The scraping result
   */
  async scrapeWebsite(url: string, maxPages: number = 20): Promise<ScrapingResult> {
    try {
      // Use Supabase edge function
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
  }
};
