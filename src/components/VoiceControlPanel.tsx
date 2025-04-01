
import React from 'react';
import VoiceButton from './VoiceButton';
import VoiceVisualizer from './VoiceVisualizer';
import { Mic, Headphones } from 'lucide-react';

interface VoiceControlPanelProps {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  transcribedText: string;
  lastTranscribedText: string;
  onButtonClick: () => void;
  autoDetectVoice?: boolean;
}

const VoiceControlPanel: React.FC<VoiceControlPanelProps> = ({
  isListening,
  isProcessing,
  isSpeaking,
  transcribedText,
  lastTranscribedText,
  onButtonClick,
  autoDetectVoice = false
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
      
      <div className="flex items-center space-x-4">
        {isSpeaking && (
          <div className="mr-4 flex items-center">
            <Headphones className="h-5 w-5 text-iceland-blue mr-2" />
            <VoiceVisualizer isActive={isSpeaking} />
          </div>
        )}
        
        <VoiceButton 
          isListening={isListening} 
          isProcessing={isProcessing}
          onClick={onButtonClick} 
        />
        
        {autoDetectVoice && (
          <div className="ml-4 flex items-center bg-iceland-blue/10 px-3 py-1 rounded-full">
            <Mic className="h-4 w-4 text-iceland-blue mr-2" />
            <span className="text-sm text-iceland-darkBlue">Sjálfvirk raddgreining virk</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceControlPanel;
