
import { useState } from 'react';

export const useVoiceAssistantUI = () => {
  const [showVideoChat, setShowVideoChat] = useState<boolean>(false);
  const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [activeSubtitleText, setActiveSubtitleText] = useState<string>("");
  const [currentTranscribedText, setCurrentTranscribedText] = useState<string>("");
  
  const toggleVideoChat = () => setShowVideoChat(prev => !prev);
  const toggleSubtitles = () => setShowSubtitles(prev => !prev);
  
  const handleTranscriptionUpdate = (text: string) => {
    setCurrentTranscribedText(text);
  };

  return {
    showVideoChat,
    setShowVideoChat,
    showSubtitles,
    setShowSubtitles,
    audioLevel,
    setAudioLevel,
    activeSubtitleText,
    setActiveSubtitleText,
    currentTranscribedText,
    setCurrentTranscribedText,
    toggleVideoChat,
    toggleSubtitles,
    handleTranscriptionUpdate
  };
};
