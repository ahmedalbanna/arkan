/**
 * Tool Registry
 * Week 2 - Day 3: Tool Registry System
 * 
 * Central registry for managing and executing tools in dynamic flows.
 * Provides tool registration, discovery, and execution capabilities.
 */

import type { SchemaDefinition } from '../lib/models/flow-config';

// ============================================================================
// Tool Registry Types
// ============================================================================

export interface ToolDefinition {
  /** Unique tool name */
  name: string;
  
  /** Display name */
  displayName: string;
  
  /** Tool description */
  description: string;
  
  /** Tool category */
  category: ToolCategory;
  
  /** Input schema */
  inputSchema: SchemaDefinition;
  
  /** Output schema */
  outputSchema: SchemaDefinition;
  
  /** Tool handler function */
  handler: ToolHandler;
  
  /** Whether tool is enabled */
  enabled: boolean;
  
  /** Whether tool is built-in */
  isBuiltIn: boolean;
  
  /** Tool metadata */
  metadata?: ToolMetadata;
}

export type ToolCategory = 
  | 'search'
  | 'formatting'
  | 'analysis'
  | 'generation'
  | 'transformation'
  | 'integration'
  | 'utility'
  | 'custom';

export type ToolHandler = (input: any) => Promise<any> | any;

export interface ToolMetadata {
  /** Author */
  author?: string;
  
  /** Version */
  version?: string;
  
  /** Tags */
  tags?: string[];
  
  /** Documentation URL */
  docsUrl?: string;
  
  /** Rate limits */
  rateLimit?: {
    maxRequests: number;
    windowSeconds: number;
  };
  
  /** Timeout in milliseconds */
  timeout?: number;
}

export interface ToolExecutionResult {
  success: boolean;
  output?: any;
  error?: Error;
  executionTime?: number;
  metadata?: Record<string, any>;
}

// ============================================================================
// Tool Registry Class
// ============================================================================

class ToolRegistry {
  private tools: Map<string, ToolDefinition>;
  private executionStats: Map<string, ToolStats>;

  constructor() {
    this.tools = new Map();
    this.executionStats = new Map();
    this.registerBuiltInTools();
  }

  // ============================================================================
  // Tool Registration
  // ============================================================================

  /**
   * Register a tool
   */
  register(tool: ToolDefinition): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool already registered: ${tool.name}`);
    }

    this.tools.set(tool.name, tool);
    this.executionStats.set(tool.name, {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      totalExecutionTime: 0,
      avgExecutionTime: 0,
    });

    console.log(`✓ Tool registered: ${tool.name}`);
  }

  /**
   * Unregister a tool
   */
  unregister(name: string): boolean {
    const tool = this.tools.get(name);
    
    if (!tool) {
      return false;
    }

    if (tool.isBuiltIn) {
      throw new Error(`Cannot unregister built-in tool: ${name}`);
    }

    this.tools.delete(name);
    this.executionStats.delete(name);
    return true;
  }

  /**
   * Get a tool by name
   */
  getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * List all tools
   */
  listTools(options?: {
    category?: ToolCategory;
    enabled?: boolean;
    search?: string;
  }): ToolDefinition[] {
    let tools = Array.from(this.tools.values());

    if (options) {
      if (options.category) {
        tools = tools.filter(t => t.category === options.category);
      }

      if (options.enabled !== undefined) {
        tools = tools.filter(t => t.enabled === options.enabled);
      }

      if (options.search) {
        const search = options.search.toLowerCase();
        tools = tools.filter(t => 
          t.name.toLowerCase().includes(search) ||
          t.displayName.toLowerCase().includes(search) ||
          t.description.toLowerCase().includes(search)
        );
      }
    }

    return tools;
  }

  /**
   * Check if tool exists
   */
  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Enable/disable a tool
   */
  setToolEnabled(name: string, enabled: boolean): void {
    const tool = this.tools.get(name);
    if (tool) {
      tool.enabled = enabled;
    }
  }

  // ============================================================================
  // Tool Execution
  // ============================================================================

  /**
   * Execute a tool
   */
  async execute(name: string, input: any): Promise<any> {
    const startTime = Date.now();
    const stats = this.executionStats.get(name);

    try {
      // Get tool
      const tool = this.tools.get(name);
      
      if (!tool) {
        throw new Error(`Tool not found: ${name}`);
      }

      if (!tool.enabled) {
        throw new Error(`Tool is disabled: ${name}`);
      }

      // Validate input (optional - could add schema validation here)
      // const validated = SchemaValidator.validate(input, tool.inputSchema);

      // Execute tool handler
      const output = await tool.handler(input);

      // Update stats
      if (stats) {
        stats.totalCalls++;
        stats.successfulCalls++;
        const executionTime = Date.now() - startTime;
        stats.totalExecutionTime += executionTime;
        stats.avgExecutionTime = stats.totalExecutionTime / stats.totalCalls;
      }

      return output;

    } catch (_error) {
      // Update stats
      if (stats) {
        stats.totalCalls++;
        stats.failedCalls++;
      }

      throw error;
    }
  }

  /**
   * Get tool execution statistics
   */
  getStats(name: string): ToolStats | undefined {
    return this.executionStats.get(name);
  }

  /**
   * Get all statistics
   */
  getAllStats(): Map<string, ToolStats> {
    return new Map(this.executionStats);
  }

  /**
   * Reset statistics for a tool
   */
  resetStats(name: string): void {
    const stats = this.executionStats.get(name);
    if (stats) {
      stats.totalCalls = 0;
      stats.successfulCalls = 0;
      stats.failedCalls = 0;
      stats.totalExecutionTime = 0;
      stats.avgExecutionTime = 0;
    }
  }

  // ============================================================================
  // Built-in Tools
  // ============================================================================

  private registerBuiltInTools(): void {
    // Google Search Tool
    this.register({
      name: 'google-search',
      displayName: 'Google Search',
      description: 'Search the web using Google',
      category: 'search',
      enabled: true,
      isBuiltIn: true,
      inputSchema: {
        type: 'zod',
        fields: [
          {
            name: 'query',
            type: 'string',
            label: 'Search Query',
            required: true,
          },
          {
            name: 'limit',
            type: 'number',
            label: 'Result Limit',
            required: false,
            defaultValue: 10,
          }
        ],
        required: true,
      },
      outputSchema: {
        type: 'zod',
        fields: [
          {
            name: 'results',
            type: 'array',
            label: 'Search Results',
            required: true,
          }
        ],
        required: true,
      },
      handler: async (input) => {
        // Import the actual Google search tool
        try {
          const { googleSearch } = await import('./tools/google-search');
          return googleSearch(input.query, input.limit || 10);
        } catch (_error) {
          console.warn('Google search tool not available, using mock data');
          return { results: [] };
        }
      },
      metadata: {
        version: '1.0.0',
        tags: ['search', 'web'],
        timeout: 10000,
      },
    });

    // Text Analysis Tool
    this.register({
      name: 'analyze-text',
      displayName: 'Text Analysis',
      description: 'Analyze text for readability, sentiment, and statistics',
      category: 'analysis',
      enabled: true,
      isBuiltIn: true,
      inputSchema: {
        type: 'zod',
        fields: [
          {
            name: 'text',
            type: 'string',
            label: 'Text to Analyze',
            required: true,
          }
        ],
        required: true,
      },
      outputSchema: {
        type: 'zod',
        fields: [
          {
            name: 'wordCount',
            type: 'number',
            label: 'Word Count',
            required: true,
          },
          {
            name: 'characterCount',
            type: 'number',
            label: 'Character Count',
            required: true,
          }
        ],
        required: true,
      },
      handler: (input) => {
        const text = input.text;
        const words = text.split(/\s+/).filter((w: string) => w.length > 0);
        
        return {
          wordCount: words.length,
          characterCount: text.length,
          sentenceCount: (text.match(/[.!?]+/g) || []).length,
          paragraphCount: text.split(/\n\n+/).length,
          avgWordLength: words.reduce((sum: number, w: string) => sum + w.length, 0) / words.length || 0,
        };
      },
      metadata: {
        version: '1.0.0',
        tags: ['analysis', 'text'],
      },
    });

    // JSON Parser Tool
    this.register({
      name: 'parse-json',
      displayName: 'JSON Parser',
      description: 'Parse JSON string to object',
      category: 'transformation',
      enabled: true,
      isBuiltIn: true,
      inputSchema: {
        type: 'zod',
        fields: [
          {
            name: 'json',
            type: 'string',
            label: 'JSON String',
            required: true,
          }
        ],
        required: true,
      },
      outputSchema: {
        type: 'zod',
        fields: [
          {
            name: 'data',
            type: 'any',
            label: 'Parsed Data',
            required: true,
          }
        ],
        required: true,
      },
      handler: (input) => {
        try {
          return { data: JSON.parse(input.json) };
        } catch (_error) {
          throw new Error('Invalid JSON');
        }
      },
      metadata: {
        version: '1.0.0',
        tags: ['transformation', 'json'],
      },
    });

    // HTTP Request Tool
    this.register({
      name: 'http-request',
      displayName: 'HTTP Request',
      description: 'Make HTTP requests',
      category: 'integration',
      enabled: true,
      isBuiltIn: true,
      inputSchema: {
        type: 'zod',
        fields: [
          {
            name: 'url',
            type: 'string',
            label: 'URL',
            required: true,
          },
          {
            name: 'method',
            type: 'string',
            label: 'Method',
            required: false,
            defaultValue: 'GET',
          }
        ],
        required: true,
      },
      outputSchema: {
        type: 'zod',
        fields: [
          {
            name: 'data',
            type: 'any',
            label: 'Response Data',
            required: true,
          }
        ],
        required: true,
      },
      handler: async (input) => {
        const response = await fetch(input.url, {
          method: input.method || 'GET',
          headers: input.headers || {},
          body: input.body ? JSON.stringify(input.body) : undefined,
        });

        const data = await response.json();
        return { data, status: response.status };
      },
      metadata: {
        version: '1.0.0',
        tags: ['integration', 'http'],
        timeout: 30000,
      },
    });
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

const toolRegistry = new ToolRegistry();

// ============================================================================
// Public API
// ============================================================================

export function registerTool(tool: ToolDefinition): void {
  toolRegistry.register(tool);
}

export function unregisterTool(name: string): boolean {
  return toolRegistry.unregister(name);
}

export function getTool(name: string): ToolDefinition | undefined {
  return toolRegistry.getTool(name);
}

export function listTools(options?: {
  category?: ToolCategory;
  enabled?: boolean;
  search?: string;
}): ToolDefinition[] {
  return toolRegistry.listTools(options);
}

export function hasTool(name: string): boolean {
  return toolRegistry.hasTool(name);
}

export function executeTool(name: string, input: any): Promise<any> {
  return toolRegistry.execute(name, input);
}

export function getToolStats(name: string): ToolStats | undefined {
  return toolRegistry.getStats(name);
}

export function getAllToolStats(): Map<string, ToolStats> {
  return toolRegistry.getAllStats();
}

export function setToolEnabled(name: string, enabled: boolean): void {
  toolRegistry.setToolEnabled(name, enabled);
}

// ============================================================================
// Types Export
// ============================================================================

export interface ToolStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  totalExecutionTime: number;
  avgExecutionTime: number;
}

export type { ToolDefinition, ToolCategory, ToolHandler, ToolMetadata };
export default toolRegistry;
