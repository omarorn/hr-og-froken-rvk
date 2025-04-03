
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import OpenAI from "https://esm.sh/openai@4.28.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, messages, assistantId, threadId, message, voice, instructions } = await req.json();
    
    // Get API key from environment variable
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    console.log(`Processing ${action} request`);
    
    // Handle different actions
    switch (action) {
      case 'createAssistant':
        // Create a new assistant optimized for Icelandic language support
        const assistant = await openai.beta.assistants.create({
          name: "Reykjavík Voice Assistant",
          instructions: 
            "You are a helpful assistant for Reykjavíkurborg (Reykjavik City). " +
            "Respond to questions about city services, facilities, and local information. " +
            "Be friendly, helpful, and concise. Always respond in Icelandic. " +
            "Use the warm, professional tone of a 1960s FM radio DJ or telephone operator.",
          tools: [{ type: "retrieval" }],
          model: "gpt-4o-mini",
        });
        
        return new Response(JSON.stringify({ assistantId: assistant.id }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      case 'createThread':
        // Create a new conversation thread
        const thread = await openai.beta.threads.create();
        return new Response(JSON.stringify({ threadId: thread.id }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      case 'sendMessage':
        if (!threadId) {
          throw new Error('Thread ID is required');
        }
        
        if (!message) {
          throw new Error('Message is required');
        }
        
        // Add the user message to the thread
        await openai.beta.threads.messages.create(threadId, {
          role: "user",
          content: message
        });
        
        // Run the assistant on the thread
        const run = await openai.beta.threads.runs.create(threadId, {
          assistant_id: assistantId,
        });
        
        // Poll for completion
        let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
        
        console.log(`Run status: ${runStatus.status}`);
        
        // Poll until the run completes
        while (runStatus.status === "queued" || runStatus.status === "in_progress") {
          // Wait for 1 second before checking again
          await new Promise(resolve => setTimeout(resolve, 1000));
          runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
          console.log(`Updated run status: ${runStatus.status}`);
        }
        
        if (runStatus.status !== "completed") {
          throw new Error(`Run ended with status: ${runStatus.status}`);
        }
        
        // Get messages from the thread (latest first)
        const messageList = await openai.beta.threads.messages.list(threadId);
        
        // Get the first (most recent) message from the assistant
        const assistantMessages = messageList.data.filter(msg => msg.role === "assistant");
        if (assistantMessages.length === 0) {
          throw new Error("No assistant response found");
        }
        
        const latestMessage = assistantMessages[0];
        const responseText = latestMessage.content[0].type === "text" 
          ? latestMessage.content[0].text.value 
          : "No text response received";
          
        return new Response(JSON.stringify({ 
          text: responseText,
          messageId: latestMessage.id
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      case 'textToSpeech':
        if (!message) {
          throw new Error('Text is required for speech generation');
        }
        
        // Use default DJ instructions if none provided
        const defaultInstructions = "Speak in the style of a 1960s telephone operator or mission control technician with subtle electronic processing reminiscent of Knight Rider's computer voice. Professional, clear and futuristic. Use clear Icelandic pronunciation for characters like þ, ð, æ.";
        
        // Generate speech using the TTS API
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini-tts',
            voice: voice || 'nova',
            input: message,
            instructions: instructions || defaultInstructions,
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
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Error in assistants endpoint:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
