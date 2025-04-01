
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, params } = await req.json();
    
    console.log(`Contextual data request: ${type}`, params);
    
    let responseData;
    
    // Handle different data types
    switch (type) {
      case 'time':
        responseData = getCurrentTime();
        break;
      
      case 'wasteCollection':
        responseData = await getWasteCollectionInfo(params.postalCode);
        break;
      
      case 'busRoutes':
        responseData = await getBusRouteInfo(
          params.originLat, 
          params.originLng,
          params.destinationLat,
          params.destinationLng
        );
        break;
      
      case 'locations':
        responseData = await getNearbyLocations(
          params.lat,
          params.lng,
          params.type,
          params.radius
        );
        break;
      
      case 'crawlData':
        responseData = await getDataFromCrawl(params.url);
        break;
      
      default:
        throw new Error(`Unknown data type: ${type}`);
    }
    
    return new Response(JSON.stringify({
      success: true,
      data: responseData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in contextual-data endpoint:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Get current time in Iceland
function getCurrentTime() {
  const now = new Date();
  
  // Get time parts
  const hour = now.getUTCHours();
  const minute = now.getUTCMinutes();
  const second = now.getUTCSeconds();
  const dayOfWeek = now.getUTCDay();
  const date = now.getUTCDate();
  const month = now.getUTCMonth() + 1;
  const year = now.getUTCFullYear();
  
  // Format time string
  const formattedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
  
  // Determine time of day
  let timeOfDay;
  if (hour >= 5 && hour < 12) {
    timeOfDay = "morning";
  } else if (hour >= 12 && hour < 18) {
    timeOfDay = "afternoon";
  } else if (hour >= 18 && hour < 22) {
    timeOfDay = "evening";
  } else {
    timeOfDay = "night";
  }
  
  // Icelandic day names
  const dayNames = [
    "Sunnudagur",
    "Mánudagur",
    "Þriðjudagur",
    "Miðvikudagur",
    "Fimmtudagur",
    "Föstudagur",
    "Laugardagur"
  ];
  
  // Icelandic month names
  const monthNames = [
    "Janúar",
    "Febrúar",
    "Mars",
    "Apríl",
    "Maí",
    "Júní",
    "Júlí",
    "Ágúst",
    "September",
    "Október",
    "Nóvember",
    "Desember"
  ];
  
  return {
    isoString: now.toISOString(),
    timestamp: now.getTime(),
    formatted: formattedTime,
    hour,
    minute,
    second,
    dayOfWeek,
    dayName: dayNames[dayOfWeek],
    date,
    month,
    monthName: monthNames[month - 1],
    year,
    timeOfDay,
    greeting: getGreeting(hour)
  };
}

// Get appropriate greeting based on time
function getGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) {
    return "Góðan morgun";
  } else if (hour >= 12 && hour < 18) {
    return "Góðan dag";
  } else if (hour >= 18 && hour < 22) {
    return "Gott kvöld";
  } else {
    return "Góða nótt";
  }
}

// Get waste collection information for a postal code
async function getWasteCollectionInfo(postalCode: string = "101") {
  // Mock data - in production this would call a real API
  const schedules: Record<string, any> = {
    "101": {
      area: "Central Reykjavik",
      schedule: {
        generalWaste: ["Monday", "Thursday"],
        recycling: ["Tuesday"],
        organicWaste: ["Wednesday"],
        paperWaste: ["Friday"]
      },
      nextCollection: {
        type: "General Waste",
        date: new Date(Date.now() + 86400000).toISOString().split("T")[0] // Tomorrow
      }
    },
    "105": {
      area: "Hlíðar",
      schedule: {
        generalWaste: ["Tuesday", "Friday"],
        recycling: ["Monday"],
        organicWaste: ["Thursday"],
        paperWaste: ["Wednesday"]
      },
      nextCollection: {
        type: "Recycling",
        date: new Date(Date.now() + 172800000).toISOString().split("T")[0] // Day after tomorrow
      }
    }
  };
    
  // Default schedule if postal code isn't found
  const defaultSchedule = {
    area: "General Reykjavik",
    schedule: {
      generalWaste: ["Monday"],
      recycling: ["Wednesday"],
      organicWaste: ["Friday"],
      paperWaste: ["Thursday"]
    },
    nextCollection: {
      type: "General Waste",
      date: new Date(Date.now() + 86400000).toISOString().split("T")[0] // Tomorrow
    }
  };
    
  // Match first 3 digits of postal code
  const postalCodePrefix = postalCode.substring(0, 3);
  
  return schedules[postalCodePrefix] || defaultSchedule;
}

// Get bus route information
async function getBusRouteInfo(originLat: number, originLng: number, destinationLat: number, destinationLng: number) {
  // Mock bus stops with approximate coordinates around Reykjavik
  const busStops = [
    {
      id: "90000295",
      name: "Hlemmur",
      coordinates: { lat: 64.1428, lng: -21.9141 }
    },
    {
      id: "90000270",
      name: "Lækjartorg",
      coordinates: { lat: 64.1474, lng: -21.9418 }
    },
    {
      id: "90000060",
      name: "Háskóli Íslands",
      coordinates: { lat: 64.1395, lng: -21.9507 }
    },
    {
      id: "90000530",
      name: "Landspítalinn",
      coordinates: { lat: 64.1360, lng: -21.9270 }
    },
    {
      id: "90000830",
      name: "Kringlan",
      coordinates: { lat: 64.1306, lng: -21.8937 }
    }
  ];
  
  // Find closest bus stop to origin and destination
  const originStop = findClosestStop(originLat, originLng, busStops);
  const destinationStop = findClosestStop(destinationLat, destinationLng, busStops);
  
  // Format time
  const formatTime = (date: Date, addMinutes: number = 0) => {
    const newDate = new Date(date);
    newDate.setMinutes(newDate.getMinutes() + addMinutes);
    return `${newDate.getHours().toString().padStart(2, '0')}:${newDate.getMinutes().toString().padStart(2, '0')}`;
  };
  
  const now = new Date();
  
  // Generate mock trip options
  const tripOptions = [
    {
      routes: [
        {
          routeNumber: "1",
          departureTime: formatTime(now, 5),
          arrivalTime: formatTime(now, 25),
          departureStop: originStop,
          arrivalStop: destinationStop
        }
      ],
      totalDuration: 20,
      transfers: 0,
      walkingDistance: 200
    },
    {
      routes: [
        {
          routeNumber: "3",
          departureTime: formatTime(now),
          arrivalTime: formatTime(now, 15),
          departureStop: originStop,
          arrivalStop: busStops[4] // Kringlan
        },
        {
          routeNumber: "6",
          departureTime: formatTime(now, 20),
          arrivalTime: formatTime(now, 30),
          departureStop: busStops[4], // Kringlan
          arrivalStop: destinationStop
        }
      ],
      totalDuration: 30,
      transfers: 1,
      walkingDistance: 150
    }
  ];
  
  return {
    origin: originStop,
    destination: destinationStop,
    options: tripOptions
  };
}

// Helper function to find closest bus stop
function findClosestStop(lat: number, lng: number, stops: any[]) {
  let closestStop = stops[0];
  let closestDistance = Number.MAX_VALUE;
  
  for (const stop of stops) {
    const distance = calculateDistance(
      lat, 
      lng, 
      stop.coordinates.lat, 
      stop.coordinates.lng
    );
    
    if (distance < closestDistance) {
      closestDistance = distance;
      closestStop = stop;
    }
  }
  
  return closestStop;
}

// Calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c;
  
  return d; // distance in meters
}

// Get nearby locations
async function getNearbyLocations(lat: number, lng: number, type: string = "all", radius: number = 1000) {
  // Mock locations in Reykjavik
  const locations = [
    {
      id: "city-hall",
      name: "Reykjavík City Hall",
      type: "government",
      address: "Tjarnargata 11, 101 Reykjavík",
      coordinates: { lat: 64.1466, lng: -21.9426 },
      services: ["Information", "Services", "Tourism"]
    },
    {
      id: "harpa",
      name: "Harpa Concert Hall",
      type: "culture",
      address: "Austurbakki 2, 101 Reykjavík",
      coordinates: { lat: 64.1505, lng: -21.9323 },
      services: ["Concerts", "Events", "Tourism"]
    },
    {
      id: "hallgrimskirkja",
      name: "Hallgrímskirkja",
      type: "culture",
      address: "Hallgrímstorg 1, 101 Reykjavík",
      coordinates: { lat: 64.1418, lng: -21.9266 },
      services: ["Church", "Tourism", "Viewpoint"]
    },
    {
      id: "kringlan",
      name: "Kringlan Shopping Mall",
      type: "shopping",
      address: "Kringlan 4-12, 103 Reykjavík",
      coordinates: { lat: 64.1306, lng: -21.8937 },
      services: ["Shopping", "Dining", "Entertainment"]
    },
    {
      id: "laugardalslaug",
      name: "Laugardalslaug Swimming Pool",
      type: "recreation",
      address: "Sundlaugavegur 30, 105 Reykjavík",
      coordinates: { lat: 64.1456, lng: -21.8872 },
      services: ["Swimming", "Hot Tubs", "Recreation"]
    }
  ];
  
  // Filter by type and distance
  return locations.filter(location => {
    // Check if type matches
    const typeMatches = type === "all" || location.type === type;
    
    // Calculate distance
    const distance = calculateDistance(
      lat, 
      lng, 
      location.coordinates.lat, 
      location.coordinates.lng
    );
    
    return typeMatches && distance <= radius;
  });
}

// Get data from web crawl
async function getDataFromCrawl(url: string) {
  // In a real implementation, this would perform an actual web crawl
  // or retrieve cached crawl data

  // For demonstration, return mock crawl data
  return {
    url,
    crawlDate: new Date().toISOString(),
    pages: 12,
    data: `This is mock crawl data from ${url}. In a real implementation, this would contain extracted and processed content from the Reykjavik city website. The content would include information about various city services, events, and resources that could be used by the AI to provide more accurate and helpful responses to users.`
  };
}
