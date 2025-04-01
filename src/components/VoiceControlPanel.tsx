
import React from 'react';
import VoiceVisualizer from './VoiceVisualizer';
import { Mic, Headphones, Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface VoiceControlPanelProps {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  transcribedText: string;
  onTranscribedTextChange: (text: string) => void;
  onSendMessage: () => void;
  autoDetectVoice?: boolean;
  audioLevel?: number;
}

const VoiceControlPanel: React.FC<VoiceControlPanelProps> = ({
  isListening,
  isProcessing,
  isSpeaking,
  transcribedText,
  onTranscribedTextChange,
  onSendMessage,
  autoDetectVoice = false,
  audioLevel = 0
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

  return (
    <div className="p-6 border-t border-iceland-blue/10 flex flex-col items-center">
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
            placeholder="Skrifaðu eða talaðu til að spyrja..."
            className="resize-none min-h-[80px]"
            disabled={isProcessing}
          />
          <Button 
            onClick={onSendMessage} 
            disabled={isProcessing || !transcribedText.trim()}
            size="icon"
            className="self-end h-10 w-10"
          >
            <Send className="h-5 w-5" />
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
