
/**
 * Service for handling places search functionality
 */

import { PlaceResult } from './types';

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
