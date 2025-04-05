
import React from 'react';
import AssistantProfile from '../AssistantProfile';
import SettingsPanel from './SettingsPanel';
import ConversationHistory from '../ConversationHistory';
import VoiceControlPanel from '../VoiceControlPanel';
import VideoChat from '../VideoChat';
import { Message } from '@/services/messageService';
import { ConversationScenario } from '@/services/chatService';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AssistantContainerProps {
  assistantName: string;
  gender: 'female' | 'male';
  messages: Message[];
  isSpeaking: boolean;
  isListening: boolean;
  isProcessing: boolean;
  isGreetingLoading: boolean;
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
  currentScenario?: string;
  userHasGreeted?: boolean; // Add this prop
  mcpStatus?: {
    supabase: boolean;
    code: boolean;
    gSuite: boolean;
  };
  hasConnectionError?: boolean; // Add prop for connection errors
}

const AssistantContainer: React.FC<AssistantContainerProps> = ({
  assistantName,
  gender,
  messages,
  isSpeaking,
  isListening,
  isProcessing,
  isGreetingLoading,
  autoDetectVoice,
  showVideoChat,
  audioLevel,
  currentTranscribedText,
  onTranscribedTextChange,
  onSendMessage,
  toggleAutoDetectVoice,
  toggleVideoChat,
  toggleSubtitles,
  showSubtitles,
  currentScenario = ConversationScenario.GENERAL,
  userHasGreeted = false, // Default to false
  mcpStatus = { supabase: false, code: false, gSuite: false },
  hasConnectionError = false
}) => {
  // Get container styling based on scenario
  const getContainerStyling = () => {
    const baseStyles = "w-full max-w-2xl backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border";
    
    if (hasConnectionError) {
      return `${baseStyles} bg-white/70 border-iceland-red/20`;
    }
    
    switch (currentScenario) {
      case ConversationScenario.GREETING:
        return `${baseStyles} bg-white/70 border-iceland-blue/20`;
      case ConversationScenario.HOLD:
        return `${baseStyles} bg-white/80 border-iceland-lightBlue/30`;
      case ConversationScenario.TECHNICAL_SUPPORT:
        return `${baseStyles} bg-white/70 border-iceland-red/10`;
      case ConversationScenario.FOLLOW_UP:
        return `${baseStyles} bg-white/70 border-iceland-green/20`;
      case ConversationScenario.FAREWELL:
        return `${baseStyles} bg-white/70 border-iceland-darkBlue/20`;
      default:
        return `${baseStyles} bg-white/70 border-iceland-blue/20`;
    }
  };

  // Get header styling based on scenario
  const getHeaderStyling = () => {
    const baseStyles = "p-6 border-b";
    
    if (hasConnectionError) {
      return `${baseStyles} border-iceland-red/20`;
    }
    
    switch (currentScenario) {
      case ConversationScenario.GREETING:
        return `${baseStyles} border-iceland-blue/10`;
      case ConversationScenario.HOLD:
        return `${baseStyles} border-iceland-lightBlue/20`;
      case ConversationScenario.TECHNICAL_SUPPORT:
        return `${baseStyles} border-iceland-red/10`;
      case ConversationScenario.FOLLOW_UP:
        return `${baseStyles} border-iceland-green/20`;
      case ConversationScenario.FAREWELL:
        return `${baseStyles} border-iceland-darkBlue/10`;
      default:
        return `${baseStyles} border-iceland-blue/10`;
    }
  };

  // Get scenario badge text
  const getScenarioBadge = () => {
    if (hasConnectionError) {
      return "Ótengdur";
    }
    
    switch (currentScenario) {
      case ConversationScenario.GREETING:
        return "Ávarp";
      case ConversationScenario.HOLD:
        return "Í bið";
      case ConversationScenario.TECHNICAL_SUPPORT:
        return "Tækniaðstoð";
      case ConversationScenario.FOLLOW_UP:
        return "Upplýsingar";
      case ConversationScenario.FAREWELL:
        return "Kveðja";
      default:
        return "Almenn";
    }
  };

  // Helper function to render connection error state
  const renderConnectionError = () => {
    if (hasConnectionError && messages.length === 0) {
      return (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <WifiOff className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Tengingarvandamál</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Ekki náðist tenging við aðstoðarmann. Svör verða staðbundin en með takmarkaða virkni.</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={getContainerStyling()}>
      <div className={`${getHeaderStyling()} flex justify-between items-center`}>
        <div className="flex flex-col space-y-1">
          <AssistantProfile 
            name={assistantName} 
            isActive={isSpeaking}
            gender={gender}
          />
          
          <div className="flex items-center">
            <span className={`text-xs px-2 py-0.5 rounded-full ${hasConnectionError ? 'bg-red-100 text-red-800' : 'bg-iceland-blue/10 text-iceland-blue'}`}>
              {getScenarioBadge()}
            </span>
            {mcpStatus.supabase && (
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                Supabase MCP
              </span>
            )}
            {mcpStatus.code && (
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Code MCP
              </span>
            )}
            {mcpStatus.gSuite && (
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                GSuite MCP
              </span>
            )}
          </div>
        </div>
        
        <SettingsPanel 
          autoDetectVoice={autoDetectVoice}
          toggleAutoDetectVoice={toggleAutoDetectVoice}
          showVideoChat={showVideoChat}
          toggleVideoChat={toggleVideoChat}
          showSubtitles={showSubtitles}
          toggleSubtitles={toggleSubtitles}
        />
      </div>
      
      {hasConnectionError && (
        <div className="p-4 border-b border-iceland-red/10">
          {renderConnectionError()}
        </div>
      )}
      
      {showVideoChat && (
        <div className="p-4 border-b border-iceland-blue/10">
          <VideoChat 
            gender={gender}
            isExpanded={true}
            onToggleExpand={toggleVideoChat}
          />
        </div>
      )}
      
      {isGreetingLoading && messages.length === 0 ? (
        <div className="p-6 h-96 flex items-center justify-center">
          <Skeleton className="h-10 w-40" />
        </div>
      ) : messages.length === 0 && !userHasGreeted ? (
        <div className="p-6 h-96 flex flex-col items-center justify-center space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 max-w-md">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Segðu hæ til að byrja</h3>
                <p className="text-xs text-blue-600 mt-1">
                  Segðu "Hæ", "Halló" eða "Góðan dag" til að hefja samtal við {assistantName}.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <ConversationHistory messages={messages} />
      )}
      
      <VoiceControlPanel 
        isListening={isListening}
        isProcessing={isProcessing}
        isSpeaking={isSpeaking}
        transcribedText={currentTranscribedText}
        onTranscribedTextChange={onTranscribedTextChange}
        onSendMessage={onSendMessage}
        autoDetectVoice={autoDetectVoice}
        audioLevel={audioLevel}
        scenario={currentScenario}
      />
    </div>
  );
};

export default AssistantContainer;
