
import React, { useEffect, useRef, useState } from 'react';
import VoiceButton from './VoiceButton';
import MessageBubble from './MessageBubble';
import AssistantProfile from './AssistantProfile';
import VoiceVisualizer from './VoiceVisualizer';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { useAudioPlayback } from '@/hooks/useAudioPlayback';
import { useMessageService } from '@/services/messageService';
import { toast } from 'sonner';

interface VoiceAssistantProps {
  assistantName?: string;
  gender?: 'female' | 'male';
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ 
  assistantName = 'Rósa', 
  gender = 'female' 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageService = useMessageService(gender);
  const { messages, isProcessing, setIsProcessing, handleUserMessage } = messageService;
  const [lastTranscribedText, setLastTranscribedText] = useState<string>('');
  const [transcriptionErrors, setTranscriptionErrors] = useState<number>(0);
  
  const { isSpeaking, speakMessage } = useAudioPlayback();

  const handleTranscriptionComplete = async (transcribedText: string) => {
    try {
      setLastTranscribedText(transcribedText);
      setTranscriptionErrors(0);
      
      console.log('Transcription completed, sending to AI:', transcribedText);
      const assistantMessage = await handleUserMessage(transcribedText);
      if (assistantMessage) {
        speakMessage(assistantMessage);
      }
    } catch (error) {
      console.error('Error handling transcription:', error);
      toast.error('Villa kom upp við vinnslu fyrirspurnar. Reyndu aftur.');
      setIsProcessing(false);
    }
  };

  const handleTranscriptionError = () => {
    setTranscriptionErrors(prev => prev + 1);
    
    // If we've had multiple errors in a row, suggest troubleshooting
    if (transcriptionErrors >= 2) {
      toast.error(
        'Endurtekinn vandi við að þekkja tal. Athugaðu hljóðnemann þinn og prófaðu að tala hærra og skýrar.',
        { duration: 5000 }
      );
    }
  };

  const { isListening, transcribedText, toggleRecording } = useAudioRecording({
    onTranscriptionComplete: handleTranscriptionComplete,
    onProcessingStateChange: setIsProcessing
  });

  useEffect(() => {
    // Load initial greeting
    const initialGreeting = gender === 'female' 
      ? "Góðan dag, ég heiti Rósa. Hvernig get ég aðstoðað þig í dag?"
      : "Góðan dag, ég heiti Birkir. Hvernig get ég aðstoðað þig í dag?";
    
    setTimeout(() => {
      const greeting = messageService.setInitialGreeting(initialGreeting);
      speakMessage(greeting);
    }, 1000);
  }, [gender]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleVoiceButtonClick = () => {
    if (!isListening && !isProcessing) {
      toggleRecording();
    } else if (isListening) {
      toggleRecording();
    }
  };

  return (
    <div className="voice-assistant-container min-h-screen flex flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-2xl bg-white/70 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-iceland-blue/20">
        <div className="p-6 border-b border-iceland-blue/10 flex justify-between items-center">
          <AssistantProfile 
            name={assistantName} 
            isActive={isSpeaking}
            gender={gender}
          />
          
          {lastTranscribedText && (
            <div className="text-sm text-iceland-darkGray mt-2 flex items-center">
              <span className="font-medium mr-1">Uppritað:</span>
              <div className="italic">{lastTranscribedText}</div>
            </div>
          )}
        </div>
        
        <div className="h-96 md:h-[420px] overflow-y-auto p-6 space-y-4 bg-iceland-gray/30">
          {messages.map((message) => (
            <MessageBubble 
              key={message.id}
              message={message.text}
              isUser={message.isUser}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
        
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
              onClick={handleVoiceButtonClick} 
            />
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-iceland-darkGray">
        <p>Reykjavíkurborg Digital Assistant</p>
        <p className="mt-1">&copy; {new Date().getFullYear()} Reykjavíkurborg - Öll réttindi áskilin</p>
      </div>
    </div>
  );
};

export default VoiceAssistant;
