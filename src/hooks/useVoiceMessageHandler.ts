
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Message } from '@/services/messageService';

interface UseVoiceMessageHandlerProps {
  handleUserMessage: (message: string) => Promise<Message>;
  speakMessage: (message: Message) => void;
  setActiveSubtitleText: (text: string) => void;
  hasError: boolean;
}

export const useVoiceMessageHandler = ({
  handleUserMessage,
  speakMessage,
  setActiveSubtitleText,
  hasError
}: UseVoiceMessageHandlerProps) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const [fallbackMode, setFallbackMode] = useState<boolean>(false);

  // Check if we're in fallback mode on mount or when errors occur
  useEffect(() => {
    const checkFallbackMode = () => {
      // Check if we've had consistent errors and should enter fallback mode
      if (retryCount > 2 || hasError) {
        setFallbackMode(true);
        console.log('Entering fallback mode due to connection issues');
      }
    };
    
    checkFallbackMode();
  }, [retryCount, hasError]);

  const handleTranscriptionComplete = async (transcribedText: string) => {
    if (!transcribedText.trim()) return;
    
    // Immediately handle sending the transcribed text
    await handleSendMessage(transcribedText);
  };

  const logConnectionError = (error: any, operation: string) => {
    console.error(`${operation} error:`, error);
    setLastError(error?.message || 'Unknown error');
    setRetryCount(prev => prev + 1);
    
    // Log to the server if possible
    try {
      fetch('/ai-phone-agent/logs.nd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: error?.message || 'Unknown error',
          operation,
          timestamp: new Date().toISOString()
        })
      }).catch(() => {
        // Silently fail if server logging fails
      });
    } catch (_) {
      // Ignore logging errors
    }
  };

  const handleSendMessage = async (currentTranscribedText: string) => {
    if (!currentTranscribedText.trim() || isProcessing) return currentTranscribedText;
    
    try {
      setIsProcessing(true);
      console.log('Sending message to AI:', currentTranscribedText);
      
      let assistantMessage;
      
      // Try with primary service
      try {
        assistantMessage = await handleUserMessage(currentTranscribedText);
      } catch (primaryError) {
        logConnectionError(primaryError, 'AI Response');
        
        // If in fallback mode, create a local fallback response
        if (fallbackMode) {
          console.log('Using fallback response mechanism');
          assistantMessage = {
            text: `Ég get því miður ekki tengst bakenda akkúrat núna. Vinsamlegast reyndu aftur síðar eða hafðu samband við þjónustuver.`,
            isUser: false,
            id: Date.now(),
            scenario: 'error'
          };
        } else {
          // Re-throw if not in fallback mode to be caught by outer catch
          throw primaryError;
        }
      }
      
      if (assistantMessage) {
        setActiveSubtitleText(assistantMessage.text);
        
        try {
          speakMessage(assistantMessage);
        } catch (speechError) {
          logConnectionError(speechError, 'Text-to-Speech');
          
          // Show toast about speech synthesis issues
          toast.info('Raddsvörun ekki í boði. Svör sýnd sem texti.', { 
            duration: 3000,
            position: 'top-center'
          });
          
          // Try browser's speech synthesis as fallback
          if (fallbackMode && 'speechSynthesis' in window) {
            try {
              const utterance = new SpeechSynthesisUtterance(assistantMessage.text);
              utterance.lang = 'is-IS';
              window.speechSynthesis.speak(utterance);
            } catch (fallbackError) {
              console.error('Browser speech synthesis error:', fallbackError);
            }
          }
        }
      } else {
        // No message response
        toast.error('Ekkert svar fékkst frá aðstoðarmanni. Reyndu aftur.', {
          duration: 4000
        });
      }
      
      return "";
    } catch (error) {
      logConnectionError(error, 'Message Handling');
      toast.error('Villa kom upp við vinnslu fyrirspurnar. Reyndu aftur.', {
        duration: 5000
      });
      return currentTranscribedText;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTranscriptionError = () => {
    logConnectionError(new Error('Transcription failed'), 'Voice Recognition');
    toast.error(
      'Vandi við að þekkja tal. Athugaðu hljóðnemann þinn og prófaðu að tala hærra og skýrar.',
      { duration: 5000 }
    );
  };

  // Recovery function for network issues
  const attemptRecovery = async () => {
    setRetryCount(0);
    setFallbackMode(false);
    setLastError(null);
    
    try {
      const response = await fetch('/api/health-check', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      return response.ok;
    } catch (error) {
      logConnectionError(error, 'Recovery Attempt');
      return false;
    }
  };

  return {
    isProcessing,
    setIsProcessing,
    handleTranscriptionComplete,
    handleSendMessage,
    handleTranscriptionError,
    inFallbackMode: fallbackMode,
    lastError,
    attemptRecovery
  };
};
