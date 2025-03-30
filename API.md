
# API Service Documentation

## openAiService

### Functions
#### `getTextToSpeech(text: string, voice?: string, instructions?: string): Promise<ArrayBuffer>`
Converts text to speech using OpenAI's TTS API via edge function
- **Parameters**:
  - `text`: Input text to convert
  - `voice`: Optional voice type (default: 'alloy')
  - `instructions`: Optional pronunciation instructions
- **Returns**: MP3 audio as ArrayBuffer
- **Throws**: Error if API request fails

#### `transcribeAudio(audioBlob: Blob): Promise<string>`
Transcribes audio to text using Whisper via edge function
- **Parameters**:
  - `audioBlob`: Audio recording as Blob
- **Returns**: Transcribed text
- **Throws**: Error if API request fails

## chatService

### Functions
#### `sendChatMessage(message: string, history?: any[]): Promise<ChatResponse>`
Sends a message to OpenAI's Chat API via edge function and receives a response
- **Parameters**:
  - `message`: The user's message to send to the AI
  - `history`: Optional conversation history for context
- **Returns**: Promise with the AI's response text
- **Throws**: Error if API request fails

## Edge Functions

The application uses edge functions to securely handle API calls to OpenAI:

### `/api/chat`
Handles chat completions using OpenAI's GPT-4o-mini model
- **Method**: POST
- **Parameters**: messages, model, temperature, max_tokens
- **Returns**: AI response text

### `/api/speech`
Converts text to speech using OpenAI's TTS API
- **Method**: POST
- **Parameters**: text, voice, instructions
- **Returns**: MP3 audio

### `/api/transcribe`
Transcribes audio using OpenAI's Whisper model
- **Method**: POST
- **Parameters**: file (audio blob), language
- **Returns**: Transcribed text

## Requirements
- Edge function deployment with OpenAI API key set as environment variable `OPENAI_API_KEY`
- Internet connection to access OpenAI endpoints

## Example Usage
```tsx
import { getTextToSpeech, transcribeAudio } from '@/services/openAiService';
import { sendChatMessage } from '@/services/chatService';

// Text-to-speech
const audio = await getTextToSpeech('Hello world', 'nova');

// Speech-to-text 
const transcription = await transcribeAudio(recordingBlob);

// Chat completion
const response = await sendChatMessage('What services does Reykjavík offer?', previousMessages);
```

## Error Handling
- All functions throw errors that should be caught and handled
- Common errors:
  - Network issues
  - API quota limits
  - Invalid formats
