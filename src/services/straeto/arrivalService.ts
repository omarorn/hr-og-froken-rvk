
/**
 * Service for fetching bus arrival information
 */

import { invokeStraetoFunction } from './utils';
import { StraetoArrival, StraetoError } from './types';
import { createStraetoError } from './utils';

/**
 * Fetches arrival times for a specific stop from the Straeto API via edge function.
 * @param stopId - The ID of the stop.
 */
export const getStraetoArrivals = async (stopId: string): Promise<StraetoArrival[] | StraetoError> => {
  if (!stopId) return createStraetoError('Stop ID is required');

  const path = `straeto/arrivals?stopId=${encodeURIComponent(stopId)}`;
  return await invokeStraetoFunction(path) as StraetoArrival[] | StraetoError;
};
