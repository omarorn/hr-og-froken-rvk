# Smithery Registry API Guide

## Overview

This document provides a comprehensive guide to the Smithery Registry API, which can be used to search for and connect to Model Context Protocol (MCP) servers. The Smithery Registry indexes available MCP servers and provides information about their capabilities, connection requirements, and deployment status.

## API Endpoints

### 1. List Servers

**Endpoint:** `GET https://registry.smithery.ai/servers`

**Query Parameters:**
- `q`: Search query (semantic search)
- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 10)

**Filtering Syntax:**
- Text search: `"machine learning"`
- Owner filter: `owner:username`
- Repository filter: `repo:repository-name`
- Deployment status: `is:deployed`
- Combined example: `"owner:smithery-ai repo:fetch is:deployed machine learning"`

**Response Schema:**
```typescript
{
  servers: Array<{
    qualifiedName: string;
    displayName: string;
    description: string;
    homepage: string;
    useCount: string;
    isDeployed: boolean;
    createdAt: string;
  }>;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
  };
}
```

### 2. Get Server Details

**Endpoint:** `GET https://registry.smithery.ai/servers/{qualifiedName}`

**Response Schema:**
```typescript
{
  qualifiedName: string;
  displayName: string;
  deploymentUrl: string;
  connections: Array<{
    type: string;
    url?: string;
    configSchema: JSONSchema;
  }>;
}
```

## WebSocket Connection

- **URL Format:** `https://server.smithery.ai/${qualifiedName}/ws?config=${base64encode(config)}`
- Config must comply with server's configSchema
- Config is base64-encoded JSON

## TypeScript SDK Usage

```typescript
import { WebSocketClientTransport } from "@modelcontextprotocol/sdk/client/websocket.js"
import { createSmitheryUrl } from "@smithery/sdk/config.js"

const url = createSmitheryUrl(
  "https://your-smithery-mcp-server/ws",
  {
    // config object matching schema
  },
)
const transport = new WebSocketClientTransport(url)
```

## Implementation Plan for Our Project

### 1. Search for Available MCP Servers

We can enhance our existing `smitheryService.ts` to provide more comprehensive search capabilities:

```typescript
// Enhanced search function with better filtering
export const searchServersWithFilters = async (
  options: {
    text?: string;
    owner?: string;
    repo?: string;
    isDeployed?: boolean;
    page?: number;
    pageSize?: number;
  }
): Promise<SearchResponse> => {
  const { text, owner, repo, isDeployed, page = 1, pageSize = 10 } = options;
  
  // Build query string
  let query = "";
  if (text) query += `"${text}" `;
  if (owner) query += `owner:${owner} `;
  if (repo) query += `repo:${repo} `;
  if (isDeployed) query += `is:deployed `;
  
  // Trim extra spaces
  query = query.trim();
  
  return searchServers(query, page, pageSize);
};
```

### 2. Search for Supabase-Related MCP Servers

To find Supabase-related MCP servers that might be useful for our project:

```typescript
// Search for Supabase-related servers
export const searchSupabaseServers = async (
  page: number = 1,
  pageSize: number = 10
): Promise<SearchResponse> => {
  return searchServersWithFilters({
    text: "supabase database",
    isDeployed: true,
    page,
    pageSize
  });
};
```

### 3. Connect to a Smithery MCP Server

Once we've found a suitable server, we can connect to it:

```typescript
import { WebSocketClientTransport } from "@modelcontextprotocol/sdk/client/websocket.js";
import { createSmitheryUrl } from "@smithery/sdk/config.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

export const connectToSmitheryServer = async (
  serverDetails: ServerDetail,
  config: any
): Promise<Client> => {
  // Find WebSocket connection
  const wsConnection = serverDetails.connections.find(c => c.type === "ws");
  if (!wsConnection || !wsConnection.url) {
    throw new Error("No WebSocket connection available for this server");
  }
  
  // Create connection URL with config
  const url = createSmitheryUrl(wsConnection.url, config);
  
  // Create transport and connect
  const transport = new WebSocketClientTransport(url);
  const client = new Client();
  await client.connect(transport);
  
  return client;
};
```

### 4. Create a Supabase MCP Server

If we don't find a suitable existing Supabase MCP server, we can create our own using the Model Context Protocol SDK. This would involve:

1. Setting up a new project with the MCP SDK
2. Implementing tools for Supabase database operations
3. Deploying the server
4. Registering it with the Smithery Registry

## Next Steps

1. **Explore Available Servers**: Search the Smithery Registry for existing Supabase or database-related MCP servers
2. **Evaluate Existing Servers**: If suitable servers exist, evaluate their capabilities and connection requirements
3. **Create Custom Server**: If no suitable servers exist, create a custom Supabase MCP server
4. **Integration**: Integrate the chosen or created MCP server with our Reykjavík voice assistant project

## Key Concepts

- **Smithery Registry**: Indexes MCP servers and provides information about their capabilities
- **Server Configuration**: Each server has a configuration schema defining connection requirements
- **Connection Types**: Servers can support "ws" (WebSocket) or "stdio" connections
- **API Status**: The Smithery API is under development and may change

## Resources

- [Smithery Registry](https://registry.smithery.ai/)
- [Model Context Protocol Documentation](https://modelcontextprotocol.github.io/)
- [Smithery SDK Documentation](https://smithery.ai/docs)