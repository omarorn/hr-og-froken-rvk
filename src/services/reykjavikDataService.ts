
/**
 * Service for accessing Reykjavik's open data portal
 */

// Base URL for Reykjavik's open data APIs
const BASE_URL = "https://gagnahladbord.reykjavik.is/api";

// Data categories in Reykjavik's open data portal
export enum DataCategory {
  LOCATIONS = "stadsetningar",
  POPULATION = "ibuafjoldi",
  BUDGET = "fjarhagsaaetlun",
  REAL_ESTATE = "fasteignaverd",
  AIR_QUALITY = "loftgaedi",
  WALKING_PATHS = "gonguleidir",
  BICYCLE_ROUTES = "hjolaleidir",
  OPEN_AREAS = "opinsvædi",
  PRESCHOOLS = "leikskoalar",
  ELEMENTARY_SCHOOLS = "grunnskoalar",
  WASTE_COLLECTION = "sorphirda"
}

// Types for location data
export interface Location {
  id: string;
  name: string;
  type: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  services: string[];
}

// Types for waste collection information
export interface WasteCollectionSchedule {
  area: string;
  schedule: {
    generalWaste: string[];
    recycling: string[];
    organicWaste: string[];
    paperWaste: string[];
  };
  nextCollection: {
    type: string;
    date: string;
  };
}

/**
 * Fetch locations from Reykjavik's open data
 * @returns Promise with location data
 */
export const getLocations = async (): Promise<Location[]> => {
  try {
    const response = await fetch(`${BASE_URL}/stadsetningar`);
    
    if (!response.ok) {
      throw new Error(`Reykjavik API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.map((item: any) => ({
      id: item.id || String(Math.random()),
      name: item.name || "Unknown",
      type: item.type || "general",
      address: item.address || "",
      coordinates: {
        lat: item.latitude || 64.1466,
        lng: item.longitude || -21.9426
      },
      services: item.services || []
    }));
  } catch (error) {
    console.error("Error fetching Reykjavik locations:", error);
    // Return mock data in case the API is unavailable
    return [
      {
        id: "rvk-city-hall",
        name: "Reykjavík City Hall",
        type: "government",
        address: "Tjarnargata 11, 101 Reykjavík",
        coordinates: {
          lat: 64.1466,
          lng: -21.9426
        },
        services: ["Information", "Services", "Tourism"]
      }
    ];
  }
};

/**
 * Get waste collection schedule for a given postal code
 * @param postalCode The postal code to check
 * @returns Promise with waste collection schedule
 */
export const getWasteCollectionSchedule = async (
  postalCode: string
): Promise<WasteCollectionSchedule> => {
  try {
    // Simulate API call to waste collection schedule
    // In a real implementation, this would call the actual Reykjavik API
    
    // Mock schedules based on postal code patterns
    const mockSchedules: Record<string, WasteCollectionSchedule> = {
      "101": {
        area: "Central Reykjavik",
        schedule: {
          generalWaste: ["Monday", "Thursday"],
          recycling: ["Tuesday"],
          organicWaste: ["Wednesday"],
          paperWaste: ["Friday"]
        },
        nextCollection: {
          type: "General Waste",
          date: new Date(Date.now() + 86400000).toISOString().split("T")[0] // Tomorrow
        }
      },
      "105": {
        area: "Hlíðar",
        schedule: {
          generalWaste: ["Tuesday", "Friday"],
          recycling: ["Monday"],
          organicWaste: ["Thursday"],
          paperWaste: ["Wednesday"]
        },
        nextCollection: {
          type: "Recycling",
          date: new Date(Date.now() + 172800000).toISOString().split("T")[0] // Day after tomorrow
        }
      }
    };
    
    // Default schedule if postal code isn't found
    const defaultSchedule: WasteCollectionSchedule = {
      area: "General Reykjavik",
      schedule: {
        generalWaste: ["Monday"],
        recycling: ["Wednesday"],
        organicWaste: ["Friday"],
        paperWaste: ["Thursday"]
      },
      nextCollection: {
        type: "General Waste",
        date: new Date(Date.now() + 86400000).toISOString().split("T")[0] // Tomorrow
      }
    };
    
    // Match first 3 digits of postal code
    const postalCodePrefix = postalCode.substring(0, 3);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return mockSchedules[postalCodePrefix] || defaultSchedule;
  } catch (error) {
    console.error("Error fetching waste collection schedule:", error);
    
    // Return a fallback schedule in case of error
    return {
      area: "Reykjavik (Default)",
      schedule: {
        generalWaste: ["Monday"],
        recycling: ["Wednesday"],
        organicWaste: ["Friday"],
        paperWaste: ["Thursday"]
      },
      nextCollection: {
        type: "General Waste",
        date: new Date(Date.now() + 86400000).toISOString().split("T")[0] // Tomorrow
      }
    };
  }
};

/**
 * Get information about city facilities near a location
 * @param lat Latitude
 * @param lng Longitude
 * @param type Type of facility
 * @param radius Search radius in meters
 * @returns Promise with nearby facilities
 */
export const getNearbyFacilities = async (
  lat: number,
  lng: number,
  type: string,
  radius: number = 1000
): Promise<Location[]> => {
  try {
    // In a real implementation, this would call the Reykjavik API
    // Simulating API call here
    
    // Get all locations
    const allLocations = await getLocations();
    
    // Filter by type and distance
    return allLocations.filter(location => {
      // Check if type matches
      const typeMatches = location.type === type || type === "all";
      
      // Calculate distance (simplified version - not accurate for long distances)
      const distance = Math.sqrt(
        Math.pow((location.coordinates.lat - lat) * 111000, 2) + 
        Math.pow((location.coordinates.lng - lng) * 111000 * Math.cos(lat * Math.PI / 180), 2)
      );
      
      return typeMatches && distance <= radius;
    });
  } catch (error) {
    console.error("Error finding nearby facilities:", error);
    return [];
  }
};
