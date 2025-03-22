
import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceButtonProps {
  isListening: boolean;
  onClick: () => void;
  className?: string;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({ 
  isListening, 
  onClick, 
  className 
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-md",
        isListening 
          ? "bg-iceland-red animate-pulse-subtle" 
          : "bg-iceland-blue hover:bg-iceland-darkBlue",
        className
      )}
      aria-label={isListening ? "Hætta að hlusta" : "Byrja að hlusta"}
    >
      {isListening ? (
        <MicOff className="h-7 w-7 text-white" />
      ) : (
        <Mic className="h-7 w-7 text-white" />
      )}
    </button>
  );
};

export default VoiceButton;
