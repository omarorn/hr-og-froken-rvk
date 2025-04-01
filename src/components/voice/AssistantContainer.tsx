
import React from 'react';
import AssistantProfile from '../AssistantProfile';
import SettingsPanel from './SettingsPanel';
import ConversationHistory from '../ConversationHistory';
import VoiceControlPanel from '../VoiceControlPanel';
import VideoChat from '../VideoChat';
import { Message } from '@/services/messageService';

interface AssistantContainerProps {
  assistantName: string;
  gender: 'female' | 'male';
  messages: Message[];
  isSpeaking: boolean;
  isListening: boolean;
  isProcessing: boolean;
  autoDetectVoice: boolean;
  showVideoChat: boolean;
  audioLevel: number;
  currentTranscribedText: string;
  onTranscribedTextChange: (text: string) => void;
  onSendMessage: () => void;
  toggleAutoDetectVoice: () => void;
  toggleVideoChat: () => void;
  toggleSubtitles: () => void;
  showSubtitles: boolean;
}

const AssistantContainer: React.FC<AssistantContainerProps> = ({
  assistantName,
  gender,
  messages,
  isSpeaking,
  isListening,
  isProcessing,
  autoDetectVoice,
  showVideoChat,
  audioLevel,
  currentTranscribedText,
  onTranscribedTextChange,
  onSendMessage,
  toggleAutoDetectVoice,
  toggleVideoChat,
  toggleSubtitles,
  showSubtitles
}) => {
  return (
    <div className="w-full max-w-2xl bg-white/70 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-iceland-blue/20">
      <div className="p-6 border-b border-iceland-blue/10 flex justify-between items-center">
        <AssistantProfile 
          name={assistantName} 
          isActive={isSpeaking}
          gender={gender}
        />
        
        <SettingsPanel 
          autoDetectVoice={autoDetectVoice}
          toggleAutoDetectVoice={toggleAutoDetectVoice}
          showVideoChat={showVideoChat}
          toggleVideoChat={toggleVideoChat}
          showSubtitles={showSubtitles}
          toggleSubtitles={toggleSubtitles}
        />
      </div>
      
      {showVideoChat && (
        <div className="p-4 border-b border-iceland-blue/10">
          <VideoChat 
            gender={gender}
            isExpanded={true}
            onToggleExpand={toggleVideoChat}
          />
        </div>
      )}
      
      <ConversationHistory messages={messages} />
      
      <VoiceControlPanel 
        isListening={isListening}
        isProcessing={isProcessing}
        isSpeaking={isSpeaking}
        transcribedText={currentTranscribedText}
        onTranscribedTextChange={onTranscribedTextChange}
        onSendMessage={onSendMessage}
        autoDetectVoice={autoDetectVoice}
        audioLevel={audioLevel}
      />
    </div>
  );
};

export default AssistantContainer;
