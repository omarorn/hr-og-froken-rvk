
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, model, temperature, max_tokens } = await req.json();
    
    console.log('Chat request:', { model, temperature, max_tokens, messageCount: messages?.length });
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages,
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 500
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI chat error:', errorData);
      return new Response(JSON.stringify({ 
        error: errorData.error?.message || response.statusText 
      }), { 
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    const data = await response.json();
    console.log('Chat response received');
    
    return new Response(JSON.stringify({
      content: data.choices[0].message.content
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
