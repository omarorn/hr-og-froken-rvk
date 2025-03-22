
import React from 'react';

interface VoiceVisualizerProps {
  isActive: boolean;
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ isActive }) => {
  return (
    <div className="voice-wave-container">
      {[1, 2, 3, 4, 5].map((i) => (
        <div 
          key={i}
          className={`voice-wave-bar ${
            isActive 
              ? `bg-iceland-blue animate-wave${i}` 
              : 'bg-iceland-darkGray opacity-30'
          }`}
        />
      ))}
    </div>
  );
};

export default VoiceVisualizer;
