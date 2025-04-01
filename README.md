
# Rosa Munnlegur Fjola Project

## Project Description
Interactive voice-enabled React application for the city of Reykjavík with:
- Vite + TypeScript
- shadcn/ui components
- OpenAI voice services
- Conversational AI using OpenAI

## Technology Stack
- Frontend: React 18, TypeScript
- Styling: Tailwind CSS
- State Management: React Query
- Voice Services: OpenAI TTS/Whisper APIs
- Conversational AI: OpenAI GPT-4o-mini API
- Backend: Supabase for edge functions

## Features
- Voice input and output in Icelandic
- AI assistant characters (Rósa and Birkir)
- Conversational intelligence for city-related questions
- Real-time audio visualization
- Custom voice styling

## Getting Started
1. Install dependencies: `npm install`
2. Set OpenAI API key in settings
3. Run dev server: `npm run dev`

## Project Structure
- `/src/components` - UI components
- `/src/hooks` - Custom hooks for reusable logic
- `/src/services` - API services and data processing
- `/src/pages` - Main application pages
- `/src/integrations` - Third-party integrations (Supabase)

## Development Guidelines
- Keep files under 500 lines of code
- Create unit tests for new functionality
- Document all components and services
- Follow the TypeScript type definitions

## Voice Services
The application uses OpenAI's Text-to-Speech (TTS) and Whisper APIs for voice interaction:
- TTS converts text responses to audio
- Whisper transcribes user's voice input to text

## Conversation AI
Uses OpenAI's GPT-4o-mini model to process user queries about Reykjavík city services and provide relevant information in Icelandic.

## Contributing
See PLANNING.md for architecture details and TASK.md for current tasks and backlog.
