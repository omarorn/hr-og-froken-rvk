# Documentation Tasks

## Project Overview
- [x] Create README with project description
- [x] Document technology stack
- [ ] Add architecture diagram

## Core Components
- [x] Document App component structure
- [x] Document routing setup
- [x] Document state management (React Query)

## UI Components
- [x] Document shadcn/ui component usage
- [x] Document custom components:
  - [x] VoiceAssistant
  - [x] VoiceButton
  - [x] VoiceVisualizer
  - [x] ApiKeyModal

## Services
- [x] Document openAiService

## Configuration
- [x] Document Vite setup
- [x] Document Tailwind configuration
- [x] Document TypeScript setup

## Development
- [x] Document scripts in package.json
- [x] Document ESLint setup
- [x] Document PostCSS setup

## MCP Server Tasks
- [x] Install required MCP servers (@block/code-mcp, @rishipradeep-think41/gsuite-mcp)
- [x] Create custom Supabase MCP server
- [x] Configure MCP servers in .roo/mcp.json
- [ ] Test MCP server integration with coder assistant
- [ ] Create unit tests for MCP server tools
- [ ] Add error handling for MCP server connections
- [ ] Document MCP server usage in the application

## Reykjavík Open Data Portal Reference
This section catalogs available resources from [Reykjavík's open data portal](https://gagnahladbord.reykjavik.is/).

### API Endpoints

| API Name | Description | Format | Authentication | URL |
|----------|-------------|--------|---------------|-----|
| Staðsetningar | Location data for city services | JSON | None | https://gagnahladbord.reykjavik.is/api/stadsetningar |
| Borgarsjá | City view mapping data | GeoJSON | None | https://borgarsja.reykjavik.is/api |
| Strætó API | Real-time bus information | JSON | API Key | https://straeto.is/api |
| Veður API | Weather data | JSON | None | https://vedurstofan.is/api |
| Umferð API | Traffic information | JSON | None | https://umferd.is/api |

### Downloadable Datasets

| Dataset Name | Description | Format | Last Updated | URL |
|--------------|-------------|--------|-------------|-----|
| Íbúafjöldi | Population data by neighborhood | CSV, Excel | 2023-05-15 | https://gagnahladbord.reykjavik.is/dataset/ibuafjoldi |
| Fjárhagsáætlun | City budget | Excel, PDF | 2023-01-10 | https://gagnahladbord.reykjavik.is/dataset/fjarhagsaaetlun |
| Fasteignaverð | Real estate prices | CSV | 2023-06-01 | https://gagnahladbord.reykjavik.is/dataset/fasteignaverd |
| Loftgæði | Air quality measurements | CSV, JSON | 2023-07-01 | https://gagnahladbord.reykjavik.is/dataset/loftgaedi |
| Gönguleiðir | Walking paths | GeoJSON, KML | 2022-09-20 | https://gagnahladbord.reykjavik.is/dataset/gonguleidir |
| Hjólaleiðir | Bicycle routes | GeoJSON, KML | 2022-09-20 | https://gagnahladbord.reykjavik.is/dataset/hjolaleidir |
| Opin svæði | Open areas and parks | GeoJSON, SHP | 2022-05-12 | https://gagnahladbord.reykjavik.is/dataset/opinsvædi |
| Leikskólar | Preschool data | CSV | 2023-02-10 | https://gagnahladbord.reykjavik.is/dataset/leikskoalar |
| Grunnskólar | Elementary school data | CSV | 2023-02-10 | https://gagnahladbord.reykjavik.is/dataset/grunnskoalar |

**Note:** The URLs, dates, and some details provided are placeholders. Please verify the actual endpoints and datasets on the [Reykjavík open data portal](https://gagnahladbord.reykjavik.is/).

### Integration Tasks
- [ ] Research authentication requirements for protected APIs
- [ ] Create API connector utilities for commonly used endpoints
- [ ] Document rate limits and usage restrictions
- [ ] Set up automated data synchronization for frequently changing datasets
- [ ] Create data transformation utilities for non-standard formats
