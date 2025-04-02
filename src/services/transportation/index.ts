
/**
 * Transportation services index
 * Exports all transportation-related services
 */

// Base URLs for transportation APIs
export const STRAETO_API_URL = "https://straeto.is/api";
export const TRAFFIC_API_URL = "https://umferd.is/api";

// Re-export all types and functions from individual services
export * from './busStopService';
export * from './busRouteService';
export * from './trafficService';
export * from './tripService';
