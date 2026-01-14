/**
 * Prompt Configuration Models
 * Week 1 - Day 1-2: Database Models
 * 
 * This file contains all TypeScript interfaces and types for the prompt management system.
 * Prompts are stored in Firestore and can be versioned, tested, and reused across flows.
 */

import { z } from 'zod';

// ============================================================================
// Core Prompt Configuration
// ============================================================================

/**
 * Main prompt configuration interface
 * Stored in Firestore collection: 'prompts'
 */
export interface PromptConfiguration {
  /** Unique identifier for the prompt */
  id: string;
  
  /** Human-readable prompt name */
  name: string;
  
  /** Brief description of the prompt's purpose */
  description: string;
  
  /** Version number (semantic versioning) */
  version: string;
  
  /** Tags for categorization and search */
  tags: string[];
  
  /** Prompt status */
  status: PromptStatus;
  
  /** The actual prompt text */
  template: string;
  
  /** Variables used in the prompt */
  variables: PromptVariable[];
  
  /** Input schema for validation */
  inputSchema?: PromptInputSchema;
  
  /** Expected output format */
  outputFormat: PromptOutputFormat;
  
  /** Model configuration */
  modelConfig?: PromptModelConfig;
  
  /** Examples for few-shot learning */
  examples?: PromptExample[];
  
  /** Metadata */
  metadata: PromptMetadata;
  
  /** Version history */
  versions?: PromptVersion[];
}

/**
 * Prompt status enum
 */
export enum PromptStatus {
  DRAFT = 'draft',
  TESTING = 'testing',
  ACTIVE = 'active',
  DEPRECATED = 'deprecated',
  ARCHIVED = 'archived'
}

/**
 * Prompt variable definition
 */
export interface PromptVariable {
  /** Variable name (used in template as {{variableName}}) */
  name: string;
  
  /** Human-readable label */
  label: string;
  
  /** Variable description */
  description?: string;
  
  /** Variable type */
  type: PromptVariableType;
  
  /** Whether variable is required */
  required: boolean;
  
  /** Default value */
  defaultValue?: any;
  
  /** Validation rules */
  validation?: VariableValidation[];
  
  /** For enum types */
  enumValues?: string[];
  
  /** Placeholder text */
  placeholder?: string;
}

/**
 * Prompt variable types
 */
export type PromptVariableType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'enum'
  | 'text'      // Multi-line text
  | 'markdown'  // Markdown text
  | 'json';     // JSON object

/**
 * Variable validation rule
 */
export interface VariableValidation {
  /** Rule type */
  type: 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  
  /** Rule value */
  value?: any;
  
  /** Error message */
  message: string;
  
  /** For custom validation */
  validator?: string;
}

/**
 * Input schema for prompt validation
 */
export interface PromptInputSchema {
  /** Schema type */
  type: 'zod' | 'json-schema';
  
  /** Schema definition */
  schema: Record<string, any>;
  
  /** Whether to validate strictly */
  strict: boolean;
}

/**
 * Output format specification
 */
export interface PromptOutputFormat {
  /** Expected format type */
  type: 'text' | 'json' | 'markdown' | 'html' | 'structured';
  
  /** For structured output - schema definition */
  schema?: Record<string, any>;
  
  /** Output parsing instructions */
  parseInstructions?: string;
  
  /** Whether to validate output */
  validate?: boolean;
}

/**
 * Model configuration specific to this prompt
 */
export interface PromptModelConfig {
  /** Preferred model */
  preferredModel?: string;
  
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
  
  /** Presence penalty */
  presencePenalty?: number;
  
  /** Frequency penalty */
  frequencyPenalty?: number;
}

/**
 * Prompt example for few-shot learning
 */
export interface PromptExample {
  /** Example ID */
  id: string;
  
  /** Example input variables */
  input: Record<string, any>;
  
  /** Expected output */
  output: string;
  
  /** Description of the example */
  description?: string;
}

/**
 * Prompt metadata
 */
export interface PromptMetadata {
  /** Created timestamp */
  createdAt: Date;
  
  /** Updated timestamp */
  updatedAt: Date;
  
  /** Created by user ID */
  createdBy: string;
  
  /** Updated by user ID */
  updatedBy: string;
  
  /** Category */
  category?: string;
  
  /** Language */
  language?: string;
  
  /** Usage statistics */
  stats?: PromptStats;
  
  /** Whether prompt is public */
  isPublic?: boolean;
  
  /** Source (if imported) */
  source?: string;
}

/**
 * Prompt usage statistics
 */
export interface PromptStats {
  /** Total uses */
  totalUses: number;
  
  /** Successful uses */
  successfulUses: number;
  
  /** Failed uses */
  failedUses: number;
  
  /** Average tokens used */
  avgTokensUsed: number;
  
  /** Average execution time (ms) */
  avgExecutionTime: number;
  
  /** Last used timestamp */
  lastUsedAt?: Date;
  
  /** Average rating (if rated) */
  avgRating?: number;
}

/**
 * Prompt version
 */
export interface PromptVersion {
  /** Version number */
  version: string;
  
  /** Change description */
  changeDescription: string;
  
  /** Timestamp */
  createdAt: Date;
  
  /** Created by */
  createdBy: string;
  
  /** Full prompt configuration at this version */
  configuration: PromptConfiguration;
  
  /** A/B test results (if applicable) */
  testResults?: PromptTestResults;
}

/**
 * Prompt test results
 */
export interface PromptTestResults {
  /** Test ID */
  testId: string;
  
  /** Number of test runs */
  runs: number;
  
  /** Success rate */
  successRate: number;
  
  /** Average quality score */
  avgQualityScore?: number;
  
  /** Test metrics */
  metrics: Record<string, number>;
  
  /** Test timestamp */
  testedAt: Date;
}

// ============================================================================
// Prompt Library & Categories
// ============================================================================

/**
 * Prompt category
 */
export interface PromptCategory {
  /** Category ID */
  id: string;
  
  /** Category name */
  name: string;
  
  /** Description */
  description: string;
  
  /** Parent category (for nested categories) */
  parentId?: string;
  
  /** Icon */
  icon?: string;
  
  /** Sort order */
  order: number;
}

/**
 * Prompt template (pre-built prompts)
 */
export interface PromptTemplate {
  /** Template ID */
  id: string;
  
  /** Template name */
  name: string;
  
  /** Description */
  description: string;
  
  /** Category */
  category: string;
  
  /** Template configuration */
  template: PromptConfiguration;
  
  /** Tags */
  tags: string[];
  
  /** Is featured */
  featured: boolean;
}

// ============================================================================
// Prompt Testing & Evaluation
// ============================================================================

/**
 * Prompt test case
 */
export interface PromptTestCase {
  /** Test case ID */
  id: string;
  
  /** Test name */
  name: string;
  
  /** Input variables */
  input: Record<string, any>;
  
  /** Expected output (optional for manual review) */
  expectedOutput?: string;
  
  /** Evaluation criteria */
  criteria?: EvaluationCriteria[];
}

/**
 * Evaluation criteria
 */
export interface EvaluationCriteria {
  /** Criteria name */
  name: string;
  
  /** Criteria type */
  type: 'contains' | 'not-contains' | 'regex' | 'length' | 'custom';
  
  /** Expected value */
  value: any;
  
  /** Weight (for scoring) */
  weight?: number;
  
  /** Description */
  description?: string;
}

/**
 * Prompt test execution result
 */
export interface PromptTestExecution {
  /** Execution ID */
  id: string;
  
  /** Test case ID */
  testCaseId: string;
  
  /** Prompt version */
  promptVersion: string;
  
  /** Input used */
  input: Record<string, any>;
  
  /** Output generated */
  output: string;
  
  /** Execution time (ms) */
  executionTime: number;
  
  /** Tokens used */
  tokensUsed: number;
  
  /** Test passed */
  passed: boolean;
  
  /** Evaluation results */
  evaluations: EvaluationResult[];
  
  /** Overall score */
  score: number;
  
  /** Timestamp */
  executedAt: Date;
}

/**
 * Evaluation result
 */
export interface EvaluationResult {
  /** Criteria name */
  criteriaName: string;
  
  /** Passed */
  passed: boolean;
  
  /** Score */
  score: number;
  
  /** Feedback */
  feedback?: string;
}

// ============================================================================
// Firestore Document Types
// ============================================================================

/**
 * Prompt document as stored in Firestore
 */
export interface PromptDocument {
  /** Document ID (same as prompt.id) */
  id: string;
  
  /** Prompt data */
  data: PromptConfiguration;
  
  /** Firestore metadata */
  _createdAt: any; // Firestore Timestamp
  _updatedAt: any; // Firestore Timestamp
}

// ============================================================================
// Zod Schemas (for runtime validation)
// ============================================================================

export const PromptVariableSchema = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['string', 'number', 'boolean', 'array', 'object', 'enum', 'text', 'markdown', 'json']),
  required: z.boolean(),
  defaultValue: z.any().optional(),
  enumValues: z.array(z.string()).optional(),
  placeholder: z.string().optional(),
});

export const PromptModelConfigSchema = z.object({
  preferredModel: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
  topP: z.number().min(0).max(1).optional(),
  topK: z.number().positive().optional(),
  stopSequences: z.array(z.string()).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
});

export const PromptOutputFormatSchema = z.object({
  type: z.enum(['text', 'json', 'markdown', 'html', 'structured']),
  schema: z.record(z.any()).optional(),
  parseInstructions: z.string().optional(),
  validate: z.boolean().optional(),
});

export const PromptConfigurationSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string(),
  version: z.string(),
  tags: z.array(z.string()),
  status: z.enum(['draft', 'testing', 'active', 'deprecated', 'archived']),
  template: z.string().min(1),
  variables: z.array(PromptVariableSchema),
  outputFormat: PromptOutputFormatSchema,
  modelConfig: PromptModelConfigSchema.optional(),
});

// Export all types
export type {
  PromptConfiguration,
  PromptVariable,
  PromptOutputFormat,
  PromptModelConfig,
  PromptExample,
  PromptTestCase,
};
