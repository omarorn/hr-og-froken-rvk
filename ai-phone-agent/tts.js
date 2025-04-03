const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function speak(text) {
    const voice = 'nova'; // Icelandic-compatible voice
    const response = await axios.post(
        'https://api.openai.com/v1/audio/speech',
        {
            model: 'tts-1',
            voice,
            input: text
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            responseType: 'arraybuffer',
        }
    );

    const outputPath = path.join(__dirname, 'response.mp3');
    fs.writeFileSync(outputPath, response.data);
    return outputPath;
}

module.exports = speak;
