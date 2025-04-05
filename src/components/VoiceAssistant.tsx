import React, { useEffect, useState } from 'react';
import MessageSubtitles from './MessageSubtitles';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { useAudioPlayback } from '@/hooks/useAudioPlayback';
import { useMessageService } from '@/services/messageService';
import AssistantContainer from './voice/AssistantContainer';
import Footer from './voice/Footer';
import MicrophonePermissionDialog from './voice/MicrophonePermissionDialog';
import { useGreeting } from '@/hooks/useGreeting';
import { usePermissionDialog } from '@/hooks/usePermissionDialog';
import { useVoiceAssistantUI } from '@/hooks/useVoiceAssistantUI';
import { useVoiceMessageHandler } from '@/hooks/useVoiceMessageHandler';
import { useMCP } from '@/hooks/useMCP';
import BackgroundContainer from './voice/BackgroundContainer';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHealthCheck } from '@/services/healthCheckService';

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
    setIsProcessing, 
    handleUserMessage, 
    setInitialGreeting,
    currentScenario,
    assistantId,
    threadId,
    initError,
    resetAssistant,
    connectionStatus
  } = messageService;
  
  const [initialGreetingDone, setInitialGreetingDone] = useState<boolean>(false);
  const [userHasGreeted, setUserHasGreeted] = useState<boolean>(false); // Add state to track if user has greeted
  
  const { isSpeaking, speakMessage, hasError } = useAudioPlayback();
  const { initialGreeting, isLoading: isGreetingLoading, shouldAutoGreet, hasError: greetingError } = useGreeting(gender);
  
  // Initialize MCP servers
  const { supabaseMCP, codeMCP, gSuiteMCP } = useMCP();
  
  const {
    showVideoChat,
    showSubtitles,
    audioLevel,
    setAudioLevel,
    activeSubtitleText,
    setActiveSubtitleText,
    currentTranscribedText,
    setCurrentTranscribedText,
    toggleVideoChat,
    toggleSubtitles,
    handleTranscriptionUpdate
  } = useVoiceAssistantUI();

  // Get the permission dialog hook BEFORE using its values
  const {
    showPermissionDialog,
    setShowPermissionDialog,
    autoDetectVoice,
    setAutoDetectVoice,
    toggleAutoDetectVoice,
    requestMicrophoneAccess
  } = usePermissionDialog({ 
    initializeVoiceDetection: () => initializeVoiceDetection().then(() => {}) 
  });

  const {
    isProcessing,
    handleTranscriptionComplete,
    handleSendMessage,
    handleTranscriptionError,
    inFallbackMode
  } = useVoiceMessageHandler({
    handleUserMessage,
    speakMessage,
    setActiveSubtitleText,
    hasError: hasError || greetingError || initError
  });

  const handleAudioLevelChange = (level: number) => {
    setAudioLevel(level);
  };

  const { isListening, hasPermission, initializeVoiceDetection } = useAudioRecording({
    onTranscriptionComplete: (text) => {
      // Check if user's message contains a greeting
      const lowerText = text.toLowerCase();
      if (
        !userHasGreeted && 
        (lowerText.includes('halló') || 
         lowerText.includes('hæ') || 
         lowerText.includes('góðan dag') || 
         lowerText.includes('hallo') || 
         lowerText.includes('hi') || 
         lowerText.includes('sæl') || 
         lowerText.includes('sæll'))
      ) {
        setUserHasGreeted(true);
        // If this is the first greeting and we haven't done the initial greeting yet,
        // do it now after the user's greeting is processed
        if (!initialGreetingDone && !isGreetingLoading && initialGreeting) {
          setTimeout(() => {
            const greeting = setInitialGreeting(initialGreeting);
            if (!hasError) {
              setActiveSubtitleText(initialGreeting);
              speakMessage(greeting);
            }
            setInitialGreetingDone(true);
          }, 1000);
        }
      }
      
      // Continue with normal transcription handling
      handleTranscriptionComplete(text);
    },
    onProcessingStateChange: setIsProcessing,
    onTranscriptionError: handleTranscriptionError,
    onAudioLevelChange: handleAudioLevelChange,
    autoDetectVoice,
    language: 'is' // Always use Icelandic
  });

  const handleSendMessageWrapper = async () => {
    // Check if the current transcribed text is a greeting
    const lowerText = currentTranscribedText.toLowerCase();
    if (
      !userHasGreeted && 
      (lowerText.includes('halló') || 
       lowerText.includes('hæ') || 
       lowerText.includes('góðan dag') || 
       lowerText.includes('hallo') || 
       lowerText.includes('hi') || 
       lowerText.includes('sæl') || 
       lowerText.includes('sæll'))
    ) {
      setUserHasGreeted(true);
    }
    
    const updatedText = await handleSendMessage(currentTranscribedText);
    setCurrentTranscribedText(updatedText);
  };

  // Log MCP server status
  useEffect(() => {
    console.log('MCP Server Status:', {
      supabase: supabaseMCP.status.connected ? 'Connected' : 'Disconnected',
      code: codeMCP.status.connected ? 'Connected' : 'Disconnected',
      gSuite: gSuiteMCP.status.connected ? 'Connected' : 'Disconnected'
    });
  }, [supabaseMCP.status, codeMCP.status, gSuiteMCP.status]);

  // We are removing the auto-greeting behavior here
  // Only shouldAutoGreet would trigger automatic greeting, which defaults to false

  // Reset subtitle text when speech ends
  useEffect(() => {
    if (!isSpeaking) {
      setTimeout(() => {
        setActiveSubtitleText("");
      }, 500);
    }
  }, [isSpeaking, setActiveSubtitleText]);

  // Add health check service
  const { diagnoseAndReport } = useHealthCheck();
  
  // Update the handleReconnectAttempt function
  const handleReconnectAttempt = async () => {
    toast.info('Reyni að tengjast aftur...', { duration: 2000 });
    await diagnoseAndReport(); // Run diagnostics first
    await resetAssistant();    // Then try to reset the assistant
  };

  // Render a badge if we have an active assistant
  const renderAssistantBadge = () => {
    if (assistantId && threadId) {
      return (
        <div className="fixed bottom-2 right-2 z-50">
          <Badge variant="outline" className="bg-green-50 text-green-800 border-green-300 hover:bg-green-100">
            OpenAI Assistant API
          </Badge>
        </div>
      );
    } else if (initError) {
      return (
        <div className="fixed bottom-2 right-2 z-50 flex items-center space-x-2">
          <Badge variant="outline" className="bg-red-50 text-red-800 border-red-300 hover:bg-red-100">
            Staðbundinn aðstoðarmaður
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white/80 border-red-300 text-red-800 hover:bg-red-50"
            onClick={handleReconnectAttempt}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reyna aftur
          </Button>
        </div>
      );
    }
    return null;
  };

  return (
    <BackgroundContainer currentScenario={currentScenario}>
      {renderAssistantBadge()}
      
      <AssistantContainer
        assistantName={assistantName}
        gender={gender}
        messages={messages}
        isSpeaking={isSpeaking}
        isListening={isListening}
        isProcessing={isProcessing}
        isGreetingLoading={isGreetingLoading}
        autoDetectVoice={autoDetectVoice}
        showVideoChat={showVideoChat}
        audioLevel={audioLevel}
        currentTranscribedText={currentTranscribedText}
        onTranscribedTextChange={handleTranscriptionUpdate}
        onSendMessage={handleSendMessageWrapper}
        toggleAutoDetectVoice={toggleAutoDetectVoice}
        toggleVideoChat={toggleVideoChat}
        toggleSubtitles={toggleSubtitles}
        showSubtitles={showSubtitles}
        currentScenario={currentScenario}
        userHasGreeted={userHasGreeted} // Pass this to AssistantContainer
        mcpStatus={{
          supabase: supabaseMCP.status.connected,
          code: codeMCP.status.connected,
          gSuite: gSuiteMCP.status.connected
        }}
        hasConnectionError={initError || inFallbackMode}
      />
      
      {showSubtitles && (
        <MessageSubtitles 
          text={activeSubtitleText} 
          isActive={isSpeaking && activeSubtitleText !== ""}
          scenario={currentScenario}
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
    </BackgroundContainer>
  );
};

export default VoiceAssistant;
