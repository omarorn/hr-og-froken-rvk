
import React from 'react';
import { X } from 'lucide-react';

interface BusScheduleErrorProps {
  error: string;
}

const BusScheduleError: React.FC<BusScheduleErrorProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="bg-destructive/15 border border-destructive/30 text-destructive p-3 rounded-md">
      <p className="text-sm flex items-center">
        <X size={16} className="mr-2" />
        {error}
      </p>
    </div>
  );
};

export default BusScheduleError;
