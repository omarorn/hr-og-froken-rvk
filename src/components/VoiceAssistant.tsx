
import React, { useEffect } from 'react';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { useAudioPlayback } from '@/hooks/useAudioPlayback';
import { useMessageService } from '@/services/messageService';
import MicrophonePermissionDialog from './voice/MicrophonePermissionDialog';
import { useGreeting } from '@/hooks/useGreeting';
import { usePermissionDialog } from '@/hooks/usePermissionDialog';
import { useVoiceAssistantUI } from '@/hooks/useVoiceAssistantUI';
import { useVoiceMessageHandler } from '@/hooks/useVoiceMessageHandler';
import { useMCP } from '@/hooks/useMCP';
import { useHealthCheck } from '@/services/healthCheckService';
import { useAssistantState } from '@/hooks/useAssistantState';
import { toast } from 'sonner';
import AssistantWrapper from './voice/AssistantWrapper';

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
  
  const { initialGreetingDone, setInitialGreetingDone, userHasGreeted, setUserHasGreeted } = useAssistantState();
  const { isSpeaking, speakMessage, hasError } = useAudioPlayback();
  const { initialGreeting, isLoading: isGreetingLoading, shouldAutoGreet, hasError: greetingError } = useGreeting(gender);
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

  const { isListening, hasPermission, initializeVoiceDetection } = useAudioRecording({
    onTranscriptionComplete: (text) => {
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
      
      handleTranscriptionComplete(text);
    },
    onProcessingStateChange: setIsProcessing,
    onTranscriptionError: handleTranscriptionError,
    onAudioLevelChange: setAudioLevel,
    autoDetectVoice,
    language: 'is'
  });

  const handleSendMessageWrapper = async () => {
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

  useEffect(() => {
    console.log('MCP Server Status:', {
      supabase: supabaseMCP.status.connected ? 'Connected' : 'Disconnected',
      code: codeMCP.status.connected ? 'Connected' : 'Disconnected',
      gSuite: gSuiteMCP.status.connected ? 'Connected' : 'Disconnected'
    });
  }, [supabaseMCP.status, codeMCP.status, gSuiteMCP.status]);

  useEffect(() => {
    if (!isSpeaking) {
      setTimeout(() => {
        setActiveSubtitleText("");
      }, 500);
    }
  }, [isSpeaking, setActiveSubtitleText]);

  const { diagnoseAndReport } = useHealthCheck();
  
  const handleReconnectAttempt = async () => {
    toast.info('Reyni að tengjast aftur...', { duration: 2000 });
    await diagnoseAndReport();
    await resetAssistant();
  };

  return (
    <>
      <AssistantWrapper
        assistantName={assistantName}
        gender={gender}
        currentScenario={currentScenario}
        messages={messages}
        isSpeaking={isSpeaking}
        isListening={isListening}
        isProcessing={isProcessing}
        isGreetingLoading={isGreetingLoading}
        autoDetectVoice={autoDetectVoice}
        showVideoChat={showVideoChat}
        showSubtitles={showSubtitles}
        audioLevel={audioLevel}
        currentTranscribedText={currentTranscribedText}
        activeSubtitleText={activeSubtitleText}
        userHasGreeted={userHasGreeted}
        assistantId={assistantId}
        threadId={threadId}
        initError={initError}
        inFallbackMode={inFallbackMode}
        mcpStatus={{
          supabase: supabaseMCP.status.connected,
          code: codeMCP.status.connected,
          gSuite: gSuiteMCP.status.connected
        }}
        onTranscribedTextChange={handleTranscriptionUpdate}
        onSendMessage={handleSendMessageWrapper}
        onReconnectAttempt={handleReconnectAttempt}
        toggleAutoDetectVoice={toggleAutoDetectVoice}
        toggleVideoChat={toggleVideoChat}
        toggleSubtitles={toggleSubtitles}
      />

      <MicrophonePermissionDialog 
        open={showPermissionDialog}
        onOpenChange={setShowPermissionDialog}
        onRequestAccess={requestMicrophoneAccess}
        onCancel={() => {
          setShowPermissionDialog(false);
          setAutoDetectVoice(false);
        }}
      />
    </>
  );
};

export default VoiceAssistant;

