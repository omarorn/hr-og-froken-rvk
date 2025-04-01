
import React from 'react';
import VoiceButton from './VoiceButton';
import VoiceVisualizer from './VoiceVisualizer';

interface VoiceControlPanelProps {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  transcribedText: string;
  lastTranscribedText: string;
  onButtonClick: () => void;
}

const VoiceControlPanel: React.FC<VoiceControlPanelProps> = ({
  isListening,
  isProcessing,
  isSpeaking,
  transcribedText,
  lastTranscribedText,
  onButtonClick
}) => {
  return (
    <div className="p-6 border-t border-iceland-blue/10 flex flex-col items-center">
      {isProcessing && transcribedText && (
        <div className="mb-4 text-center">
          <div className="text-sm font-medium text-iceland-darkGray">Uppritaður texti:</div>
          <div className="text-iceland-darkBlue italic">{transcribedText}</div>
        </div>
      )}
      
      {!isProcessing && lastTranscribedText && (
        <div className="mb-4 text-center">
          <div className="text-sm font-medium text-iceland-darkGray">Síðasti uppritaði texti:</div>
          <div className="text-iceland-darkBlue italic">{lastTranscribedText}</div>
        </div>
      )}
      
      <div className="flex items-center">
        {isSpeaking && (
          <div className="mr-4">
            <VoiceVisualizer isActive={isSpeaking} />
          </div>
        )}
        <VoiceButton 
          isListening={isListening} 
          isProcessing={isProcessing}
          onClick={onButtonClick} 
        />
      </div>
    </div>
  );
};

export default VoiceControlPanel;
