
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
  const [fallbackVoice, setFallbackVoice] = useState<SpeechSynthesisVoice | null>(null);
  
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
    
    // Initialize fallback voice if available
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        // Try to find Icelandic voice, otherwise use the first available
        const icelandicVoice = voices.find(voice => voice.lang.includes('is'));
        const fallback = icelandicVoice || voices[0];
        setFallbackVoice(fallback);
      };
      
      // Trigger voices loading
      window.speechSynthesis.getVoices();
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

  // Use browser's speech synthesis as fallback
  const speakWithFallback = (text: string) => {
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported');
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    if (fallbackVoice) {
      utterance.voice = fallbackVoice;
    }
    
    utterance.rate = 0.9; // slightly slower
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const speakMessage = async (message: Message) => {
    if (message.isUser) return;
    
    try {
      // Clean up previous audio source if it exists
      if (audioSource) {
        URL.revokeObjectURL(audioSource);
        setAudioSource(null);
      }
      
      setIsSpeaking(true);
      
      if (hasError) {
        // If we had errors with OpenAI TTS before, use fallback immediately
        speakWithFallback(message.text);
        return;
      }
      
      // Select voice based on gender
      const voice = message.gender === 'female' ? 'nova' : 'onyx';
      
      // Instructions will be determined by the scenario in the openAiService
      try {
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
        console.error('Failed to use OpenAI TTS, falling back to speech synthesis:', error);
        speakWithFallback(message.text);
        setHasError(true); // Set flag to use fallback directly next time
      }
    } catch (error) {
      console.error('Failed to speak message:', error);
      setIsSpeaking(false);
      setHasError(true);
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
    
    // Also stop speech synthesis if it's active
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
  };

  return {
    isSpeaking,
    speakMessage,
    stopSpeaking,
    hasError
  };
};
