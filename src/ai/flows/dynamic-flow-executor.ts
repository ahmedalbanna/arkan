/**
 * Dynamic Flow Executor
 * Week 1 - Day 5: Dynamic Flow Executor (Core)
 * 
 * Core executor engine for running dynamic flows from database configurations.
 * Handles flow loading, step execution, error handling, and context management.
 */

import { ContextManager } from '../dynamic-flow/context-manager';
import { SchemaValidator } from '../dynamic-flow/schema-validator';
import type { 
  FlowConfiguration, 
  FlowStep, 
  StepType,
  FlowStatus 
} from '../../lib/models/flow-config';

// ============================================================================
// Dynamic Flow Executor Class
// ============================================================================

export class DynamicFlowExecutor {
  private flow: FlowConfiguration;
  private context: ContextManager;
  private executionTrace: ExecutionTrace;
  private abortController: AbortController;

  constructor(flow: FlowConfiguration) {
    this.flow = flow;
    this.context = new ContextManager();
    this.executionTrace = {
      flowId: flow.id,
      flowVersion: flow.version,
      status: 'pending',
      startTime: new Date(),
      steps: [],
      errors: [],
    };
    this.abortController = new AbortController();
  }

  // ============================================================================
  // Main Execution Methods
  // ============================================================================

  /**
   * Execute the flow with given input
   */
  async execute(input: Record<string, any>): Promise<ExecutionResult> {
    try {
      // Validate flow status
      if (this.flow.status !== FlowStatus.ACTIVE) {
        throw new Error(`Flow is not active. Current status: ${this.flow.status}`);
      }

      // Start execution
      this.executionTrace.status = 'running';
      this.executionTrace.input = input;

      // Validate input
      const inputValidation = SchemaValidator.validate(input, this.flow.inputSchema);
      if (!inputValidation.success) {
        throw new ExecutionError(
          'Input validation failed',
          'VALIDATION_ERROR',
          inputValidation.errors
        );
      }

      // Initialize context with input
      Object.entries(inputValidation.data).forEach(([key, value]) => {
        this.context.set(key, value);
      });

      // Execute steps sequentially
      for (let i = 0; i < this.flow.steps.length; i++) {
        const step = this.flow.steps[i];
        
        // Check if execution was aborted
        if (this.abortController.signal.aborted) {
          throw new ExecutionError('Flow execution was aborted', 'ABORTED');
        }

        // Check step condition
        if (step.condition && !this.evaluateCondition(step.condition.expression)) {
          this.logStepSkipped(step, 'Condition not met');
          continue;
        }

        // Execute step with retry logic
        await this.executeStepWithRetry(step);

        // Check for global timeout
        if (this.flow.config.timeout) {
          const elapsed = Date.now() - this.executionTrace.startTime.getTime();
          if (elapsed > this.flow.config.timeout) {
            throw new ExecutionError('Flow execution timeout', 'TIMEOUT');
          }
        }
      }

      // Validate output
      const output = this.extractOutput();
      const outputValidation = SchemaValidator.validate(output, this.flow.outputSchema);
      
      if (!outputValidation.success) {
        throw new ExecutionError(
          'Output validation failed',
          'VALIDATION_ERROR',
          outputValidation.errors
        );
      }

      // Complete execution
      this.executionTrace.status = 'completed';
      this.executionTrace.endTime = new Date();
      this.executionTrace.output = outputValidation.data;
      this.executionTrace.duration = 
        this.executionTrace.endTime.getTime() - this.executionTrace.startTime.getTime();

      return {
        success: true,
        output: outputValidation.data,
        trace: this.executionTrace,
        context: this.context.getAll(),
      };

    } catch (error) {
      // Handle execution error
      this.executionTrace.status = 'failed';
      this.executionTrace.endTime = new Date();
      this.executionTrace.duration = 
        this.executionTrace.endTime.getTime() - this.executionTrace.startTime.getTime();

      const executionError = error instanceof ExecutionError 
        ? error 
        : new ExecutionError(
            error instanceof Error ? error.message : 'Unknown error',
            'EXECUTION_ERROR'
          );

      this.executionTrace.errors.push({
        message: executionError.message,
        code: executionError.code,
        details: executionError.details,
        timestamp: new Date(),
      });

      return {
        success: false,
        error: executionError,
        trace: this.executionTrace,
        context: this.context.getAll(),
      };
    }
  }

  /**
   * Execute a single step with retry logic
   */
  private async executeStepWithRetry(step: FlowStep): Promise<void> {
    const maxAttempts = step.retry?.maxAttempts ?? 1;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.executeStep(step, attempt);
        return; // Success
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        // Log retry attempt
        if (attempt < maxAttempts) {
          console.log(`Step ${step.id} failed, retrying (${attempt}/${maxAttempts})...`);
          
          // Apply retry delay with backoff
          if (step.retry) {
            const delay = this.calculateRetryDelay(attempt, step.retry);
            await this.sleep(delay);
          }
        }
      }
    }

    // All retries exhausted
    if (step.errorHandling?.onError === 'continue') {
      this.logStepError(step, lastError!, 'Continuing despite error');
      
      // Set fallback value if provided
      if (step.errorHandling.fallbackValue !== undefined) {
        const outputVar = this.getStepOutputVariable(step);
        if (outputVar) {
          this.context.set(outputVar, step.errorHandling.fallbackValue);
        }
      }
      
      return;
    }

    // Fail execution
    throw new ExecutionError(
      `Step ${step.id} failed after ${maxAttempts} attempts: ${lastError?.message}`,
      'STEP_EXECUTION_ERROR',
      { stepId: step.id, attempts: maxAttempts, originalError: lastError }
    );
  }

  /**
   * Execute a single step
   */
  private async executeStep(step: FlowStep, attempt: number): Promise<void> {
    const stepTrace: StepTrace = {
      stepId: step.id,
      stepType: step.type,
      status: 'running',
      startTime: new Date(),
      attempt,
    };

    this.executionTrace.steps.push(stepTrace);

    try {
      // Resolve step configuration (replace template variables)
      const resolvedConfig = this.context.resolveObject(step.config);

      // Execute based on step type
      let result: any;

      switch (step.type) {
        case StepType.RETRIEVE:
          result = await this.executeRetrieveStep(resolvedConfig);
          break;

        case StepType.GENERATE:
          result = await this.executeGenerateStep(resolvedConfig);
          break;

        case StepType.TOOL:
          result = await this.executeToolStep(resolvedConfig);
          break;

        case StepType.FORMAT:
          result = await this.executeFormatStep(resolvedConfig);
          break;

        case StepType.CONDITION:
          result = await this.executeConditionStep(resolvedConfig);
          break;

        case StepType.LOOP:
          result = await this.executeLoopStep(resolvedConfig);
          break;

        case StepType.PARALLEL:
          result = await this.executeParallelStep(resolvedConfig);
          break;

        case StepType.TRANSFORM:
          result = await this.executeTransformStep(resolvedConfig);
          break;

        default:
          throw new Error(`Unsupported step type: ${step.type}`);
      }

      // Store result in context
      const outputVar = this.getStepOutputVariable(step);
      if (outputVar && result !== undefined) {
        this.context.set(outputVar, result);
      }

      // Complete step trace
      stepTrace.status = 'completed';
      stepTrace.endTime = new Date();
      stepTrace.duration = stepTrace.endTime.getTime() - stepTrace.startTime.getTime();
      stepTrace.output = result;

    } catch (error) {
      // Handle step error
      stepTrace.status = 'failed';
      stepTrace.endTime = new Date();
      stepTrace.duration = stepTrace.endTime.getTime() - stepTrace.startTime.getTime();
      stepTrace.error = {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      };

      throw error;
    }
  }

  // ============================================================================
  // Step Execution Methods
  // ============================================================================

  private async executeRetrieveStep(config: any): Promise<any> {
    const { executeRetrieveStep } = await import('../dynamic-flow/step-handlers');
    return executeRetrieveStep(config, this.context);
  }

  private async executeGenerateStep(config: any): Promise<any> {
    const { executeGenerateStep } = await import('../dynamic-flow/step-handlers');
    return executeGenerateStep(config, this.context);
  }

  private async executeToolStep(config: any): Promise<any> {
    const { executeToolStep } = await import('../dynamic-flow/step-handlers');
    return executeToolStep(config, this.context);
  }

  private async executeFormatStep(config: any): Promise<any> {
    const { executeFormatStep } = await import('../dynamic-flow/step-handlers');
    return executeFormatStep(config, this.context);
  }

  private async executeTransformStep(config: any): Promise<any> {
    const { executeTransformStep } = await import('../dynamic-flow/step-handlers');
    return executeTransformStep(config, this.context);
  }

  private async executeConditionStep(config: any): Promise<any> {
    // TODO: Implement in Week 7
    throw new Error('Condition step not yet implemented');
  }

  private async executeLoopStep(config: any): Promise<any> {
    // TODO: Implement in Week 7
    throw new Error('Loop step not yet implemented');
  }

  private async executeParallelStep(config: any): Promise<any> {
    // TODO: Implement in Week 7
    throw new Error('Parallel step not yet implemented');
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Evaluate a condition expression
   */
  private evaluateCondition(expression: string): boolean {
    try {
      // Simple variable check for now
      // TODO: Implement full expression evaluation
      const varName = expression.trim();
      const value = this.context.get(varName);
      return Boolean(value);
    } catch (error) {
      console.warn(`Failed to evaluate condition: ${expression}`, error);
      return false;
    }
  }

  /**
   * Extract output from context based on output schema
   */
  private extractOutput(): Record<string, any> {
    const output: Record<string, any> = {};

    for (const field of this.flow.outputSchema.fields) {
      const value = this.context.get(field.name);
      if (value !== undefined) {
        output[field.name] = value;
      }
    }

    return output;
  }

  /**
   * Get output variable name from step config
   */
  private getStepOutputVariable(step: FlowStep): string | null {
    const config = step.config as any;
    return config.outputVariable ?? null;
  }

  /**
   * Calculate retry delay with backoff
   */
  private calculateRetryDelay(attempt: number, retryConfig: any): number {
    const baseDelay = retryConfig.delay ?? 1000;
    const maxDelay = retryConfig.maxDelay ?? 30000;

    let delay: number;

    switch (retryConfig.backoff) {
      case 'exponential':
        delay = baseDelay * Math.pow(2, attempt - 1);
        break;

      case 'linear':
        delay = baseDelay * attempt;
        break;

      case 'fixed':
      default:
        delay = baseDelay;
        break;
    }

    return Math.min(delay, maxDelay);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log skipped step
   */
  private logStepSkipped(step: FlowStep, reason: string): void {
    this.executionTrace.steps.push({
      stepId: step.id,
      stepType: step.type,
      status: 'skipped',
      startTime: new Date(),
      endTime: new Date(),
      duration: 0,
      attempt: 1,
      skipReason: reason,
    });
  }

  /**
   * Log step error
   */
  private logStepError(step: FlowStep, error: Error, action: string): void {
    console.warn(`Step ${step.id} error: ${error.message}. ${action}`);
  }

  /**
   * Abort flow execution
   */
  abort(): void {
    this.abortController.abort();
  }

  /**
   * Get current execution trace
   */
  getTrace(): ExecutionTrace {
    return this.executionTrace;
  }

  /**
   * Get current context
   */
  getContext(): ContextManager {
    return this.context;
  }
}

// ============================================================================
// Types
// ============================================================================

export interface ExecutionResult {
  success: boolean;
  output?: Record<string, any>;
  error?: ExecutionError;
  trace: ExecutionTrace;
  context: Record<string, any>;
}

export interface ExecutionTrace {
  flowId: string;
  flowVersion: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  input?: Record<string, any>;
  output?: Record<string, any>;
  steps: StepTrace[];
  errors: TraceError[];
}

export interface StepTrace {
  stepId: string;
  stepType: StepType;
  status: 'running' | 'completed' | 'failed' | 'skipped';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  attempt: number;
  input?: any;
  output?: any;
  error?: {
    message: string;
    stack?: string;
  };
  skipReason?: string;
}

export interface TraceError {
  message: string;
  code: string;
  details?: any;
  timestamp: Date;
}

export class ExecutionError extends Error {
  code: string;
  details?: any;

  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = 'ExecutionError';
    this.code = code;
    this.details = details;
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a flow executor from configuration
 */
export function createFlowExecutor(flow: FlowConfiguration): DynamicFlowExecutor {
  return new DynamicFlowExecutor(flow);
}

/**
 * Quick execution helper
 */
export async function executeFlow(
  flow: FlowConfiguration,
  input: Record<string, any>
): Promise<ExecutionResult> {
  const executor = new DynamicFlowExecutor(flow);
  return executor.execute(input);
}
