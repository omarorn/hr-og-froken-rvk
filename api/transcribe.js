
// Edge function for audio transcription
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the file from the request
    const file = req.body.get('file');
    
    if (!file) {
      console.error('No file received in request');
      return res.status(400).json({ error: 'No file received' });
    }
    
    const language = req.body.get('language') || 'is'; // Default to Icelandic
    
    console.log('Processing transcription request', { 
      language, 
      fileType: file.type,
      fileSize: file.size 
    });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', 'whisper-1');
    formData.append('language', language);
    formData.append('response_format', 'json');

    // Add more detailed logging
    console.log('Sending request to OpenAI API with language:', language);
    
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(e => ({ error: { message: 'Failed to parse error response' } }));
      console.error('OpenAI API error:', errorData);
      return res.status(response.status).json({ 
        error: errorData.error?.message || response.statusText,
        status: response.status
      });
    }

    const data = await response.json();
    console.log('Transcription result:', data.text);
    
    return res.status(200).json({
      text: data.text
    });
  } catch (error) {
    console.error('Error in transcribe endpoint:', error.message, error.stack);
    return res.status(500).json({ error: 'Error processing request: ' + error.message });
  }
}
