
import React, { useEffect, useState } from 'react';
import AssistantProfile from './AssistantProfile';
import ConversationHistory from './ConversationHistory';
import VoiceControlPanel from './VoiceControlPanel';
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
    onProcessingStateChange: setIsProcessing,
    onTranscriptionError: handleTranscriptionError
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
  }, [gender, messageService, speakMessage]);

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
        
        <ConversationHistory messages={messages} />
        
        <VoiceControlPanel 
          isListening={isListening}
          isProcessing={isProcessing}
          isSpeaking={isSpeaking}
          transcribedText={transcribedText}
          lastTranscribedText={lastTranscribedText}
          onButtonClick={handleVoiceButtonClick}
        />
      </div>
      
      <div className="mt-8 text-center text-sm text-iceland-darkGray">
        <p>Reykjavíkurborg Digital Assistant</p>
        <p className="mt-1">&copy; {new Date().getFullYear()} Reykjavíkurborg - Öll réttindi áskilin</p>
      </div>
    </div>
  );
};

export default VoiceAssistant;
