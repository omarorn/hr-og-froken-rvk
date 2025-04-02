
/**
 * Service for syncing Straeto data
 */

import { invokeStraetoFunction } from './utils';
import { StraetoError } from './types';

/**
 * Triggers a data sync operation to refresh the database with the latest Straeto data.
 */
export const syncStraetoData = async (): Promise<{ message: string } | StraetoError> => {
  return await invokeStraetoFunction('straeto/sync', 'POST') as { message: string } | StraetoError;
};
