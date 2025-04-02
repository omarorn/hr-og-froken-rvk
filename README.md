# Voice Assistant Project

## Overview
This project is a voice assistant application built with React and Vite that integrates OpenAI for transcription and conversation management. It features voice recording, playback, and transcription services, along with a dynamic UI and an optional gender toggle for the assistant.

## Features
- Basic voice recording and playback functionality
- Integration with OpenAI API for transcription and conversation management
- User-friendly voice assistant UI with interactive controls
- MCP Server integration for enhanced functionalities:
  - Custom Supabase MCP server for database operations (read, create, update, delete records)
  - Code MCP and Google Suite MCP integration available in configuration
- Error handling and logging improvements

## Current Status
- Core functionalities deployed and tested
- MCP server integration verified and documented
- Ongoing improvements:
  - **Loading States & User Feedback**: Need to improve UI loading states.
  - **Audio Processing Optimization**: Future work to boost performance.
  - **Session Persistence**: Implementation pending.
  - **Language Switching**: Support for Icelandic and English under development.
  - **Automated Tests & Analytics**: Planned for future release.
  - **Caching Strategies**: To be implemented.

## Project Tasks
For a detailed list of tasks and progress, refer to [TASK.md](TASK.md) and [todo.md](todo.md).

## Setup Instructions
1. Clone the repository.
2. Install dependencies using the appropriate package manager.
3. Start the development server:
   ```
   npm run dev
   ```
4. For MCP server testing, ensure Docker is running or use the provided virtual environment.

## Future Enhancements
- Polished UI with complete interaction flow
- Production-ready application with robust error handling and optimizations
- Multilingual support and advanced features including voice analytics and caching

## License
[MIT](LICENSE)
