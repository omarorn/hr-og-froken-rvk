
const getTextToSpeech = async (text: string, voice: string = 'alloy', instructions?: string): Promise<ArrayBuffer> => {
  try {
    const openAiKey = localStorage.getItem('openai_api_key');
    
    if (!openAiKey) {
      throw new Error('OpenAI API key not found. Please set your API key in settings.');
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        voice,
        input: text,
        instructions: instructions || undefined,
        response_format: 'mp3'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error('Text-to-speech error:', error);
    throw error;
  }
};

export { getTextToSpeech };
