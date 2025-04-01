
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { getTextToSpeech } from '@/services/openAiService';

interface Message {
  text: string;
  isUser: boolean;
  id: number;
  gender?: 'female' | 'male';
  scenario?: string;
}

export const useAudioPlayback = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioSource, setAudioSource] = useState<string | null>(null);
  
  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    
    // Add event listeners
    if (audioRef.current) {
      audioRef.current.onended = () => {
        setIsSpeaking(false);
      };
      
      audioRef.current.onerror = () => {
        console.error('Audio playback error');
        setIsSpeaking(false);
        setHasError(true);
      };
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        
        // Clean up any audio source URLs
        if (audioSource) {
          URL.revokeObjectURL(audioSource);
          setAudioSource(null);
        }
      }
    };
  }, [audioSource]);

  const speakMessage = async (message: Message) => {
    if (message.isUser || hasError) return;
    
    try {
      // Clean up previous audio source if it exists
      if (audioSource) {
        URL.revokeObjectURL(audioSource);
        setAudioSource(null);
      }
      
      setIsSpeaking(true);
      
      // Select voice based on gender
      const voice = message.gender === 'female' ? 'nova' : 'onyx';
      
      // Instructions will be determined by the scenario in the openAiService
      const audioData = await getTextToSpeech(
        message.text, 
        voice, 
        undefined, 
        message.scenario, 
        message.gender
      );
      
      const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioSource(audioUrl);
      
      if (audioRef.current) {
        // Pause and reset any current playback
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        
        // Set new source
        audioRef.current.src = audioUrl;
        
        // Add cleanup for when playback ends
        const originalOnEnded = audioRef.current.onended;
        audioRef.current.onended = () => {
          if (typeof originalOnEnded === 'function') {
            originalOnEnded.call(audioRef.current);
          }
          setIsSpeaking(false);
        };
        
        // Begin playback
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Failed to speak message:', error);
      setIsSpeaking(false);
      setHasError(true); // Set error flag to prevent further attempts
      toast.error('Villa við afspilun á rödd. Verður að nota textann í staðinn.', {
        duration: 5000,
      });
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current && isSpeaking) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  };

  return {
    isSpeaking,
    speakMessage,
    stopSpeaking,
    hasError
  };
};
