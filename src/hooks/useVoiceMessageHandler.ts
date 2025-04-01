
import { useState } from 'react';
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

  const handleTranscriptionComplete = async (transcribedText: string) => {
    if (!transcribedText.trim()) return;
  };

  const handleSendMessage = async (currentTranscribedText: string) => {
    if (!currentTranscribedText.trim() || isProcessing) return;
    
    try {
      setIsProcessing(true);
      console.log('Sending message to AI:', currentTranscribedText);
      const assistantMessage = await handleUserMessage(currentTranscribedText);
      
      if (assistantMessage && !hasError) {
        setActiveSubtitleText(assistantMessage.text);
        speakMessage(assistantMessage);
      }
      
      return "";
    } catch (error) {
      console.error('Error handling message:', error);
      toast.error('Villa kom upp við vinnslu fyrirspurnar. Reyndu aftur.');
      return currentTranscribedText;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTranscriptionError = () => {
    toast.error(
      'Vandi við að þekkja tal. Athugaðu hljóðnemann þinn og prófaðu að tala hærra og skýrar.',
      { duration: 5000 }
    );
  };

  return {
    isProcessing,
    setIsProcessing,
    handleTranscriptionComplete,
    handleSendMessage,
    handleTranscriptionError
  };
};
