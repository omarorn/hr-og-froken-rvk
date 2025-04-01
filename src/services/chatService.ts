
import { supabase } from "@/integrations/supabase/client";
import { enhancePromptWithContext } from "@/services/contextService";
import { getCurrentTime } from "@/services/timeService";
import { useSupabaseMCP } from "@/hooks/useMCP";

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
  BUS_INFO = "bus_info",
  WASTE_INFO = "waste_info",
  CITY_INFO = "city_info",
  LOCATION_INFO = "location_info",
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
    // Initialize Supabase MCP tools
    let supabaseMCPTools = null;
    try {
      // Create a temporary instance of the hook's return value
      const { readRows, createRecord, updateRecord, deleteRecord, status } = useSupabaseMCP();
      
      if (status.connected) {
        supabaseMCPTools = {
          readRows,
          createRecord,
          updateRecord,
          deleteRecord
        };
        console.log('Supabase MCP server connected and ready for use');
      } else {
        console.warn('Supabase MCP server not connected:', status.error);
      }
    } catch (error) {
      console.error('Failed to initialize Supabase MCP tools:', error);
    }
    
    // Determine assistant name based on gender in history
    const gender = history.length > 0 && history[0].gender === 'male' ? 'male' : 'female';
    const assistantName = gender === 'male' ? 'Birkir' : 'Rósa';
    
    // Detect scenario from the message content
    const detectScenario = (message: string): ConversationScenario => {
      const lowerMessage = message.toLowerCase();
      
      // Bus-related queries
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
      
      // General greetings
      if (/hæ|halló|góðan dag|gott kvöld|góða nótt|morg[uo]nn/.test(lowerMessage)) {
        return ConversationScenario.GREETING;
      } 
      
      // Farewell messages
      else if (/bless|bæ|kveðja|takk fyrir|vertu sæl[lt]?|hafðu það gott/.test(lowerMessage)) {
        return ConversationScenario.FAREWELL;
      } 
      
      // Hold/wait messages
      else if (/bíða|andartak|augnablik|mínútu/.test(lowerMessage)) {
        return ConversationScenario.HOLD;
      } 
      
      // Technical support queries
      else if (/tölvu|tækni|internet|villa|bilun|virkar ekki/.test(lowerMessage)) {
        return ConversationScenario.TECHNICAL_SUPPORT;
      } 
      
      // Follow-up queries
      else if (/svar|upplýsingar|niðurstað|fundið/.test(lowerMessage)) {
        return ConversationScenario.FOLLOW_UP;
      } 
      
      // Default to general
      else {
        return ConversationScenario.GENERAL;
      }
    };
    
    // Get the most likely scenario for this interaction
    const scenario = detectScenario(message);
    
    // Create specialized system prompts based on the scenario
    const getScenarioPrompt = async (scenario: ConversationScenario): Promise<string> => {
      const basePrompt = `
        You are a helpful assistant for Reykjavíkurborg (Reykjavik City) named ${assistantName}.
        Respond to questions about city services, facilities, and local information.
        Be friendly, helpful, and concise.
        Always respond in Icelandic.
        
        IMPORTANT: Always respond directly to what the user is asking. Don't give generic responses.
        Always acknowledge the user's specific question or statement. If you don't know the answer,
        say so directly and suggest where they might find information.
        
        Use the warm, professional tone of a 1960s FM radio DJ or telephone operator.
        
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
      let scenarioPrompt = "";
      switch (scenario) {
        case ConversationScenario.GREETING:
          scenarioPrompt = `
            This is a GREETING scenario.
            Respond with a warm welcome like:
            "Góðan daginn, þetta er Reykjavíkurborg. Hvernig get ég aðstoðað þig í dag?" or
            "Góðan daginn og velkomin í Reykjavíkurborg. Ég er hér til að hjálpa þér – hvernig get ég aðstoðað?"
          `;
          break;
          
        case ConversationScenario.HOLD:
          scenarioPrompt = `
            This is a HOLD scenario.
            Respond with a calming message like:
            "Augnablik, ég kanna stöðuna og kem aftur til þín fljótlega. Vinsamlegast haltu á línunni." or
            "Vinsamlegast bíddu andartak á meðan ég fæ rétta aðila til aðstoðar. Ég verð hjá þér fljótlega."
          `;
          break;
          
        case ConversationScenario.TECHNICAL_SUPPORT:
          scenarioPrompt = `
            This is a TECHNICAL SUPPORT scenario.
            Respond with a helpful technical greeting like:
            "Tækniaðstoð Reykjavíkur, góðan daginn! Hvernig get ég aðstoðað þig með tæknimál í dag?" or
            "Þú ert kominn til tækniaðstoðar Reykjavíkur. Segðu mér hvaða tæknilegt vandamál þú ert að glíma við."
          `;
          break;
          
        case ConversationScenario.FOLLOW_UP:
          scenarioPrompt = `
            This is a FOLLOW-UP scenario.
            Respond with an informative follow-up like:
            "Ég er aftur komin með upplýsingar fyrir þig! Hér er það sem ég fann..." or
            "Ég hef nú fengið svörin sem þú leitaðir að. Ég skal útskýra þau fyrir þér núna."
          `;
          break;
          
        case ConversationScenario.FAREWELL:
          scenarioPrompt = `
            This is a FAREWELL scenario.
            Respond with a polite goodbye like:
            "Takk fyrir að hringja í okkur í dag! Ég vona að þetta hafi hjálpað þér. Hafðu góðan dag!" or
            "Ef þú hefur einhverjar aðrar spurningar seinna, hikaðu ekki við að hafa samband. Njóttu dagsins!"
          `;
          break;
          
        case ConversationScenario.BUS_INFO:
          scenarioPrompt = `
            This is a BUS_INFO scenario.
            The user is asking about bus routes, bus stops, or public transportation.
            Provide helpful information about Reykjavik's public transportation system (Strætó).
            Include details about relevant bus routes, schedules, and bus stop locations if available.
            Speak in a clear, organized manner like a professional transit information specialist.
          `;
          break;
          
        case ConversationScenario.WASTE_INFO:
          scenarioPrompt = `
            This is a WASTE_INFO scenario.
            The user is asking about garbage collection, recycling, or waste management.
            Provide helpful information about Reykjavik's waste collection system.
            Include details about collection schedules, recycling guidelines, and waste sorting if available.
            Use a helpful, educational tone when explaining the city's waste management processes.
          `;
          break;
          
        case ConversationScenario.LOCATION_INFO:
          scenarioPrompt = `
            This is a LOCATION_INFO scenario.
            The user is asking about finding a location, place, or service in Reykjavik.
            Provide helpful information about the requested location or nearby services.
            Include details about addresses, opening hours, and directions if available.
            Use the tone of a knowledgeable local guide who knows the city well.
          `;
          break;
          
        case ConversationScenario.CITY_INFO:
          scenarioPrompt = `
            This is a CITY_INFO scenario.
            The user is asking about general information about Reykjavik city or its services.
            Provide helpful information about city services, facilities, or general information.
            Include relevant details about city departments, contact information, or service hours if available.
            Use the tone of a professional city information desk representative.
          `;
          break;
          
        default:
          scenarioPrompt = "";
      }
      
      // Combine base prompt with scenario-specific instructions
      let combinedPrompt = basePrompt + scenarioPrompt;
      
      // Enhance with contextual information
      return await enhancePromptWithContext(combinedPrompt);
    };
    
    // Get the scenario-specific system prompt
    const systemPrompt = await getScenarioPrompt(scenario);
    
    // Add MCP tools information to the system message if available
    let mcpToolsInfo = '';
    if (supabaseMCPTools) {
      mcpToolsInfo = `
        You have access to a Supabase database through the following tools:
        - readRows: Read rows from a table
        - createRecord: Create a new record in a table
        - updateRecord: Update an existing record in a table
        - deleteRecord: Delete a record from a table
        
        Use these tools when appropriate to store or retrieve information.
      `;
    }
    
    // Add current time to the system message
    const timeInfo = getCurrentTime();
    const timeMessage = `Current time in Reykjavik: ${timeInfo.hour}:${String(timeInfo.minute).padStart(2, '0')}`;
    
    const messages = [
      {
        role: "system",
        content: `${systemPrompt}\n\n${mcpToolsInfo}\n\n${timeMessage}`
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
