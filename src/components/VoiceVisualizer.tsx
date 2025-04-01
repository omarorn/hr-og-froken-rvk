
import React from 'react';

interface VoiceVisualizerProps {
  isActive: boolean;
  audioLevel?: number;
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ 
  isActive, 
  audioLevel = 0 
}) => {
  const maxBars = 5;
  const bars = Array.from({ length: maxBars });
  
  // Calculate how many bars to show based on audio level
  const activeBars = isActive 
    ? Math.max(1, Math.min(maxBars, Math.ceil(audioLevel * maxBars))) 
    : 0;

  return (
    <div className="voice-visualizer flex items-center justify-center h-6 space-x-1">
      {bars.map((_, i) => (
        <div 
          key={i}
          className={`voice-wave-bar h-full w-1 md:w-1.5 rounded-full transition-all duration-200 ${
            isActive && i < activeBars
              ? `bg-iceland-blue ${i % 2 === 0 ? 'animate-pulse' : 'animate-pulse-slow'}`
              : 'bg-iceland-darkGray/30'
          }`}
          style={{
            height: isActive && i < activeBars 
              ? `${Math.min(100, 40 + (i + 1) * 15)}%` 
              : '40%'
          }}
        />
      ))}
    </div>
  );
};

export default VoiceVisualizer;
