
import { supabase } from "@/integrations/supabase/client";

const getTextToSpeech = async (text: string, voice: string = 'alloy', instructions?: string): Promise<ArrayBuffer> => {
  try {
    // Use Supabase Edge Function instead of direct API
    const { data, error } = await supabase.functions.invoke('speech', {
      body: {
        text,
        voice,
        instructions: instructions || undefined
      }
    });

    if (error) {
      throw new Error(`Text-to-speech error: ${error.message}`);
    }

    if (!data) {
      throw new Error('No audio data returned from speech service');
    }

    // Convert the response data to ArrayBuffer
    const base64Data = data as string;
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes.buffer;
  } catch (error) {
    console.error('Text-to-speech error:', error);
    throw error;
  }
};

const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    // Convert blob to base64
    const arrayBuffer = await audioBlob.arrayBuffer();
    const base64String = btoa(
      new Uint8Array(arrayBuffer)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    
    // Use Supabase Edge Function instead of direct API
    const { data, error } = await supabase.functions.invoke('transcribe', {
      body: {
        audio: base64String,
        language: 'is'
      }
    });

    if (error) {
      throw new Error(`Transcription error: ${error.message}`);
    }

    return data.text;
  } catch (error) {
    console.error('Audio transcription error:', error);
    throw error;
  }
};

export { getTextToSpeech, transcribeAudio };
