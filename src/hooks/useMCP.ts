/// <reference types="react" />
import { useState, useEffect } from 'react';

// Define types for MCP server tools
interface SupabaseMCPTools {
  readRows: (params: { table: string }) => Promise<any>;
  createRecord: (params: { table: string, record: any }) => Promise<any>;
  updateRecord: (params: { table: string, id: number, record: any }) => Promise<any>;
  deleteRecord: (params: { table: string, id: number }) => Promise<any>;
}

interface CodeMCPTools {
  formatCode: (code: string, language: string) => Promise<string>;
  analyzeCode: (code: string) => Promise<any>;
}

interface GSuiteMCPTools {
  getEvents: (params: { startDate: Date, endDate: Date }) => Promise<any[]>;
  createEvent: (params: { summary: string, start: Date, end: Date, attendees?: string[] }) => Promise<any>;
  listEmails: (params: { maxResults?: number, query?: string }) => Promise<any[]>;
  sendEmail: (params: { to: string, subject: string, body: string }) => Promise<any>;
}

// MCP server connection status
interface MCPServerStatus {
  connected: boolean;
  error?: string;
}

/**
 * Hook for using the Supabase MCP server
 * @returns Tools for interacting with Supabase database
 */
export const useSupabaseMCP = (): SupabaseMCPTools & { status: MCPServerStatus } => {
  const [status, setStatus] = useState<MCPServerStatus>({ connected: false });

  useEffect(() => {
    // Check if the Supabase MCP server is running
    const checkServerStatus = async () => {
      try {
        // Simple ping to check if server is running
        const response = await fetch('http://localhost:8000/ping');
        if (response.ok) {
          setStatus({ connected: true });
        } else {
          setStatus({ connected: false, error: 'Server returned non-OK response' });
        }
      } catch (error) {
        console.error('Failed to connect to Supabase MCP server:', error);
        setStatus({ connected: false, error: error.message });
      }
    };

    checkServerStatus();
    // Check server status every 30 seconds
    const interval = setInterval(checkServerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Read rows from a Supabase table
   * @param params Parameters for reading rows
   * @returns Promise with the rows data
   */
  const readRows = async (params: { table: string }): Promise<any> => {
    try {
      const response = await fetch('http://localhost:8000/tools/read_rows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Failed to read rows: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error reading rows:', error);
      throw error;
    }
  };

  /**
   * Create a record in a Supabase table
   * @param params Parameters for creating a record
   * @returns Promise with the created record
   */
  const createRecord = async (params: { table: string, record: any }): Promise<any> => {
    try {
      const response = await fetch('http://localhost:8000/tools/create_record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Failed to create record: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating record:', error);
      throw error;
    }
  };

  /**
   * Update a record in a Supabase table
   * @param params Parameters for updating a record
   * @returns Promise with the updated record
   */
  const updateRecord = async (params: { table: string, id: number, record: any }): Promise<any> => {
    try {
      const response = await fetch('http://localhost:8000/tools/update_record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Failed to update record: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating record:', error);
      throw error;
    }
  };

  /**
   * Delete a record from a Supabase table
   * @param params Parameters for deleting a record
   * @returns Promise with the deletion status
   */
  const deleteRecord = async (params: { table: string, id: number }): Promise<any> => {
    try {
      const response = await fetch('http://localhost:8000/tools/delete_record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete record: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting record:', error);
      throw error;
    }
  };

  return {
    readRows,
    createRecord,
    updateRecord,
    deleteRecord,
    status
  };
};

/**
 * Hook for using the Code MCP server
 * @returns Tools for code-related operations
 */
export const useCodeMCP = (): CodeMCPTools & { status: MCPServerStatus } => {
  const [status, setStatus] = useState<MCPServerStatus>({ connected: false });

  // Implementation would connect to the Code MCP server
  // This is a placeholder implementation
  const formatCode = async (code: string, language: string): Promise<string> => {
    return code; // Placeholder
  };

  const analyzeCode = async (code: string): Promise<any> => {
    return {}; // Placeholder
  };

  return {
    formatCode,
    analyzeCode,
    status: { connected: true } // Placeholder
  };
};

/**
 * Hook for using the Google Suite MCP server
 * @returns Tools for Google Suite operations
 */
export const useGSuiteMCP = (): GSuiteMCPTools & { status: MCPServerStatus } => {
  const [status, setStatus] = useState<MCPServerStatus>({ connected: false });

  // Implementation would connect to the Google Suite MCP server
  // This is a placeholder implementation
  const getEvents = async (params: { startDate: Date, endDate: Date }): Promise<any[]> => {
    return []; // Placeholder
  };

  const createEvent = async (params: { summary: string, start: Date, end: Date, attendees?: string[] }): Promise<any> => {
    return {}; // Placeholder
  };

  const listEmails = async (params: { maxResults?: number, query?: string }): Promise<any[]> => {
    return []; // Placeholder
  };

  const sendEmail = async (params: { to: string, subject: string, body: string }): Promise<any> => {
    return {}; // Placeholder
  };

  return {
    getEvents,
    createEvent,
    listEmails,
    sendEmail,
    status: { connected: true } // Placeholder
  };
};

/**
 * Main hook for accessing all MCP servers
 * @returns Object containing all MCP server hooks
 */
export const useMCP = () => {
  const supabaseMCP = useSupabaseMCP();
  const codeMCP = useCodeMCP();
  const gSuiteMCP = useGSuiteMCP();

  return {
    supabaseMCP,
    codeMCP,
    gSuiteMCP
  };
};