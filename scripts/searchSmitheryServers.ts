/// <reference types="node" />
/**
 * Script to search for servers in the Smithery Registry
 * 
 * Usage:
 * npm run search-smithery -- [options]
 * 
 * Options:
 * --query, -q       Search query text (semantic search)
 * --owner, -o       Filter by repository owner
 * --repo, -r        Filter by repository name
 * --deployed, -d    Show only deployed servers (true/false)
 * --page, -p        Page number (default: 1)
 * --size, -s        Page size (default: 10)
 * --category, -c    Filter by category (database, ai, time, weather, etc.)
 * 
 * Examples:
 * npm run search-smithery -- --query "database" --deployed true
 * npm run search-smithery -- --owner smithery-ai --repo fetch
 * npm run search-smithery -- --category database
 */

import { searchServers, getServerDetails } from "../src/services/smitheryService";
import * as fs from 'fs';
import * as path from 'path';

// Define command line arguments
interface SearchArgs {
  query?: string;
  owner?: string;
  repo?: string;
  deployed?: boolean;
  page?: number;
  size?: number;
  category?: string;
  server?: string; // For getting details of a specific server
}

// Categories for organizing servers
const CATEGORIES = {
  database: ["database", "sql", "supabase", "postgres", "mysql", "mongodb", "nosql", "db"],
  ai: ["ai", "ml", "machine learning", "model", "gpt", "llm", "openai", "huggingface"],
  time: ["time", "date", "calendar", "schedule", "clock"],
  weather: ["weather", "climate", "forecast", "temperature"],
  search: ["search", "find", "query", "lookup"],
  file: ["file", "storage", "s3", "blob", "document"],
  communication: ["message", "chat", "email", "notification", "slack", "discord"],
};

/**
 * Parse command line arguments
 */
function parseArgs(): SearchArgs {
  const args: SearchArgs = {
    page: 1,
    size: 10
  };

  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    const nextArg = process.argv[i + 1];

    if (arg === '--query' || arg === '-q') {
      args.query = nextArg;
      i++;
    } else if (arg === '--owner' || arg === '-o') {
      args.owner = nextArg;
      i++;
    } else if (arg === '--repo' || arg === '-r') {
      args.repo = nextArg;
      i++;
    } else if (arg === '--deployed' || arg === '-d') {
      args.deployed = nextArg === 'true';
      i++;
    } else if (arg === '--page' || arg === '-p') {
      args.page = parseInt(nextArg, 10);
      i++;
    } else if (arg === '--size' || arg === '-s') {
      args.size = parseInt(nextArg, 10);
      i++;
    } else if (arg === '--category' || arg === '-c') {
      args.category = nextArg;
      i++;
    } else if (arg === '--server') {
      args.server = nextArg;
      i++;
    }
  }

  return args;
}

/**
 * Build a search query string from the provided arguments
 */
function buildQueryString(args: SearchArgs): string {
  let query = '';

  // Add text query if provided
  if (args.query) {
    query += `"${args.query}" `;
  }

  // Add owner filter if provided
  if (args.owner) {
    query += `owner:${args.owner} `;
  }

  // Add repo filter if provided
  if (args.repo) {
    query += `repo:${args.repo} `;
  }

  // Add deployed filter if provided
  if (args.deployed) {
    query += 'is:deployed ';
  }

  // Add category-based keywords if provided
  if (args.category && CATEGORIES[args.category]) {
    // If no specific query is provided, add category keywords to the query
    if (!args.query) {
      const categoryKeywords = CATEGORIES[args.category].join(' OR ');
      query += `"${categoryKeywords}" `;
    }
  }

  return query.trim();
}

/**
 * Determine which category a server belongs to based on its name and description
 */
function categorizeServer(server: any): string {
  const name = server.displayName.toLowerCase();
  const desc = server.description.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    for (const keyword of keywords) {
      if (name.includes(keyword) || desc.includes(keyword)) {
        return category;
      }
    }
  }
  
  return 'other';
}

/**
 * Group servers by category
 */
function groupServersByCategory(servers: any[]): Record<string, any[]> {
  const grouped: Record<string, any[]> = {};
  
  for (const server of servers) {
    const category = categorizeServer(server);
    
    if (!grouped[category]) {
      grouped[category] = [];
    }
    
    grouped[category].push(server);
  }
  
  return grouped;
}

/**
 * Format and display server information
 */
function displayServer(server: any, detailed: boolean = false): void {
  console.log(`\n${server.displayName} (${server.qualifiedName})`);
  console.log(`${'='.repeat(server.displayName.length + server.qualifiedName.length + 3)}`);
  console.log(`Description: ${server.description}`);
  
  if (server.homepage) {
    console.log(`Homepage: ${server.homepage}`);
  }
  
  console.log(`Deployed: ${server.isDeployed ? 'Yes' : 'No'}`);
  console.log(`Usage Count: ${server.useCount || 0}`);
  console.log(`Created: ${new Date(server.createdAt).toLocaleDateString()}`);
  
  if (detailed && server.connections) {
    console.log('\nConnections:');
    for (const conn of server.connections) {
      console.log(`- Type: ${conn.type}`);
      if (conn.url) {
        console.log(`  URL: ${conn.url}`);
      }
      
      if (conn.configSchema) {
        console.log('  Config Schema:');
        console.log(`  ${JSON.stringify(conn.configSchema, null, 2).replace(/\n/g, '\n  ')}`);
      }
      console.log('');
    }
  }
}

/**
 * Save server details to a JSON file
 */
function saveServerToFile(server: any, detailed: boolean = false): void {
  const filename = `smithery-server-${server.qualifiedName.replace(/\//g, '-')}.json`;
  const filePath = path.join(process.cwd(), filename);
  
  fs.writeFileSync(
    filePath,
    JSON.stringify(detailed ? server : { 
      qualifiedName: server.qualifiedName,
      displayName: server.displayName,
      description: server.description,
      isDeployed: server.isDeployed,
      homepage: server.homepage,
      useCount: server.useCount,
      createdAt: server.createdAt
    }, null, 2)
  );
  
  console.log(`\nServer details saved to ${filename}`);
}

/**
 * Display search results
 */
function displaySearchResults(results: any): void {
  const { servers, pagination } = results;
  
  console.log(`\nFound ${pagination.totalCount} servers (Page ${pagination.currentPage} of ${pagination.totalPages})`);
  console.log('='.repeat(50));
  
  if (servers.length === 0) {
    console.log('No servers found matching your criteria.');
    return;
  }
  
  // Group servers by category
  const grouped = groupServersByCategory(servers);
  
  // Display servers by category
  for (const [category, categoryServers] of Object.entries(grouped)) {
    console.log(`\n## ${category.toUpperCase()} (${categoryServers.length})`);
    
    for (const server of categoryServers) {
      displayServer(server);
    }
  }
  
  console.log('\nTo get details for a specific server, run:');
  console.log('npm run search-smithery -- --server <qualifiedName>');
}

/**
 * Main function to search for servers or get server details
 */
async function main(): Promise<void> {
  try {
    const args = parseArgs();
    
    // If a specific server is requested, get its details
    if (args.server) {
      console.log(`Getting details for server: ${args.server}`);
      const serverDetails = await getServerDetails(args.server);
      displayServer(serverDetails, true);
      saveServerToFile(serverDetails, true);
      return;
    }
    
    // Otherwise, search for servers
    const query = buildQueryString(args);
    console.log(`Searching for servers with query: ${query || '(all servers)'}`);
    
    const results = await searchServers(query, args.page, args.size);
    displaySearchResults(results);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();