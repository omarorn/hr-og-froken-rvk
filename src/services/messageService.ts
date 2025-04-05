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
  const [initError, setInitError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  
  useEffect(() => {
    const init = async () => {
      try {
        if (retryCount > 3) {
          setInitError(true);
          console.log('Max retry attempts reached, using local fallback');
          return;
        }
        
        const { assistantId, threadId } = await initializeAssistant();
        setAssistantId(assistantId);
        setThreadId(threadId);
        setInitError(false);
        console.log('Assistant initialized:', { assistantId, threadId });
      } catch (error) {
        console.error('Failed to initialize assistant:', error);
        setRetryCount(prev => prev + 1);
        setInitError(true);
        
        if (retryCount === 0) {
          toast.error('Villa við að tengja aðstoðarmann. Reyndu aftur.', {
            duration: 5000,
            action: {
              label: 'Reyna aftur',
              onClick: () => init()
            }
          });
        }
        
        try {
          const storedAssistantId = localStorage.getItem('assistantId');
          const storedThreadId = localStorage.getItem('threadId');
          
          if (storedAssistantId && storedThreadId) {
            setAssistantId(storedAssistantId);
            setThreadId(storedThreadId);
            console.log('Using stored assistant credentials');
          }
        } catch (storageError) {
          console.error('Failed to access localStorage:', storageError);
        }
      }
    };
    
    init();
  }, [retryCount]);

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
      
      addMessage(text, true);
      
      if (!contextData || Date.now() - (contextData.timestamp || 0) > 300000) {
        try {
          const newContext = await generateContext();
          newContext.timestamp = Date.now();
          setContextData(newContext);
          console.log('Updated contextual data:', newContext);
        } catch (error) {
          console.error('Failed to update contextual data:', error);
        }
      }
      
      let assistantMessage;
      
      if (!initError && assistantId && threadId) {
        try {
          const response = await sendAssistantMessage(text, assistantId, threadId);
          console.log('Assistant response:', response);
          
          assistantMessage = {
            text: response.text,
            isUser: false,
            id: Date.now(),
            gender,
            scenario: detectScenario(response.text)
          };
        } catch (error) {
          console.error('Error sending message to assistant:', error);
        }
      }
      
      if (!assistantMessage) {
        console.log('Using fallback response');
        
        let fallbackResponse = '';
        
        if (text.toLowerCase().includes('halló') || text.toLowerCase().includes('hæ') || text.toLowerCase().includes('góðan dag')) {
          fallbackResponse = `Góðan dag! Ég er ${gender === 'female' ? 'Rósa' : 'Birkir'}, aðstoðarmaður Reykjavíkurborgar. Því miður er bakendi ekki aðgengilegur akkúrat núna, svo ég get aðeins svarað með takmörkuðum hætti. Hvernig get ég aðstoðað þig?`;
        } else if (text.toLowerCase().includes('bless') || text.toLowerCase().includes('bæ') || text.toLowerCase().includes('kveðja')) {
          fallbackResponse = 'Takk fyrir spjallið. Hafðu það gott!';
        } else {
          fallbackResponse = 'Fyrirgefðu, ég get ekki tengst bakenda akkúrat núna. Vinsamlegast reyndu aftur síðar eða hafðu samband við þjónustuver Reykjavíkurborgar.';
        }
        
        assistantMessage = {
          text: fallbackResponse,
          isUser: false,
          id: Date.now(),
          gender,
          scenario: text.toLowerCase().includes('bless') ? ConversationScenario.FAREWELL : ConversationScenario.GENERAL
        };
      }
      
      addMessage(assistantMessage.text, false, assistantMessage.scenario);
      setIsProcessing(false);
      
      return assistantMessage;
    } catch (error) {
      console.error('Error getting AI response:', error);
      setIsProcessing(false);
      toast.error('Villa við að sækja svar. Reyndu aftur.', { duration: 4000 });
      return null;
    }
  };

  const detectScenario = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
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
    
    if (/rusl|sorp|sorpið|tunnu|tunnur|flokkun|waste|garbage|trash|recycling|endurvinnsla|urðun/.test(lowerMessage)) {
      return ConversationScenario.WASTE_INFO;
    }
    
    if (/hvar|staðsetning|staðurinn|staður|location|place|find|finna|nálægt|nearby|næst|næsta/.test(lowerMessage)) {
      return ConversationScenario.LOCATION_INFO;
    }
    
    if (/reykjavík|reykjavik|borgar|borg|city|sveitarfélag|upplýsingar|info|information|þjónustu|service/.test(lowerMessage)) {
      return ConversationScenario.CITY_INFO;
    }
    
    if (/tölvu|tækni|internet|villa|bilun|virkar ekki/.test(lowerMessage)) {
      return ConversationScenario.TECHNICAL_SUPPORT;
    } 
    
    if (/svar|upplýsingar|niðurstað|fundið/.test(lowerMessage)) {
      return ConversationScenario.FOLLOW_UP;
    } 
    
    return ConversationScenario.GENERAL;
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
  
  const resetAssistant = async () => {
    localStorage.removeItem('assistantId');
    localStorage.removeItem('threadId');
    setAssistantId(null);
    setThreadId(null);
    setRetryCount(0);
    setInitError(false);
    
    try {
      const { assistantId, threadId } = await initializeAssistant();
      setAssistantId(assistantId);
      setThreadId(threadId);
      toast.success('Tenging við aðstoðarmann hefur verið endurstillt.', { duration: 3000 });
      return true;
    } catch (error) {
      console.error('Failed to reset assistant:', error);
      toast.error('Villa við að endurstilla aðstoðarmann.', { duration: 4000 });
      setInitError(true);
      return false;
    }
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
    threadId,
    initError,
    resetAssistant
  };
};
