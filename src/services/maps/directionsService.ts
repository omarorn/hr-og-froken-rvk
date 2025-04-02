
/**
 * Service for handling directions functionality
 */

import { DirectionsResult, TransportMode } from './types';

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
  mode: TransportMode = "driving"
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
