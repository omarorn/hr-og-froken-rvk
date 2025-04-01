
import { supabase } from "@/integrations/supabase/client";

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
   * Scrape a website and store the results in Supabase
   * @param url The URL to scrape
   * @param maxPages Maximum number of pages to scrape
   * @returns The scraping result
   */
  async scrapeWebsite(url: string, maxPages: number = 20) {
    try {
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
