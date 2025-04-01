
import React, { useEffect, useState } from 'react';
import MessageSubtitles from './MessageSubtitles';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { useAudioPlayback } from '@/hooks/useAudioPlayback';
import { useMessageService } from '@/services/messageService';
import { toast } from 'sonner';
import AssistantContainer from './voice/AssistantContainer';
import Footer from './voice/Footer';
import MicrophonePermissionDialog from './voice/MicrophonePermissionDialog';
import { ConversationScenario } from '@/services/chatService';

interface VoiceAssistantProps {
  assistantName?: string;
  gender?: 'female' | 'male';
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ 
  assistantName = 'Rósa', 
  gender = 'female' 
}) => {
  const messageService = useMessageService(gender);
  const { 
    messages, 
    isProcessing, 
    setIsProcessing, 
    handleUserMessage, 
    setInitialGreeting,
    currentScenario 
  } = messageService;
  
  const [initialGreetingDone, setInitialGreetingDone] = useState<boolean>(false);
  const [autoDetectVoice, setAutoDetectVoice] = useState<boolean>(false);
  const [showVideoChat, setShowVideoChat] = useState<boolean>(false);
  const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [activeSubtitleText, setActiveSubtitleText] = useState<string>("");
  const [currentTranscribedText, setCurrentTranscribedText] = useState<string>("");
  const [showPermissionDialog, setShowPermissionDialog] = useState<boolean>(false);
  
  const { isSpeaking, speakMessage, hasError } = useAudioPlayback();

  const handleTranscriptionUpdate = (text: string) => {
    setCurrentTranscribedText(text);
  };

  const handleTranscriptionComplete = async (transcribedText: string) => {
    if (!transcribedText.trim()) return;
    setCurrentTranscribedText(transcribedText);
  };

  const handleSendMessage = async () => {
    if (!currentTranscribedText.trim() || isProcessing) return;
    
    try {
      setIsProcessing(true);
      console.log('Sending message to AI:', currentTranscribedText);
      const assistantMessage = await handleUserMessage(currentTranscribedText);
      
      if (assistantMessage && !hasError) {
        setActiveSubtitleText(assistantMessage.text);
        speakMessage(assistantMessage);
      }
      
      // Clear the input field after sending
      setCurrentTranscribedText("");
    } catch (error) {
      console.error('Error handling message:', error);
      toast.error('Villa kom upp við vinnslu fyrirspurnar. Reyndu aftur.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTranscriptionError = () => {
    toast.error(
      'Vandi við að þekkja tal. Athugaðu hljóðnemann þinn og prófaðu að tala hærra og skýrar.',
      { duration: 5000 }
    );
  };

  const handleAudioLevelChange = (level: number) => {
    setAudioLevel(level);
  };

  const { isListening, hasPermission, initializeVoiceDetection } = useAudioRecording({
    onTranscriptionComplete: handleTranscriptionComplete,
    onProcessingStateChange: setIsProcessing,
    onTranscriptionError: handleTranscriptionError,
    onAudioLevelChange: handleAudioLevelChange,
    autoDetectVoice,
    language: 'is' // Always use Icelandic
  });

  // Get greeting based on time of day
  const getTimeBasedGreeting = (): string => {
    const hour = new Date().getHours();
    const name = gender === 'female' ? 'Rósa' : 'Birkir';
    
    if (hour >= 5 && hour < 12) {
      return `Góðan morgun, ég heiti ${name}. Hvernig get ég aðstoðað þig í dag?`;
    } else if (hour >= 12 && hour < 18) {
      return `Góðan dag, ég heiti ${name}. Hvernig get ég aðstoðað þig í dag?`;
    } else if (hour >= 18 && hour < 22) {
      return `Gott kvöld, ég heiti ${name}. Hvernig get ég aðstoðað þig í dag?`;
    } else {
      return `Góða nótt, ég heiti ${name}. Hvernig get ég aðstoðað þig?`;
    }
  };

  useEffect(() => {
    // Load initial greeting only once
    if (!initialGreetingDone) {
      const initialGreeting = getTimeBasedGreeting();
      
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

  const toggleAutoDetectVoice = async () => {
    if (!autoDetectVoice) {
      // Show permission dialog when enabling voice detection
      setShowPermissionDialog(true);
    } else {
      setAutoDetectVoice(false);
      toast.info('Sjálfvirk raddgreining óvirk.', { duration: 2000 });
    }
  };

  const requestMicrophoneAccess = async () => {
    try {
      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Initialize voice detection with the granted permission
      await initializeVoiceDetection();
      
      setAutoDetectVoice(true);
      setShowPermissionDialog(false);
      
      toast.success('Sjálfvirk raddgreining virkjuð.', { duration: 3000 });
    } catch (error) {
      console.error('Error requesting microphone access:', error);
      toast.error('Ekki tókst að fá aðgang að hljóðnema. Virkjaðu hljóðnemann í stillingum vafrans.');
      setAutoDetectVoice(false);
      setShowPermissionDialog(false);
    }
  };

  const toggleVideoChat = () => setShowVideoChat(prev => !prev);
  const toggleSubtitles = () => setShowSubtitles(prev => !prev);

  // Get animated background class based on current scenario
  const getScenarioStyling = () => {
    switch (currentScenario) {
      case ConversationScenario.GREETING:
        return "bg-gradient-to-br from-iceland-blue/10 to-iceland-lightBlue/20";
      case ConversationScenario.HOLD:
        return "bg-gradient-to-br from-iceland-lightBlue/10 to-iceland-gray/10";
      case ConversationScenario.TECHNICAL_SUPPORT:
        return "bg-gradient-to-br from-iceland-lightBlue/10 to-iceland-red/5";
      case ConversationScenario.FOLLOW_UP:
        return "bg-gradient-to-br from-iceland-blue/10 to-iceland-green/10";
      case ConversationScenario.FAREWELL:
        return "bg-gradient-to-br from-iceland-darkBlue/10 to-iceland-blue/10";
      default:
        return "bg-gradient-to-b from-iceland-blue/10 to-iceland-lightBlue/20";
    }
  };

  return (
    <div className={`voice-assistant-container min-h-screen flex flex-col items-center p-4 md:p-8 transition-colors duration-1000 ${getScenarioStyling()}`}>
      <AssistantContainer 
        assistantName={assistantName}
        gender={gender}
        messages={messages}
        isSpeaking={isSpeaking}
        isListening={isListening}
        isProcessing={isProcessing}
        autoDetectVoice={autoDetectVoice}
        showVideoChat={showVideoChat}
        audioLevel={audioLevel}
        currentTranscribedText={currentTranscribedText}
        onTranscribedTextChange={handleTranscriptionUpdate}
        onSendMessage={handleSendMessage}
        toggleAutoDetectVoice={toggleAutoDetectVoice}
        toggleVideoChat={toggleVideoChat}
        toggleSubtitles={toggleSubtitles}
        showSubtitles={showSubtitles}
        currentScenario={currentScenario}
      />
      
      {showSubtitles && (
        <MessageSubtitles 
          text={activeSubtitleText} 
          isActive={isSpeaking && activeSubtitleText !== ""}
        />
      )}
      
      <Footer />

      <MicrophonePermissionDialog 
        open={showPermissionDialog}
        onOpenChange={setShowPermissionDialog}
        onRequestAccess={requestMicrophoneAccess}
        onCancel={() => {
          setShowPermissionDialog(false);
          setAutoDetectVoice(false);
        }}
      />
    </div>
  );
};

export default VoiceAssistant;
