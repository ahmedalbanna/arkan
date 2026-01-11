/**
 * Tool Configuration Models
 * 
 * Defines TypeScript interfaces for tool registry and configurations
 * stored in Firestore database.
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Tool implementation types
 */
export type ToolType = 'builtin' | 'custom' | 'external';

/**
 * Tool configuration status
 */
export type ToolStatus = 'active' | 'deprecated' | 'disabled';

/**
 * Main tool configuration interface
 */
export interface ToolConfiguration {
  name: string; // Unique identifier
  displayName: string;
  description: string;
  category: string;
  tags: string[];
  
  // Implementation
  type: ToolType;
  handler: string; // Function name, file path, or URL
  
  // Schema definitions (Zod schema as JSON)
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  
  // Settings
  status: ToolStatus;
  timeout?: number; // milliseconds
  requiresAuth?: boolean;
  cacheable?: boolean;
  cacheTTL?: number; // seconds
  
  // Metadata
  version: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Documentation
  examples?: ToolExample[];
  documentation?: string;
  
  // Advanced settings
  settings?: ToolSettings;
}

/**
 * Example usage of a tool
 */
export interface ToolExample {
  id: string;
  name: string;
  description?: string;
  input: Record<string, any>;
  expectedOutput: any;
  notes?: string;
}

/**
 * Tool execution settings
 */
export interface ToolSettings {
  // Retry configuration
  maxRetries?: number;
  retryDelay?: number; // milliseconds
  retryBackoff?: 'linear' | 'exponential';
  
  // Rate limiting
  rateLimit?: {
    requestsPerMinute?: number;
    requestsPerHour?: number;
  };
  
  // Resource limits
  maxMemoryMB?: number;
  maxConcurrent?: number;
  
  // Error handling
  onError?: 'throw' | 'return-null' | 'return-default';
  defaultOutput?: any;
  
  // Validation
  validateInput?: boolean;
  validateOutput?: boolean;
  strictMode?: boolean;
}

/**
 * Tool execution context
 */
export interface ToolExecutionContext {
  toolName: string;
  executionId: string;
  
  // Input
  parameters: Record<string, any>;
  
  // Metadata
  userId?: string;
  flowId?: string;
  stepId?: string;
  
  // Settings override
  timeout?: number;
}

/**
 * Tool execution result
 */
export interface ToolExecutionResult {
  executionId: string;
  toolName: string;
  
  // Output
  output: any;
  
  // Status
  status: 'success' | 'error';
  error?: {
    message: string;
    code?: string;
    stack?: string;
  };
  
  // Timing
  startTime: Timestamp;
  endTime: Timestamp;
  duration: number;
  
  // Metadata
  cached?: boolean;
  retryCount?: number;
}

/**
 * Tool usage statistics
 */
export interface ToolUsageStats {
  toolName: string;
  period: 'hour' | 'day' | 'week' | 'month';
  startDate: Timestamp;
  endDate: Timestamp;
  
  // Usage metrics
  executionCount: number;
  successCount: number;
  failureCount: number;
  
  // Performance metrics
  averageDuration: number;
  p95Duration: number;
  p99Duration: number;
  
  // Cache metrics
  cacheHitRate?: number;
  
  // Error analysis
  errorsByType?: Record<string, number>;
}

/**
 * Built-in tool metadata
 */
export interface BuiltinToolMetadata {
  name: string;
  displayName: string;
  description: string;
  category: string;
  
  // Function reference
  handler: Function;
  
  // Schema
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  
  // Examples
  examples?: ToolExample[];
}

/**
 * External tool configuration (API-based)
 */
export interface ExternalToolConfig {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  
  // Authentication
  authType?: 'none' | 'bearer' | 'api-key' | 'basic';
  authConfig?: {
    token?: string;
    apiKey?: string;
    username?: string;
    password?: string;
  };
  
  // Headers
  headers?: Record<string, string>;
  
  // Request mapping
  requestMapping?: {
    bodyPath?: string; // JSON path to put parameters
    queryParams?: Record<string, string>; // Static query params
  };
  
  // Response mapping
  responseMapping?: {
    dataPath?: string; // JSON path to extract result
    errorPath?: string; // JSON path to extract error
  };
}

/**
 * Tool category definitions
 */
export const TOOL_CATEGORIES = {
  TEXT: 'text',
  DATA: 'data',
  API: 'api',
  UTIL: 'util',
  AI: 'ai',
  SEARCH: 'search',
  FORMAT: 'format',
  VALIDATE: 'validate',
} as const;

/**
 * Firestore collection names
 */
export const TOOL_COLLECTIONS = {
  CONFIGURATIONS: 'toolConfigurations',
  EXECUTIONS: 'toolExecutions',
  STATS: 'toolStats',
} as const;

/**
 * Default tool settings
 */
export const DEFAULT_TOOL_SETTINGS: ToolSettings = {
  maxRetries: 3,
  retryDelay: 1000,
  retryBackoff: 'exponential',
  maxConcurrent: 5,
  onError: 'throw',
  validateInput: true,
  validateOutput: true,
  strictMode: false,
};

/**
 * Validation helpers
 */
export function validateToolConfiguration(config: Partial<ToolConfiguration>): string[] {
  const errors: string[] = [];
  
  if (!config.name) {
    errors.push('Tool name is required');
  }
  
  if (!config.displayName) {
    errors.push('Tool display name is required');
  }
  
  if (!config.type) {
    errors.push('Tool type is required');
  }
  
  if (!config.handler) {
    errors.push('Tool handler is required');
  }
  
  if (!config.inputSchema) {
    errors.push('Tool input schema is required');
  }
  
  if (!config.outputSchema) {
    errors.push('Tool output schema is required');
  }
  
  // Validate handler based on type
  if (config.type === 'external' && config.handler) {
    try {
      new URL(config.handler);
    } catch {
      errors.push('External tool handler must be a valid URL');
    }
  }
  
  return errors;
}

/**
 * Create a new tool configuration with defaults
 */
export function createToolConfiguration(
  partial: Partial<ToolConfiguration>
): Omit<ToolConfiguration, 'createdAt' | 'updatedAt'> {
  return {
    name: partial.name || '',
    displayName: partial.displayName || '',
    description: partial.description || '',
    category: partial.category || TOOL_CATEGORIES.UTIL,
    tags: partial.tags || [],
    type: partial.type || 'custom',
    handler: partial.handler || '',
    inputSchema: partial.inputSchema || {},
    outputSchema: partial.outputSchema || {},
    status: 'active',
    timeout: partial.timeout || 30000,
    requiresAuth: partial.requiresAuth ?? false,
    cacheable: partial.cacheable ?? true,
    cacheTTL: partial.cacheTTL || 3600,
    version: partial.version || '1.0.0',
    createdBy: partial.createdBy || '',
    examples: partial.examples || [],
    documentation: partial.documentation,
    settings: { ...DEFAULT_TOOL_SETTINGS, ...partial.settings },
  } as Omit<ToolConfiguration, 'createdAt' | 'updatedAt'>;
}

/**
 * Tool registry interface
 */
export interface ToolRegistry {
  // Register a built-in tool
  registerBuiltin(metadata: BuiltinToolMetadata): void;
  
  // Register an external tool
  registerExternal(config: ToolConfiguration & { type: 'external' }): void;
  
  // Get tool by name
  getTool(name: string): ToolConfiguration | null;
  
  // List all tools
  listTools(filters?: ToolFilters): ToolConfiguration[];
  
  // Check if tool exists
  hasTool(name: string): boolean;
  
  // Execute tool
  executeTool(name: string, parameters: Record<string, any>, context?: ToolExecutionContext): Promise<any>;
}

/**
 * Filters for listing tools
 */
export interface ToolFilters {
  category?: string;
  type?: ToolType;
  status?: ToolStatus;
  tags?: string[];
  search?: string;
}

/**
 * Tool error types
 */
export class ToolNotFoundError extends Error {
  constructor(toolName: string) {
    super(`Tool not found: ${toolName}`);
    this.name = 'ToolNotFoundError';
  }
}

export class ToolExecutionError extends Error {
  public readonly toolName: string;
  public readonly cause?: Error;
  
  constructor(toolName: string, message: string, cause?: Error) {
    super(message);
    this.name = 'ToolExecutionError';
    this.toolName = toolName;
    this.cause = cause;
  }
}

export class ToolTimeoutError extends Error {
  public readonly toolName: string;
  public readonly timeout: number;
  
  constructor(toolName: string, timeout: number) {
    super(`Tool execution timeout: ${toolName} (${timeout}ms)`);
    this.name = 'ToolTimeoutError';
    this.toolName = toolName;
    this.timeout = timeout;
  }
}

export class ToolValidationError extends Error {
  public readonly toolName: string;
  public readonly validationErrors: string[];
  
  constructor(toolName: string, errors: string[]) {
    super(`Tool validation failed: ${toolName}\n${errors.join('\n')}`);
    this.name = 'ToolValidationError';
    this.toolName = toolName;
    this.validationErrors = errors;
  }
}

/**
 * Helper to format tool documentation
 */
export function formatToolDocumentation(config: ToolConfiguration): string {
  let doc = `# ${config.displayName}\n\n`;
  doc += `${config.description}\n\n`;
  
  if (config.category) {
    doc += `**Category:** ${config.category}\n\n`;
  }
  
  if (config.tags.length > 0) {
    doc += `**Tags:** ${config.tags.join(', ')}\n\n`;
  }
  
  doc += `## Input Schema\n\`\`\`json\n${JSON.stringify(config.inputSchema, null, 2)}\n\`\`\`\n\n`;
  doc += `## Output Schema\n\`\`\`json\n${JSON.stringify(config.outputSchema, null, 2)}\n\`\`\`\n\n`;
  
  if (config.examples && config.examples.length > 0) {
    doc += `## Examples\n\n`;
    config.examples.forEach((example, index) => {
      doc += `### Example ${index + 1}: ${example.name}\n\n`;
      if (example.description) {
        doc += `${example.description}\n\n`;
      }
      doc += `**Input:**\n\`\`\`json\n${JSON.stringify(example.input, null, 2)}\n\`\`\`\n\n`;
      doc += `**Output:**\n\`\`\`json\n${JSON.stringify(example.expectedOutput, null, 2)}\n\`\`\`\n\n`;
    });
  }
  
  if (config.documentation) {
    doc += `## Additional Documentation\n\n${config.documentation}\n\n`;
  }
  
  return doc;
}
