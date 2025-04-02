
/**
 * Service for fetching bus stop information
 */

import { invokeStraetoFunction } from './utils';
import { StraetoStop, StraetoError } from './types';
import { createStraetoError } from './utils';

/**
 * Fetches stops for a specific route from the Straeto API via edge function.
 * @param routeId - The ID of the route.
 */
export const getStraetoStops = async (routeId: string): Promise<StraetoStop[] | StraetoError> => {
  if (!routeId) return createStraetoError('Route ID is required');

  const path = `straeto/stops?routeId=${encodeURIComponent(routeId)}`;
  return await invokeStraetoFunction(path) as StraetoStop[] | StraetoError;
};
