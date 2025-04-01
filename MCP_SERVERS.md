# MCP Servers Documentation

## Overview

This document provides information about the Model Context Protocol (MCP) servers used in the Rosa Munnlegur Fjola Project. MCP servers extend the capabilities of AI assistants by providing tools and resources for specific tasks.

## Installed MCP Servers

### 1. Code MCP (@block/code-mcp)

**Purpose**: Provides code-related operations and utilities.

**Usage**:
```typescript
// Example of using the Code MCP server
import { useCodeMCP } from '@/hooks/useMCP';

function CodeComponent() {
  const { formatCode, analyzeCode } = useCodeMCP();
  
  const formattedCode = formatCode(myCode, 'typescript');
  const analysis = analyzeCode(myCode);
  
  return (
    // Component implementation
  );
}
```

### 2. Google Suite MCP (@rishipradeep-think41/gsuite-mcp)

**Purpose**: Provides integration with Google Suite applications (Gmail, Drive, Calendar, etc.).

**Usage**:
```typescript
// Example of using the Google Suite MCP server
import { useGSuiteMCP } from '@/hooks/useMCP';

function CalendarComponent() {
  const { getEvents, createEvent } = useGSuiteMCP();
  
  const events = getEvents({ startDate: new Date(), endDate: new Date() });
  
  return (
    // Component implementation
  );
}
```

### 3. Supabase MCP (Custom)

**Purpose**: Provides database operations for Supabase integration.

**Available Tools**:
- `read_rows`: Read rows from a Supabase table
- `create_record`: Create a new record in a Supabase table
- `update_record`: Update an existing record in a Supabase table
- `delete_record`: Delete a record from a Supabase table

**Usage**:
```typescript
// Example of using the Supabase MCP server
import { useSupabaseMCP } from '@/hooks/useMCP';

function DataComponent() {
  const { readRows, createRecord } = useSupabaseMCP();
  
  const data = readRows({ table: 'conversations' });
  const newRecord = createRecord({ 
    table: 'conversations', 
    record: { user: 'user1', message: 'Hello' } 
  });
  
  return (
    // Component implementation
  );
}
```

## Running MCP Servers

### Supabase MCP Server

The custom Supabase MCP server can be run using Docker or directly with Python:

**Using Docker**:
```bash
# Build the Docker image
docker build -t mcp/supabase ./mcp-servers/supabase-mcp

# Run the Docker container
docker run -p 8000:8000 mcp/supabase
```

**Using Python**:
```bash
# Create and activate a virtual environment
python -m venv .venv
.\.venv\Scripts\activate

# Install dependencies
pip install fastmcp

# Run the server
python mcp-servers/supabase-mcp/server.py
```

## Configuration

MCP servers are configured in the `.roo/mcp.json` file:

```json
{
  "mcpServers": {
    "supabase": {
      "serverUrl": "ws://localhost:8000",
      "tools": [
        "read_rows",
        "create_record",
        "update_record",
        "delete_record"
      ],
      "description": "Custom Supabase MCP server for database operations",
      "dockerImage": "mcp/supabase"
    }
  }
}
```

## Troubleshooting

If you encounter issues with MCP servers:

1. Check that the server is running and accessible
2. Verify that the configuration in `.roo/mcp.json` is correct
3. Check the server logs for error messages
4. Ensure that required environment variables are set

## Future Improvements

- Add authentication for MCP servers
- Implement caching for frequently used operations
- Create more comprehensive error handling
- Add unit tests for MCP server tools