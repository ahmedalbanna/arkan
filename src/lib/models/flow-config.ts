/**
 * Flow Configuration Models
 * 
 * Defines TypeScript interfaces and types for dynamic flow configurations
 * stored in Firestore database.
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Flow configuration status
 */
export type FlowStatus = 'draft' | 'active' | 'archived';

/**
 * Step types supported by the dynamic executor
 */
export type StepType = 'RETRIEVE' | 'GENERATE' | 'TOOL' | 'FORMAT' | 'CONDITION' | 'LOOP';

/**
 * Error handling strategies for steps
 */
export type ErrorHandlingStrategy = 'stop' | 'skip' | 'retry';

/**
 * Main flow configuration interface
 */
export interface FlowConfiguration {
  id: string;
  name: string;
  displayName: string;
  description: string;
  version: number;
  status: FlowStatus;
  category: string;
  tags: string[];
  
  // Step definitions
  steps: FlowStep[];
  
  // Schema definitions (Zod schema as JSON)
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  
  // Metadata
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
  
  // Settings
  settings: FlowSettings;
}

/**
 * Individual step in a flow
 */
export interface FlowStep {
  id: string;
  type: StepType;
  name: string;
  description?: string;
  
  // Configuration based on step type
  config: StepConfig;
  
  // I/O Schema (Zod schema as JSON)
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  
  // Data mapping between context and step
  inputMapping?: Record<string, string>; // Map context vars to step inputs
  outputMapping?: Record<string, string>; // Map step outputs to context vars
  
  // Error handling
  onError?: ErrorHandlingStrategy;
  retryCount?: number;
  retryDelay?: number; // milliseconds
  
  // Conditional execution
  condition?: string; // JavaScript expression
}

/**
 * Union type for all step configurations
 */
export type StepConfig = 
  | RetrieveStepConfig
  | GenerateStepConfig
  | ToolStepConfig
  | FormatStepConfig
  | ConditionStepConfig
  | LoopStepConfig;

/**
 * Configuration for RETRIEVE step (RAG retrieval)
 */
export interface RetrieveStepConfig {
  type: 'RETRIEVE';
  retrieverName: string; // Name of registered retriever
  query: string; // Template string with {{variables}}
  topK?: number;
  minScore?: number;
  metadata?: Record<string, any>;
}

/**
 * Configuration for GENERATE step (LLM generation)
 */
export interface GenerateStepConfig {
  type: 'GENERATE';
  promptId: string; // Reference to prompt template in database
  model?: string; // Override default model
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  streamResponse?: boolean;
}

/**
 * Configuration for TOOL step (external tool execution)
 */
export interface ToolStepConfig {
  type: 'TOOL';
  toolName: string; // Name of registered tool
  parameters: Record<string, any>; // Tool-specific parameters
  timeout?: number;
}

/**
 * Configuration for FORMAT step (output formatting)
 */
export interface FormatStepConfig {
  type: 'FORMAT';
  outputFormat: 'json' | 'markdown' | 'html' | 'text' | 'xml';
  template?: string; // Template string for custom formatting
  prettify?: boolean;
}

/**
 * Configuration for CONDITION step (conditional branching)
 */
export interface ConditionStepConfig {
  type: 'CONDITION';
  condition: string; // JavaScript expression
  trueSteps: FlowStep[]; // Steps to execute if condition is true
  falseSteps?: FlowStep[]; // Steps to execute if condition is false
}

/**
 * Configuration for LOOP step (iterative processing)
 */
export interface LoopStepConfig {
  type: 'LOOP';
  itemsSource: string; // Context variable containing array
  itemVariable: string; // Variable name for current iteration item
  indexVariable?: string; // Variable name for current index
  steps: FlowStep[]; // Steps to execute for each item
  maxIterations?: number; // Safety limit
  parallel?: boolean; // Execute iterations in parallel
}

/**
 * Flow execution settings
 */
export interface FlowSettings {
  // Performance
  timeout?: number; // milliseconds, default 300000 (5 min)
  maxRetries?: number; // Global retry count
  
  // Caching
  enableCaching?: boolean;
  cacheTTL?: number; // seconds
  cacheKeyTemplate?: string; // Template for cache key
  
  // Tracing & Monitoring
  enableTracing?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  
  // Security
  requiresAuth?: boolean;
  allowedRoles?: string[];
  allowedUsers?: string[];
  
  // Rate Limiting
  rateLimitPerMinute?: number;
  rateLimitPerHour?: number;
  
  // Advanced
  concurrencyLimit?: number; // Max concurrent executions
  priority?: number; // Execution priority (higher = more important)
}

/**
 * Flow version history entry
 */
export interface FlowVersion {
  flowId: string;
  version: number;
  configuration: FlowConfiguration;
  createdBy: string;
  createdAt: Timestamp;
  message?: string; // Commit message
  previousVersion?: number;
}

/**
 * Flow execution context snapshot
 */
export interface FlowExecutionContext {
  flowId: string;
  flowVersion: number;
  executionId: string;
  startTime: Timestamp;
  
  // Current state
  currentStepId?: string;
  currentStepIndex?: number;
  
  // Context data
  variables: Record<string, any>;
  stepOutputs: Record<string, any>;
  
  // Status
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  error?: string;
}

/**
 * Flow execution result
 */
export interface FlowExecutionResult {
  executionId: string;
  flowId: string;
  flowVersion: number;
  
  status: 'completed' | 'failed';
  output?: any;
  error?: {
    message: string;
    step?: string;
    stack?: string;
  };
  
  // Timing
  startTime: Timestamp;
  endTime: Timestamp;
  duration: number; // milliseconds
  
  // Metadata
  userId?: string;
  requestId?: string;
  traceId?: string;
}

/**
 * Type guard to check step config type
 */
export function isRetrieveStep(config: StepConfig): config is RetrieveStepConfig {
  return config.type === 'RETRIEVE';
}

export function isGenerateStep(config: StepConfig): config is GenerateStepConfig {
  return config.type === 'GENERATE';
}

export function isToolStep(config: StepConfig): config is ToolStepConfig {
  return config.type === 'TOOL';
}

export function isFormatStep(config: StepConfig): config is FormatStepConfig {
  return config.type === 'FORMAT';
}

export function isConditionStep(config: StepConfig): config is ConditionStepConfig {
  return config.type === 'CONDITION';
}

export function isLoopStep(config: StepConfig): config is LoopStepConfig {
  return config.type === 'LOOP';
}

/**
 * Firestore collection names
 */
export const FLOW_COLLECTIONS = {
  CONFIGURATIONS: 'flowConfigurations',
  VERSIONS: 'flowVersions',
  EXECUTIONS: 'flowExecutions',
} as const;

/**
 * Default flow settings
 */
export const DEFAULT_FLOW_SETTINGS: FlowSettings = {
  timeout: 300000, // 5 minutes
  maxRetries: 3,
  enableCaching: false,
  enableTracing: true,
  logLevel: 'info',
  requiresAuth: true,
  rateLimitPerMinute: 60,
  concurrencyLimit: 10,
  priority: 5,
};

/**
 * Validation helpers
 */
export function validateFlowConfiguration(config: Partial<FlowConfiguration>): string[] {
  const errors: string[] = [];
  
  if (!config.name) {
    errors.push('Flow name is required');
  }
  
  if (!config.displayName) {
    errors.push('Flow display name is required');
  }
  
  if (!config.steps || config.steps.length === 0) {
    errors.push('Flow must have at least one step');
  }
  
  if (!config.inputSchema) {
    errors.push('Flow input schema is required');
  }
  
  if (!config.outputSchema) {
    errors.push('Flow output schema is required');
  }
  
  // Validate step IDs are unique
  if (config.steps) {
    const stepIds = config.steps.map(s => s.id);
    const uniqueIds = new Set(stepIds);
    if (stepIds.length !== uniqueIds.size) {
      errors.push('Step IDs must be unique');
    }
  }
  
  return errors;
}

/**
 * Create a new flow configuration with defaults
 */
export function createFlowConfiguration(
  partial: Partial<FlowConfiguration>
): Omit<FlowConfiguration, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name: partial.name || '',
    displayName: partial.displayName || '',
    description: partial.description || '',
    version: 1,
    status: 'draft',
    category: partial.category || 'general',
    tags: partial.tags || [],
    steps: partial.steps || [],
    inputSchema: partial.inputSchema || {},
    outputSchema: partial.outputSchema || {},
    createdBy: partial.createdBy || '',
    settings: { ...DEFAULT_FLOW_SETTINGS, ...partial.settings },
  } as Omit<FlowConfiguration, 'id' | 'createdAt' | 'updatedAt'>;
}
