import { useState, useEffect } from 'react';
import { ConversationScenario } from '@/services/chatService';
import { toast } from 'sonner';
import { generateContext } from '@/services/contextService';
import { initializeAssistant, sendAssistantMessage } from '@/services/assistantService';

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
  const [contextData, setContextData] = useState<any>(null);
  const [assistantId, setAssistantId] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  
  // Initialize assistant when component mounts
  useEffect(() => {
    const init = async () => {
      try {
        const { assistantId, threadId } = await initializeAssistant();
        setAssistantId(assistantId);
        setThreadId(threadId);
        console.log('Assistant initialized:', { assistantId, threadId });
      } catch (error) {
        console.error('Failed to initialize assistant:', error);
        toast.error('Villa við að tengja aðstoðarmann. Reyndu aftur.');
      }
    };
    
    init();
  }, []);

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
      
      // Update contextual data if needed
      if (!contextData || Date.now() - (contextData.timestamp || 0) > 300000) { // 5 minutes
        try {
          const newContext = await generateContext();
          newContext.timestamp = Date.now();
          setContextData(newContext);
          console.log('Updated contextual data:', newContext);
        } catch (error) {
          console.error('Failed to update contextual data:', error);
        }
      }
      
      // Make sure we have assistant and thread IDs
      if (!assistantId || !threadId) {
        const { assistantId: newAssistantId, threadId: newThreadId } = await initializeAssistant();
        setAssistantId(newAssistantId);
        setThreadId(newThreadId);
      }
      
      // Send the message to the assistant
      const response = await sendAssistantMessage(text, assistantId!, threadId!);
      console.log('Assistant response:', response);
      
      // Detect scenario from response content
      const detectScenario = (message: string): string => {
        const lowerMessage = message.toLowerCase();
        
        // Add your scenario detection logic here
        if (/hæ|halló|góðan dag|gott kvöld|góða nótt|morg[uo]nn/.test(lowerMessage)) {
          return ConversationScenario.GREETING;
        } else if (/bless|bæ|kveðja|takk fyrir|vertu sæl[lt]?|hafðu það gott/.test(lowerMessage)) {
          return ConversationScenario.FAREWELL;
        } else if (/bíða|andartak|augnablik|mínútu/.test(lowerMessage)) {
          return ConversationScenario.HOLD;
        } 
        
        if (/strætó|straeðto|strætisvagn|bus|vagn|ferðast|ferðir|komast|leið|route|stöð|stop/.test(lowerMessage)) {
          return ConversationScenario.BUS_INFO;
        }
        
        // Waste collection related queries
        if (/rusl|sorp|sorpið|tunnu|tunnur|flokkun|waste|garbage|trash|recycling|endurvinnsla|urðun/.test(lowerMessage)) {
          return ConversationScenario.WASTE_INFO;
        }
        
        // Location or place related queries
        if (/hvar|staðsetning|staðurinn|staður|location|place|find|finna|nálægt|nearby|næst|næsta/.test(lowerMessage)) {
          return ConversationScenario.LOCATION_INFO;
        }
        
        // City info related queries
        if (/reykjavík|reykjavik|borgar|borg|city|sveitarfélag|upplýsingar|info|information|þjónustu|service/.test(lowerMessage)) {
          return ConversationScenario.CITY_INFO;
        }
        
        // Technical support queries
        else if (/tölvu|tækni|internet|villa|bilun|virkar ekki/.test(lowerMessage)) {
          return ConversationScenario.TECHNICAL_SUPPORT;
        } 
        
        // Follow-up queries
        else if (/svar|upplýsingar|niðurstað|fundið/.test(lowerMessage)) {
          return ConversationScenario.FOLLOW_UP;
        } 
        
        return ConversationScenario.GENERAL;
      };
      
      // Determine scenario from the response
      const scenario = detectScenario(response.text);
      
      // Add assistant response with detected scenario
      const assistantMessage = addMessage(response.text, false, scenario);
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
    currentScenario,
    contextData,
    assistantId,
    threadId
  };
};
