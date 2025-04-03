
import { supabase } from "@/integrations/supabase/client";

export interface AssistantMessage {
  text: string;
  role: 'user' | 'assistant';
  id: string;
  threadId?: string;
}

interface AssistantSession {
  assistantId: string;
  threadId: string;
}

// Initialize assistant and create a new thread
export const initializeAssistant = async (): Promise<AssistantSession> => {
  try {
    // Check if we have stored IDs in localStorage
    const storedAssistantId = localStorage.getItem('assistantId');
    const storedThreadId = localStorage.getItem('threadId');
    
    if (storedAssistantId && storedThreadId) {
      return {
        assistantId: storedAssistantId,
        threadId: storedThreadId
      };
    }
    
    // Create a new assistant if needed
    let assistantId = storedAssistantId;
    if (!assistantId) {
      const { data, error } = await supabase.functions.invoke('assistants', {
        body: { action: 'createAssistant' }
      });
      
      if (error) throw new Error(`Failed to create assistant: ${error.message}`);
      assistantId = data.assistantId;
      localStorage.setItem('assistantId', assistantId);
    }
    
    // Always create a new thread for a new session
    const { data: threadData, error: threadError } = await supabase.functions.invoke('assistants', {
      body: { action: 'createThread' }
    });
    
    if (threadError) throw new Error(`Failed to create thread: ${threadError.message}`);
    const threadId = threadData.threadId;
    localStorage.setItem('threadId', threadId);
    
    return { assistantId, threadId };
  } catch (error) {
    console.error('Error initializing assistant:', error);
    throw error;
  }
};

// Send a message to the assistant and get a response
export const sendAssistantMessage = async (
  message: string, 
  assistantId: string, 
  threadId: string
): Promise<AssistantMessage> => {
  try {
    const { data, error } = await supabase.functions.invoke('assistants', {
      body: {
        action: 'sendMessage',
        assistantId,
        threadId,
        message
      }
    });
    
    if (error) throw new Error(`Failed to send message: ${error.message}`);
    
    return {
      text: data.text,
      role: 'assistant',
      id: data.messageId,
      threadId
    };
  } catch (error) {
    console.error('Error sending message to assistant:', error);
    throw error;
  }
};

// Generate speech from text
export const getAssistantSpeech = async (
  text: string, 
  voice: string = 'nova',
  instructions?: string,
  scenario?: string,
  gender: 'female' | 'male' = 'female'
): Promise<ArrayBuffer> => {
  try {
    // Use specific voice based on gender
    const voiceToUse = gender === 'female' ? 'nova' : 'onyx';
    
    // Get voice instructions based on scenario
    let voiceInstructions = instructions;
    if (!voiceInstructions && scenario) {
      voiceInstructions = `Speak in the style of a 1960s FM radio DJ with a warm, professional tone. Use clear Icelandic pronunciation for characters like þ, ð, æ.`;
      
      // Add scenario-specific instructions if needed
      if (scenario === 'greeting') {
        voiceInstructions += " Greet the listener with warmth and enthusiasm.";
      } else if (scenario === 'farewell') {
        voiceInstructions += " Sound genuinely appreciative and warm in your goodbye.";
      }
    }
    
    const { data, error } = await supabase.functions.invoke('assistants', {
      body: {
        action: 'textToSpeech',
        message: text,
        voice: voiceToUse,
        instructions: voiceInstructions
      }
    });
    
    if (error) throw new Error(`Text-to-speech error: ${error.message}`);
    
    if (!data) {
      throw new Error('No audio data returned from speech service');
    }
    
    // Convert the response data to ArrayBuffer safely
    const base64Data = data as string;
    
    // Safely decode base64 to avoid stack issues
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    
    // Process in smaller chunks to avoid stack issues
    const chunkSize = 1024;
    for (let i = 0; i < binaryString.length; i += chunkSize) {
      const end = Math.min(i + chunkSize, binaryString.length);
      for (let j = i; j < end; j++) {
        bytes[j] = binaryString.charCodeAt(j);
      }
    }
    
    return bytes.buffer;
  } catch (error) {
    console.error('Text-to-speech error:', error);
    throw error;
  }
};
