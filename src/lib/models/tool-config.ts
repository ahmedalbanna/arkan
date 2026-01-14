/**
 * Tool Configuration Models
 * Week 2 - Day 3: Tool Registry Models
 * 
 * Type definitions for tool registry and tool configurations.
 */

import { z } from 'zod';
import type { SchemaDefinition } from './flow-config';

// ============================================================================
// Tool Configuration
// ============================================================================

/**
 * Tool configuration stored in database
 */
export interface ToolConfiguration {
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
  
  /** Whether tool is enabled */
  enabled: boolean;
  
  /** Whether tool is built-in */
  isBuiltIn: boolean;
  
  /** Tool implementation reference */
  implementation?: ToolImplementation;
  
  /** Tool metadata */
  metadata: ToolMetadata;
}

/**
 * Tool categories
 */
export type ToolCategory = 
  | 'search'
  | 'formatting'
  | 'analysis'
  | 'generation'
  | 'transformation'
  | 'integration'
  | 'utility'
  | 'custom';

/**
 * Tool implementation reference
 */
export interface ToolImplementation {
  /** Implementation type */
  type: 'built-in' | 'custom' | 'external';
  
  /** For built-in tools */
  builtInName?: string;
  
  /** For custom tools - code reference */
  customCode?: string;
  
  /** For external tools - API endpoint */
  externalUrl?: string;
  
  /** Authentication config */
  auth?: ToolAuthConfig;
}

/**
 * Tool authentication configuration
 */
export interface ToolAuthConfig {
  /** Auth type */
  type: 'none' | 'api-key' | 'oauth' | 'bearer';
  
  /** API key name */
  apiKeyName?: string;
  
  /** API key location */
  apiKeyLocation?: 'header' | 'query' | 'body';
  
  /** OAuth config */
  oauth?: {
    authUrl: string;
    tokenUrl: string;
    scope?: string[];
  };
}

/**
 * Tool metadata
 */
export interface ToolMetadata {
  /** Created timestamp */
  createdAt: Date;
  
  /** Updated timestamp */
  updatedAt: Date;
  
  /** Created by user ID */
  createdBy: string;
  
  /** Updated by user ID */
  updatedBy: string;
  
  /** Tool author */
  author?: string;
  
  /** Tool version */
  version?: string;
  
  /** Tags */
  tags?: string[];
  
  /** Documentation URL */
  docsUrl?: string;
  
  /** Rate limiting */
  rateLimit?: RateLimitConfig;
  
  /** Timeout in milliseconds */
  timeout?: number;
  
  /** Usage statistics */
  stats?: ToolStats;
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /** Max requests per window */
  maxRequests: number;
  
  /** Window duration in seconds */
  windowSeconds: number;
  
  /** Per user rate limit */
  perUser?: boolean;
}

/**
 * Tool usage statistics
 */
export interface ToolStats {
  /** Total calls */
  totalCalls: number;
  
  /** Successful calls */
  successfulCalls: number;
  
  /** Failed calls */
  failedCalls: number;
  
  /** Total execution time */
  totalExecutionTime: number;
  
  /** Average execution time */
  avgExecutionTime: number;
  
  /** Last used timestamp */
  lastUsedAt?: Date;
}

// ============================================================================
// Tool Execution
// ============================================================================

/**
 * Tool execution request
 */
export interface ToolExecutionRequest {
  /** Tool name */
  toolName: string;
  
  /** Input parameters */
  input: Record<string, any>;
  
  /** Execution options */
  options?: ToolExecutionOptions;
  
  /** User ID */
  userId?: string;
  
  /** Flow execution ID */
  flowExecutionId?: string;
}

/**
 * Tool execution options
 */
export interface ToolExecutionOptions {
  /** Timeout override */
  timeout?: number;
  
  /** Whether to cache result */
  cache?: boolean;
  
  /** Cache TTL in seconds */
  cacheTTL?: number;
  
  /** Whether to trace execution */
  trace?: boolean;
}

/**
 * Tool execution result
 */
export interface ToolExecutionResult {
  /** Success status */
  success: boolean;
  
  /** Output data */
  output?: any;
  
  /** Error if failed */
  error?: ToolExecutionError;
  
  /** Execution metadata */
  metadata: ToolExecutionMetadata;
}

/**
 * Tool execution error
 */
export interface ToolExecutionError {
  /** Error message */
  message: string;
  
  /** Error code */
  code: string;
  
  /** Error details */
  details?: any;
  
  /** Stack trace */
  stack?: string;
}

/**
 * Tool execution metadata
 */
export interface ToolExecutionMetadata {
  /** Tool name */
  toolName: string;
  
  /** Execution time in milliseconds */
  executionTime: number;
  
  /** Start timestamp */
  startTime: Date;
  
  /** End timestamp */
  endTime: Date;
  
  /** Whether result was cached */
  cached?: boolean;
  
  /** Retry count */
  retryCount?: number;
}

// ============================================================================
// Tool Discovery
// ============================================================================

/**
 * Tool discovery filters
 */
export interface ToolDiscoveryFilters {
  /** Filter by category */
  category?: ToolCategory;
  
  /** Filter by enabled status */
  enabled?: boolean;
  
  /** Search query */
  search?: string;
  
  /** Filter by tags */
  tags?: string[];
  
  /** Filter by author */
  author?: string;
  
  /** Include built-in tools */
  includeBuiltIn?: boolean;
  
  /** Include custom tools */
  includeCustom?: boolean;
}

/**
 * Tool discovery result
 */
export interface ToolDiscoveryResult {
  /** Found tools */
  tools: ToolConfiguration[];
  
  /** Total count */
  total: number;
  
  /** Current page */
  page?: number;
  
  /** Page size */
  pageSize?: number;
}

// ============================================================================
// Zod Schemas
// ============================================================================

export const ToolCategorySchema = z.enum([
  'search',
  'formatting',
  'analysis',
  'generation',
  'transformation',
  'integration',
  'utility',
  'custom',
]);

export const RateLimitConfigSchema = z.object({
  maxRequests: z.number().positive(),
  windowSeconds: z.number().positive(),
  perUser: z.boolean().optional(),
});

export const ToolAuthConfigSchema = z.object({
  type: z.enum(['none', 'api-key', 'oauth', 'bearer']),
  apiKeyName: z.string().optional(),
  apiKeyLocation: z.enum(['header', 'query', 'body']).optional(),
  oauth: z.object({
    authUrl: z.string().url(),
    tokenUrl: z.string().url(),
    scope: z.array(z.string()).optional(),
  }).optional(),
});

export const ToolConfigurationSchema = z.object({
  name: z.string().min(1),
  displayName: z.string().min(1),
  description: z.string(),
  category: ToolCategorySchema,
  enabled: z.boolean(),
  isBuiltIn: z.boolean(),
  metadata: z.object({
    version: z.string().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
    docsUrl: z.string().url().optional(),
    timeout: z.number().positive().optional(),
    rateLimit: RateLimitConfigSchema.optional(),
  }),
});

// Export all types
export type {
  ToolConfiguration,
  ToolCategory,
  ToolImplementation,
  ToolAuthConfig,
  ToolMetadata,
  ToolStats,
  ToolExecutionRequest,
  ToolExecutionResult,
  ToolExecutionError,
  ToolExecutionMetadata,
  ToolDiscoveryFilters,
  ToolDiscoveryResult,
};
