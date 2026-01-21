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
  private circuitBreaker: CircuitBreaker;

  constructor() {
    this.contextManager = new ContextManager();
    this.schemaValidator = new SchemaValidator();
    this.templateEngine = new TemplateEngine();
    this.conditionEvaluator = new ConditionEvaluator();
    this.stepExecutor = new StepExecutor(this.contextManager, this.templateEngine);
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      halfOpenMaxAttempts: 3
    });
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
    const globalTimeout = options.timeout || config.config?.timeout || 300000; // Default 5 minutes

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

      // Execute flow steps with global timeout
      const executionPromise = this.executeSteps(config.steps, context);
      const timeoutPromise = this.createTimeout(globalTimeout, 'Flow execution timeout');
      
      await Promise.race([executionPromise, timeoutPromise]);

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
   * Supports both sequential and parallel execution based on dependencies
   */
  private async executeSteps(
    steps: FlowStep[],
    context: ExecutionContext
  ): Promise<void> {
    // Build dependency graph
    const dependencyGraph = this.buildDependencyGraph(steps);
    
    // Get execution levels (steps that can run in parallel)
    const executionLevels = this.topologicalSort(steps, dependencyGraph);

    // Execute each level
    for (const level of executionLevels) {
      // If level has only one step, execute sequentially
      if (level.length === 1) {
        const step = level[0];
        
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
      } else {
        // Execute multiple independent steps in parallel
        await this.executeStepsInParallel(level, context);
      }
    }
  }

  /**
   * Execute multiple independent steps in parallel
   */
  private async executeStepsInParallel(
    steps: FlowStep[],
    context: ExecutionContext
  ): Promise<void> {
    const promises = steps.map(async (step) => {
      // Check if step should execute based on conditions
      if (!await this.shouldExecuteStep(step, context)) {
        context.metrics.skippedSteps++;
        return { step, result: null, skipped: true };
      }

      // Execute step with error handling
      const result = await this.executeStepWithErrorHandling(step, context);

      // Update context with result
      await this.contextManager.updateContext(context, step, result);

      return { step, result, skipped: false };
    });

    const results = await Promise.allSettled(promises);

    // Check for failures
    for (const promiseResult of results) {
      if (promiseResult.status === 'rejected') {
        throw new StepExecutionError(
          `Parallel step execution failed: ${promiseResult.reason}`,
          { error: promiseResult.reason }
        );
      }

      const { step, result, skipped } = promiseResult.value;
      
      if (!skipped && result?.status === 'error' && !step.errorHandling?.continueOnError) {
        throw new StepExecutionError(
          `Step ${step.name} failed: ${result.error?.message}`,
          { step, error: result.error }
        );
      }
    }
  }

  /**
   * Execute a single step with retry, timeout, circuit breaker, and error handling
   */
  private async executeStepWithErrorHandling(
    step: FlowStep,
    context: ExecutionContext
  ): Promise<StepResult> {
    const maxRetries = step.errorHandling?.retries ?? 0;
    const stepTimeout = step.config?.timeout || context.options.stepTimeout || 30000; // Default 30 seconds
    let lastError: Error | undefined;

    // Check circuit breaker state
    if (this.circuitBreaker.isOpen()) {
      context.metrics.failedSteps++;
      return {
        status: 'error',
        error: new Error(`Circuit breaker is OPEN for step ${step.name}. Too many recent failures.`),
        output: null,
        metrics: {}
      };
    }

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Execute step with timeout using circuit breaker
        const result = await this.circuitBreaker.execute(async () => {
          const executionPromise = this.stepExecutor.execute(step, context);
          const timeoutPromise = this.createTimeout(stepTimeout, `Step ${step.name} timeout`);
          
          return await Promise.race([executionPromise, timeoutPromise]);
        });

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

  /**
   * Create a timeout promise that rejects after specified milliseconds
   */
  private createTimeout(ms: number, message: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new TimeoutError(message, ms));
      }, ms);
    });
  }

  /**
   * Build dependency graph for steps
   * Returns a map of step ID to list of step IDs it depends on
   */
  private buildDependencyGraph(steps: FlowStep[]): Map<string, Set<string>> {
    const graph = new Map<string, Set<string>>();

    for (const step of steps) {
      if (!graph.has(step.id)) {
        graph.set(step.id, new Set());
      }

      // Analyze step config for variable references to other steps
      const configStr = JSON.stringify(step.config);
      const stepRefs = configStr.match(/\{\{steps\.(\w+)/g) || [];

      for (const ref of stepRefs) {
        const depStepId = ref.match(/steps\.(\w+)/)?.[1];
        if (depStepId && steps.some(s => s.id === depStepId)) {
          graph.get(step.id)!.add(depStepId);
        }
      }

      // Also check input references
      const inputRefs = configStr.match(/\{\{input\.(\w+)/g) || [];
      // Input doesn't create dependencies on other steps
    }

    return graph;
  }

  /**
   * Topological sort to determine execution order
   * Returns levels of steps that can be executed in parallel
   */
  private topologicalSort(
    steps: FlowStep[],
    dependencyGraph: Map<string, Set<string>>
  ): FlowStep[][] {
    const levels: FlowStep[][] = [];
    const stepMap = new Map(steps.map(s => [s.id, s]));
    const processed = new Set<string>();
    const inProgress = new Set<string>();

    // Calculate in-degree for each step
    const inDegree = new Map<string, number>();
    for (const step of steps) {
      inDegree.set(step.id, 0);
    }

    for (const deps of dependencyGraph.values()) {
      for (const dep of deps) {
        inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
      }
    }

    // Process steps level by level
    while (processed.size < steps.length) {
      const currentLevel: FlowStep[] = [];

      // Find all steps with no remaining dependencies
      for (const step of steps) {
        if (processed.has(step.id) || inProgress.has(step.id)) {
          continue;
        }

        const deps = dependencyGraph.get(step.id) || new Set();
        const allDepsProcessed = Array.from(deps).every(dep => processed.has(dep));

        if (allDepsProcessed) {
          currentLevel.push(step);
          inProgress.add(step.id);
        }
      }

      if (currentLevel.length === 0) {
        // No progress possible - might be a circular dependency
        const remaining = steps.filter(s => !processed.has(s.id));
        if (remaining.length > 0) {
          console.warn('Possible circular dependency detected, executing remaining steps sequentially');
          levels.push(remaining);
          break;
        }
        break;
      }

      levels.push(currentLevel);

      // Mark current level as processed
      for (const step of currentLevel) {
        processed.add(step.id);
        inProgress.delete(step.id);
      }
    }

    return levels;
  }
}

// ============================================================================
// Circuit Breaker Implementation
// ============================================================================

enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  halfOpenMaxAttempts: number;
}

class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private halfOpenAttempts: number = 0;
  private config: CircuitBreakerConfig;

  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Check if circuit should transition from OPEN to HALF_OPEN
    if (this.state === CircuitBreakerState.OPEN) {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure >= this.config.resetTimeout) {
        console.log('Circuit breaker transitioning to HALF_OPEN');
        this.state = CircuitBreakerState.HALF_OPEN;
        this.halfOpenAttempts = 0;
      } else {
        throw new Error(`Circuit breaker is OPEN. Retry after ${this.config.resetTimeout - timeSinceLastFailure}ms`);
      }
    }

    try {
      const result = await operation();
      
      // Success - handle state transitions
      if (this.state === CircuitBreakerState.HALF_OPEN) {
        this.halfOpenAttempts++;
        if (this.halfOpenAttempts >= this.config.halfOpenMaxAttempts) {
          console.log('Circuit breaker transitioning to CLOSED');
          this.state = CircuitBreakerState.CLOSED;
          this.failureCount = 0;
          this.halfOpenAttempts = 0;
        }
      } else if (this.state === CircuitBreakerState.CLOSED) {
        // Reset failure count on success
        this.failureCount = 0;
      }

      return result;

    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      // Check if we should open the circuit
      if (this.state === CircuitBreakerState.CLOSED && 
          this.failureCount >= this.config.failureThreshold) {
        console.log(`Circuit breaker OPENING after ${this.failureCount} failures`);
        this.state = CircuitBreakerState.OPEN;
      } else if (this.state === CircuitBreakerState.HALF_OPEN) {
        console.log('Circuit breaker returning to OPEN state');
        this.state = CircuitBreakerState.OPEN;
        this.halfOpenAttempts = 0;
      }

      throw error;
    }
  }

  isOpen(): boolean {
    return this.state === CircuitBreakerState.OPEN;
  }

  getState(): CircuitBreakerState {
    return this.state;
  }

  getMetrics() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      halfOpenAttempts: this.halfOpenAttempts
    };
  }

  reset(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.halfOpenAttempts = 0;
  }
}

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface ExecutionOptions {
  timeout?: number;
  stepTimeout?: number;
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

export class TimeoutError extends Error {
  constructor(
    message: string,
    public timeoutMs: number
  ) {
    super(message);
    this.name = 'TimeoutError';
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
