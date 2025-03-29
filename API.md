# API Service Documentation

## openAiService

### Functions
#### `getTextToSpeech(text: string, voice?: string, instructions?: string): Promise<ArrayBuffer>`
Converts text to speech using OpenAI's TTS API
- **Parameters**:
  - `text`: Input text to convert
  - `voice`: Optional voice type (default: 'alloy')
  - `instructions`: Optional pronunciation instructions
- **Returns**: MP3 audio as ArrayBuffer
- **Throws**: Error if API key missing or API request fails

#### `transcribeAudio(audioBlob: Blob): Promise<string>`
Transcribes audio to text using Whisper
- **Parameters**:
  - `audioBlob`: Audio recording as Blob
- **Returns**: Transcribed text
- **Throws**: Error if API key missing or API request fails

## Requirements
- OpenAI API key stored in localStorage under 'openai_api_key'
- Internet connection to access OpenAI endpoints

## Example Usage
```tsx
import { getTextToSpeech, transcribeAudio } from '@/services/openAiService';

// Text-to-speech
const audio = await getTextToSpeech('Hello world', 'nova');

// Speech-to-text 
const transcription = await transcribeAudio(recordingBlob);
```

## Error Handling
- Both functions throw errors that should be caught and handled
- Common errors:
  - Missing API key
  - Network issues
  - API quota limits
  - Invalid audio formats