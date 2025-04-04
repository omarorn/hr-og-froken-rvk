
import { getStraetoRoutes, getStraetoRealtime, getStraetoStops, getStraetoArrivals } from './index';
import type { StraetoRoute, StraetoRealtimeData, StraetoStop, StraetoArrival, StraetoError } from './types';

/**
 * Utility for testing Straeto API functionality
 */

/**
 * Tests all Straeto API endpoints and returns the results
 */
export const testStraetoApi = async (): Promise<{
  success: boolean;
  results: {
    routes?: StraetoRoute[] | StraetoError;
    realtime?: StraetoRealtimeData[] | StraetoError;
    stops?: StraetoStop[] | StraetoError;
    arrivals?: StraetoArrival[] | StraetoError;
  };
  errors: string[];
}> => {
  const errors: string[] = [];
  const results: any = {};
  
  try {
    // Test routes endpoint
    console.log("Testing Straeto Routes API...");
    const routesResponse = await getStraetoRoutes();
    results.routes = routesResponse;
    
    if ('error' in routesResponse) {
      errors.push(`Routes API error: ${routesResponse.error}`);
    } else {
      console.log(`Routes API successful, received ${routesResponse.length} routes`);
      
      // If routes were successful, test the realtime endpoint
      if (routesResponse.length > 0) {
        const selectedRouteId = routesResponse[0].id;
        
        // Test realtime endpoint with the first route
        console.log(`Testing Realtime API with route ${selectedRouteId}...`);
        const realtimeResponse = await getStraetoRealtime([selectedRouteId]);
        results.realtime = realtimeResponse;
        
        if ('error' in realtimeResponse) {
          errors.push(`Realtime API error: ${realtimeResponse.error}`);
        } else {
          console.log(`Realtime API successful, received ${realtimeResponse.length} bus locations`);
        }
        
        // Test stops endpoint with the first route
        console.log(`Testing Stops API with route ${selectedRouteId}...`);
        const stopsResponse = await getStraetoStops(selectedRouteId);
        results.stops = stopsResponse;
        
        if ('error' in stopsResponse) {
          errors.push(`Stops API error: ${stopsResponse.error}`);
        } else {
          console.log(`Stops API successful, received ${stopsResponse.length} stops`);
          
          // Test arrivals endpoint with the first stop if any
          if (stopsResponse.length > 0) {
            const selectedStopId = stopsResponse[0].id;
            
            console.log(`Testing Arrivals API with stop ${selectedStopId}...`);
            const arrivalsResponse = await getStraetoArrivals(selectedStopId);
            results.arrivals = arrivalsResponse;
            
            if ('error' in arrivalsResponse) {
              errors.push(`Arrivals API error: ${arrivalsResponse.error}`);
            } else {
              console.log(`Arrivals API successful, received ${arrivalsResponse.length} arrivals`);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Unexpected error during API testing:", error);
    errors.push(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  return {
    success: errors.length === 0,
    results,
    errors
  };
};

/**
 * Run API test and log results to console
 */
export const runApiTest = async (): Promise<void> => {
  console.log("Running Straeto API test...");
  const testResults = await testStraetoApi();
  
  if (testResults.success) {
    console.log("✅ All Straeto API tests passed successfully!");
  } else {
    console.error("❌ Straeto API tests encountered errors:", testResults.errors);
  }
  
  console.log("API Test Results:", testResults.results);
};
