/**
 * Enhanced Dynamic Flow Executor
 * Integrates all core components for complete flow orchestration
 * 
 * This is the main orchestrator that coordinates:
 * - ContextManager for state management
 * - SchemaValidator for input/output validation
 * - TemplateEngine for prompt rendering
 * - ConditionEvaluator for branching logic
 * - StepExecutor for step execution
 */

import { ContextManager, type ExecutionContext } from './context-manager';
import { SchemaValidator } from './schema-validator';
import { TemplateEngine } from './template-engine';
import { ConditionEvaluator } from './condition-evaluator';
import { StepExecutor } from './step-executor';
import type { 
  FlowConfiguration, 
  FlowStep,
  StepResult
} from '../../lib/models/flow-config';

// ============================================================================
// Enhanced Dynamic Flow Executor
// ============================================================================

export class EnhancedFlowExecutor {
  private contextManager: ContextManager;
  private schemaValidator: SchemaValidator;
  private templateEngine: TemplateEngine;
  private conditionEvaluator: ConditionEvaluator;
  private stepExecutor: StepExecutor;

  constructor() {
    this.contextManager = new ContextManager();
    this.schemaValidator = new SchemaValidator();
    this.templateEngine = new TemplateEngine();
    this.conditionEvaluator = new ConditionEvaluator();
    this.stepExecutor = new StepExecutor(this.contextManager, this.templateEngine);
  }

  /**
   * Execute a flow with the given configuration and input
   */
  async execute(
    config: FlowConfiguration,
    input: any,
    options: ExecutionOptions = {}
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    const traceId = this.generateTraceId();

    try {
      // Validate flow configuration
      this.validateFlowConfig(config);

      // Validate input against schema
      const validatedInput = await this.schemaValidator.validate(
        input,
        config.inputSchema
      );

      // Initialize execution context
      const context = await this.contextManager.initialize({
        input: validatedInput.data,
        config,
        options,
        traceId
      });

      // Execute flow steps
      await this.executeSteps(config.steps, context);

      // Extract and validate output
      const output = this.contextManager.extractOutput(context, config.outputMapping);
      const validatedOutput = await this.schemaValidator.validate(
        output,
        config.outputSchema
      );

      // Build execution metrics
      const metrics = this.buildMetrics(context);

      return {
        success: true,
        output: validatedOutput.data,
        traceId,
        metrics,
        duration: Date.now() - startTime,
        context: this.contextManager.snapshot(context)
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        traceId,
        metrics: this.buildMetrics(null),
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Execute all steps in the flow
   */
  private async executeSteps(
    steps: FlowStep[],
    context: ExecutionContext
  ): Promise<void> {
    for (const step of steps) {
      // Check if step should execute based on conditions
      if (!await this.shouldExecuteStep(step, context)) {
        context.metrics.skippedSteps++;
        continue;
      }

      // Execute step with error handling
      const result = await this.executeStepWithErrorHandling(step, context);

      // Update context with result
      await this.contextManager.updateContext(context, step, result);

      // Check for early termination
      if (result.status === 'error' && !step.errorHandling?.continueOnError) {
        throw new StepExecutionError(
          `Step ${step.name} failed: ${result.error?.message}`,
          { step, error: result.error }
        );
      }
    }
  }

  /**
   * Execute a single step with retry and error handling
   */
  private async executeStepWithErrorHandling(
    step: FlowStep,
    context: ExecutionContext
  ): Promise<StepResult> {
    const maxRetries = step.errorHandling?.retries ?? 0;
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.stepExecutor.execute(step, context);
        context.metrics.successfulSteps++;
        return result;

      } catch (error) {
        lastError = error as Error;

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await this.sleep(delay);
        }
      }
    }

    // All retries exhausted - try fallback
    if (step.errorHandling?.fallback) {
      const fallbackStep = this.findStep(context.config.steps, step.errorHandling.fallback);
      if (fallbackStep) {
        return this.executeStepWithErrorHandling(fallbackStep, context);
      }
    }

    // Record failure
    context.metrics.failedSteps++;

    return {
      status: 'error',
      error: lastError!,
      output: null,
      metrics: {}
    };
  }

  /**
   * Check if a step should execute based on its condition
   */
  private async shouldExecuteStep(
    step: FlowStep,
    context: ExecutionContext
  ): Promise<boolean> {
    if (!step.condition) {
      return true;
    }

    try {
      return this.conditionEvaluator.evaluate(
        step.condition.expression,
        context
      );
    } catch (error) {
      console.error(`Condition evaluation failed for step ${step.id}:`, error);
      return step.condition.defaultValue ?? false;
    }
  }

  /**
   * Validate flow configuration
   */
  private validateFlowConfig(config: FlowConfiguration): void {
    if (!config.steps || config.steps.length === 0) {
      throw new ValidationError('Flow must have at least one step');
    }

    // Validate step IDs are unique
    const stepIds = new Set<string>();
    for (const step of config.steps) {
      if (stepIds.has(step.id)) {
        throw new ValidationError(`Duplicate step ID: ${step.id}`);
      }
      stepIds.add(step.id);
    }

    // Validate step references
    for (const step of config.steps) {
      if (step.condition?.onTrue && !stepIds.has(step.condition.onTrue)) {
        throw new ValidationError(
          `Step ${step.id} references unknown onTrue step: ${step.condition.onTrue}`
        );
      }
      if (step.condition?.onFalse && !stepIds.has(step.condition.onFalse)) {
        throw new ValidationError(
          `Step ${step.id} references unknown onFalse step: ${step.condition.onFalse}`
        );
      }
      if (step.errorHandling?.fallback && !stepIds.has(step.errorHandling.fallback)) {
        throw new ValidationError(
          `Step ${step.id} references unknown fallback step: ${step.errorHandling.fallback}`
        );
      }
    }
  }

  /**
   * Build execution metrics
   */
  private buildMetrics(context: ExecutionContext | null): ExecutionMetrics {
    if (!context) {
      return {
        totalSteps: 0,
        successfulSteps: 0,
        failedSteps: 0,
        skippedSteps: 0,
        totalTokens: 0,
        totalCost: 0,
        cacheHits: 0,
        cacheMisses: 0
      };
    }

    return {
      totalSteps: context.config.steps.length,
      successfulSteps: context.metrics.successfulSteps,
      failedSteps: context.metrics.failedSteps,
      skippedSteps: context.metrics.skippedSteps,
      totalTokens: context.metrics.totalTokens,
      totalCost: context.metrics.totalCost,
      cacheHits: context.metrics.cacheHits,
      cacheMisses: context.metrics.cacheMisses
    };
  }

  /**
   * Generate unique trace ID
   */
  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Find a step by ID
   */
  private findStep(steps: FlowStep[], stepId: string): FlowStep | undefined {
    return steps.find(s => s.id === stepId);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface ExecutionOptions {
  timeout?: number;
  userId?: string;
  sessionId?: string;
  dryRun?: boolean;
  debug?: boolean;
  variables?: Record<string, any>;
}

export interface ExecutionResult {
  success: boolean;
  output?: any;
  error?: Error;
  traceId: string;
  metrics: ExecutionMetrics;
  duration: number;
  context?: any;
}

export interface ExecutionMetrics {
  totalSteps: number;
  successfulSteps: number;
  failedSteps: number;
  skippedSteps: number;
  totalTokens: number;
  totalCost: number;
  cacheHits: number;
  cacheMisses: number;
}

// ============================================================================
// Custom Errors
// ============================================================================

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class StepExecutionError extends Error {
  constructor(
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'StepExecutionError';
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create an enhanced flow executor
 */
export function createEnhancedExecutor(): EnhancedFlowExecutor {
  return new EnhancedFlowExecutor();
}

/**
 * Quick execution helper
 */
export async function executeFlow(
  config: FlowConfiguration,
  input: any,
  options?: ExecutionOptions
): Promise<ExecutionResult> {
  const executor = new EnhancedFlowExecutor();
  return executor.execute(config, input, options);
}
