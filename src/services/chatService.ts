
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
    const openAiKey = localStorage.getItem('openai_api_key');
    
    if (!openAiKey) {
      throw new Error('OpenAI API key not found. Please set your API key in settings.');
    }
    
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
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 500
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      text: data.choices[0].message.content
    };
  } catch (error) {
    console.error('Chat service error:', error);
    throw error;
  }
};
