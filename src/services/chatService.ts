
import { supabase } from "@/integrations/supabase/client";

/**
 * Service for handling chat-based interactions with OpenAI
 */

/**
 * Response from the OpenAI chat API
 */
interface ChatResponse {
  text: string;
  sources?: any[];
  scenario?: string;
}

/**
 * Conversation scenarios for context-aware responses
 */
export enum ConversationScenario {
  GREETING = "greeting",
  HOLD = "hold",
  TECHNICAL_SUPPORT = "tech_support",
  FOLLOW_UP = "follow_up",
  FAREWELL = "farewell",
  GENERAL = "general",
}

/**
 * Sends a message to OpenAI and receives a response
 * 
 * @param message - The user's message
 * @param history - Previous conversation history
 * @returns A Promise containing the AI's response
 */
export const sendChatMessage = async (message: string, history: any[] = []): Promise<ChatResponse> => {
  try {
    // Determine assistant name based on gender in history
    const gender = history.length > 0 && history[0].gender === 'male' ? 'male' : 'female';
    const assistantName = gender === 'male' ? 'Birkir' : 'Rósa';
    
    // Detect scenario from the message content (simplified version)
    const detectScenario = (message: string): ConversationScenario => {
      const lowerMessage = message.toLowerCase();
      
      if (/hæ|halló|góðan dag|gott kvöld|góða nótt|morg[uo]nn/.test(lowerMessage)) {
        return ConversationScenario.GREETING;
      } else if (/bless|bæ|kveðja|takk fyrir|vertu sæl[lt]?|hafðu það gott/.test(lowerMessage)) {
        return ConversationScenario.FAREWELL;
      } else if (/bíða|andartak|augnablik|mínútu/.test(lowerMessage)) {
        return ConversationScenario.HOLD;
      } else if (/tölvu|tækni|internet|villa|bilun|virkar ekki/.test(lowerMessage)) {
        return ConversationScenario.TECHNICAL_SUPPORT;
      } else if (/svar|upplýsingar|niðurstað|fundið/.test(lowerMessage)) {
        return ConversationScenario.FOLLOW_UP;
      } else {
        return ConversationScenario.GENERAL;
      }
    };
    
    // Get the most likely scenario for this interaction
    const scenario = detectScenario(message);
    
    // Create specialized system prompts based on the scenario
    const getScenarioPrompt = (scenario: ConversationScenario): string => {
      const basePrompt = `
        You are a helpful assistant for Reykjavíkurborg (Reykjavik City) named ${assistantName}.
        Respond to questions about city services, facilities, and local information.
        Be friendly, helpful, and concise.
        Always respond in Icelandic.
        
        IMPORTANT: Always respond directly to what the user is asking. Don't give generic responses.
        Always acknowledge the user's specific question or statement. If you don't know the answer,
        say so directly and suggest where they might find information.
        
        Use the warm, professional tone of a radio DJ or telephone operator.
        
        Here are some topics you can help with:
        - Leikskólar (Preschools)
        - Grunnskólar (Elementary schools)
        - Sorphirða (Garbage collection)
        - Borgarstjórn (City council)
        - Fasteignagjöld (Property taxes)
        - Sundlaugar (Swimming pools)
        - Íþróttir og útivist (Sports and recreation)
        - Samgöngur (Transportation)
        - Menning og viðburðir (Culture and events)
      `;
      
      // Add scenario-specific instructions
      switch (scenario) {
        case ConversationScenario.GREETING:
          return `${basePrompt}
            This is a GREETING scenario.
            Respond with a warm welcome like:
            "Góðan daginn, þetta er Reykjavíkurborg. Hvernig get ég aðstoðað þig í dag?" or
            "Góðan daginn og velkomin í Reykjavíkurborg. Ég er hér til að hjálpa þér – hvernig get ég aðstoðað?"
          `;
        case ConversationScenario.HOLD:
          return `${basePrompt}
            This is a HOLD scenario.
            Respond with a calming message like:
            "Augnablik, ég kanna stöðuna og kem aftur til þín fljótlega. Vinsamlegast haltu á línunni." or
            "Vinsamlegast bíddu andartak á meðan ég fæ rétta aðila til aðstoðar. Ég verð hjá þér fljótlega."
          `;
        case ConversationScenario.TECHNICAL_SUPPORT:
          return `${basePrompt}
            This is a TECHNICAL SUPPORT scenario.
            Respond with a helpful technical greeting like:
            "Tækniaðstoð Reykjavíkur, góðan daginn! Hvernig get ég aðstoðað þig með tæknimál í dag?" or
            "Þú ert kominn til tækniaðstoðar Reykjavíkur. Segðu mér hvaða tæknilegt vandamál þú ert að glíma við."
          `;
        case ConversationScenario.FOLLOW_UP:
          return `${basePrompt}
            This is a FOLLOW-UP scenario.
            Respond with an informative follow-up like:
            "Ég er aftur komin með upplýsingar fyrir þig! Hér er það sem ég fann..." or
            "Ég hef nú fengið svörin sem þú leitaðir að. Ég skal útskýra þau fyrir þér núna."
          `;
        case ConversationScenario.FAREWELL:
          return `${basePrompt}
            This is a FAREWELL scenario.
            Respond with a polite goodbye like:
            "Takk fyrir að hringja í okkur í dag! Ég vona að þetta hafi hjálpað þér. Hafðu góðan dag!" or
            "Ef þú hefur einhverjar aðrar spurningar seinna, hikaðu ekki við að hafa samband. Njóttu dagsins!"
          `;
        default:
          return basePrompt;
      }
    };
    
    const systemPrompt = getScenarioPrompt(scenario);
    
    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      ...history.map(entry => ({
        role: entry.isUser ? "user" : "assistant",
        content: entry.text
      })),
      {
        role: "user",
        content: message
      }
    ];
    
    console.log('Sending chat with history:', history.length, 'messages', 'scenario:', scenario);
    
    // Use Supabase Edge Function instead of direct API
    const { data, error } = await supabase.functions.invoke('chat', {
      body: {
        messages,
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 500
      }
    });
    
    if (error) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
    
    return {
      text: data.content,
      scenario: scenario
    };
  } catch (error) {
    console.error('Chat service error:', error);
    throw error;
  }
};
