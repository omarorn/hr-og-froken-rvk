
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
    
    // Convert blob to base64
    const arrayBuffer = await audioBlob.arrayBuffer();
    
    // Convert to base64 safely in chunks
    const uint8Array = new Uint8Array(arrayBuffer);
    const chunkSize = 1024;
    let binary = '';
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, Math.min(i + chunkSize, uint8Array.length));
      for (let j = 0; j < chunk.length; j++) {
        binary += String.fromCharCode(chunk[j]);
      }
    }
    
    const base64String = btoa(binary);
    console.log('Converted audio to base64, length:', base64String.length);
    
    // Use Supabase Edge Function instead of direct API
    const { data, error } = await supabase.functions.invoke('transcribe', {
      body: {
        audio: base64String,
        language: 'is'
      }
    });

    if (error) {
      console.error('Transcription function error:', error);
      throw new Error(`Transcription error: ${error.message}`);
    }

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
