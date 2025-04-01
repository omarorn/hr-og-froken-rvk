
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
    const { text, voice, instructions } = await req.json();
    
    if (!text) {
      throw new Error('Text is required');
    }

    console.log('Speech request:', { text, voice, instructions });
    
    // Get API key from environment variable
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        voice: voice || 'coral',
        input: text,
        instructions: instructions || "Speak in a clear, natural tone with appropriate emotion.",
        response_format: 'mp3'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI speech error:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: errorText };
      }
      
      return new Response(JSON.stringify({ 
        error: errorData.error?.message || response.statusText 
      }), { 
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Get audio data as ArrayBuffer
    const audioBuffer = await response.arrayBuffer();
    
    // Create a safe base64 encoding function
    const toBase64 = (buffer: ArrayBuffer): string => {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      const chunkSize = 1024;
      
      // Process in chunks to avoid call stack issues
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.slice(i, Math.min(i + chunkSize, bytes.length));
        for (let j = 0; j < chunk.length; j++) {
          binary += String.fromCharCode(chunk[j]);
        }
      }
      
      return btoa(binary);
    };
    
    const base64Audio = toBase64(audioBuffer);
    
    return new Response(JSON.stringify(base64Audio), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('Error in speech endpoint:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
