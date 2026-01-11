/**
 * Execution Trace Models
 * 
 * Defines TypeScript interfaces for tracking and debugging flow executions.
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Execution status types
 */
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * Step execution status
 */
export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

/**
 * Main execution trace interface
 */
export interface ExecutionTrace {
  id: string;
  flowId: string;
  flowName: string;
  flowVersion: number;
  
  // Execution info
  startTime: Timestamp;
  endTime?: Timestamp;
  duration?: number; // milliseconds
  status: ExecutionStatus;
  
  // Input/Output
  input: Record<string, any>;
  output?: any;
  error?: ExecutionError;
  
  // Step traces
  stepTraces: StepTrace[];
  
  // Metadata
  userId?: string;
  requestId?: string;
  environment: 'development' | 'staging' | 'production';
  
  // Performance metrics
  metrics?: ExecutionMetrics;
}

/**
 * Individual step trace
 */
export interface StepTrace {
  stepId: string;
  stepName: string;
  stepType: string;
  stepIndex: number;
  
  // Timing
  startTime: Timestamp;
  endTime?: Timestamp;
  duration?: number;
  status: StepStatus;
  
  // Input/Output
  input: any;
  output?: any;
  error?: StepError;
  
  // Additional metadata
  model?: string;
  promptId?: string;
  toolName?: string;
  
  // Token usage (for LLM steps)
  tokenUsage?: {
    input: number;
    output: number;
    total: number;
  };
  
  // Context snapshot
  contextBefore?: Record<string, any>;
  contextAfter?: Record<string, any>;
  
  // Retry information
  retryCount?: number;
  retryErrors?: string[];
}

/**
 * Execution error details
 */
export interface ExecutionError {
  message: string;
  code?: string;
  step?: string;
  stepIndex?: number;
  stack?: string;
  timestamp: Timestamp;
}

/**
 * Step error details
 */
export interface StepError {
  message: string;
  code?: string;
  type?: string;
  recoverable?: boolean;
  stack?: string;
}

/**
 * Execution performance metrics
 */
export interface ExecutionMetrics {
  // Overall
  totalDuration: number;
  stepCount: number;
  
  // Step breakdown
  stepDurations: Record<string, number>;
  slowestStep?: {
    stepId: string;
    stepName: string;
    duration: number;
  };
  
  // Token usage (if applicable)
  totalTokens?: {
    input: number;
    output: number;
    total: number;
  };
  
  // Resource usage
  memoryUsageMB?: number;
  cacheHits?: number;
  cacheMisses?: number;
  
  // Network
  apiCalls?: number;
  totalApiLatency?: number;
}

/**
 * Execution summary for listing
 */
export interface ExecutionSummary {
  id: string;
  flowName: string;
  status: ExecutionStatus;
  startTime: Timestamp;
  duration?: number;
  userId?: string;
  error?: string;
}

/**
 * Execution filters for querying
 */
export interface ExecutionFilters {
  flowId?: string;
  flowName?: string;
  status?: ExecutionStatus;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  hasError?: boolean;
  minDuration?: number;
  maxDuration?: number;
}

/**
 * Execution analytics
 */
export interface ExecutionAnalytics {
  flowId: string;
  period: 'hour' | 'day' | 'week' | 'month';
  startDate: Timestamp;
  endDate: Timestamp;
  
  // Counts
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  cancelledExecutions: number;
  
  // Performance
  averageDuration: number;
  medianDuration: number;
  p95Duration: number;
  p99Duration: number;
  
  // Success rate
  successRate: number;
  
  // Step performance
  stepPerformance?: Record<string, {
    count: number;
    averageDuration: number;
    errorRate: number;
  }>;
  
  // Error analysis
  errorsByType?: Record<string, number>;
  topErrors?: Array<{
    message: string;
    count: number;
  }>;
}

/**
 * Firestore collection names
 */
export const TRACE_COLLECTIONS = {
  EXECUTIONS: 'executionTraces',
  ANALYTICS: 'executionAnalytics',
} as const;

/**
 * Helper functions
 */

/**
 * Create execution trace
 */
export function createExecutionTrace(
  flowId: string,
  flowName: string,
  flowVersion: number,
  input: Record<string, any>,
  userId?: string,
  requestId?: string
): Omit<ExecutionTrace, 'id'> {
  return {
    flowId,
    flowName,
    flowVersion,
    startTime: Timestamp.now(),
    status: 'pending',
    input,
    stepTraces: [],
    userId,
    requestId,
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  };
}

/**
 * Create step trace
 */
export function createStepTrace(
  stepId: string,
  stepName: string,
  stepType: string,
  stepIndex: number,
  input: any
): StepTrace {
  return {
    stepId,
    stepName,
    stepType,
    stepIndex,
    startTime: Timestamp.now(),
    status: 'pending',
    input,
  };
}

/**
 * Complete step trace
 */
export function completeStepTrace(
  trace: StepTrace,
  output: any,
  contextAfter?: Record<string, any>
): StepTrace {
  const endTime = Timestamp.now();
  const duration = endTime.toMillis() - trace.startTime.toMillis();
  
  return {
    ...trace,
    endTime,
    duration,
    status: 'completed',
    output,
    contextAfter,
  };
}

/**
 * Fail step trace
 */
export function failStepTrace(
  trace: StepTrace,
  error: StepError
): StepTrace {
  const endTime = Timestamp.now();
  const duration = endTime.toMillis() - trace.startTime.toMillis();
  
  return {
    ...trace,
    endTime,
    duration,
    status: 'failed',
    error,
  };
}

/**
 * Complete execution trace
 */
export function completeExecutionTrace(
  trace: ExecutionTrace,
  output: any
): ExecutionTrace {
  const endTime = Timestamp.now();
  const duration = endTime.toMillis() - trace.startTime.toMillis();
  
  return {
    ...trace,
    endTime,
    duration,
    status: 'completed',
    output,
    metrics: calculateMetrics(trace, duration),
  };
}

/**
 * Fail execution trace
 */
export function failExecutionTrace(
  trace: ExecutionTrace,
  error: ExecutionError
): ExecutionTrace {
  const endTime = Timestamp.now();
  const duration = endTime.toMillis() - trace.startTime.toMillis();
  
  return {
    ...trace,
    endTime,
    duration,
    status: 'failed',
    error,
    metrics: calculateMetrics(trace, duration),
  };
}

/**
 * Calculate execution metrics
 */
function calculateMetrics(
  trace: ExecutionTrace,
  totalDuration: number
): ExecutionMetrics {
  const stepDurations: Record<string, number> = {};
  let slowestStep: ExecutionMetrics['slowestStep'];
  let maxDuration = 0;
  
  const totalTokens = {
    input: 0,
    output: 0,
    total: 0,
  };
  
  for (const step of trace.stepTraces) {
    if (step.duration) {
      stepDurations[step.stepId] = step.duration;
      
      if (step.duration > maxDuration) {
        maxDuration = step.duration;
        slowestStep = {
          stepId: step.stepId,
          stepName: step.stepName,
          duration: step.duration,
        };
      }
    }
    
    if (step.tokenUsage) {
      totalTokens.input += step.tokenUsage.input;
      totalTokens.output += step.tokenUsage.output;
      totalTokens.total += step.tokenUsage.total;
    }
  }
  
  return {
    totalDuration,
    stepCount: trace.stepTraces.length,
    stepDurations,
    slowestStep,
    totalTokens: totalTokens.total > 0 ? totalTokens : undefined,
  };
}

/**
 * Format execution trace for display
 */
export function formatExecutionTrace(trace: ExecutionTrace): string {
  let output = `Execution Trace: ${trace.id}\n`;
  output += `Flow: ${trace.flowName} (v${trace.flowVersion})\n`;
  output += `Status: ${trace.status}\n`;
  output += `Duration: ${trace.duration ? `${trace.duration}ms` : 'N/A'}\n`;
  output += `\n`;
  
  if (trace.error) {
    output += `Error: ${trace.error.message}\n`;
    if (trace.error.step) {
      output += `Failed at step: ${trace.error.step}\n`;
    }
    output += `\n`;
  }
  
  output += `Steps:\n`;
  trace.stepTraces.forEach((step, index) => {
    output += `  ${index + 1}. ${step.stepName} (${step.stepType})\n`;
    output += `     Status: ${step.status}\n`;
    output += `     Duration: ${step.duration ? `${step.duration}ms` : 'N/A'}\n`;
    
    if (step.error) {
      output += `     Error: ${step.error.message}\n`;
    }
    
    if (step.tokenUsage) {
      output += `     Tokens: ${step.tokenUsage.input} in, ${step.tokenUsage.output} out\n`;
    }
    
    output += `\n`;
  });
  
  if (trace.metrics) {
    output += `Metrics:\n`;
    output += `  Total Duration: ${trace.metrics.totalDuration}ms\n`;
    output += `  Step Count: ${trace.metrics.stepCount}\n`;
    
    if (trace.metrics.slowestStep) {
      output += `  Slowest Step: ${trace.metrics.slowestStep.stepName} (${trace.metrics.slowestStep.duration}ms)\n`;
    }
    
    if (trace.metrics.totalTokens) {
      output += `  Total Tokens: ${trace.metrics.totalTokens.total}\n`;
    }
  }
  
  return output;
}

/**
 * Get execution summary from trace
 */
export function getExecutionSummary(trace: ExecutionTrace): ExecutionSummary {
  return {
    id: trace.id,
    flowName: trace.flowName,
    status: trace.status,
    startTime: trace.startTime,
    duration: trace.duration,
    userId: trace.userId,
    error: trace.error?.message,
  };
}
