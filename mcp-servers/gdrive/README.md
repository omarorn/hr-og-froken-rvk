# Google Drive MCP Server

This directory contains configuration for the Google Drive MCP server that integrates with Google Drive to allow listing, reading, and searching over files.

## Features

- **Search files** in Google Drive
- **Read files** from Google Drive (with automatic format conversions for Google Workspace files)

## Setup

This server has been configured in the Claude settings using the NPX deployment method:

```json
{
  "mcpServers": {
    "github.com/modelcontextprotocol/servers/tree/main/src/gdrive": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-gdrive"
      ],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

## Authentication

For authentication, this server requires:

1. A Google Cloud project with Drive API enabled
2. OAuth consent screen configured with appropriate scopes
3. OAuth client credentials 
4. A completed authentication flow

Authentication steps:
1. Create a new Google Cloud project at https://console.cloud.google.com/projectcreate
2. Enable the Google Drive API at https://console.cloud.google.com/workspace-api/products
3. Configure an OAuth consent screen at https://console.cloud.google.com/apis/credentials/consent
4. Add OAuth scope `https://www.googleapis.com/auth/drive.readonly`
5. Create an OAuth Client ID for application type "Desktop App"
6. Download the JSON file of your client's OAuth keys
7. Run authentication command to complete the flow

## Usage

Once authenticated, this server provides the following capabilities:

### Tools
- **search**: Search for files in Google Drive by query

### Resources
- Access files via URI: `gdrive:///<file_id>`
- Google Workspace files are automatically exported:
  - Docs → Markdown
  - Sheets → CSV
  - Presentations → Plain text
  - Drawings → PNG

See the official repo for more information: https://github.com/modelcontextprotocol/servers/tree/main/src/gdrive
