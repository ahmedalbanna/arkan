/**
 * Execution Trace Models
 * Week 2 - Day 4: Execution Trace Models
 * 
 * Type definitions for flow execution traces and logging.
 */

import type { StepType } from './flow-config';

// ============================================================================
// Execution Trace
// ============================================================================

/**
 * Main execution trace
 */
export interface ExecutionTrace {
  /** Trace ID */
  id: string;
  
  /** Flow ID */
  flowId: string;
  
  /** Flow version */
  flowVersion: string;
  
  /** Execution status */
  status: ExecutionStatus;
  
  /** Start timestamp */
  startTime: Date;
  
  /** End timestamp */
  endTime?: Date;
  
  /** Duration in milliseconds */
  duration?: number;
  
  /** Input data */
  input: Record<string, any>;
  
  /** Output data */
  output?: Record<string, any>;
  
  /** Step traces */
  steps: StepTrace[];
  
  /** Errors */
  errors: ExecutionError[];
  
  /** Context snapshot */
  context?: Record<string, any>;
  
  /** Metadata */
  metadata: ExecutionMetadata;
}

/**
 * Execution status
 */
export type ExecutionStatus = 
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'timeout';

/**
 * Step trace
 */
export interface StepTrace {
  /** Step ID */
  stepId: string;
  
  /** Step name */
  stepName: string;
  
  /** Step type */
  stepType: StepType;
  
  /** Step index in flow */
  stepIndex: number;
  
  /** Step status */
  status: StepStatus;
  
  /** Start timestamp */
  startTime: Date;
  
  /** End timestamp */
  endTime?: Date;
  
  /** Duration in milliseconds */
  duration?: number;
  
  /** Input data */
  input?: any;
  
  /** Output data */
  output?: any;
  
  /** Error if failed */
  error?: StepError;
  
  /** Retry count */
  retryCount: number;
  
  /** Skip reason if skipped */
  skipReason?: string;
  
  /** Step metadata */
  metadata?: StepTraceMetadata;
}

/**
 * Step status
 */
export type StepStatus = 
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped'
  | 'retrying';

/**
 * Step trace metadata
 */
export interface StepTraceMetadata {
  /** Model used (for generate steps) */
  modelUsed?: string;
  
  /** Tokens used (for generate steps) */
  tokensUsed?: number;
  
  /** Cache hit */
  cacheHit?: boolean;
  
  /** Tool name (for tool steps) */
  toolName?: string;
  
  /** Documents retrieved (for retrieve steps) */
  documentsRetrieved?: number;
  
  /** Custom metadata */
  custom?: Record<string, any>;
}

/**
 * Step error
 */
export interface StepError {
  /** Error message */
  message: string;
  
  /** Error code */
  code?: string;
  
  /** Stack trace */
  stack?: string;
  
  /** Error details */
  details?: any;
}

/**
 * Execution error
 */
export interface ExecutionError {
  /** Error message */
  message: string;
  
  /** Error code */
  code: string;
  
  /** Step ID where error occurred */
  stepId?: string;
  
  /** Error details */
  details?: any;
  
  /** Timestamp */
  timestamp: Date;
  
  /** Stack trace */
  stack?: string;
}

/**
 * Execution metadata
 */
export interface ExecutionMetadata {
  /** User ID */
  userId?: string;
  
  /** Environment */
  environment: 'production' | 'staging' | 'development' | 'test';
  
  /** Region */
  region?: string;
  
  /** Model usage */
  modelUsage?: ModelUsage;
  
  /** Total cost (if applicable) */
  totalCost?: number;
  
  /** Request ID */
  requestId?: string;
  
  /** Session ID */
  sessionId?: string;
  
  /** Custom metadata */
  custom?: Record<string, any>;
}

/**
 * Model usage statistics
 */
export interface ModelUsage {
  /** Total tokens */
  totalTokens: number;
  
  /** Prompt tokens */
  promptTokens: number;
  
  /** Completion tokens */
  completionTokens: number;
  
  /** Model name */
  modelName?: string;
  
  /** Cost per token */
  costPerToken?: number;
}

// ============================================================================
// Trace Query
// ============================================================================

/**
 * Trace query filters
 */
export interface TraceQueryFilters {
  /** Filter by flow ID */
  flowId?: string;
  
  /** Filter by status */
  status?: ExecutionStatus;
  
  /** Filter by user ID */
  userId?: string;
  
  /** Start date range */
  startDate?: Date;
  
  /** End date range */
  endDate?: Date;
  
  /** Minimum duration */
  minDuration?: number;
  
  /** Maximum duration */
  maxDuration?: number;
  
  /** Filter by error */
  hasError?: boolean;
  
  /** Limit results */
  limit?: number;
  
  /** Offset for pagination */
  offset?: number;
}

/**
 * Trace query result
 */
export interface TraceQueryResult {
  /** Traces */
  traces: ExecutionTrace[];
  
  /** Total count */
  total: number;
  
  /** Page info */
  page?: {
    offset: number;
    limit: number;
    hasMore: boolean;
  };
}

// ============================================================================
// Trace Analytics
// ============================================================================

/**
 * Trace analytics summary
 */
export interface TraceAnalytics {
  /** Total executions */
  totalExecutions: number;
  
  /** Successful executions */
  successfulExecutions: number;
  
  /** Failed executions */
  failedExecutions: number;
  
  /** Average duration */
  avgDuration: number;
  
  /** Min duration */
  minDuration: number;
  
  /** Max duration */
  maxDuration: number;
  
  /** Success rate */
  successRate: number;
  
  /** Error rate */
  errorRate: number;
  
  /** Most common errors */
  commonErrors?: Array<{
    code: string;
    message: string;
    count: number;
  }>;
  
  /** Step statistics */
  stepStats?: Record<string, StepAnalytics>;
  
  /** Time period */
  period?: {
    start: Date;
    end: Date;
  };
}

/**
 * Step analytics
 */
export interface StepAnalytics {
  /** Step type */
  stepType: StepType;
  
  /** Total executions */
  totalExecutions: number;
  
  /** Successful executions */
  successfulExecutions: number;
  
  /** Failed executions */
  failedExecutions: number;
  
  /** Average duration */
  avgDuration: number;
  
  /** Success rate */
  successRate: number;
}

// Export all types
export type {
  ExecutionTrace,
  ExecutionStatus,
  StepTrace,
  StepStatus,
  StepTraceMetadata,
  StepError,
  ExecutionError,
  ExecutionMetadata,
  ModelUsage,
  TraceQueryFilters,
  TraceQueryResult,
  TraceAnalytics,
  StepAnalytics,
};
