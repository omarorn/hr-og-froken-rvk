
import React from 'react';
import BackgroundContainer from './BackgroundContainer';
import AssistantContainer from './AssistantContainer';
import AssistantStatusBadge from './AssistantStatusBadge';
import Footer from './Footer';
import MessageSubtitles from '../MessageSubtitles';

interface AssistantWrapperProps {
  assistantName: string;
  gender: 'female' | 'male';
  currentScenario: string;
  messages: any[];
  isSpeaking: boolean;
  isListening: boolean;
  isProcessing: boolean;
  isGreetingLoading: boolean;
  autoDetectVoice: boolean;
  showVideoChat: boolean;
  showSubtitles: boolean;
  audioLevel: number;
  currentTranscribedText: string;
  activeSubtitleText: string;
  userHasGreeted: boolean;
  assistantId?: string;
  threadId?: string;
  initError?: boolean;
  inFallbackMode?: boolean;
  mcpStatus: {
    supabase: boolean;
    code: boolean;
    gSuite: boolean;
  };
  onTranscribedTextChange: (text: string) => void;
  onSendMessage: () => void;
  onReconnectAttempt: () => Promise<void>;
  toggleAutoDetectVoice: () => void;
  toggleVideoChat: () => void;
  toggleSubtitles: () => void;
}

const AssistantWrapper: React.FC<AssistantWrapperProps> = ({
  assistantName,
  gender,
  currentScenario,
  messages,
  isSpeaking,
  isListening,
  isProcessing,
  isGreetingLoading,
  autoDetectVoice,
  showVideoChat,
  showSubtitles,
  audioLevel,
  currentTranscribedText,
  activeSubtitleText,
  userHasGreeted,
  assistantId,
  threadId,
  initError,
  inFallbackMode,
  mcpStatus,
  onTranscribedTextChange,
  onSendMessage,
  onReconnectAttempt,
  toggleAutoDetectVoice,
  toggleVideoChat,
  toggleSubtitles,
}) => {
  return (
    <BackgroundContainer currentScenario={currentScenario}>
      <AssistantStatusBadge
        assistantId={assistantId}
        threadId={threadId}
        initError={initError}
        onReconnect={onReconnectAttempt}
      />
      
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
        onTranscribedTextChange={onTranscribedTextChange}
        onSendMessage={onSendMessage}
        toggleAutoDetectVoice={toggleAutoDetectVoice}
        toggleVideoChat={toggleVideoChat}
        toggleSubtitles={toggleSubtitles}
        showSubtitles={showSubtitles}
        currentScenario={currentScenario}
        userHasGreeted={userHasGreeted}
        mcpStatus={mcpStatus}
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
    </BackgroundContainer>
  );
};

export default AssistantWrapper;

