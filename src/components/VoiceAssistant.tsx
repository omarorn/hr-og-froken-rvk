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
    currentScenario 
  } = messageService;
  
  const [initialGreetingDone, setInitialGreetingDone] = useState<boolean>(false);
  
  const { isSpeaking, speakMessage, hasError } = useAudioPlayback();
  const { initialGreeting, isLoading: isGreetingLoading } = useGreeting(gender);
  
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
    handleTranscriptionError
  } = useVoiceMessageHandler({
    handleUserMessage,
    speakMessage,
    setActiveSubtitleText,
    hasError
  });

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

  const handleSendMessageWrapper = async () => {
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

  useEffect(() => {
    // Load initial greeting only once
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
  }, [gender, initialGreetingDone, initialGreeting, isGreetingLoading, setInitialGreeting, speakMessage, hasError, setActiveSubtitleText]);

  // Reset subtitle text when speech ends
  useEffect(() => {
    if (!isSpeaking) {
      setTimeout(() => {
        setActiveSubtitleText("");
      }, 500);
    }
  }, [isSpeaking, setActiveSubtitleText]);

  return (
    <BackgroundContainer currentScenario={currentScenario}>
      <AssistantContainer
        assistantName={assistantName}
        gender={gender}
        messages={messages}
        isSpeaking={isSpeaking}
        isListening={isListening}
        isProcessing={isProcessing}
        isGreetingLoading={isGreetingLoading} // Pass greeting loading state
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
        mcpStatus={{
          supabase: supabaseMCP.status.connected,
          code: codeMCP.status.connected,
          gSuite: gSuiteMCP.status.connected
        }}
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
