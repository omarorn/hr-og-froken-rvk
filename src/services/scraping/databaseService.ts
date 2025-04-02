
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
      // Use REST API for both the primary attempt and fallback
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
        console.error('Error saving scraped data:', await insertResult.text());
        return null;
      }
      
      const insertData = await insertResult.json();
      return insertData[0] as ScrapedDataRecord;
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
  },
  
  /**
   * Save transportation data to the appropriate tables
   * @param type The type of transportation data ('routes', 'stops', 'locations')
   * @param data The data to save
   * @returns Success status
   */
  async saveTransportationData(type: 'routes' | 'stops' | 'locations', data: any[]): Promise<boolean> {
    try {
      let tableName = '';
      let dataTransform = (item: any) => item;
      
      // Define table name and data transformation for each type
      switch (type) {
        case 'routes':
          tableName = 'bus_routes';
          dataTransform = (route: any) => ({
            route_number: route.shortName,
            name: route.longName,
            description: route.description,
            color: route.color
          });
          break;
        case 'stops':
          tableName = 'bus_stops';
          dataTransform = (stop: any) => ({
            stop_id: stop.id,
            name: stop.name,
            latitude: stop.coordinates.lat,
            longitude: stop.coordinates.lng,
            address: stop.address
          });
          break;
        case 'locations':
          tableName = 'bus_locations';
          dataTransform = (location: any) => ({
            bus_id: location.busId,
            route_id: location.routeId,
            route_number: location.routeNumber,
            latitude: location.latitude,
            longitude: location.longitude,
            heading: location.heading,
            speed: location.speed,
            timestamp: location.timestamp
          });
          break;
        default:
          throw new Error(`Unknown transportation data type: ${type}`);
      }
      
      // Transform the data
      const transformedData = data.map(dataTransform);
      
      // Use REST API instead of supabase client to avoid type issues
      const response = await fetch(`${SUPABASE_PUBLIC_URL}/rest/v1/${tableName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_PUBLIC_KEY}`,
          'apikey': SUPABASE_PUBLIC_KEY,
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(transformedData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error saving ${type} data:`, errorText);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Error in saveTransportationData for ${type}:`, error);
      return false;
    }
  }
};
