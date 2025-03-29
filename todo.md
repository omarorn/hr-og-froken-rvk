# Documentation Tasks

## Project Overview
- [ ] Create README with project description
- [ ] Document technology stack
- [ ] Add architecture diagram

## Core Components
- [ ] Document App component structure
- [ ] Document routing setup
- [ ] Document state management (React Query)

## UI Components
- [ ] Document shadcn/ui component usage
- [ ] Document custom components:
  - [ ] VoiceAssistant
  - [ ] VoiceButton
  - [ ] VoiceVisualizer
  - [ ] ApiKeyModal

## Services
- [ ] Document openAiService

## Configuration
- [ ] Document Vite setup
- [ ] Document Tailwind configuration
- [ ] Document TypeScript setup

## Development
- [ ] Document scripts in package.json
- [ ] Document ESLint setup
- [ ] Document PostCSS setup

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
