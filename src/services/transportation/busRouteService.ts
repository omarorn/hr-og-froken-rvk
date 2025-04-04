
/**
 * Service for bus route related functionality
 */
import { BusStop } from './busStopService';

export interface BusRoute {
  routeNumber: string;
  name: string;
  schedule: string[];
  stops: BusStop[];
  frequency: string;
}

/**
 * Get bus route information
 * @param routeNumber The bus route number
 * @returns Promise with bus route details
 */
export const getBusRoute = async (routeNumber: string): Promise<BusRoute | null> => {
  try {
    // Simulate API call to get bus route information
    // In a real implementation, this would call the Strætó API
    
    // Mock bus routes
    const mockBusRoutes: Record<string, BusRoute> = {
      "1": {
        routeNumber: "1",
        name: "Hlemmur - Kópavogur - Seltjarnarnes",
        schedule: ["06:00-23:30"],
        frequency: "Every 15 minutes",
        stops: [
          { id: "90000295", name: "Hlemmur", coordinates: { lat: 64.1428, lng: -21.9141 } },
          { id: "90000270", name: "Lækjartorg", coordinates: { lat: 64.1474, lng: -21.9418 } },
          { id: "90000830", name: "Kringlan", coordinates: { lat: 64.1306, lng: -21.8937 } }
        ]
      },
      "3": {
        routeNumber: "3",
        name: "Hlemmur - Kringlan - Mjódd",
        schedule: ["06:20-23:00"],
        frequency: "Every 20 minutes",
        stops: [
          { id: "90000295", name: "Hlemmur", coordinates: { lat: 64.1428, lng: -21.9141 } },
          { id: "90000830", name: "Kringlan", coordinates: { lat: 64.1306, lng: -21.8937 } }
        ]
      },
      "6": {
        routeNumber: "6",
        name: "Hlemmur - Háskóli Íslands - Spöng",
        schedule: ["06:30-22:45"],
        frequency: "Every 30 minutes",
        stops: [
          { id: "90000295", name: "Hlemmur", coordinates: { lat: 64.1428, lng: -21.9141 } },
          { id: "90000060", name: "Háskóli Íslands", coordinates: { lat: 64.1395, lng: -21.9507 } }
        ]
      },
      "14": {
        routeNumber: "14",
        name: "Grandi - Kringlan - Verzló",
        schedule: ["06:15-23:15"],
        frequency: "Every 15 minutes",
        stops: [
          { id: "90000190", name: "Grandi", coordinates: { lat: 64.1515, lng: -21.9545 } },
          { id: "90000295", name: "Hlemmur", coordinates: { lat: 64.1428, lng: -21.9141 } },
          { id: "90000830", name: "Kringlan", coordinates: { lat: 64.1306, lng: -21.8937 } },
          { id: "90000920", name: "Verzló", coordinates: { lat: 64.1215, lng: -21.8855 } }
        ]
      }
    };
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return mockBusRoutes[routeNumber] || null;
  } catch (error) {
    console.error("Error getting bus route information:", error);
    return null;
  }
};
