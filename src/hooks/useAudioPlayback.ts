
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { getTextToSpeech } from '@/services/openAiService';

interface Message {
  text: string;
  isUser: boolean;
  id: number;
  gender?: 'female' | 'male';
}

export const useAudioPlayback = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
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
      }
    };
  }, []);

  const speakMessage = async (message: Message) => {
    if (message.isUser || hasError) return;
    
    try {
      setIsSpeaking(true);
      
      // Select voice based on gender
      const voice = message.gender === 'female' ? 'nova' : 'onyx';
      
      // Instructions for 60s operator style with Knight Rider flair
      const instructions = "Speak in the style of a 1960s telephone operator or mission control technician with subtle electronic processing reminiscent of Knight Rider's computer voice. Professional, clear and futuristic.";
      
      const audioData = await getTextToSpeech(message.text, voice, instructions);
      const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
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
          URL.revokeObjectURL(audioUrl);
        };
        
        // Begin playback
        audioRef.current.play().catch(error => {
          console.error('Audio playback error:', error);
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        });
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

  return {
    isSpeaking,
    speakMessage,
    hasError
  };
};
