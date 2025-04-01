
import { useState } from 'react';
import { sendChatMessage, ConversationScenario } from '@/services/chatService';
import { toast } from 'sonner';

export interface Message {
  text: string;
  isUser: boolean;
  id: number;
  gender?: 'female' | 'male';
  scenario?: string;
}

export const useMessageService = (gender: 'female' | 'male' = 'female') => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<string>(ConversationScenario.GREETING);

  const addMessage = (text: string, isUser: boolean, scenario?: string) => {
    const newMessage = {
      text,
      isUser,
      id: Date.now(),
      gender: isUser ? undefined : gender,
      scenario: isUser ? undefined : scenario
    };
    
    if (!isUser && scenario) {
      setCurrentScenario(scenario);
    }
    
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const handleUserMessage = async (text: string) => {
    try {
      setIsProcessing(true);
      
      // Add user message
      addMessage(text, true);
      
      // Get conversation history to provide context to the AI
      const conversationHistory = messages.map(msg => ({
        text: msg.text,
        isUser: msg.isUser,
        gender
      }));
      
      console.log('Sending user question to AI:', text);
      
      // Send the message to OpenAI
      const response = await sendChatMessage(text, conversationHistory);
      console.log('AI response:', response.text, 'Scenario:', response.scenario);
      
      // Add assistant response with scenario
      const assistantMessage = addMessage(response.text, false, response.scenario);
      setIsProcessing(false);
      
      return assistantMessage;
    } catch (error) {
      console.error('Error getting AI response:', error);
      setIsProcessing(false);
      toast.error('Villa við að sækja svar. Reyndu aftur.');
      return null;
    }
  };

  const setInitialGreeting = (initialMessage: string) => {
    const greeting = {
      text: initialMessage,
      isUser: false,
      id: Date.now(),
      gender,
      scenario: ConversationScenario.GREETING
    };
    
    setMessages([greeting]);
    return greeting;
  };

  return {
    messages,
    isProcessing,
    setIsProcessing,
    addMessage,
    handleUserMessage,
    setInitialGreeting,
    currentScenario
  };
};
