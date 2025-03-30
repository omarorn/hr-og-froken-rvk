
import { supabase } from "@/integrations/supabase/client";

const getTextToSpeech = async (text: string, voice: string = 'alloy', instructions?: string): Promise<ArrayBuffer> => {
  try {
    // Use Supabase Edge Function instead of direct API
    const { data, error } = await supabase.functions.invoke('speech', {
      body: {
        text,
        voice,
        instructions: instructions || undefined
      },
      responseType: 'arraybuffer'
    });

    if (error) {
      throw new Error(`Text-to-speech error: ${error.message}`);
    }

    return data as unknown as ArrayBuffer;
  } catch (error) {
    console.error('Text-to-speech error:', error);
    throw error;
  }
};

const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('language', 'is');
    
    // Use Supabase Edge Function instead of direct API
    const { data, error } = await supabase.functions.invoke('transcribe', {
      body: formData
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
