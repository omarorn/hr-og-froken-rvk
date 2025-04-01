
import { supabase } from "@/integrations/supabase/client";
import { ConversationScenario } from './chatService';

// Voice style instructions based on scenario
const getVoiceInstructions = (scenario?: string, gender: 'female' | 'male' = 'female'): string => {
  const baseInstructions = `Speak in the style of a 1960s FM radio DJ or telephone operator with a warm, professional tone. 
  Use clear Icelandic pronunciation for characters like þ, ð, æ. 
  The voice should be smooth, reassuring, and slightly electronic like Knight Rider's computer voice.`;
  
  switch (scenario) {
    case ConversationScenario.GREETING:
      return `${baseInstructions} Greet the listener with warmth and enthusiasm without being overly casual.`;
    case ConversationScenario.HOLD:
      return `${baseInstructions} Speak in a calming, reassuring tone that makes the listener comfortable while waiting.`;
    case ConversationScenario.TECHNICAL_SUPPORT:
      return `${baseInstructions} Use a patient, clear, and helpful tone that conveys technical expertise.`;
    case ConversationScenario.FOLLOW_UP:
      return `${baseInstructions} Sound enthusiastic about sharing the information you've found.`;
    case ConversationScenario.FAREWELL:
      return `${baseInstructions} Sound genuinely appreciative and warm in your goodbye.`;
    default:
      return baseInstructions;
  }
};

const getTextToSpeech = async (text: string, voice: string = 'alloy', instructions?: string, scenario?: string, gender: 'female' | 'male' = 'female'): Promise<ArrayBuffer> => {
  try {
    // Determine the best voice instructions based on the scenario
    const voiceInstructions = instructions || getVoiceInstructions(scenario, gender);
    
    // Use Supabase Edge Function instead of direct API
    const { data, error } = await supabase.functions.invoke('speech', {
      body: {
        text,
        voice,
        instructions: voiceInstructions
      }
    });

    if (error) {
      throw new Error(`Text-to-speech error: ${error.message}`);
    }

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

const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    console.log('Starting audio transcription for blob size:', audioBlob.size);
    
    // Create a direct FormData to send to the API
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('language', 'is'); // Specify Icelandic language
    
    console.log('Sending audio data to transcribe API with Icelandic language setting');
    
    // Send directly to our API endpoint
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Transcription API error:', errorData);
      throw new Error(`Transcription error: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data || !data.text) {
      console.error('No transcription data returned:', data);
      throw new Error('No transcription data returned');
    }

    console.log('Transcription successful:', data.text);
    return data.text;
  } catch (error) {
    console.error('Audio transcription error:', error);
    throw error;
  }
};

export { getTextToSpeech, transcribeAudio };
