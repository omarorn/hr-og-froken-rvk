
import React, { useEffect, useState } from 'react';
import { getStraetoArrivals, getStraetoStops, StraetoArrival, StraetoStop } from '@/services/straeto';
import BusStopSelector from './BusStopSelector';
import BusScheduleError from './BusScheduleError';
import BusArrivalsList from './BusArrivalsList';

interface BusScheduleProps {
  routeId: string;
  routeName?: string;
  onSelectBus?: (busId: string, latitude: number, longitude: number) => void;
}

const BusSchedule: React.FC<BusScheduleProps> = ({ 
  routeId, 
  routeName,
  onSelectBus
}) => {
  const [stops, setStops] = useState<StraetoStop[]>([]);
  const [selectedStopId, setSelectedStopId] = useState<string>('');
  const [arrivals, setArrivals] = useState<StraetoArrival[]>([]);
  const [loadingStops, setLoadingStops] = useState<boolean>(true);
  const [loadingArrivals, setLoadingArrivals] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load stops when route changes
  useEffect(() => {
    loadStops();
  }, [routeId]);

  // Load arrivals when selected stop changes
  useEffect(() => {
    if (selectedStopId) {
      loadArrivals();
    }
  }, [selectedStopId]);

  const loadStops = async () => {
    if (!routeId) return;
    
    setLoadingStops(true);
    setError(null);
    
    try {
      const response = await getStraetoStops(routeId);
      
      if ('error' in response) {
        setError(response.error);
      } else {
        setStops(response);
        
        // Select first stop by default
        if (response.length > 0 && !selectedStopId) {
          setSelectedStopId(response[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading stops:', err);
      setError('Unexpected error loading bus stops');
    } finally {
      setLoadingStops(false);
    }
  };

  const loadArrivals = async () => {
    if (!selectedStopId) return;
    
    setLoadingArrivals(true);
    setError(null);
    
    try {
      const response = await getStraetoArrivals(selectedStopId);
      
      if ('error' in response) {
        setError(response.error);
      } else {
        // Filter arrivals for the selected route if routeId is provided
        const filteredArrivals = routeId 
          ? response.filter(arrival => arrival.routeId === routeId)
          : response;
          
        setArrivals(filteredArrivals);
      }
    } catch (err) {
      console.error('Error loading arrivals:', err);
      setError('Unexpected error loading bus arrivals');
    } finally {
      setLoadingArrivals(false);
    }
  };

  const handleStopChange = (stopId: string) => {
    setSelectedStopId(stopId);
  };

  const getSelectedStop = (): StraetoStop | undefined => {
    return stops.find(stop => stop.id === selectedStopId);
  };

  return (
    <div className="space-y-4">
      <BusStopSelector
        stops={stops}
        selectedStopId={selectedStopId}
        onStopChange={handleStopChange}
        loading={loadingStops}
      />
      
      {error && <BusScheduleError error={error} />}
      
      {selectedStopId && (
        <BusArrivalsList
          selectedStop={getSelectedStop()}
          arrivals={arrivals}
          loading={loadingArrivals}
          routeName={routeName}
          onSelectBus={onSelectBus}
        />
      )}
    </div>
  );
};

export default BusSchedule;
