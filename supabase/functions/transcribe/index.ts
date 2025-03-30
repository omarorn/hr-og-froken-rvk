
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a ReadableStream from the request body
    const formData = await req.formData();
    
    // Get the file from the request
    const file = formData.get('file');
    const language = formData.get('language') || 'is';
    
    if (!file || !(file instanceof File)) {
      throw new Error('No audio file provided');
    }

    console.log('Transcribe request:', { language, fileSize: file.size });
    
    // Create a new FormData object for the OpenAI API
    const openAIFormData = new FormData();
    openAIFormData.append('file', file);
    openAIFormData.append('model', 'whisper-1');
    openAIFormData.append('language', language);
    openAIFormData.append('response_format', 'json');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: openAIFormData
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI transcription error:', errorData);
      return new Response(JSON.stringify({ 
        error: errorData.error?.message || response.statusText 
      }), { 
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const data = await response.json();
    console.log('Transcription result:', data);
    
    return new Response(JSON.stringify({
      text: data.text
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in transcribe endpoint:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
