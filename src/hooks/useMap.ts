
import { useState, useEffect, useCallback, useRef } from 'react';
import { getCurrentLocation } from '@/services/maps';

export interface MapLocation {
  lat: number;
  lng: number;
  address?: string;
}

export const useMap = (initialLat = 64.1466, initialLng = -21.9426, initialZoom = 13) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: initialLat, lng: initialLng });
  const [zoom, setZoom] = useState<number>(initialZoom);
  
  // Function to get current location
  const handleGetCurrentLocation = useCallback(async () => {
    try {
      const location = await getCurrentLocation();
      if (location) {
        setCenter({ lat: location.lat, lng: location.lng });
        setZoom(15);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error getting current location:', error);
      return false;
    }
  }, []);
  
  // Function to handle search
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Searching for: ${searchQuery}`);
    
    // Mock search result
    const randomOffset = () => (Math.random() - 0.5) * 0.02;
    const searchResult = {
      lat: 64.1466 + randomOffset(),
      lng: -21.9426 + randomOffset(),
      address: searchQuery + ', Reykjavík, Iceland'
    };
    
    setCenter({ lat: searchResult.lat, lng: searchResult.lng });
    setZoom(16);
    
    return searchResult;
  }, [searchQuery]);
  
  // Initialize map
  useEffect(() => {
    if (mapRef.current) {
      console.log(`Initializing map at [${center.lat}, ${center.lng}] with zoom ${zoom}`);
      setTimeout(() => {
        setMapLoaded(true);
      }, 500);
    }
  }, [center.lat, center.lng, zoom]);
  
  return {
    mapRef,
    mapLoaded,
    searchQuery,
    setSearchQuery,
    center,
    setCenter,
    zoom,
    setZoom,
    handleGetCurrentLocation,
    handleSearch
  };
};
