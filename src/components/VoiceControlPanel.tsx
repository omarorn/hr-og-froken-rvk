
import React from 'react';
import VoiceVisualizer from './VoiceVisualizer';
import { Mic, Headphones, Send, Loader2 } from 'lucide-react'; // Import Loader2
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ConversationScenario } from '@/services/chatService';

interface VoiceControlPanelProps {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  transcribedText: string;
  onTranscribedTextChange: (text: string) => void;
  onSendMessage: () => void;
  autoDetectVoice?: boolean;
  audioLevel?: number;
  scenario?: string;
}

const VoiceControlPanel: React.FC<VoiceControlPanelProps> = ({
  isListening,
  isProcessing,
  isSpeaking,
  transcribedText,
  onTranscribedTextChange,
  onSendMessage,
  autoDetectVoice = false,
  audioLevel = 0,
  scenario = ConversationScenario.GENERAL
}) => {
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onTranscribedTextChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  // Get textarea placeholder based on scenario
  const getPlaceholder = () => {
    switch (scenario) {
      case ConversationScenario.GREETING:
        return "Svaraðu ávarpinu eða spyrðu um aðstoð...";
      case ConversationScenario.HOLD:
        return "Segðu hvað þú þarft aðstoð með...";
      case ConversationScenario.TECHNICAL_SUPPORT:
        return "Lýstu tæknilega vandamálinu þínu...";
      case ConversationScenario.FOLLOW_UP:
        return "Þarftu frekari upplýsingar? Spurðu hér...";
      case ConversationScenario.FAREWELL:
        return "Ertu með fleiri spurningar áður en þú lýkur?";
      default:
        return "Skrifaðu eða talaðu til að spyrja...";
    }
  };

  // Get styling for control panel based on scenario
  const getPanelStyling = () => {
    const baseStyles = "p-6 border-t";
    
    switch (scenario) {
      case ConversationScenario.GREETING:
        return `${baseStyles} border-iceland-blue/10`;
      case ConversationScenario.HOLD:
        return `${baseStyles} border-iceland-lightBlue/20`;
      case ConversationScenario.TECHNICAL_SUPPORT:
        return `${baseStyles} border-iceland-red/10`;
      case ConversationScenario.FOLLOW_UP:
        return `${baseStyles} border-iceland-green/20`;
      case ConversationScenario.FAREWELL:
        return `${baseStyles} border-iceland-darkBlue/10`;
      default:
        return `${baseStyles} border-iceland-blue/10`;
    }
  };

  return (
    <div className={`${getPanelStyling()} flex flex-col items-center`}>
      <div className="w-full mb-4">
        <div className="flex mb-2">
          {isSpeaking && (
            <div className="mr-4 flex items-center">
              <Headphones className="h-5 w-5 text-iceland-blue mr-2" />
              <VoiceVisualizer isActive={isSpeaking} audioLevel={0.7} />
            </div>
          )}
          
          {isListening && (
            <div className="flex items-center">
              <Mic className="h-5 w-5 text-iceland-red mr-2" />
              <VoiceVisualizer isActive={isListening} audioLevel={audioLevel} />
              <span className="ml-2 text-sm text-iceland-darkGray">
                {autoDetectVoice ? "Sjálfvirk raddgreining virk" : "Hlustun virk"}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Textarea
            value={transcribedText}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            className="resize-none min-h-[80px]"
            disabled={isProcessing}
          />
          <Button 
            onClick={onSendMessage} 
            disabled={isProcessing || !transcribedText.trim()}
            size="icon"
            className="self-end h-10 w-10"
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        {autoDetectVoice && (
          <div className="mt-2 flex items-center">
            <Mic className="h-4 w-4 text-iceland-blue mr-2" />
            <span className="text-sm text-iceland-darkBlue">Sjálfvirk raddgreining virk</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceControlPanel;
