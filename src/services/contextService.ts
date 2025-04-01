
import { supabase } from "@/integrations/supabase/client";
import { getTextToSpeech } from '@/services/openAiService';
import { getCurrentTime, formatIcelandicDate, getIcelandicDayName, getIcelandicMonthName, getTimeBasedGreeting } from '@/services/timeService';
import { toast } from "sonner";

/**
 * Service for enhancing AI conversation with contextual information
 */

interface ContextualDataRequest {
  type: 'time' | 'wasteCollection' | 'busRoutes' | 'locations' | 'crawlData';
  params: any;
}

interface TimeInfo {
  isoString: string;
  timestamp: number;
  formatted: string;
  hour: number;
  minute: number;
  second: number;
  dayOfWeek: number;
  dayName: string;
  date: number;
  month: number;
  monthName: string;
  year: number;
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  greeting: string;
}

/**
 * Add time information to the AI context
 * @returns Time information
 */
export const addTimeContext = async (): Promise<TimeInfo | null> => {
  try {
    // Get time locally first
    const localTime = getCurrentTime();
    
    // Add missing properties to meet TimeInfo interface
    const enhancedLocalTime: TimeInfo = {
      ...localTime,
      dayName: getIcelandicDayName(localTime.dayOfWeek),
      monthName: getIcelandicMonthName(localTime.month),
      greeting: getTimeBasedGreeting()
    };
    
    // Then try to get time from edge function for more accuracy
    try {
      const { data, error } = await supabase.functions.invoke('contextual-data', {
        body: {
          type: 'time',
          params: {}
        }
      });
      
      if (error) {
        console.error('Error getting time from edge function:', error);
        return enhancedLocalTime;
      }
      
      return data;
    } catch (error) {
      console.error('Failed to get time from edge function:', error);
      return enhancedLocalTime;
    }
  } catch (error) {
    console.error('Error adding time context:', error);
    return null;
  }
};

/**
 * Add waste collection information to the AI context
 * @param postalCode Postal code
 * @returns Waste collection information
 */
export const addWasteCollectionContext = async (postalCode: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('contextual-data', {
      body: {
        type: 'wasteCollection',
        params: { postalCode }
      }
    });
    
    if (error) {
      console.error('Error getting waste collection info:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error adding waste collection context:', error);
    return null;
  }
};

/**
 * Add bus route information to the AI context
 * @param originLat Origin latitude
 * @param originLng Origin longitude
 * @param destinationLat Destination latitude
 * @param destinationLng Destination longitude
 * @returns Bus route information
 */
export const addBusRouteContext = async (
  originLat: number,
  originLng: number,
  destinationLat: number,
  destinationLng: number
): Promise<any | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('contextual-data', {
      body: {
        type: 'busRoutes',
        params: { originLat, originLng, destinationLat, destinationLng }
      }
    });
    
    if (error) {
      console.error('Error getting bus route info:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error adding bus route context:', error);
    return null;
  }
};

/**
 * Add nearby location information to the AI context
 * @param lat Latitude
 * @param lng Longitude
 * @param type Location type
 * @param radius Search radius in meters
 * @returns Nearby location information
 */
export const addLocationContext = async (
  lat: number,
  lng: number,
  type: string = 'all',
  radius: number = 1000
): Promise<any | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('contextual-data', {
      body: {
        type: 'locations',
        params: { lat, lng, type, radius }
      }
    });
    
    if (error) {
      console.error('Error getting location info:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error adding location context:', error);
    return null;
  }
};

/**
 * Add data from a web crawl to the AI context
 * @param url URL to crawl
 * @returns Crawled data
 */
export const addCrawlDataContext = async (url: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('contextual-data', {
      body: {
        type: 'crawlData',
        params: { url }
      }
    });
    
    if (error) {
      console.error('Error getting crawl data:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error adding crawl data context:', error);
    return null;
  }
};

/**
 * Generate a comprehensive context object for the AI
 * @param includeLocation Whether to include location context
 * @param includeWaste Whether to include waste collection context
 * @param postalCode Postal code for waste collection
 * @returns Context object
 */
export const generateContext = async (
  includeLocation: boolean = true,
  includeWaste: boolean = true,
  postalCode: string = "101"
): Promise<any> => {
  try {
    const context: any = {};
    
    // Always include time
    const timeInfo = await addTimeContext();
    if (timeInfo) {
      context.time = timeInfo;
    }
    
    // Add location information if requested
    if (includeLocation) {
      try {
        // Try to get user's location
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          } else {
            reject(new Error("Geolocation not supported"));
          }
        });
        
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Add nearby locations
        const locations = await addLocationContext(lat, lng);
        if (locations) {
          context.locations = locations;
        }
      } catch (error) {
        console.error('Error getting location:', error);
        // Use default Reykjavik center coordinates
        const locations = await addLocationContext(64.1466, -21.9426);
        if (locations) {
          context.locations = locations;
        }
      }
    }
    
    // Add waste collection information if requested
    if (includeWaste) {
      const wasteInfo = await addWasteCollectionContext(postalCode);
      if (wasteInfo) {
        context.wasteCollection = wasteInfo;
      }
    }
    
    return context;
  } catch (error) {
    console.error('Error generating context:', error);
    toast.error('Ekki tókst að búa til samhengi');
    return {};
  }
};

/**
 * Enhance the AI system prompt with contextual data
 * @param basePrompt Base system prompt
 * @returns Enhanced prompt with context
 */
export const enhancePromptWithContext = async (basePrompt: string): Promise<string> => {
  try {
    // Generate context
    const context = await generateContext();
    
    // Build contextual information string
    let contextInfo = "CURRENT CONTEXTUAL INFORMATION:\n";
    
    // Add time information
    if (context.time) {
      const { formatted, dayName, date, monthName, year, greeting } = context.time;
      contextInfo += `Current time: ${formatted}\n`;
      contextInfo += `Today is ${dayName}, ${date}. ${monthName} ${year}\n`;
      contextInfo += `Appropriate greeting: "${greeting}"\n\n`;
    }
    
    // Add waste collection information
    if (context.wasteCollection) {
      const { area, nextCollection } = context.wasteCollection;
      contextInfo += `Waste Collection Area: ${area}\n`;
      contextInfo += `Next collection: ${nextCollection.type} on ${nextCollection.date}\n\n`;
    }
    
    // Add location information
    if (context.locations && context.locations.length > 0) {
      contextInfo += `Nearby locations:\n`;
      context.locations.slice(0, 3).forEach((location: any) => {
        contextInfo += `- ${location.name} (${location.type}): ${location.address}\n`;
      });
      contextInfo += "\n";
    }
    
    // Enhance the prompt
    return `${basePrompt}\n\n${contextInfo}`;
  } catch (error) {
    console.error('Error enhancing prompt with context:', error);
    return basePrompt;
  }
};
