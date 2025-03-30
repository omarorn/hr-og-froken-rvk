
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
    const systemPrompt = `
      You are a helpful assistant for Reykjavíkurborg (Reykjavik City) named ${history.length > 0 && history[0].gender === 'male' ? 'Birkir' : 'Rósa'}.
      Respond to questions about city services, facilities, and local information.
      Be friendly, helpful, and concise.
      Always respond in Icelandic.
      
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
      
      If you don't know the answer, suggest where the user might find more information.
    `;
    
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
      text: data.content
    };
  } catch (error) {
    console.error('Chat service error:', error);
    throw error;
  }
};
