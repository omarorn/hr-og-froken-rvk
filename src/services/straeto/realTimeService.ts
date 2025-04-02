
/**
 * Service for fetching real-time bus location information
 */

import { invokeStraetoFunction } from './utils';
import { StraetoRealtimeData, StraetoError } from './types';

/**
 * Fetches real-time bus locations from the Straeto API via edge function.
 * @param routeIds - Optional array of route IDs to filter locations.
 */
export const getStraetoRealtime = async (routeIds?: string[]): Promise<StraetoRealtimeData[] | StraetoError> => {
  let path = 'straeto/realtime';
  if (routeIds && routeIds.length > 0) {
    path += `?routeIds=${routeIds.join(',')}`;
  }

  return await invokeStraetoFunction(path) as StraetoRealtimeData[] | StraetoError;
};
