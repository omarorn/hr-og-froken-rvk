const WebSocket = require('ws');

function transcribeStream(audioStreamUrl, callback) {
    const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
    const deepgramSocket = new WebSocket(
        'wss://api.deepgram.com/v1/listen',
        {
            headers: { Authorization: `Token ${DEEPGRAM_API_KEY}` }
        }
    );

    deepgramSocket.on('open', () => {
        console.log('Connected to Deepgram');
    });

    deepgramSocket.on('message', (message) => {
        const data = JSON.parse(message);
        const transcript = data.channel?.alternatives[0]?.transcript;
        if (transcript) {
            callback(transcript);
        }
    });

    deepgramSocket.on('close', () => console.log('Deepgram connection closed'));
    deepgramSocket.on('error', (e) => console.error('Deepgram error:', e));

    return deepgramSocket;
}

module.exports = transcribeStream;
