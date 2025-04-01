
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
- **Usage Example**:
```typescript
const audioData = await getTextToSpeech(
  "Góðan dag", 
  "nova", 
  "Speak with Icelandic accent"
);
// Use the audioData with an audio element
```

#### `transcribeAudio(audioBlob: Blob): Promise<string>`
Transcribes audio to text using Whisper via edge function
- **Parameters**:
  - `audioBlob`: Audio recording as Blob
- **Returns**: Transcribed text
- **Throws**: Error if API request fails
- **Usage Example**:
```typescript
// After recording audio
const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
const text = await transcribeAudio(audioBlob);
console.log("Transcribed text:", text);
```

## chatService

### Functions
#### `sendChatMessage(message: string, history?: any[]): Promise<ChatResponse>`
Sends a message to OpenAI's Chat API via edge function and receives a response
- **Parameters**:
  - `message`: The user's message to send to the AI
  - `history`: Optional conversation history for context
- **Returns**: Promise with the AI's response text
- **Throws**: Error if API request fails
- **Usage Example**:
```typescript
const response = await sendChatMessage(
  "Hvar eru sundlaugarnar í Reykjavík?",
  previousMessages
);
console.log("AI response:", response.text);
```

## messageService

### Hook: useMessageService
Manages conversation state and history
- **Parameters**:
  - `gender`: 'female' | 'male'
- **Returns**:
  - `messages`: Array of message objects
  - `isProcessing`: Boolean indicating if a message is being processed
  - `setIsProcessing`: Function to update processing state
  - `addMessage`: Function to add a new message
  - `handleUserMessage`: Function to process a user message
  - `setInitialGreeting`: Function to set initial greeting
- **Usage Example**:
```typescript
const { 
  messages, 
  handleUserMessage 
} = useMessageService('female');

// When user sends a message
const response = await handleUserMessage("Hæ, hvernig get ég hjálpað þér?");
```

## Edge Functions

The application uses edge functions to securely handle API calls to OpenAI:

### `/api/chat`
Handles chat completions using OpenAI's GPT-4o-mini model
- **Method**: POST
- **Parameters**: messages, model, temperature, max_tokens
- **Returns**: AI response text
- **Error Handling**: Returns status codes with error details

### `/api/speech`
Converts text to speech using OpenAI's TTS API
- **Method**: POST
- **Parameters**: text, voice, instructions
- **Returns**: MP3 audio
- **Error Handling**: Returns status codes with error details

### `/api/transcribe`
Transcribes audio using OpenAI's Whisper model
- **Method**: POST
- **Parameters**: file (audio blob), language
- **Returns**: Transcribed text
- **Error Handling**: Returns status codes with error details

## Error Handling
All services implement robust error handling with:
- Detailed error logging
- User-friendly error messages
- Fallback mechanisms
- Retry logic for transient failures

## Performance Considerations
- All API calls are made via edge functions to reduce latency
- Audio processing is optimized for size and quality
- Response caching is implemented for frequent queries
