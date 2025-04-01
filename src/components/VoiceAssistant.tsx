
import React, { useEffect, useState } from 'react';
import AssistantProfile from './AssistantProfile';
import ConversationHistory from './ConversationHistory';
import VoiceControlPanel from './VoiceControlPanel';
import VideoChat from './VideoChat';
import MessageSubtitles from './MessageSubtitles';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { useAudioPlayback } from '@/hooks/useAudioPlayback';
import { useMessageService } from '@/services/messageService';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface VoiceAssistantProps {
  assistantName?: string;
  gender?: 'female' | 'male';
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ 
  assistantName = 'Rósa', 
  gender = 'female' 
}) => {
  const messageService = useMessageService(gender);
  const { messages, isProcessing, setIsProcessing, handleUserMessage, setInitialGreeting } = messageService;
  const [lastTranscribedText, setLastTranscribedText] = useState<string>('');
  const [transcriptionErrors, setTranscriptionErrors] = useState<number>(0);
  const [initialGreetingDone, setInitialGreetingDone] = useState<boolean>(false);
  const [autoDetectVoice, setAutoDetectVoice] = useState<boolean>(false);
  const [showVideoChat, setShowVideoChat] = useState<boolean>(false);
  const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [activeSubtitleText, setActiveSubtitleText] = useState<string>("");
  
  const { isSpeaking, speakMessage, hasError } = useAudioPlayback();

  const handleTranscriptionComplete = async (transcribedText: string) => {
    try {
      setLastTranscribedText(transcribedText);
      setTranscriptionErrors(0);
      
      console.log('Transcription completed, sending to AI:', transcribedText);
      const assistantMessage = await handleUserMessage(transcribedText);
      if (assistantMessage && !hasError) {
        setActiveSubtitleText(assistantMessage.text);
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

  const handleAudioLevelChange = (level: number) => {
    setAudioLevel(level);
  };

  const { isListening, transcribedText, toggleRecording, hasPermission } = useAudioRecording({
    onTranscriptionComplete: handleTranscriptionComplete,
    onProcessingStateChange: setIsProcessing,
    onTranscriptionError: handleTranscriptionError,
    onAudioLevelChange: handleAudioLevelChange,
    autoDetectVoice
  });

  useEffect(() => {
    // Load initial greeting only once
    if (!initialGreetingDone) {
      const initialGreeting = gender === 'female' 
        ? "Góðan dag, ég heiti Rósa. Hvernig get ég aðstoðað þig í dag?"
        : "Góðan dag, ég heiti Birkir. Hvernig get ég aðstoðað þig í dag?";
      
      setTimeout(() => {
        const greeting = setInitialGreeting(initialGreeting);
        if (!hasError) {
          setActiveSubtitleText(initialGreeting);
          speakMessage(greeting);
        }
        setInitialGreetingDone(true);
      }, 1000);
    }
  }, [gender, initialGreetingDone, setInitialGreeting, speakMessage, hasError]);

  // Reset subtitle text when speech ends
  useEffect(() => {
    if (!isSpeaking) {
      setTimeout(() => {
        setActiveSubtitleText("");
      }, 500);
    }
  }, [isSpeaking]);

  const handleVoiceButtonClick = () => {
    if (!isListening && !isProcessing) {
      toggleRecording();
    } else if (isListening) {
      toggleRecording();
    }
  };

  const toggleAutoDetectVoice = () => {
    setAutoDetectVoice(prev => !prev);
    
    if (!autoDetectVoice) {
      toast.info('Sjálfvirk raddgreining virk. Talaðu til að hefja samtal.', {
        duration: 3000
      });
    } else {
      toast.info('Sjálfvirk raddgreining óvirk.', {
        duration: 2000
      });
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
          
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="voice-detection-toggle" className="text-sm">
                Sjálfvirk raddgreining
              </Label>
              <Switch 
                id="voice-detection-toggle" 
                checked={autoDetectVoice}
                onCheckedChange={toggleAutoDetectVoice}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="video-toggle" className="text-sm">
                Myndavél
              </Label>
              <Switch 
                id="video-toggle" 
                checked={showVideoChat}
                onCheckedChange={() => setShowVideoChat(prev => !prev)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="subtitle-toggle" className="text-sm">
                Skjátextar
              </Label>
              <Switch 
                id="subtitle-toggle" 
                checked={showSubtitles}
                onCheckedChange={() => setShowSubtitles(prev => !prev)}
              />
            </div>
          </div>
        </div>
        
        {showVideoChat && (
          <div className="p-4 border-b border-iceland-blue/10">
            <VideoChat 
              gender={gender}
              isExpanded={true}
              onToggleExpand={() => setShowVideoChat(false)}
            />
          </div>
        )}
        
        <ConversationHistory messages={messages} />
        
        <VoiceControlPanel 
          isListening={isListening}
          isProcessing={isProcessing}
          isSpeaking={isSpeaking}
          transcribedText={transcribedText}
          lastTranscribedText={lastTranscribedText}
          onButtonClick={handleVoiceButtonClick}
          autoDetectVoice={autoDetectVoice}
          audioLevel={audioLevel}
        />
      </div>
      
      {showSubtitles && (
        <MessageSubtitles 
          text={activeSubtitleText} 
          isActive={isSpeaking && activeSubtitleText !== ""}
        />
      )}
      
      <div className="mt-8 text-center text-sm text-iceland-darkGray">
        <p>Reykjavíkurborg Digital Assistant</p>
        <p className="mt-1">&copy; {new Date().getFullYear()} Reykjavíkurborg - Öll réttindi áskilin</p>
      </div>
    </div>
  );
};

export default VoiceAssistant;
