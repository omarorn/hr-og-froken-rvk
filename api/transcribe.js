
// Edge function for audio transcription
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const formData = new FormData();
    
    // Get the file from the request
    const file = req.body.get('file');
    const language = req.body.get('language') || 'is';
    
    formData.append('file', file);
    formData.append('model', 'whisper-1');
    formData.append('language', language);
    formData.append('response_format', 'json');

    console.log('Processing transcription request', { language });

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return res.status(response.status).json({ 
        error: errorData.error?.message || response.statusText 
      });
    }

    const data = await response.json();
    console.log('Transcription result:', data.text);
    
    return res.status(200).json({
      text: data.text
    });
  } catch (error) {
    console.error('Error in transcribe endpoint:', error);
    return res.status(500).json({ error: 'Error processing request' });
  }
}
