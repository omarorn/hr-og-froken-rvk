
/**
 * Service for fetching bus route information
 */

import { invokeStraetoFunction } from './utils';
import { StraetoRoute, StraetoError } from './types';

/**
 * Fetches all bus routes from the Straeto API via edge function.
 */
export const getStraetoRoutes = async (): Promise<StraetoRoute[] | StraetoError> => {
  return await invokeStraetoFunction('straeto/routes') as StraetoRoute[] | StraetoError;
};
