
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
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const speakMessage = async (message: Message) => {
    if (message.isUser || hasError) return;
    
    try {
      setIsSpeaking(true);
      
      // Select voice based on gender
      const voice = message.gender === 'female' ? 'nova' : 'echo';
      
      // Instructions for Icelandic pronunciation
      const instructions = "The voice should speak with a clear Icelandic accent and pronounce Icelandic characters like þ, ð, æ, etc. correctly. The tone should be warm and helpful, like a friendly customer service representative.";
      
      const audioData = await getTextToSpeech(message.text, voice, instructions);
      const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        
        audioRef.current.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        audioRef.current.play().catch(error => {
          console.error('Audio playback error:', error);
          setIsSpeaking(false);
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
