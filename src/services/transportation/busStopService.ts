
/**
 * Service for bus stop related functionality
 */

// Types for bus stops
export interface BusStop {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address?: string;
}

/**
 * Get nearby bus stops
 * @param lat Latitude
 * @param lng Longitude
 * @param radius Radius in meters (default: 500)
 * @returns Promise with bus stops
 */
export const getNearbyBusStops = async (
  lat: number,
  lng: number,
  radius: number = 500
): Promise<BusStop[]> => {
  try {
    // Simulate API call to get nearby bus stops
    // In a real implementation, this would call the Strætó API
    
    // Mock bus stops with approximate coordinates around Reykjavik
    const mockBusStops: BusStop[] = [
      {
        id: "90000295",
        name: "Hlemmur",
        coordinates: { lat: 64.1428, lng: -21.9141 }
      },
      {
        id: "90000270",
        name: "Lækjartorg",
        coordinates: { lat: 64.1474, lng: -21.9418 }
      },
      {
        id: "90000060",
        name: "Háskóli Íslands",
        coordinates: { lat: 64.1395, lng: -21.9507 }
      },
      {
        id: "90000530",
        name: "Landspítalinn",
        coordinates: { lat: 64.1360, lng: -21.9270 }
      },
      {
        id: "90000830",
        name: "Kringlan",
        coordinates: { lat: 64.1306, lng: -21.8937 }
      }
    ];
    
    // Calculate distance for each bus stop
    const busStopsWithDistance = mockBusStops.map(stop => {
      // Calculate distance (simplified version - not accurate for long distances)
      const distance = Math.sqrt(
        Math.pow((stop.coordinates.lat - lat) * 111000, 2) + 
        Math.pow((stop.coordinates.lng - lng) * 111000 * Math.cos(lat * Math.PI / 180), 2)
      );
      
      return { ...stop, distance };
    });
    
    // Filter bus stops within the radius
    const nearbyStops = busStopsWithDistance
      .filter(stop => stop.distance <= radius)
      .map(({ distance, ...stop }) => stop); // Remove distance property
    
    return nearbyStops;
  } catch (error) {
    console.error("Error finding nearby bus stops:", error);
    return [];
  }
};
