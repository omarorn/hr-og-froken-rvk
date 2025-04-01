
# Project Planning

## Project Overview
This is a voice-enabled web application for the city of Reykjavík that allows users to interact with an AI assistant (Rósa or Birkir) using voice input and output in Icelandic.

## Architecture
- **Frontend**: React 18 with TypeScript, Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query
- **Voice Services**: OpenAI TTS/Whisper APIs
- **Conversational AI**: OpenAI GPT-4o-mini API
- **Backend**: Supabase for edge functions and API integrations

## Tech Stack
- React 18, TypeScript
- Vite (build tool)
- Tailwind CSS
- Shadcn UI components
- OpenAI Voice and Language APIs
- Supabase

## Constraints
- Support for Icelandic language
- Responsive design for all devices
- Accessibility compliance
- Edge functions for API calls to ensure security

## File Structure Guidelines
- Keep files under 500 lines of code
- Create separate components for UI elements
- Use hooks for reusable logic
- Extract services for API calls and data processing
- Organize by feature when possible

## Naming Conventions
- PascalCase for components
- camelCase for variables, functions, and instances
- Use descriptive names that reflect purpose
- Prefix hooks with "use"
- Suffix services with "Service"

## Code Style
- Use TypeScript interfaces for all props and state
- Prefer functional components with hooks
- Use async/await for asynchronous operations
- Add comments for complex logic
- Create reusable custom hooks for shared functionality
