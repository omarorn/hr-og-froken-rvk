
/**
 * Service for trip planning and bus trips
 */

import { BusStop, getNearbyBusStops } from './busStopService';

/**
 * Bus trip option interface
 */
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
