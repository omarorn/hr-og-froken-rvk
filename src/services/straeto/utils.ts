
/**
 * Utility functions for Straeto services
 */

import { supabase, SUPABASE_URL, SUPABASE_PUBLIC_KEY } from '@/integrations/supabase/client';

/**
 * Checks if a value is a StraetoError
 */
export const isStraetoError = (value: any): value is { error: string } => {
  return value && typeof value === 'object' && 'error' in value;
};

/**
 * Helper function to create a standard error object
 */
export const createStraetoError = (message: string): { error: string } => {
  return { error: message };
};

/**
 * Executes a Supabase Edge Function and handles error cases
 */
export const invokeStraetoFunction = async (
  path: string, 
  method: 'GET' | 'POST' = 'GET'
) => {
  try {
    const { data, error } = await supabase.functions.invoke(path, {
      method,
    });

    if (error) {
      console.error(`Error invoking function ${path}:`, error);
      return { error: error.message };
    }

    return data;
  } catch (error) {
    console.error(`Unexpected error in ${path}:`, error);
    return { error: `Unexpected error in ${path}` };
  }
};
