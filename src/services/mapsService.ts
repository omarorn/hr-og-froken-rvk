
/**
 * Service for handling map-related functionality
 */

// Mock Google Maps API key (would need a real key in production)
const GOOGLE_MAPS_API_KEY = "mock_key";

export interface PlaceResult {
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  rating?: number;
  types: string[];
  openingHours?: {
    isOpen: boolean;
    periods: Array<{
      day: number;
      open: string;
      close: string;
    }>;
  };
}

export interface DirectionsResult {
  origin: string;
  destination: string;
  distance: string;
  duration: string;
  steps: Array<{
    instruction: string;
    distance: string;
    duration: string;
  }>;
}

/**
 * Search for places near a location
 * @param query Search query
 * @param lat Latitude
 * @param lng Longitude
 * @param radius Search radius in meters
 * @returns Promise with place results
 */
export const searchPlaces = async (
  query: string,
  lat: number,
  lng: number,
  radius: number = 1000
): Promise<PlaceResult[]> => {
  try {
    // In a real implementation, this would call the Google Places API
    
    // Mock place results based on query
    const mockPlaces: Record<string, PlaceResult[]> = {
      "restaurant": [
        {
          name: "Grillmarkaðurinn",
          address: "Lækjargata 2a, 101 Reykjavík",
          coordinates: { lat: 64.1476, lng: -21.9382 },
          rating: 4.5,
          types: ["restaurant", "food"],
          openingHours: {
            isOpen: true,
            periods: [
              { day: 1, open: "17:00", close: "23:00" },
              { day: 2, open: "17:00", close: "23:00" },
              { day: 3, open: "17:00", close: "23:00" },
              { day: 4, open: "17:00", close: "23:00" },
              { day: 5, open: "17:00", close: "23:30" },
              { day: 6, open: "17:00", close: "23:30" },
              { day: 0, open: "17:00", close: "22:00" }
            ]
          }
        },
        {
          name: "Fish Company",
          address: "Vesturgata 2a, 101 Reykjavík",
          coordinates: { lat: 64.1485, lng: -21.9430 },
          rating: 4.6,
          types: ["restaurant", "seafood", "food"],
          openingHours: {
            isOpen: true,
            periods: [
              { day: 1, open: "11:30", close: "23:00" },
              { day: 2, open: "11:30", close: "23:00" },
              { day: 3, open: "11:30", close: "23:00" },
              { day: 4, open: "11:30", close: "23:00" },
              { day: 5, open: "11:30", close: "23:30" },
              { day: 6, open: "11:30", close: "23:30" },
              { day: 0, open: "17:00", close: "22:00" }
            ]
          }
        }
      ],
      "cafe": [
        {
          name: "Reykjavik Roasters",
          address: "Kárastígur 1, 101 Reykjavík",
          coordinates: { lat: 64.1426, lng: -21.9271 },
          rating: 4.7,
          types: ["cafe", "coffee", "food"],
          openingHours: {
            isOpen: true,
            periods: [
              { day: 1, open: "08:00", close: "18:00" },
              { day: 2, open: "08:00", close: "18:00" },
              { day: 3, open: "08:00", close: "18:00" },
              { day: 4, open: "08:00", close: "18:00" },
              { day: 5, open: "08:00", close: "18:00" },
              { day: 6, open: "09:00", close: "18:00" },
              { day: 0, open: "09:00", close: "17:00" }
            ]
          }
        }
      ],
      "grocery": [
        {
          name: "Bónus",
          address: "Hallveigarstígur 1, 101 Reykjavík",
          coordinates: { lat: 64.1465, lng: -21.9352 },
          rating: 4.3,
          types: ["grocery", "store", "food"],
          openingHours: {
            isOpen: true,
            periods: [
              { day: 1, open: "10:00", close: "20:00" },
              { day: 2, open: "10:00", close: "20:00" },
              { day: 3, open: "10:00", close: "20:00" },
              { day: 4, open: "10:00", close: "20:00" },
              { day: 5, open: "10:00", close: "20:00" },
              { day: 6, open: "10:00", close: "19:00" },
              { day: 0, open: "11:00", close: "18:00" }
            ]
          }
        }
      ],
      "library": [
        {
          name: "Reykjavík City Library",
          address: "Tryggvagata 15, 101 Reykjavík",
          coordinates: { lat: 64.1488, lng: -21.9419 },
          rating: 4.5,
          types: ["library", "government"],
          openingHours: {
            isOpen: true,
            periods: [
              { day: 1, open: "10:00", close: "19:00" },
              { day: 2, open: "10:00", close: "19:00" },
              { day: 3, open: "10:00", close: "19:00" },
              { day: 4, open: "10:00", close: "19:00" },
              { day: 5, open: "10:00", close: "18:00" },
              { day: 6, open: "11:00", close: "17:00" },
              { day: 0, open: "13:00", close: "17:00" }
            ]
          }
        }
      ],
      "swimming": [
        {
          name: "Sundhöllin",
          address: "Barónsstígur 45a, 101 Reykjavík",
          coordinates: { lat: 64.1422, lng: -21.9205 },
          rating: 4.6,
          types: ["swimming", "pool", "recreation"],
          openingHours: {
            isOpen: true,
            periods: [
              { day: 1, open: "06:30", close: "22:00" },
              { day: 2, open: "06:30", close: "22:00" },
              { day: 3, open: "06:30", close: "22:00" },
              { day: 4, open: "06:30", close: "22:00" },
              { day: 5, open: "06:30", close: "22:00" },
              { day: 6, open: "08:00", close: "20:00" },
              { day: 0, open: "08:00", close: "20:00" }
            ]
          }
        }
      ]
    };
    
    // Check if we have mock data for the query
    // If not, return empty array (or could return results for "default" category)
    const results = mockPlaces[query.toLowerCase()] || [];
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return results;
  } catch (error) {
    console.error("Error searching places:", error);
    return [];
  }
};

/**
 * Get directions between two locations
 * @param originLat Origin latitude
 * @param originLng Origin longitude
 * @param destinationLat Destination latitude
 * @param destinationLng Destination longitude
 * @param mode Travel mode (driving, walking, bicycling, transit)
 * @returns Promise with directions
 */
export const getDirections = async (
  originLat: number,
  originLng: number,
  destinationLat: number,
  destinationLng: number,
  mode: "driving" | "walking" | "bicycling" | "transit" = "driving"
): Promise<DirectionsResult> => {
  try {
    // In a real implementation, this would call the Google Directions API
    
    // Generate mock directions based on mode
    const mockDirections: Record<string, DirectionsResult> = {
      "driving": {
        origin: "Current Location",
        destination: "Destination",
        distance: "5.2 km",
        duration: "12 mins",
        steps: [
          {
            instruction: "Head south on Laugavegur",
            distance: "300 m",
            duration: "1 min"
          },
          {
            instruction: "Turn right onto Snorrabraut",
            distance: "700 m",
            duration: "2 mins"
          },
          {
            instruction: "Continue onto Hringbraut",
            distance: "1.5 km",
            duration: "3 mins"
          },
          {
            instruction: "Turn left onto Hofsvallagata",
            distance: "800 m",
            duration: "2 mins"
          },
          {
            instruction: "Continue onto Ægisíða",
            distance: "1.9 km",
            duration: "4 mins"
          }
        ]
      },
      "walking": {
        origin: "Current Location",
        destination: "Destination",
        distance: "4.8 km",
        duration: "58 mins",
        steps: [
          {
            instruction: "Head south on Laugavegur",
            distance: "300 m",
            duration: "4 mins"
          },
          {
            instruction: "Turn right onto Snorrabraut",
            distance: "700 m",
            duration: "8 mins"
          },
          {
            instruction: "Continue onto Hringbraut",
            distance: "1.5 km",
            duration: "18 mins"
          },
          {
            instruction: "Turn left onto Hofsvallagata",
            distance: "800 m",
            duration: "10 mins"
          },
          {
            instruction: "Continue onto Ægisíða",
            distance: "1.5 km",
            duration: "18 mins"
          }
        ]
      },
      "bicycling": {
        origin: "Current Location",
        destination: "Destination",
        distance: "5.0 km",
        duration: "24 mins",
        steps: [
          {
            instruction: "Head south on Laugavegur",
            distance: "300 m",
            duration: "2 mins"
          },
          {
            instruction: "Turn right onto Snorrabraut",
            distance: "700 m",
            duration: "3 mins"
          },
          {
            instruction: "Continue onto Hringbraut",
            distance: "1.5 km",
            duration: "6 mins"
          },
          {
            instruction: "Turn left onto Hofsvallagata",
            distance: "800 m",
            duration: "4 mins"
          },
          {
            instruction: "Continue onto Ægisíða",
            distance: "1.7 km",
            duration: "9 mins"
          }
        ]
      },
      "transit": {
        origin: "Current Location",
        destination: "Destination",
        distance: "5.3 km",
        duration: "25 mins",
        steps: [
          {
            instruction: "Walk to Hlemmur bus stop",
            distance: "250 m",
            duration: "3 mins"
          },
          {
            instruction: "Take bus number 3 towards Kringlan",
            distance: "3.2 km",
            duration: "12 mins"
          },
          {
            instruction: "Get off at Kringlan",
            distance: "0 m",
            duration: "0 mins"
          },
          {
            instruction: "Walk to your destination",
            distance: "1.8 km",
            duration: "10 mins"
          }
        ]
      }
    };
    
    // Return directions for the requested mode
    const directions = mockDirections[mode] || mockDirections.driving;
    
    // Customize origin and destination names
    directions.origin = `${originLat.toFixed(4)}, ${originLng.toFixed(4)}`;
    directions.destination = `${destinationLat.toFixed(4)}, ${destinationLng.toFixed(4)}`;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return directions;
  } catch (error) {
    console.error("Error getting directions:", error);
    
    // Return a basic result in case of error
    return {
      origin: `${originLat.toFixed(4)}, ${originLng.toFixed(4)}`,
      destination: `${destinationLat.toFixed(4)}, ${destinationLng.toFixed(4)}`,
      distance: "Unknown",
      duration: "Unknown",
      steps: []
    };
  }
};

/**
 * Get the current location of the user
 * @returns Promise with coordinates
 */
export const getCurrentLocation = async (): Promise<{
  lat: number;
  lng: number;
  accuracy: number;
} | null> => {
  return new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        () => {
          console.error("Error getting current location");
          // Default to Reykjavik center if geolocation fails
          resolve({
            lat: 64.1466,
            lng: -21.9426,
            accuracy: 1000
          });
        }
      );
    } else {
      console.error("Geolocation not supported");
      resolve(null);
    }
  });
};
