#!/usr/bin/env node

/**
 * Richard's Pattern Library MCP Server
 * 
 * Serves proven, working code patterns from successful projects.
 * Prevents reinventing the wheel and ensures consistency.
 * 
 * Usage: Reference patterns in any project with natural language:
 * - "Use my Azure AD auth pattern"
 * - "Apply my Carbon dark theme setup"
 * - "Show me the backend proxy pattern"
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PatternLibraryServer {
  constructor() {
    this.server = new Server(
      {
        name: 'vibe-coding-helper',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.patternsDir = path.join(__dirname, 'patterns');
    this.setupHandlers();
  }

  setupHandlers() {
    // List all available patterns
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      const patterns = await this.getPatternList();
      return {
        resources: patterns.map(p => ({
          uri: `pattern:///${p.category}/${p.name}`,
          name: p.title,
          description: p.description,
          mimeType: 'text/markdown',
        })),
      };
    });

    // Read a specific pattern
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params.uri;
      const match = uri.match(/^pattern:\/\/\/(.+)\/(.+)$/);
      
      if (!match) {
        throw new Error('Invalid pattern URI');
      }

      const [, category, name] = match;
      const filePath = path.join(this.patternsDir, category, `${name}.md`);
      
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        return {
          contents: [{
            uri,
            mimeType: 'text/markdown',
            text: content,
          }],
        };
      } catch (error) {
        throw new Error(`Pattern not found: ${category}/${name}`);
      }
    });

    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'search_patterns',
            description: 'Search for patterns by keyword, technology, or problem domain',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query (e.g., "authentication", "Azure", "deployment")',
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'get_pattern_code',
            description: 'Get the complete code for a specific pattern',
            inputSchema: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  description: 'Pattern category (auth, styling, routing, deployment, api, debugging)',
                },
                name: {
                  type: 'string',
                  description: 'Pattern name (e.g., azure-ad-msal, carbon-dark-theme)',
                },
              },
              required: ['category', 'name'],
            },
          },
          {
            name: 'list_patterns_by_category',
            description: 'List all patterns in a specific category',
            inputSchema: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  description: 'Category to list (auth, styling, routing, deployment, api, debugging)',
                },
              },
              required: ['category'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'search_patterns':
          return await this.searchPatterns(args.query);
        
        case 'get_pattern_code':
          return await this.getPatternCode(args.category, args.name);
        
        case 'list_patterns_by_category':
          return await this.listPatternsByCategory(args.category);
        
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async getPatternList() {
    const patterns = [];
    const categories = await fs.readdir(this.patternsDir);

    for (const category of categories) {
      const categoryPath = path.join(this.patternsDir, category);
      const stat = await fs.stat(categoryPath);
      
      if (stat.isDirectory()) {
        const files = await fs.readdir(categoryPath);
        
        for (const file of files) {
          if (file.endsWith('.md')) {
            const content = await fs.readFile(path.join(categoryPath, file), 'utf-8');
            const titleMatch = content.match(/^#\s+(.+)$/m);
            const descMatch = content.match(/^>\s+(.+)$/m);
            
            patterns.push({
              category,
              name: file.replace('.md', ''),
              title: titleMatch ? titleMatch[1] : file,
              description: descMatch ? descMatch[1] : '',
            });
          }
        }
      }
    }

    return patterns;
  }

  async searchPatterns(query) {
    const patterns = await this.getPatternList();
    const lowerQuery = query.toLowerCase();
    
    const matches = patterns.filter(p => 
      p.title.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery)
    );

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(matches, null, 2),
      }],
    };
  }

  async getPatternCode(category, name) {
    const filePath = path.join(this.patternsDir, category, `${name}.md`);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return {
        content: [{
          type: 'text',
          text: content,
        }],
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Pattern not found: ${category}/${name}\n\nAvailable categories: auth, styling, routing, deployment, api, debugging`,
        }],
        isError: true,
      };
    }
  }

  async listPatternsByCategory(category) {
    const categoryPath = path.join(this.patternsDir, category);
    
    try {
      const files = await fs.readdir(categoryPath);
      const patterns = files.filter(f => f.endsWith('.md')).map(f => f.replace('.md', ''));
      
      return {
        content: [{
          type: 'text',
          text: `Patterns in ${category}:\n${patterns.map(p => `- ${p}`).join('\n')}`,
        }],
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Category not found: ${category}\n\nAvailable categories: auth, styling, routing, deployment, api, debugging`,
        }],
        isError: true,
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Richard Pattern Library MCP Server running on stdio');
  }
}

const server = new PatternLibraryServer();
server.run().catch(console.error);
