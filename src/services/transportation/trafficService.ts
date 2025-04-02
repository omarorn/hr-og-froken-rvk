
/**
 * Service for traffic information
 */

// Base URL for traffic API
const TRAFFIC_API_URL = "https://umferd.is/api";

/**
 * Traffic incident interface
 */
export interface TrafficIncident {
  location: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

/**
 * Traffic information interface
 */
export interface TrafficInformation {
  status: string;
  incidents: TrafficIncident[];
}

/**
 * Get traffic information for Reykjavik
 * @returns Promise with traffic status
 */
export const getTrafficInformation = async (): Promise<TrafficInformation> => {
  try {
    // Simulate API call to get traffic information
    // In a real implementation, this would call the traffic API
    
    // Mock traffic data
    const mockTrafficData: TrafficInformation = {
      status: "Normal",
      incidents: [
        {
          location: "Miklabraut, near Kringlan",
          type: "Roadwork",
          severity: "medium",
          description: "Road repairs causing delays in both directions"
        },
        {
          location: "Hringbraut, near University of Iceland",
          type: "Accident",
          severity: "low",
          description: "Minor accident, right lane closed"
        }
      ]
    };
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return mockTrafficData;
  } catch (error) {
    console.error("Error getting traffic information:", error);
    
    // Return default data in case of error
    return {
      status: "Unknown",
      incidents: []
    };
  }
};
