
import { supabase, ScrapedDataRecord, SUPABASE_PUBLIC_URL, SUPABASE_PUBLIC_KEY } from "@/integrations/supabase/client";

/**
 * Service for interacting with the scraped data in the database
 */
export const databaseService = {
  /**
   * Save scraped data to Supabase
   * @param url The URL that was scraped
   * @param scrapedData The data from scraping
   * @returns The saved record or null
   */
  async saveScrapedData(url: string, scrapedData: any): Promise<ScrapedDataRecord | null> {
    try {
      // Try to use the stored procedure first
      try {
        const params = {
          p_url: url,
          p_domain: scrapedData.domain,
          p_pages_scraped: scrapedData.pagesScraped,
          p_data: scrapedData.data
        };
        
        // Use any for the generic types to bypass type constraints
        const { data, error } = await supabase.rpc<any, any>('insert_scraped_data', params);
        
        if (!error && data) {
          return data as ScrapedDataRecord;
        }
        
        throw new Error("RPC failed or returned no data");
      } catch (rpcError) {
        console.log('RPC method failed, falling back to direct insert:', rpcError);
        
        // Fall back to direct insert if RPC doesn't exist or fails
        const insertResult = await fetch(`${SUPABASE_PUBLIC_URL}/rest/v1/scraped_data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_PUBLIC_KEY}`,
            'apikey': SUPABASE_PUBLIC_KEY,
            'Prefer': 'return=representation'
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
      const response = await fetch(`${SUPABASE_PUBLIC_URL}/rest/v1/scraped_data?order=scraped_at.desc`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_PUBLIC_KEY}`,
          'apikey': SUPABASE_PUBLIC_KEY,
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
      const response = await fetch(`${SUPABASE_PUBLIC_URL}/rest/v1/scraped_data?id=eq.${id}&limit=1`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_PUBLIC_KEY}`,
          'apikey': SUPABASE_PUBLIC_KEY,
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
      const response = await fetch(`${SUPABASE_PUBLIC_URL}/rest/v1/scraped_data?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${SUPABASE_PUBLIC_KEY}`,
          'apikey': SUPABASE_PUBLIC_KEY,
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error in deleteScrapedData:', error);
      return false;
    }
  }
};
