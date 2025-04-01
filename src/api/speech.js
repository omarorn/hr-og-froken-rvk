
// Edge function for text-to-speech
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, voice, instructions } = req.body;
    
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        voice: voice || 'coral',
        input: text,
        instructions: instructions || "Speak in the style of a 1960s telephone operator or mission control technician with subtle electronic processing reminiscent of Knight Rider's computer voice. Professional, clear and futuristic.",
        response_format: 'mp3'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: errorText };
      }
      
      return res.status(response.status).json({ 
        error: errorData.error?.message || response.statusText 
      });
    }

    const audioBuffer = await response.arrayBuffer();
    
    res.setHeader('Content-Type', 'audio/mpeg');
    return res.send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error('Error in speech endpoint:', error);
    return res.status(500).json({ error: 'Error processing request' });
  }
}
