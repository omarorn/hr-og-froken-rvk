
/**
 * Service for transportation information, including bus routes
 */

// Base URLs for transportation APIs
const STRAETO_API_URL = "https://straeto.is/api";
const TRAFFIC_API_URL = "https://umferd.is/api";

// Types for bus routes
export interface BusStop {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface BusRoute {
  routeNumber: string;
  name: string;
  schedule: string[];
  stops: BusStop[];
  frequency: string;
}

export interface BusTrip {
  origin: BusStop;
  destination: BusStop;
  options: Array<{
    routes: Array<{
      routeNumber: string;
      departureTime: string;
      arrivalTime: string;
      departureStop: BusStop;
      arrivalStop: BusStop;
    }>;
    totalDuration: number; // in minutes
    transfers: number;
    walkingDistance: number; // in meters
  }>;
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

/**
 * Find optimal bus trips between two locations
 * @param originLat Origin latitude
 * @param originLng Origin longitude
 * @param destinationLat Destination latitude
 * @param destinationLng Destination longitude
 * @param departureTime Departure time (ISO string)
 * @returns Promise with trip options
 */
export const findBusTrips = async (
  originLat: number,
  originLng: number,
  destinationLat: number,
  destinationLng: number,
  departureTime?: string // Optional, defaults to current time
): Promise<BusTrip> => {
  try {
    // Get nearby bus stops for origin and destination
    const originStops = await getNearbyBusStops(originLat, originLng, 500);
    const destinationStops = await getNearbyBusStops(destinationLat, destinationLng, 500);
    
    if (originStops.length === 0 || destinationStops.length === 0) {
      throw new Error("No bus stops found near one or both locations");
    }
    
    // Use the closest bus stops as origin and destination
    const originStop = originStops[0];
    const destinationStop = destinationStops[0];
    
    // Get current time if departureTime is not provided
    const now = new Date();
    const departureDateTime = departureTime ? new Date(departureTime) : now;
    
    // Format time strings
    const formatTime = (date: Date, addMinutes: number = 0) => {
      const newDate = new Date(date);
      newDate.setMinutes(newDate.getMinutes() + addMinutes);
      return newDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    };
    
    // Simplified algorithm to generate trip options
    // In a real implementation, this would call the Strætó API for route planning
    
    // Generate mock trip options
    const tripOptions = [
      {
        routes: [
          {
            routeNumber: "1",
            departureTime: formatTime(departureDateTime, 5),
            arrivalTime: formatTime(departureDateTime, 25),
            departureStop: originStop,
            arrivalStop: destinationStop
          }
        ],
        totalDuration: 20,
        transfers: 0,
        walkingDistance: 200
      },
      {
        routes: [
          {
            routeNumber: "3",
            departureTime: formatTime(departureDateTime),
            arrivalTime: formatTime(departureDateTime, 15),
            departureStop: originStop,
            arrivalStop: { 
              id: "90000830", 
              name: "Kringlan", 
              coordinates: { lat: 64.1306, lng: -21.8937 } 
            }
          },
          {
            routeNumber: "6",
            departureTime: formatTime(departureDateTime, 20),
            arrivalTime: formatTime(departureDateTime, 30),
            departureStop: { 
              id: "90000830", 
              name: "Kringlan", 
              coordinates: { lat: 64.1306, lng: -21.8937 } 
            },
            arrivalStop: destinationStop
          }
        ],
        totalDuration: 30,
        transfers: 1,
        walkingDistance: 150
      }
    ];
    
    return {
      origin: originStop,
      destination: destinationStop,
      options: tripOptions
    };
  } catch (error) {
    console.error("Error finding bus trips:", error);
    
    // Return an empty result structure
    return {
      origin: {
        id: "unknown",
        name: "Unknown",
        coordinates: { lat: originLat, lng: originLng }
      },
      destination: {
        id: "unknown",
        name: "Unknown",
        coordinates: { lat: destinationLat, lng: destinationLng }
      },
      options: []
    };
  }
};

/**
 * Get traffic information for Reykjavik
 * @returns Promise with traffic status
 */
export const getTrafficInformation = async (): Promise<{
  status: string;
  incidents: Array<{
    location: string;
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
}> => {
  try {
    // Simulate API call to get traffic information
    // In a real implementation, this would call the traffic API
    
    // Mock traffic data
    const mockTrafficData = {
      status: "Normal",
      incidents: [
        {
          location: "Miklabraut, near Kringlan",
          type: "Roadwork",
          severity: "medium" as const,
          description: "Road repairs causing delays in both directions"
        },
        {
          location: "Hringbraut, near University of Iceland",
          type: "Accident",
          severity: "low" as const,
          description: "Minor accident, right lane closed"
        }
      ]
    };
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return mockTrafficData;
  } catch (error) {
    console.error("Error getting traffic information:", error);
    
    // Return default data in case of error
    return {
      status: "Unknown",
      incidents: []
    };
  }
};
