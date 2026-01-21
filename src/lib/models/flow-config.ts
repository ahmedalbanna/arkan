/**
 * Dynamic Flow Configuration Models
 * Week 1 - Day 1-2: Database Models
 * 
 * This file contains all TypeScript interfaces and types for the dynamic flow system.
 * These models define the structure of flows stored in Firestore.
 */

import { z } from 'zod';

// ============================================================================
// Core Flow Configuration
// ============================================================================

/**
 * Main flow configuration interface
 * Stored in Firestore collection: 'flows'
 */
export interface FlowConfiguration {
  category: any;
  updatedAt: string | number | Date;
  /** Unique identifier for the flow */
  id: string;
  
  /** Human-readable flow name */
  name: string;
  
  /** Brief description of what the flow does */
  description: string;
  
  /** Version number (semantic versioning) */
  version: string;
  
  /** Tags for categorization and search */
  tags: string[];
  
  /** Flow status */
  status: FlowStatus;
  
  /** Input schema definition */
  inputSchema: SchemaDefinition;
  
  /** Output schema definition */
  outputSchema: SchemaDefinition;
  
  /** Ordered list of steps to execute */
  steps: FlowStep[];
  
  /** Global configuration options */
  config: FlowGlobalConfig;
  
  /** Metadata */
  metadata: FlowMetadata;
  
  /** Version history */
  versions?: FlowVersion[];
}

/**
 * Flow status enum
 */
export enum FlowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  DEPRECATED = 'deprecated',
  ARCHIVED = 'archived'
}

/**
 * Schema definition for inputs and outputs
 */
export interface SchemaDefinition {
  /** Schema type (currently only Zod supported) */
  type: 'zod' | 'json-schema';
  
  /** Field definitions */
  fields: SchemaField[];
  
  /** Whether the schema is required */
  required: boolean;
  
  /** Additional validation rules */
  validation?: ValidationRule[];
}

/**
 * Individual schema field
 */
export interface SchemaField {
  /** Field name */
  name: string;
  
  /** Field type */
  type: SchemaFieldType;
  
  /** Human-readable label */
  label: string;
  
  /** Field description */
  description?: string;
  
  /** Whether field is required */
  required: boolean;
  
  /** Default value */
  defaultValue?: any;
  
  /** Validation rules specific to this field */
  validation?: ValidationRule[];
  
  /** For array/object types */
  items?: SchemaField[];
  
  /** For enum types */
  enumValues?: string[];
}

/**
 * Supported schema field types
 */
export type SchemaFieldType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'array'
  | 'object'
  | 'enum'
  | 'file'
  | 'any';

/**
 * Validation rule
 */
export interface ValidationRule {
  /** Rule type */
  type: 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'url' | 'custom';
  
  /** Rule value */
  value?: any;
  
  /** Error message */
  message: string;
  
  /** For custom validation */
  validator?: string;
}

// ============================================================================
// Flow Steps
// ============================================================================

/**
 * Base flow step interface
 */
export interface FlowStep {
  /** Unique step identifier within the flow */
  id: string;
  
  /** Step name */
  name: string;
  
  /** Step type */
  type: StepType;
  
  /** Step description */
  description?: string;
  
  /** Configuration specific to step type */
  config: StepConfig;
  
  /** Condition to execute this step (optional) */
  condition?: StepCondition;
  
  /** Error handling configuration */
  errorHandling?: ErrorHandlingConfig;
  
  /** Retry configuration */
  retry?: RetryConfig;
}

/**
 * Step types
 */
export enum StepType {
  RETRIEVE = 'retrieve',        // RAG retrieval
  GENERATE = 'generate',        // LLM generation
  TOOL = 'tool',               // Tool execution
  FORMAT = 'format',           // Output formatting
  CONDITION = 'condition',     // Conditional branching
  LOOP = 'loop',              // Loop execution
  PARALLEL = 'parallel',      // Parallel execution
  TRANSFORM = 'transform'     // Data transformation
}

/**
 * Step configuration (union type based on step type)
 */
export type StepConfig = 
  | RetrieveStepConfig
  | GenerateStepConfig
  | ToolStepConfig
  | FormatStepConfig
  | ConditionStepConfig
  | LoopStepConfig
  | ParallelStepConfig
  | TransformStepConfig;

// ============================================================================
// Step Configurations
// ============================================================================

/**
 * RAG Retrieve step configuration
 */
export interface RetrieveStepConfig {
  type: 'retrieve';
  
  /** Query to search for (supports template variables) */
  query: string;
  
  /** Collection to search in */
  collection?: string;
  
  /** Number of results to retrieve */
  limit: number;
  
  /** Minimum relevance score */
  minScore?: number;
  
  /** Filters to apply */
  filters?: Record<string, any>;
  
  /** Output variable name */
  outputVariable: string;
}

/**
 * LLM Generate step configuration
 */
export interface GenerateStepConfig {
  type: 'generate';
  
  /** Prompt ID or inline prompt */
  prompt: string | PromptReference;
  
  /** Model configuration */
  model?: ModelConfig;
  
  /** Variables to pass to prompt */
  variables?: Record<string, string>;
  
  /** Output variable name */
  outputVariable: string;
  
  /** Whether to stream output */
  stream?: boolean;
  
  /** Output format */
  outputFormat?: 'text' | 'json' | 'markdown';
}

/**
 * Tool execution step configuration
 */
export interface ToolStepConfig {
  type: 'tool';
  
  /** Tool name to execute */
  toolName: string;
  
  /** Tool input parameters (supports template variables) */
  parameters: Record<string, any>;
  
  /** Output variable name */
  outputVariable: string;
  
  /** Timeout in milliseconds */
  timeout?: number;
}

/**
 * Format step configuration
 */
export interface FormatStepConfig {
  type: 'format';
  
  /** Template string (supports template variables) */
  template: string;
  
  /** Output format */
  format: 'text' | 'json' | 'markdown' | 'html';
  
  /** Output variable name */
  outputVariable: string;
}

/**
 * Condition step configuration
 */
export interface ConditionStepConfig {
  type: 'condition';
  
  /** Condition to evaluate */
  condition: string;
  
  /** Steps to execute if true */
  thenSteps: string[];
  
  /** Steps to execute if false */
  elseSteps?: string[];
}

/**
 * Loop step configuration
 */
export interface LoopStepConfig {
  type: 'loop';
  
  /** Array variable to iterate over */
  iterateOver: string;
  
  /** Variable name for current item */
  itemVariable: string;
  
  /** Steps to execute in each iteration */
  steps: string[];
  
  /** Maximum iterations */
  maxIterations?: number;
}

/**
 * Parallel step configuration
 */
export interface ParallelStepConfig {
  type: 'parallel';
  
  /** Steps to execute in parallel */
  steps: string[];
  
  /** Whether to wait for all steps to complete */
  waitForAll: boolean;
  
  /** Timeout for all parallel steps */
  timeout?: number;
}

/**
 * Transform step configuration
 */
export interface TransformStepConfig {
  type: 'transform';
  
  /** Input variable */
  input: string;
  
  /** Transformation function name */
  transformer: string;
  
  /** Output variable name */
  outputVariable: string;
  
  /** Additional parameters */
  parameters?: Record<string, any>;
}

// ============================================================================
// Supporting Types
// ============================================================================

/**
 * Prompt reference (for referencing prompts from prompt library)
 */
export interface PromptReference {
  /** Prompt ID */
  id: string;
  
  /** Version (optional, uses latest if not specified) */
  version?: string;
}

/**
 * Model configuration
 */
export interface ModelConfig {
  /** Model name */
  name?: string;
  
  /** Temperature */
  temperature?: number;
  
  /** Max tokens */
  maxTokens?: number;
  
  /** Top P */
  topP?: number;
  
  /** Top K */
  topK?: number;
  
  /** Stop sequences */
  stopSequences?: string[];
}

/**
 * Step condition
 */
export interface StepCondition {
  /** Condition expression */
  expression: string;
  
  /** Variables used in condition */
  variables: string[];
}

/**
 * Error handling configuration
 */
export interface ErrorHandlingConfig {
  /** What to do on error */
  onError: 'fail' | 'continue' | 'retry' | 'fallback';
  
  /** Fallback value if error occurs */
  fallbackValue?: any;
  
  /** Custom error message */
  errorMessage?: string;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  /** Maximum retry attempts */
  maxAttempts: number;
  
  /** Delay between retries (ms) */
  delay: number;
  
  /** Backoff strategy */
  backoff: 'fixed' | 'exponential' | 'linear';
  
  /** Maximum delay (ms) */
  maxDelay?: number;
}

/**
 * Global flow configuration
 */
export interface FlowGlobalConfig {
  /** Overall timeout for flow execution (ms) */
  timeout?: number;
  
  /** Enable caching */
  cache?: boolean;
  
  /** Cache TTL (seconds) */
  cacheTTL?: number;
  
  /** Rate limiting */
  rateLimit?: RateLimitConfig;
  
  /** Default model configuration */
  defaultModel?: ModelConfig;
  
  /** Enable tracing */
  tracing?: boolean;
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /** Max requests per window */
  maxRequests: number;
  
  /** Window duration (seconds) */
  windowSeconds: number;
}

/**
 * Flow metadata
 */
export interface FlowMetadata {
  /** Created timestamp */
  createdAt: Date;
  
  /** Updated timestamp */
  updatedAt: Date;
  
  /** Created by user ID */
  createdBy: string;
  
  /** Updated by user ID */
  updatedBy: string;
  
  /** Execution statistics */
  stats?: FlowStats;
  
  /** Category */
  category?: string;
  
  /** Whether flow is public */
  isPublic?: boolean;
}

/**
 * Flow statistics
 */
export interface FlowStats {
  /** Total executions */
  totalExecutions: number;
  
  /** Successful executions */
  successfulExecutions: number;
  
  /** Failed executions */
  failedExecutions: number;
  
  /** Average execution time (ms) */
  avgExecutionTime: number;
  
  /** Last execution timestamp */
  lastExecutedAt?: Date;
}

/**
 * Flow version
 */
export interface FlowVersion {
  /** Version number */
  version: string;
  
  /** Change description */
  changeDescription: string;
  
  /** Timestamp */
  createdAt: Date;
  
  /** Created by */
  createdBy: string;
  
  /** Full flow configuration at this version */
  configuration: FlowConfiguration;
}

// ============================================================================
// Firestore Document Types
// ============================================================================

/**
 * Flow document as stored in Firestore
 */
export interface FlowDocument {
  /** Document ID (same as flow.id) */
  id: string;
  
  /** Flow data */
  data: FlowConfiguration;
  
  /** Firestore metadata */
  _createdAt: any; // Firestore Timestamp
  _updatedAt: any; // Firestore Timestamp
}

// ============================================================================
// Zod Schemas (for runtime validation)
// ============================================================================

export const ModelConfigSchema = z.object({
  name: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
  topP: z.number().min(0).max(1).optional(),
  topK: z.number().positive().optional(),
  stopSequences: z.array(z.string()).optional(),
});

export const RetryConfigSchema = z.object({
  maxAttempts: z.number().positive(),
  delay: z.number().positive(),
  backoff: z.enum(['fixed', 'exponential', 'linear']),
  maxDelay: z.number().positive().optional(),
});

export const ErrorHandlingConfigSchema = z.object({
  onError: z.enum(['fail', 'continue', 'retry', 'fallback']),
  fallbackValue: z.any().optional(),
  errorMessage: z.string().optional(),
});
