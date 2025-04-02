
/**
 * Service for handling geolocation functionality
 */

import { LocationResult } from './types';

/**
 * Get the current location of the user
 * @returns Promise with coordinates
 */
export const getCurrentLocation = async (): Promise<LocationResult | null> => {
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
