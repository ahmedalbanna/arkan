# Dynamic Flow System - Comprehensive Implementation Guide

**Version**: 2.0  
**Last Updated**: 2026-01-14  
**Status**: Expansion of dynamic-flows.md with detailed architecture and implementation specifications

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Technical Specifications](#technical-specifications)
4. [Implementation Guide](#implementation-guide)
5. [API Documentation](#api-documentation)
6. [Testing Strategy](#testing-strategy)
7. [Deployment & Operations](#deployment-operations)
8. [Migration Strategy](#migration-strategy)
9. [Performance & Optimization](#performance-optimization)
10. [Security Considerations](#security-considerations)

---

## Executive Summary

### Vision
Transform Arkan's static Genkit AI flows into a dynamic, configuration-driven system that enables:
- Remote flow management without code deployment
- A/B testing and experimentation
- Real-time prompt optimization
- Visual flow builder interface
- Comprehensive observability and tracing

### Key Benefits
- **Agility**: Update AI behaviors in minutes, not hours
- **Experimentation**: Test multiple prompt variations simultaneously
- **Observability**: Complete trace visibility for debugging and optimization
- **Scalability**: Configuration-driven architecture supports rapid growth
- **Maintainability**: Centralized management reduces technical debt

### Success Metrics
- Migration of all 23+ static flows to dynamic system
- <100ms overhead per dynamic flow execution
- 90%+ test coverage across all components
- Zero downtime deployment capability
- Complete audit trail for all configuration changes

---


## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  React Components                                                │
│  ├── Flow Builder UI (Visual Editor)                            │
│  ├── Prompt Management Interface                                 │
│  ├── Tool Registry Browser                                       │
│  └── Execution Trace Viewer                                      │
└─────────────────┬───────────────────────────────────────────────┘
                  │ REST API / GraphQL
┌─────────────────┴───────────────────────────────────────────────┐
│                      API GATEWAY LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  Next.js API Routes                                              │
│  ├── /api/admin/flows      - Flow CRUD operations               │
│  ├── /api/admin/prompts    - Prompt management                  │
│  ├── /api/admin/tools      - Tool registry                      │
│  └── /api/admin/traces     - Execution monitoring               │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────────────────┐
│                     SERVICE LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  Business Logic Services                                         │
│  ├── FlowConfigService     - Flow configuration management      │
│  ├── PromptService         - Prompt versioning & templates      │
│  ├── ToolRegistryService   - Tool discovery & validation        │
│  └── ExecutionTraceService - Observability & analytics          │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────────────────┐
│                    EXECUTION ENGINE                              │
├─────────────────────────────────────────────────────────────────┤
│  Dynamic Flow Runtime                                            │
│  ├── Context Manager       - State & variable management        │
│  ├── Schema Validator      - Input/output validation            │
│  ├── Step Executor         - Orchestrates flow execution        │
│  ├── Step Handlers         - Individual step implementations    │
│  ├── Template Engine       - Dynamic prompt rendering           │
│  └── Condition Evaluator   - Branching logic evaluation         │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────────────────┐
│                      DATA LAYER                                  │
├─────────────────────────────────────────────────────────────────┤
│  Firebase Firestore Collections                                  │
│  ├── flow_configs          - Flow definitions & versions        │
│  ├── prompt_templates      - Prompt library with versioning     │
│  ├── tool_registry         - Available tools & schemas          │
│  ├── execution_traces      - Runtime telemetry & logs           │
│  └── flow_versions         - Historical configuration snapshots │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
├─────────────────────────────────────────────────────────────────┤
│  ├── Google Genkit AI      - AI model orchestration             │
│  ├── Firebase Storage      - Large file handling                │
│  ├── Qdrant Vector DB      - RAG knowledge base                 │
│  └── Firebase Analytics    - Usage tracking & metrics           │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Diagram

```
┌──────────┐
│   User   │
└────┬─────┘
     │ 1. Execute Flow Request
     ↓
┌────────────────┐
│  API Gateway   │
└────┬───────────┘
     │ 2. Load Flow Config
     ↓
┌──────────────────┐     ┌─────────────────┐
│ FlowConfigService├────→│    Firestore    │
└────┬─────────────┘     └─────────────────┘
     │ 3. Flow Config
     ↓
┌────────────────────┐
│ DynamicFlowExecutor│
└────┬───────────────┘
     │ 4. Initialize Context
     ↓
┌──────────────┐
│ContextManager│
└────┬─────────┘
     │ 5. For Each Step
     ↓
┌─────────────────┐
│  TemplateEngine │  ← Render prompt with variables
└────┬────────────┘
     │ 6. Rendered Prompt
     ↓
┌──────────────┐
│ StepExecutor │
└────┬─────────┘
     │ 7. Execute Step (AI/Tool)
     ↓
┌────────────────┐     ┌──────────────┐
│   Genkit AI    │────→│  Gemini API  │
└────┬───────────┘     └──────────────┘
     │ 8. Step Result
     ↓
┌──────────────┐
│ ContextManager│ ← Update context with result
└────┬─────────┘
     │ 9. Continue to next step or finish
     ↓
┌────────────────────────┐     ┌─────────────────┐
│ ExecutionTraceService  │────→│    Firestore    │
└────┬───────────────────┘     └─────────────────┘
     │ 10. Save execution trace
     ↓
┌────────────────┐
│  Return Result │
└────┬───────────┘
     │ 11. Response
     ↓
┌──────────┐
│   User   │
└──────────┘
```

---

## Technical Specifications

### Core Component Details

#### 1. DynamicFlowExecutor

**Location**: `src/ai/dynamic-flow/executor.ts`

**Responsibilities**:
- Orchestrate multi-step flow execution
- Handle error recovery and retries
- Manage execution lifecycle
- Coordinate with other components

**Key Interfaces**:

```typescript
interface ExecutionOptions {
  timeout?: number;
  userId?: string;
  sessionId?: string;
  dryRun?: boolean;
  debug?: boolean;
  variables?: Record<string, any>;
}

interface ExecutionResult {
  success: boolean;
  output?: any;
  error?: Error;
  traceId: string;
  metrics: ExecutionMetrics;
  duration: number;
}

interface ExecutionMetrics {
  totalSteps: number;
  successfulSteps: number;
  failedSteps: number;
  skippedSteps: number;
  totalTokens: number;
  totalCost: number;
  cacheHits: number;
  cacheMisses: number;
}
```

**Implementation Highlights**:

```typescript
export class DynamicFlowExecutor {
  constructor(
    private contextManager: ContextManager,
    private schemaValidator: SchemaValidator,
    private stepExecutor: StepExecutor,
    private templateEngine: TemplateEngine,
    private conditionEvaluator: ConditionEvaluator,
    private traceService: ExecutionTraceService
  ) {}

  async execute(
    config: FlowConfig,
    input: any,
    options: ExecutionOptions = {}
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    const trace = await this.traceService.startTrace(config, input, options);

    try {
      // Validate configuration
      this.validateFlowConfig(config);

      // Validate and sanitize input
      const validatedInput = await this.schemaValidator.validate(
        input,
        config.inputSchema
      );

      // Initialize execution context
      const context = await this.contextManager.initialize({
        input: validatedInput,
        config,
        options,
        traceId: trace.id
      });

      // Execute flow steps
      await this.executeSteps(config.steps, context, trace.id);

      // Extract and validate output
      const output = this.contextManager.extractOutput(context, config.outputMapping);
      const validatedOutput = await this.schemaValidator.validate(
        output,
        config.outputSchema
      );

      // Build metrics
      const metrics = this.buildMetrics(context);

      // Complete trace
      await this.traceService.completeTrace(trace.id, {
        status: 'success',
        output: validatedOutput,
        metrics
      });

      return {
        success: true,
        output: validatedOutput,
        traceId: trace.id,
        metrics,
        duration: Date.now() - startTime
      };

    } catch (error) {
      await this.traceService.completeTrace(trace.id, {
        status: 'error',
        error: this.normalizeError(error)
      });

      return {
        success: false,
        error: error as Error,
        traceId: trace.id,
        metrics: this.buildMetrics(context),
        duration: Date.now() - startTime
      };
    } finally {
      // Cleanup context
      await this.contextManager.cleanup(context.id);
    }
  }

  private async executeSteps(
    steps: FlowStep[],
    context: ExecutionContext,
    traceId: string
  ): Promise<void> {
    for (const step of steps) {
      // Check execution conditions
      if (!await this.shouldExecuteStep(step, context)) {
        await this.traceService.recordSkippedStep(traceId, step.id);
        context.metrics.skippedSteps++;
        continue;
      }

      // Execute with retries and error handling
      const result = await this.executeStepWithErrorHandling(
        step,
        context,
        traceId
      );

      // Update context
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

  private async executeStepWithErrorHandling(
    step: FlowStep,
    context: ExecutionContext,
    traceId: string
  ): Promise<StepResult> {
    const maxRetries = step.errorHandling?.retries ?? 0;
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Execute the step
        const result = await this.stepExecutor.execute(step, context);
        
        // Record success
        await this.traceService.recordStepSuccess(traceId, step.id, result);
        context.metrics.successfulSteps++;
        
        return result;

      } catch (error) {
        lastError = error as Error;
        
        // Log attempt
        await this.traceService.recordStepAttempt(
          traceId,
          step.id,
          attempt + 1,
          error
        );

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
        return this.executeStepWithErrorHandling(fallbackStep, context, traceId);
      }
    }

    // Record failure
    await this.traceService.recordStepError(traceId, step.id, lastError!);
    context.metrics.failedSteps++;

    return {
      status: 'error',
      error: lastError!,
      output: null
    };
  }

  private async shouldExecuteStep(
    step: FlowStep,
    context: ExecutionContext
  ): Promise<boolean> {
    if (!step.condition) {
      return true;
    }

    try {
      return await this.conditionEvaluator.evaluate(
        step.condition.expression,
        context
      );
    } catch (error) {
      console.error(`Condition evaluation failed for step ${step.id}:`, error);
      return step.condition.defaultValue ?? false;
    }
  }

  private validateFlowConfig(config: FlowConfig): void {
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

  private buildMetrics(context: ExecutionContext): ExecutionMetrics {
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

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private findStep(steps: FlowStep[], stepId: string): FlowStep | undefined {
    return steps.find(s => s.id === stepId);
  }

  private normalizeError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error(String(error));
  }
}
```

---

#### 2. Context Manager

**Location**: `src/ai/dynamic-flow/context-manager.ts`

**Responsibilities**:
- Manage execution state and variables
- Provide type-safe variable access
- Track step results and metrics
- Support context snapshots for debugging

**Implementation**:

```typescript
export interface ExecutionContext {
  id: string;
  traceId: string;
  
  // Input data
  input: any;
  
  // Configuration
  config: FlowConfig;
  options: ExecutionOptions;
  
  // Runtime state
  variables: Map<string, any>;
  stepResults: Map<string, StepResult>;
  
  // Metrics
  metrics: {
    successfulSteps: number;
    failedSteps: number;
    skippedSteps: number;
    totalTokens: number;
    totalCost: number;
    cacheHits: number;
    cacheMisses: number;
  };
  
  // Timestamps
  startTime: number;
  lastStepTime?: number;
}

export class ContextManager {
  private contexts: Map<string, ExecutionContext> = new Map();
  
  async initialize(params: {
    input: any;
    config: FlowConfig;
    options: ExecutionOptions;
    traceId: string;
  }): Promise<ExecutionContext> {
    const context: ExecutionContext = {
      id: this.generateContextId(),
      traceId: params.traceId,
      input: params.input,
      config: params.config,
      options: params.options,
      variables: new Map(),
      stepResults: new Map(),
      metrics: {
        successfulSteps: 0,
        failedSteps: 0,
        skippedSteps: 0,
        totalTokens: 0,
        totalCost: 0,
        cacheHits: 0,
        cacheMisses: 0
      },
      startTime: Date.now()
    };
    
    // Initialize with any provided variables
    if (params.options.variables) {
      for (const [key, value] of Object.entries(params.options.variables)) {
        context.variables.set(key, value);
      }
    }
    
    this.contexts.set(context.id, context);
    return context;
  }
  
  async updateContext(
    context: ExecutionContext,
    step: FlowStep,
    result: StepResult
  ): Promise<void> {
    // Store step result
    context.stepResults.set(step.id, result);
    context.lastStepTime = Date.now();
    
    // Apply output mapping to context variables
    if (step.contextMapping?.output && result.output) {
      for (const [outputPath, contextVar] of Object.entries(step.contextMapping.output)) {
        const value = this.extractValue(result.output, outputPath);
        context.variables.set(contextVar, value);
      }
    }
    
    // Update metrics
    if (result.metrics) {
      context.metrics.totalTokens += result.metrics.tokens || 0;
      context.metrics.totalCost += result.metrics.cost || 0;
      
      if (result.metrics.cacheHit) {
        context.metrics.cacheHits++;
      } else {
        context.metrics.cacheMisses++;
      }
    }
  }
  
  getVariable(context: ExecutionContext, name: string): any {
    // Check explicit variables first
    if (context.variables.has(name)) {
      return context.variables.get(name);
    }
    
    // Check input with path notation (input.fieldName)
    if (name.startsWith('input.')) {
      const path = name.substring(6);
      return this.extractValue(context.input, path);
    }
    
    // Check step results with path notation (stepId.outputField)
    if (name.includes('.')) {
      const [stepId, ...pathParts] = name.split('.');
      const stepResult = context.stepResults.get(stepId);
      if (stepResult?.output) {
        return this.extractValue(stepResult.output, pathParts.join('.'));
      }
    }
    
    // Check for special variables
    if (name === 'context.stepCount') {
      return context.stepResults.size;
    }
    if (name === 'context.duration') {
      return Date.now() - context.startTime;
    }
    
    return undefined;
  }
  
  setVariable(context: ExecutionContext, name: string, value: any): void {
    context.variables.set(name, value);
  }
  
  extractOutput(
    context: ExecutionContext,
    outputMapping?: Record<string, string>
  ): any {
    if (outputMapping) {
      // Build output object from mapping
      const output: any = {};
      for (const [outputKey, contextPath] of Object.entries(outputMapping)) {
        output[outputKey] = this.getVariable(context, contextPath);
      }
      return output;
    }
    
    // Default: return last step output
    const lastStepResult = Array.from(context.stepResults.values()).pop();
    return lastStepResult?.output || null;
  }
  
  snapshot(context: ExecutionContext): ContextSnapshot {
    return {
      id: context.id,
      traceId: context.traceId,
      timestamp: Date.now(),
      variables: Object.fromEntries(context.variables),
      stepResults: Array.from(context.stepResults.entries()).map(([id, result]) => ({
        stepId: id,
        status: result.status,
        output: result.output
      })),
      metrics: { ...context.metrics }
    };
  }
  
  async cleanup(contextId: string): Promise<void> {
    this.contexts.delete(contextId);
  }
  
  private extractValue(obj: any, path: string): any {
    if (!path) return obj;
    
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      // Handle array indices
      const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
      if (arrayMatch) {
        const [, key, index] = arrayMatch;
        current = current?.[key]?.[parseInt(index)];
      } else {
        current = current?.[part];
      }
      
      if (current === undefined) {
        return undefined;
      }
    }
    
    return current;
  }
  
  private generateContextId(): string {
    return `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

---


#### 3. Step Executor

**Location**: `src/ai/dynamic-flow/step-executor.ts`

**Responsibilities**:
- Execute individual flow steps
- Handle different step types (prompt, tool, condition, loop)
- Manage step-level caching
- Coordinate with AI models and tools

**Implementation**:

```typescript
export class StepExecutor {
  constructor(
    private ai: ReturnType<typeof initializeGenkit>,
    private toolRegistry: ToolRegistry,
    private templateEngine: TemplateEngine,
    private contextManager: ContextManager,
    private cache: StepCache
  ) {}

  async execute(
    step: FlowStep,
    context: ExecutionContext
  ): Promise<StepResult> {
    const startTime = Date.now();

    try {
      // Check cache
      if (step.config.caching?.enabled) {
        const cached = await this.cache.get(step, context);
        if (cached) {
          return {
            ...cached,
            metrics: { ...cached.metrics, cacheHit: true }
          };
        }
      }

      // Prepare step input from context
      const input = this.prepareInput(step, context);

      // Execute based on step type
      let result: StepResult;
      switch (step.type) {
        case 'prompt':
          result = await this.executePromptStep(step, input, context);
          break;
        case 'tool':
          result = await this.executeToolStep(step, input, context);
          break;
        case 'condition':
          result = await this.executeConditionStep(step, input, context);
          break;
        case 'loop':
          result = await this.executeLoopStep(step, input, context);
          break;
        case 'parallel':
          result = await this.executeParallelStep(step, input, context);
          break;
        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      // Add execution metrics
      result.metrics = {
        ...result.metrics,
        duration: Date.now() - startTime,
        cacheHit: false
      };

      // Cache result if enabled
      if (step.config.caching?.enabled) {
        await this.cache.set(step, context, result);
      }

      return result;

    } catch (error) {
      return {
        status: 'error',
        error: error as Error,
        output: null,
        metrics: {
          duration: Date.now() - startTime,
          cacheHit: false
        }
      };
    }
  }

  private async executePromptStep(
    step: FlowStep,
    input: any,
    context: ExecutionContext
  ): Promise<StepResult> {
    const config = step.config as PromptStepConfig;

    // Load prompt template
    const promptTemplate = await this.loadPromptTemplate(config.promptId);

    // Render prompt with context variables
    const renderedPrompt = this.templateEngine.render(
      promptTemplate.template,
      context
    );

    // Execute AI generation
    const result = await this.ai.generate({
      model: config.model || 'gemini-2.0-flash-exp',
      prompt: renderedPrompt,
      config: {
        temperature: config.temperature,
        maxOutputTokens: config.maxTokens,
        topK: config.topK,
        topP: config.topP
      }
    });

    return {
      status: 'success',
      output: result.text,
      metrics: {
        tokens: result.usage?.totalTokens || 0,
        cost: this.calculateCost(result.usage),
        model: config.model
      }
    };
  }

  private async executeToolStep(
    step: FlowStep,
    input: any,
    context: ExecutionContext
  ): Promise<StepResult> {
    const config = step.config as ToolStepConfig;

    // Get tool from registry
    const tool = await this.toolRegistry.getTool(config.toolName);
    if (!tool) {
      throw new Error(`Tool not found: ${config.toolName}`);
    }

    // Prepare tool parameters
    const parameters = this.resolveParameters(config.parameters, context);

    // Validate parameters
    if (tool.inputSchema) {
      await this.validateToolInput(parameters, tool.inputSchema);
    }

    // Execute tool
    const result = await tool.execute(parameters);

    return {
      status: 'success',
      output: result,
      metrics: {
        tool: config.toolName
      }
    };
  }

  private async executeConditionStep(
    step: FlowStep,
    input: any,
    context: ExecutionContext
  ): Promise<StepResult> {
    const config = step.config as ConditionStepConfig;

    // Evaluate condition
    const conditionResult = await this.evaluateCondition(
      config.condition,
      context
    );

    return {
      status: 'success',
      output: {
        conditionMet: conditionResult,
        nextStep: conditionResult ? config.onTrue : config.onFalse
      },
      metrics: {}
    };
  }

  private async executeLoopStep(
    step: FlowStep,
    input: any,
    context: ExecutionContext
  ): Promise<StepResult> {
    const config = step.config as LoopStepConfig;

    // Get array to iterate over
    const items = this.contextManager.getVariable(context, config.iterateOver);
    if (!Array.isArray(items)) {
      throw new Error(`Loop variable ${config.iterateOver} is not an array`);
    }

    const maxIterations = config.maxIterations || items.length;
    const results: any[] = [];

    // Execute loop steps for each item
    for (let i = 0; i < Math.min(items.length, maxIterations); i++) {
      const item = items[i];

      // Create loop context with current item
      const loopContext = this.createLoopContext(context, item, i);

      // Execute loop steps
      const loopResults = await this.executeSteps(config.steps, loopContext);
      results.push(loopResults);
    }

    return {
      status: 'success',
      output: results,
      metrics: {
        iterations: results.length
      }
    };
  }

  private async executeParallelStep(
    step: FlowStep,
    input: any,
    context: ExecutionContext
  ): Promise<StepResult> {
    const config = step.config as ParallelStepConfig;

    // Execute all parallel steps concurrently
    const promises = config.steps.map(parallelStep =>
      this.execute(parallelStep, context)
    );

    const results = await Promise.allSettled(promises);

    // Check if any failed
    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length > 0 && !config.allowPartialFailure) {
      throw new Error(
        `${failures.length} parallel steps failed: ${failures.map(f => f.reason).join(', ')}`
      );
    }

    return {
      status: 'success',
      output: results.map((r, i) => ({
        stepId: config.steps[i].id,
        status: r.status,
        output: r.status === 'fulfilled' ? r.value.output : null,
        error: r.status === 'rejected' ? r.reason : null
      })),
      metrics: {
        parallelSteps: config.steps.length,
        successful: results.filter(r => r.status === 'fulfilled').length,
        failed: failures.length
      }
    };
  }

  private prepareInput(step: FlowStep, context: ExecutionContext): any {
    if (!step.contextMapping?.input) {
      return context.input;
    }

    const input: any = {};
    for (const [inputKey, contextPath] of Object.entries(step.contextMapping.input)) {
      input[inputKey] = this.contextManager.getVariable(context, contextPath);
    }
    return input;
  }

  private resolveParameters(
    parameters: Record<string, any>,
    context: ExecutionContext
  ): Record<string, any> {
    const resolved: Record<string, any> = {};

    for (const [key, value] of Object.entries(parameters)) {
      if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
        // Template variable reference
        const varName = value.slice(2, -2).trim();
        resolved[key] = this.contextManager.getVariable(context, varName);
      } else {
        resolved[key] = value;
      }
    }

    return resolved;
  }

  private async loadPromptTemplate(promptId: string): Promise<PromptTemplate> {
    // Implementation to load from Firestore or cache
    // This would typically call PromptManagementService
    throw new Error('Not implemented');
  }

  private calculateCost(usage: any): number {
    if (!usage) return 0;
    
    // Gemini 2.0 Flash pricing (example)
    const inputCostPer1M = 0.075;
    const outputCostPer1M = 0.30;
    
    const inputCost = (usage.inputTokens / 1_000_000) * inputCostPer1M;
    const outputCost = (usage.outputTokens / 1_000_000) * outputCostPer1M;
    
    return inputCost + outputCost;
  }
}
```

---

## Implementation Guide

### Week 1-2: Foundation Setup

#### Database Schema Setup

**Firestore Collections Structure**:

```javascript
// Collection: flow_configs
{
  "id": "flow_123",
  "name": "generate-report-section",
  "description": "Generates a report section with citations",
  "version": "1.0.0",
  "status": "active",
  "category": "content-generation",
  "tags": ["report", "academic", "citations"],
  
  "inputSchema": {
    "type": "object",
    "properties": {
      "topic": { "type": "string" },
      "context": { "type": "string" },
      "citationStyle": { "type": "string", "enum": ["APA", "MLA", "Chicago"] }
    },
    "required": ["topic"]
  },
  
  "outputSchema": {
    "type": "object",
    "properties": {
      "content": { "type": "string" },
      "citations": { "type": "array" }
    }
  },
  
  "steps": [
    {
      "id": "step_1",
      "name": "Research Topic",
      "type": "tool",
      "config": {
        "toolName": "ragRetrieval",
        "parameters": {
          "query": "{{input.topic}}",
          "limit": 5
        }
      },
      "contextMapping": {
        "output": {
          "results": "researchResults"
        }
      }
    },
    {
      "id": "step_2",
      "name": "Generate Content",
      "type": "prompt",
      "config": {
        "promptId": "generate-section-with-citations",
        "model": "gemini-2.0-flash-exp",
        "temperature": 0.7,
        "maxTokens": 2000
      },
      "contextMapping": {
        "input": {
          "topic": "input.topic",
          "research": "researchResults",
          "style": "input.citationStyle"
        },
        "output": {
          "content": "sectionContent",
          "citations": "extractedCitations"
        }
      }
    },
    {
      "id": "step_3",
      "name": "Format Citations",
      "type": "tool",
      "config": {
        "toolName": "formatCitations",
        "parameters": {
          "citations": "{{extractedCitations}}",
          "style": "{{input.citationStyle}}"
        }
      }
    }
  ],
  
  "config": {
    "timeout": 60000,
    "retryPolicy": {
      "maxRetries": 2,
      "backoffMultiplier": 2
    },
    "caching": {
      "enabled": true,
      "ttl": 3600
    }
  },
  
  "metadata": {
    "author": "admin@arkan.com",
    "createdAt": "2026-01-14T00:00:00Z",
    "updatedAt": "2026-01-14T00:00:00Z"
  }
}

// Collection: prompt_templates
{
  "id": "prompt_456",
  "name": "generate-section-with-citations",
  "description": "Generates academic content with proper citations",
  "version": "1.0.0",
  
  "template": `You are an academic writer creating a report section.

Topic: {{topic}}

Research Context:
{{#each research}}
- {{this.content}}
  Source: {{this.source}}
{{/each}}

Instructions:
1. Write a comprehensive section about the topic
2. Use the provided research to support your points
3. Include in-text citations in {{style}} format
4. Ensure academic tone and proper structure

Generate the content now:`,
  
  "variables": [
    {
      "name": "topic",
      "type": "string",
      "description": "The main topic for the section",
      "required": true
    },
    {
      "name": "research",
      "type": "array",
      "description": "Research results from RAG",
      "required": true
    },
    {
      "name": "style",
      "type": "string",
      "description": "Citation style (APA, MLA, Chicago)",
      "required": true,
      "defaultValue": "APA"
    }
  ],
  
  "variants": [
    {
      "id": "variant_a",
      "name": "Concise Version",
      "template": "...",
      "weight": 0.5,
      "metrics": {
        "impressions": 100,
        "successRate": 0.92,
        "avgLatency": 2300
      }
    },
    {
      "id": "variant_b",
      "name": "Detailed Version",
      "template": "...",
      "weight": 0.5,
      "metrics": {
        "impressions": 100,
        "successRate": 0.88,
        "avgLatency": 3100
      }
    }
  ],
  
  "metadata": {
    "category": "content-generation",
    "tags": ["academic", "citations"],
    "author": "admin@arkan.com",
    "createdAt": "2026-01-14T00:00:00Z",
    "updatedAt": "2026-01-14T00:00:00Z"
  }
}

// Collection: execution_traces
{
  "id": "trace_789",
  "flowId": "flow_123",
  "flowVersion": "1.0.0",
  "userId": "user_001",
  "sessionId": "session_abc",
  
  "startTime": "2026-01-14T10:00:00Z",
  "endTime": "2026-01-14T10:00:05Z",
  "duration": 5234,
  "status": "success",
  
  "input": {
    "topic": "Machine Learning in Healthcare",
    "citationStyle": "APA"
  },
  
  "output": {
    "content": "Machine learning has revolutionized...",
    "citations": [...]
  },
  
  "steps": [
    {
      "stepId": "step_1",
      "stepName": "Research Topic",
      "startTime": "2026-01-14T10:00:00Z",
      "endTime": "2026-01-14T10:00:02Z",
      "duration": 2000,
      "status": "success",
      "input": { "query": "Machine Learning in Healthcare" },
      "output": { "results": [...] },
      "metrics": {
        "cacheHit": false
      }
    },
    {
      "stepId": "step_2",
      "stepName": "Generate Content",
      "startTime": "2026-01-14T10:00:02Z",
      "endTime": "2026-01-14T10:00:04Z",
      "duration": 2800,
      "status": "success",
      "metrics": {
        "tokens": 1500,
        "cost": 0.00045,
        "model": "gemini-2.0-flash-exp"
      }
    },
    {
      "stepId": "step_3",
      "stepName": "Format Citations",
      "startTime": "2026-01-14T10:00:04Z",
      "endTime": "2026-01-14T10:00:05Z",
      "duration": 434,
      "status": "success"
    }
  ],
  
  "metrics": {
    "totalTokens": 1500,
    "totalCost": 0.00045,
    "cacheHits": 0,
    "cacheMisses": 3
  },
  
  "context": {
    "researchResults": [...],
    "sectionContent": "...",
    "extractedCitations": [...]
  }
}
```

#### Firestore Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Flow configurations - Admin only write, authenticated read
    match /flow_configs/{flowId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      
      // Versions subcollection
      match /versions/{versionId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null && 
                        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      }
    }
    
    // Prompt templates - Admin only write, authenticated read
    match /prompt_templates/{promptId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      
      match /versions/{versionId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null && 
                        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      }
    }
    
    // Tool registry - Admin only
    match /tool_registry/{toolId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Execution traces - User can read their own, admin reads all
    match /execution_traces/{traceId} {
      allow read: if request.auth != null && 
                     (resource.data.userId == request.auth.uid || 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null;
      allow update, delete: if false; // Immutable once created
    }
  }
}
```

---

## API Documentation

### Flow Management API

#### GET /api/admin/flows

List all flow configurations with optional filtering.

**Query Parameters**:
- `status` - Filter by status (active, draft, deprecated)
- `category` - Filter by category
- `search` - Search in name and description
- `limit` - Results per page (default: 50)
- `offset` - Pagination offset

**Response**:
```json
{
  "flows": [
    {
      "id": "flow_123",
      "name": "generate-report-section",
      "description": "Generates a report section with citations",
      "version": "1.0.0",
      "status": "active",
      "category": "content-generation",
      "metadata": {
        "author": "admin@arkan.com",
        "createdAt": "2026-01-14T00:00:00Z",
        "updatedAt": "2026-01-14T00:00:00Z"
      }
    }
  ],
  "total": 23,
  "limit": 50,
  "offset": 0
}
```

#### GET /api/admin/flows/:flowId

Get detailed flow configuration.

**Response**:
```json
{
  "id": "flow_123",
  "name": "generate-report-section",
  "description": "Generates a report section with citations",
  "version": "1.0.0",
  "status": "active",
  "inputSchema": { ... },
  "outputSchema": { ... },
  "steps": [ ... ],
  "config": { ... },
  "metadata": { ... }
}
```

#### POST /api/admin/flows

Create a new flow configuration.

**Request Body**:
```json
{
  "name": "my-new-flow",
  "description": "Description of the flow",
  "category": "content-generation",
  "tags": ["tag1", "tag2"],
  "inputSchema": { ... },
  "outputSchema": { ... },
  "steps": [ ... ],
  "config": { ... }
}
```

**Response**: 201 Created
```json
{
  "id": "flow_new",
  "message": "Flow created successfully",
  "flow": { ... }
}
```

#### PUT /api/admin/flows/:flowId

Update an existing flow (creates new version).

**Request Body**: Same as POST

**Response**: 200 OK
```json
{
  "id": "flow_123",
  "version": "1.1.0",
  "message": "Flow updated successfully",
  "flow": { ... }
}
```

#### DELETE /api/admin/flows/:flowId

Delete or deprecate a flow.

**Query Parameters**:
- `permanent` - If true, permanently delete; otherwise mark as deprecated

**Response**: 204 No Content

---

### Flow Execution API

#### POST /api/flows/execute

Execute a dynamic flow.

**Request Body**:
```json
{
  "flowId": "flow_123",
  "flowVersion": "1.0.0",  // Optional, defaults to latest active
  "input": {
    "topic": "Machine Learning in Healthcare",
    "citationStyle": "APA"
  },
  "options": {
    "debug": false,
    "timeout": 60000,
    "variables": {
      "customVar": "value"
    }
  }
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "output": {
    "content": "Machine learning has revolutionized...",
    "citations": [ ... ]
  },
  "traceId": "trace_789",
  "metrics": {
    "totalSteps": 3,
    "successfulSteps": 3,
    "failedSteps": 0,
    "skippedSteps": 0,
    "totalTokens": 1500,
    "totalCost": 0.00045,
    "cacheHits": 0,
    "cacheMisses": 3
  },
  "duration": 5234
}
```

**Error Response**: 400 Bad Request / 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "STEP_EXECUTION_FAILED",
    "message": "Step 'Generate Content' failed after 3 retries",
    "details": { ... }
  },
  "traceId": "trace_790"
}
```

---


### Prompt Management API

#### GET /api/admin/prompts

List all prompt templates.

**Response**:
```json
{
  "prompts": [
    {
      "id": "prompt_456",
      "name": "generate-section-with-citations",
      "description": "Generates academic content with proper citations",
      "version": "1.0.0",
      "category": "content-generation",
      "metadata": { ... }
    }
  ],
  "total": 45
}
```

#### POST /api/admin/prompts/:promptId/test

Test a prompt template with sample data.

**Request Body**:
```json
{
  "template": "You are an expert in {{topic}}. Write about {{subject}}.",
  "variables": {
    "topic": "Machine Learning",
    "subject": "neural networks"
  },
  "model": "gemini-2.0-flash-exp",
  "config": {
    "temperature": 0.7
  }
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "output": "Neural networks are fundamental...",
  "metrics": {
    "tokens": 250,
    "latency": 1200,
    "cost": 0.0001
  }
}
```

---

## Testing Strategy

### Unit Testing

#### Testing DynamicFlowExecutor

```typescript
// src/ai/dynamic-flow/__tests__/executor.test.ts
describe('DynamicFlowExecutor', () => {
  let executor: DynamicFlowExecutor;
  let mockContextManager: jest.Mocked<ContextManager>;
  let mockSchemaValidator: jest.Mocked<SchemaValidator>;
  let mockStepExecutor: jest.Mocked<StepExecutor>;
  let mockTraceService: jest.Mocked<ExecutionTraceService>;

  beforeEach(() => {
    mockContextManager = {
      initialize: jest.fn(),
      updateContext: jest.fn(),
      extractOutput: jest.fn(),
      cleanup: jest.fn()
    } as any;

    mockSchemaValidator = {
      validate: jest.fn((data) => data)
    } as any;

    mockStepExecutor = {
      execute: jest.fn()
    } as any;

    mockTraceService = {
      startTrace: jest.fn().mockResolvedValue({ id: 'trace_123' }),
      completeTrace: jest.fn(),
      recordStepSuccess: jest.fn(),
      recordStepError: jest.fn()
    } as any;

    executor = new DynamicFlowExecutor(
      mockContextManager,
      mockSchemaValidator,
      mockStepExecutor,
      mockTemplateEngine,
      mockConditionEvaluator,
      mockTraceService
    );
  });

  describe('execute', () => {
    it('should execute a simple flow successfully', async () => {
      const config: FlowConfig = {
        id: 'flow_1',
        name: 'test-flow',
        version: '1.0.0',
        inputSchema: z.object({ input: z.string() }),
        outputSchema: z.object({ output: z.string() }),
        steps: [
          {
            id: 'step_1',
            name: 'Test Step',
            type: 'prompt',
            config: {
              promptId: 'prompt_1',
              model: 'gemini-2.0-flash-exp'
            }
          }
        ]
      };

      const input = { input: 'test' };
      const expectedOutput = { output: 'result' };

      mockContextManager.initialize.mockResolvedValue({
        id: 'ctx_1',
        input,
        config,
        variables: new Map(),
        stepResults: new Map()
      } as any);

      mockStepExecutor.execute.mockResolvedValue({
        status: 'success',
        output: expectedOutput
      });

      mockContextManager.extractOutput.mockReturnValue(expectedOutput);

      const result = await executor.execute(config, input);

      expect(result.success).toBe(true);
      expect(result.output).toEqual(expectedOutput);
      expect(mockTraceService.startTrace).toHaveBeenCalledWith(config, input, {});
      expect(mockTraceService.completeTrace).toHaveBeenCalledWith(
        'trace_123',
        expect.objectContaining({ status: 'success' })
      );
    });

    it('should handle step failures with retries', async () => {
      const config: FlowConfig = {
        id: 'flow_1',
        name: 'test-flow',
        version: '1.0.0',
        inputSchema: z.object({}),
        outputSchema: z.object({}),
        steps: [
          {
            id: 'step_1',
            name: 'Flaky Step',
            type: 'prompt',
            config: { promptId: 'prompt_1' },
            errorHandling: {
              retries: 2
            }
          }
        ]
      };

      mockContextManager.initialize.mockResolvedValue({
        id: 'ctx_1',
        config,
        variables: new Map(),
        stepResults: new Map()
      } as any);

      // Fail twice, then succeed
      mockStepExecutor.execute
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce({
          status: 'success',
          output: 'success'
        });

      const result = await executor.execute(config, {});

      expect(result.success).toBe(true);
      expect(mockStepExecutor.execute).toHaveBeenCalledTimes(3);
    });

    it('should execute fallback step on failure', async () => {
      const config: FlowConfig = {
        id: 'flow_1',
        name: 'test-flow',
        version: '1.0.0',
        inputSchema: z.object({}),
        outputSchema: z.object({}),
        steps: [
          {
            id: 'step_1',
            name: 'Primary Step',
            type: 'prompt',
            config: { promptId: 'prompt_1' },
            errorHandling: {
              fallback: 'step_2'
            }
          },
          {
            id: 'step_2',
            name: 'Fallback Step',
            type: 'prompt',
            config: { promptId: 'prompt_2' }
          }
        ]
      };

      mockContextManager.initialize.mockResolvedValue({
        id: 'ctx_1',
        config,
        variables: new Map(),
        stepResults: new Map()
      } as any);

      // Primary step fails
      mockStepExecutor.execute
        .mockRejectedValueOnce(new Error('Primary failed'))
        .mockResolvedValueOnce({
          status: 'success',
          output: 'fallback result'
        });

      const result = await executor.execute(config, {});

      expect(result.success).toBe(true);
      expect(mockStepExecutor.execute).toHaveBeenCalledTimes(2);
    });

    it('should validate input schema', async () => {
      const config: FlowConfig = {
        id: 'flow_1',
        name: 'test-flow',
        version: '1.0.0',
        inputSchema: z.object({
          required: z.string()
        }),
        outputSchema: z.object({}),
        steps: []
      };

      mockSchemaValidator.validate.mockImplementation(() => {
        throw new Error('Validation failed');
      });

      await expect(
        executor.execute(config, { wrong: 'input' })
      ).rejects.toThrow('Validation failed');
    });

    it('should skip steps based on conditions', async () => {
      const config: FlowConfig = {
        id: 'flow_1',
        name: 'test-flow',
        version: '1.0.0',
        inputSchema: z.object({}),
        outputSchema: z.object({}),
        steps: [
          {
            id: 'step_1',
            name: 'Conditional Step',
            type: 'prompt',
            config: { promptId: 'prompt_1' },
            condition: {
              expression: 'input.shouldExecute === true'
            }
          }
        ]
      };

      mockContextManager.initialize.mockResolvedValue({
        id: 'ctx_1',
        config,
        input: { shouldExecute: false },
        variables: new Map(),
        stepResults: new Map()
      } as any);

      mockConditionEvaluator.evaluate.mockReturnValue(false);

      await executor.execute(config, { shouldExecute: false });

      expect(mockStepExecutor.execute).not.toHaveBeenCalled();
      expect(mockTraceService.recordSkippedStep).toHaveBeenCalledWith(
        'trace_123',
        expect.objectContaining({ id: 'step_1' })
      );
    });
  });

  describe('validateFlowConfig', () => {
    it('should reject flow with no steps', () => {
      const config: FlowConfig = {
        id: 'flow_1',
        name: 'test-flow',
        version: '1.0.0',
        inputSchema: z.object({}),
        outputSchema: z.object({}),
        steps: []
      };

      expect(() => executor['validateFlowConfig'](config))
        .toThrow('Flow must have at least one step');
    });

    it('should reject duplicate step IDs', () => {
      const config: FlowConfig = {
        id: 'flow_1',
        name: 'test-flow',
        version: '1.0.0',
        inputSchema: z.object({}),
        outputSchema: z.object({}),
        steps: [
          { id: 'step_1', name: 'Step 1', type: 'prompt', config: {} },
          { id: 'step_1', name: 'Step 2', type: 'prompt', config: {} }
        ]
      };

      expect(() => executor['validateFlowConfig'](config))
        .toThrow('Duplicate step ID: step_1');
    });

    it('should reject invalid step references', () => {
      const config: FlowConfig = {
        id: 'flow_1',
        name: 'test-flow',
        version: '1.0.0',
        inputSchema: z.object({}),
        outputSchema: z.object({}),
        steps: [
          {
            id: 'step_1',
            name: 'Step 1',
            type: 'condition',
            config: {},
            condition: {
              expression: 'true',
              onTrue: 'step_999'  // Non-existent step
            }
          }
        ]
      };

      expect(() => executor['validateFlowConfig'](config))
        .toThrow('references unknown onTrue step: step_999');
    });
  });
});
```

#### Testing ContextManager

```typescript
// src/ai/dynamic-flow/__tests__/context-manager.test.ts
describe('ContextManager', () => {
  let contextManager: ContextManager;

  beforeEach(() => {
    contextManager = new ContextManager();
  });

  describe('initialize', () => {
    it('should create a new context', async () => {
      const context = await contextManager.initialize({
        input: { test: 'data' },
        config: {} as FlowConfig,
        options: {},
        traceId: 'trace_1'
      });

      expect(context.id).toBeDefined();
      expect(context.input).toEqual({ test: 'data' });
      expect(context.variables).toBeInstanceOf(Map);
      expect(context.stepResults).toBeInstanceOf(Map);
    });

    it('should initialize with provided variables', async () => {
      const context = await contextManager.initialize({
        input: {},
        config: {} as FlowConfig,
        options: {
          variables: {
            customVar: 'value'
          }
        },
        traceId: 'trace_1'
      });

      expect(context.variables.get('customVar')).toBe('value');
    });
  });

  describe('getVariable', () => {
    it('should get variable from context', async () => {
      const context = await contextManager.initialize({
        input: {},
        config: {} as FlowConfig,
        options: {},
        traceId: 'trace_1'
      });

      context.variables.set('myVar', 'myValue');

      expect(contextManager.getVariable(context, 'myVar')).toBe('myValue');
    });

    it('should get nested input value', async () => {
      const context = await contextManager.initialize({
        input: { user: { name: 'John', age: 30 } },
        config: {} as FlowConfig,
        options: {},
        traceId: 'trace_1'
      });

      expect(contextManager.getVariable(context, 'input.user.name')).toBe('John');
      expect(contextManager.getVariable(context, 'input.user.age')).toBe(30);
    });

    it('should get step result value', async () => {
      const context = await contextManager.initialize({
        input: {},
        config: {} as FlowConfig,
        options: {},
        traceId: 'trace_1'
      });

      context.stepResults.set('step_1', {
        status: 'success',
        output: { result: 'data' }
      });

      expect(contextManager.getVariable(context, 'step_1.result')).toBe('data');
    });

    it('should handle array indices', async () => {
      const context = await contextManager.initialize({
        input: { items: ['a', 'b', 'c'] },
        config: {} as FlowConfig,
        options: {},
        traceId: 'trace_1'
      });

      expect(contextManager.getVariable(context, 'input.items[0]')).toBe('a');
      expect(contextManager.getVariable(context, 'input.items[2]')).toBe('c');
    });
  });

  describe('updateContext', () => {
    it('should update context with step result', async () => {
      const context = await contextManager.initialize({
        input: {},
        config: {} as FlowConfig,
        options: {},
        traceId: 'trace_1'
      });

      const step: FlowStep = {
        id: 'step_1',
        name: 'Test Step',
        type: 'prompt',
        config: {},
        contextMapping: {
          output: {
            'result': 'stepOutput'
          }
        }
      };

      const result: StepResult = {
        status: 'success',
        output: { result: 'test data' },
        metrics: {
          tokens: 100,
          cost: 0.001
        }
      };

      await contextManager.updateContext(context, step, result);

      expect(context.stepResults.get('step_1')).toBe(result);
      expect(context.variables.get('stepOutput')).toBe('test data');
      expect(context.metrics.totalTokens).toBe(100);
      expect(context.metrics.totalCost).toBe(0.001);
    });
  });

  describe('extractOutput', () => {
    it('should extract output using mapping', async () => {
      const context = await contextManager.initialize({
        input: {},
        config: {} as FlowConfig,
        options: {},
        traceId: 'trace_1'
      });

      context.variables.set('content', 'Generated content');
      context.variables.set('citations', ['ref1', 'ref2']);

      const outputMapping = {
        content: 'content',
        citations: 'citations'
      };

      const output = contextManager.extractOutput(context, outputMapping);

      expect(output).toEqual({
        content: 'Generated content',
        citations: ['ref1', 'ref2']
      });
    });

    it('should return last step output if no mapping', async () => {
      const context = await contextManager.initialize({
        input: {},
        config: {} as FlowConfig,
        options: {},
        traceId: 'trace_1'
      });

      context.stepResults.set('step_1', {
        status: 'success',
        output: 'first result'
      });

      context.stepResults.set('step_2', {
        status: 'success',
        output: 'final result'
      });

      const output = contextManager.extractOutput(context);

      expect(output).toBe('final result');
    });
  });
});
```

### Integration Testing

#### Testing Complete Flow Execution

```typescript
// src/ai/dynamic-flow/__tests__/integration.test.ts
describe('Dynamic Flow Integration', () => {
  let flowService: FlowConfigService;
  let executor: DynamicFlowExecutor;

  beforeAll(async () => {
    // Setup test Firebase emulator
    await setupFirebaseEmulator();
    
    // Initialize services
    flowService = new FlowConfigService();
    executor = createDynamicFlowExecutor();
  });

  afterAll(async () => {
    await cleanupFirebaseEmulator();
  });

  it('should execute a complete flow end-to-end', async () => {
    // Create a test flow
    const flowConfig: FlowConfig = {
      id: 'test_flow_1',
      name: 'integration-test-flow',
      version: '1.0.0',
      inputSchema: z.object({
        topic: z.string()
      }),
      outputSchema: z.object({
        summary: z.string()
      }),
      steps: [
        {
          id: 'step_1',
          name: 'Generate Summary',
          type: 'prompt',
          config: {
            promptId: 'test_prompt_1',
            model: 'gemini-2.0-flash-exp',
            temperature: 0.7
          },
          contextMapping: {
            input: {
              topic: 'input.topic'
            },
            output: {
              text: 'summary'
            }
          }
        }
      ]
    };

    // Save flow to Firestore
    await flowService.createFlow(flowConfig);

    // Create prompt template
    await createTestPrompt('test_prompt_1', {
      template: 'Summarize the topic: {{topic}}'
    });

    // Execute flow
    const result = await executor.execute(flowConfig, {
      topic: 'Machine Learning'
    });

    // Assertions
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('summary');
    expect(result.traceId).toBeDefined();
    expect(result.metrics.totalSteps).toBe(1);
    expect(result.metrics.successfulSteps).toBe(1);

    // Verify trace was saved
    const trace = await getExecutionTrace(result.traceId);
    expect(trace).toBeDefined();
    expect(trace.status).toBe('success');
    expect(trace.steps).toHaveLength(1);
  });

  it('should handle multi-step flow with context passing', async () => {
    const flowConfig: FlowConfig = {
      id: 'test_flow_2',
      name: 'multi-step-flow',
      version: '1.0.0',
      inputSchema: z.object({ query: z.string() }),
      outputSchema: z.object({ answer: z.string() }),
      steps: [
        {
          id: 'step_1',
          name: 'Research',
          type: 'tool',
          config: {
            toolName: 'mockSearch',
            parameters: {
              query: '{{input.query}}'
            }
          },
          contextMapping: {
            output: {
              results: 'searchResults'
            }
          }
        },
        {
          id: 'step_2',
          name: 'Generate Answer',
          type: 'prompt',
          config: {
            promptId: 'qa_prompt',
            model: 'gemini-2.0-flash-exp'
          },
          contextMapping: {
            input: {
              question: 'input.query',
              context: 'searchResults'
            },
            output: {
              text: 'answer'
            }
          }
        }
      ]
    };

    await flowService.createFlow(flowConfig);

    const result = await executor.execute(flowConfig, {
      query: 'What is machine learning?'
    });

    expect(result.success).toBe(true);
    expect(result.metrics.successfulSteps).toBe(2);
  });

  it('should handle conditional branching', async () => {
    const flowConfig: FlowConfig = {
      id: 'test_flow_3',
      name: 'conditional-flow',
      version: '1.0.0',
      inputSchema: z.object({ userType: z.string() }),
      outputSchema: z.object({ message: z.string() }),
      steps: [
        {
          id: 'step_1',
          name: 'Check User Type',
          type: 'condition',
          condition: {
            expression: 'input.userType === "premium"',
            onTrue: 'step_premium',
            onFalse: 'step_free'
          },
          config: {}
        },
        {
          id: 'step_premium',
          name: 'Premium Message',
          type: 'prompt',
          config: {
            promptId: 'premium_prompt'
          }
        },
        {
          id: 'step_free',
          name: 'Free Message',
          type: 'prompt',
          config: {
            promptId: 'free_prompt'
          }
        }
      ]
    };

    await flowService.createFlow(flowConfig);

    // Test premium path
    const premiumResult = await executor.execute(flowConfig, {
      userType: 'premium'
    });
    expect(premiumResult.success).toBe(true);

    // Test free path
    const freeResult = await executor.execute(flowConfig, {
      userType: 'free'
    });
    expect(freeResult.success).toBe(true);
  });
});
```

### Performance Testing

```typescript
// src/ai/dynamic-flow/__tests__/performance.test.ts
describe('Dynamic Flow Performance', () => {
  it('should execute simple flow within 100ms overhead', async () => {
    const config = createSimpleFlowConfig();
    const executor = createDynamicFlowExecutor();

    // Warm up
    await executor.execute(config, { input: 'test' });

    // Measure
    const start = Date.now();
    const result = await executor.execute(config, { input: 'test' });
    const overhead = Date.now() - start - result.metrics.stepDuration;

    expect(overhead).toBeLessThan(100);
  });

  it('should handle 100 concurrent executions', async () => {
    const config = createSimpleFlowConfig();
    const executor = createDynamicFlowExecutor();

    const promises = Array(100).fill(null).map((_, i) =>
      executor.execute(config, { input: `test-${i}` })
    );

    const results = await Promise.all(promises);

    expect(results.every(r => r.success)).toBe(true);
  });

  it('should cache repeated executions', async () => {
    const config = {
      ...createSimpleFlowConfig(),
      config: {
        caching: { enabled: true, ttl: 3600 }
      }
    };
    const executor = createDynamicFlowExecutor();

    const input = { input: 'cache-test' };

    // First execution - cache miss
    const result1 = await executor.execute(config, input);
    expect(result1.metrics.cacheHits).toBe(0);

    // Second execution - cache hit
    const result2 = await executor.execute(config, input);
    expect(result2.metrics.cacheHits).toBeGreaterThan(0);
    expect(result2.duration).toBeLessThan(result1.duration);
  });
});
```

---


## Deployment & Operations

### Deployment Strategy

#### Phase 1: Infrastructure Setup (Week 1-2)

**Steps**:
1. Create Firestore collections with proper indexes
2. Deploy security rules
3. Set up monitoring and alerting
4. Configure backup policies

**Firestore Indexes**:
```javascript
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "flow_configs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "metadata.updatedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "flow_configs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "metadata.createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "execution_traces",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "startTime", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "execution_traces",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "flowId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "startTime", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "prompt_templates",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "metadata.updatedAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

**Monitoring Setup**:
```typescript
// src/lib/monitoring/flow-monitoring.ts
import { getFirestore } from 'firebase-admin/firestore';

export class FlowMonitoring {
  private db = getFirestore();

  /**
   * Record flow execution metrics
   */
  async recordMetrics(trace: ExecutionTrace): Promise<void> {
    const metrics = {
      flowId: trace.flowId,
      flowVersion: trace.flowVersion,
      duration: trace.duration,
      status: trace.status,
      tokens: trace.metrics.totalTokens,
      cost: trace.metrics.totalCost,
      timestamp: new Date()
    };

    // Store in time-series collection for analytics
    await this.db.collection('flow_metrics').add(metrics);

    // Update aggregated statistics
    await this.updateFlowStatistics(trace.flowId, metrics);
  }

  /**
   * Update aggregated flow statistics
   */
  private async updateFlowStatistics(
    flowId: string,
    metrics: any
  ): Promise<void> {
    const statsRef = this.db.collection('flow_statistics').doc(flowId);
    
    await this.db.runTransaction(async (transaction) => {
      const doc = await transaction.get(statsRef);
      
      if (!doc.exists) {
        transaction.set(statsRef, {
          flowId,
          totalExecutions: 1,
          successfulExecutions: metrics.status === 'success' ? 1 : 0,
          failedExecutions: metrics.status === 'error' ? 1 : 0,
          avgDuration: metrics.duration,
          totalTokens: metrics.tokens,
          totalCost: metrics.cost,
          lastExecuted: metrics.timestamp
        });
      } else {
        const data = doc.data()!;
        const totalExec = data.totalExecutions + 1;
        
        transaction.update(statsRef, {
          totalExecutions: totalExec,
          successfulExecutions: data.successfulExecutions + 
            (metrics.status === 'success' ? 1 : 0),
          failedExecutions: data.failedExecutions + 
            (metrics.status === 'error' ? 1 : 0),
          avgDuration: (data.avgDuration * data.totalExecutions + metrics.duration) / totalExec,
          totalTokens: data.totalTokens + metrics.tokens,
          totalCost: data.totalCost + metrics.cost,
          lastExecuted: metrics.timestamp
        });
      }
    });
  }

  /**
   * Set up alerts for flow failures
   */
  async checkAndAlert(trace: ExecutionTrace): Promise<void> {
    if (trace.status === 'error') {
      // Check failure rate
      const recentTraces = await this.getRecentTraces(trace.flowId, 100);
      const failureRate = recentTraces.filter(t => t.status === 'error').length / recentTraces.length;

      if (failureRate > 0.1) { // More than 10% failures
        await this.sendAlert({
          severity: 'high',
          flowId: trace.flowId,
          message: `Flow ${trace.flowId} has ${(failureRate * 100).toFixed(1)}% failure rate`,
          failureRate,
          recentErrors: recentTraces.filter(t => t.status === 'error').slice(0, 5)
        });
      }
    }
  }

  private async getRecentTraces(
    flowId: string,
    limit: number
  ): Promise<ExecutionTrace[]> {
    const snapshot = await this.db
      .collection('execution_traces')
      .where('flowId', '==', flowId)
      .orderBy('startTime', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => doc.data() as ExecutionTrace);
  }

  private async sendAlert(alert: any): Promise<void> {
    // Implement alert mechanism (email, Slack, etc.)
    console.error('ALERT:', alert);
    
    // Store alert in database
    await this.db.collection('alerts').add({
      ...alert,
      timestamp: new Date(),
      acknowledged: false
    });
  }
}
```

#### Phase 2: Gradual Rollout (Week 5-6)

**Migration Approach**: Parallel Run Strategy

```typescript
// src/ai/flows/hybrid-flow-executor.ts
/**
 * Hybrid executor that runs both static and dynamic versions
 * for comparison during migration
 */
export class HybridFlowExecutor {
  constructor(
    private staticFlow: any,
    private dynamicExecutor: DynamicFlowExecutor,
    private flowConfig: FlowConfig
  ) {}

  async execute(input: any, options: ExecutionOptions = {}): Promise<any> {
    const { compareOutputs = false, useDynamic = false } = options;

    if (compareOutputs) {
      // Run both versions and compare
      return this.runComparison(input);
    }

    if (useDynamic) {
      // Use dynamic flow
      return this.dynamicExecutor.execute(this.flowConfig, input, options);
    }

    // Use static flow (default during transition)
    return this.staticFlow(input);
  }

  private async runComparison(input: any): Promise<any> {
    const [staticResult, dynamicResult] = await Promise.allSettled([
      this.staticFlow(input),
      this.dynamicExecutor.execute(this.flowConfig, input)
    ]);

    // Log comparison results
    await this.logComparison({
      flowId: this.flowConfig.id,
      input,
      staticResult,
      dynamicResult,
      timestamp: new Date()
    });

    // Return static result (safe fallback during migration)
    if (staticResult.status === 'fulfilled') {
      return staticResult.value;
    }

    throw staticResult.reason;
  }

  private async logComparison(data: any): Promise<void> {
    const db = getFirestore();
    await db.collection('migration_comparisons').add(data);
  }
}
```

**Feature Flag Implementation**:
```typescript
// src/lib/feature-flags.ts
export class FeatureFlags {
  private db = getFirestore();

  async isDynamicFlowEnabled(flowId: string, userId?: string): Promise<boolean> {
    // Check global flag
    const globalFlag = await this.getFlag('dynamic_flows_enabled');
    if (!globalFlag) return false;

    // Check per-flow flag
    const flowFlag = await this.getFlag(`dynamic_flow_${flowId}`);
    if (flowFlag === false) return false;

    // Check user-based rollout percentage
    if (userId) {
      const rolloutPercentage = await this.getRolloutPercentage(flowId);
      return this.isUserInRollout(userId, rolloutPercentage);
    }

    return true;
  }

  private async getFlag(key: string): Promise<boolean | null> {
    const doc = await this.db.collection('feature_flags').doc(key).get();
    return doc.exists ? doc.data()?.enabled : null;
  }

  private async getRolloutPercentage(flowId: string): Promise<number> {
    const doc = await this.db
      .collection('feature_flags')
      .doc(`dynamic_flow_${flowId}_rollout`)
      .get();
    
    return doc.exists ? doc.data()?.percentage : 0;
  }

  private isUserInRollout(userId: string, percentage: number): boolean {
    // Consistent hash-based assignment
    const hash = this.hashUserId(userId);
    return (hash % 100) < percentage;
  }

  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}
```

#### Phase 3: Full Migration (Week 7-8)

**Rollout Schedule**:
```
Week 5: 
  - Deploy dynamic flow infrastructure
  - Enable for 5% of users (pilot flows only)
  - Monitor metrics and errors

Week 6:
  - Increase to 25% of users (all flows)
  - Run comparison mode for critical flows
  - Address any issues

Week 7:
  - Increase to 50% of users
  - Disable comparison mode
  - Optimize performance

Week 8:
  - Increase to 100% of users
  - Deprecate static flows
  - Complete migration
```

**Rollback Plan**:
```typescript
// scripts/rollback-dynamic-flows.ts
import { getFirestore } from 'firebase-admin/firestore';

async function rollbackDynamicFlows() {
  const db = getFirestore();

  console.log('Rolling back to static flows...');

  // Disable all dynamic flow flags
  await db.collection('feature_flags').doc('dynamic_flows_enabled').set({
    enabled: false,
    reason: 'Emergency rollback',
    timestamp: new Date()
  });

  // Log rollback event
  await db.collection('system_events').add({
    type: 'rollback',
    component: 'dynamic_flows',
    timestamp: new Date(),
    triggeredBy: 'admin'
  });

  console.log('Rollback complete. Static flows are now active.');
}

// Run if executed directly
if (require.main === module) {
  rollbackDynamicFlows()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Rollback failed:', error);
      process.exit(1);
    });
}
```

---

## Migration Strategy

### Analyzing Existing Flows

```typescript
// scripts/migration/analyze-flows.ts
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

interface FlowAnalysis {
  name: string;
  complexity: 'simple' | 'medium' | 'complex';
  dependencies: string[];
  estimatedMigrationTime: string;
  challenges: string[];
  recommendations: string[];
}

/**
 * Analyze all existing static flows and generate migration report
 */
export async function analyzeFlows(): Promise<FlowAnalysis[]> {
  const flowsDir = join(__dirname, '../../src/ai/flows');
  const flowFiles = readdirSync(flowsDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

  const analyses: FlowAnalysis[] = [];

  for (const file of flowFiles) {
    const content = readFileSync(join(flowsDir, file), 'utf-8');
    const analysis = analyzeFlowFile(file, content);
    analyses.push(analysis);
  }

  // Sort by complexity and generate report
  analyses.sort((a, b) => {
    const order = { simple: 0, medium: 1, complex: 2 };
    return order[a.complexity] - order[b.complexity];
  });

  return analyses;
}

function analyzeFlowFile(filename: string, content: string): FlowAnalysis {
  const name = filename.replace('.ts', '');
  
  // Detect complexity based on code patterns
  const hasMultipleSteps = content.includes('await') && 
    (content.match(/await/g) || []).length > 2;
  const hasConditionals = content.includes('if') || content.includes('switch');
  const hasLoops = content.includes('for') || content.includes('while') || 
    content.includes('map');
  const hasToolCalls = content.includes('tools:');
  const hasRAG = content.includes('ragRetrieval') || content.includes('Qdrant');

  let complexity: 'simple' | 'medium' | 'complex';
  if (hasRAG || (hasMultipleSteps && hasConditionals && hasLoops)) {
    complexity = 'complex';
  } else if (hasMultipleSteps || hasToolCalls || hasConditionals) {
    complexity = 'medium';
  } else {
    complexity = 'simple';
  }

  // Extract dependencies
  const dependencies: string[] = [];
  const importMatches = content.matchAll(/from ['"](.+)['"]/g);
  for (const match of importMatches) {
    dependencies.push(match[1]);
  }

  // Estimate migration time
  const estimatedMigrationTime = 
    complexity === 'simple' ? '1-2 hours' :
    complexity === 'medium' ? '2-4 hours' :
    '4-8 hours';

  // Identify challenges
  const challenges: string[] = [];
  if (hasRAG) challenges.push('RAG integration requires tool configuration');
  if (hasLoops) challenges.push('Loop logic needs loop step configuration');
  if (hasConditionals) challenges.push('Conditional logic requires condition evaluator');
  if (content.includes('context')) challenges.push('Context management needs mapping');

  // Generate recommendations
  const recommendations: string[] = [];
  if (complexity === 'simple') {
    recommendations.push('Good candidate for early migration');
  }
  if (hasRAG) {
    recommendations.push('Ensure RAG tool is registered in tool registry');
  }
  if (hasMultipleSteps) {
    recommendations.push('Break down into clearly defined steps');
    recommendations.push('Create explicit context mappings between steps');
  }

  return {
    name,
    complexity,
    dependencies,
    estimatedMigrationTime,
    challenges,
    recommendations
  };
}

// Generate migration priority list
export function generateMigrationPriority(
  analyses: FlowAnalysis[]
): { phase: string; flows: string[] }[] {
  const simple = analyses.filter(a => a.complexity === 'simple').map(a => a.name);
  const medium = analyses.filter(a => a.complexity === 'medium').map(a => a.name);
  const complex = analyses.filter(a => a.complexity === 'complex').map(a => a.name);

  return [
    {
      phase: 'Phase 1: Simple Flows (Week 5)',
      flows: simple
    },
    {
      phase: 'Phase 2: Medium Flows (Week 6)',
      flows: medium
    },
    {
      phase: 'Phase 3: Complex Flows (Week 7)',
      flows: complex
    }
  ];
}
```

### Automated Migration Script

```typescript
// scripts/migration/migrate-flow.ts
import { z } from 'zod';

interface MigrationConfig {
  flowName: string;
  outputPath: string;
  dryRun?: boolean;
}

/**
 * Automatically migrate a static flow to dynamic configuration
 */
export async function migrateFlow(config: MigrationConfig): Promise<FlowConfig> {
  const { flowName, outputPath, dryRun = false } = config;

  console.log(`Migrating flow: ${flowName}`);

  // Load static flow code
  const flowModule = await import(`../../src/ai/flows/${flowName}`);
  const flowFunction = flowModule[flowName];

  if (!flowFunction) {
    throw new Error(`Flow ${flowName} not found`);
  }

  // Extract flow metadata
  const metadata = extractFlowMetadata(flowFunction);

  // Parse flow logic into steps
  const steps = await parseFlowSteps(flowFunction.toString());

  // Extract prompts
  const prompts = extractPrompts(flowFunction.toString());

  // Build flow configuration
  const flowConfig: FlowConfig = {
    id: `flow_${flowName}`,
    name: flowName,
    description: metadata.description || `Migrated flow: ${flowName}`,
    version: '1.0.0',
    inputSchema: metadata.inputSchema || z.object({}),
    outputSchema: metadata.outputSchema || z.object({}),
    steps,
    config: {
      timeout: 60000,
      retryPolicy: {
        maxRetries: 2,
        backoffMultiplier: 2
      }
    },
    metadata: {
      category: metadata.category || 'uncategorized',
      tags: metadata.tags || [],
      author: 'migration-script',
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft'
    }
  };

  // Create prompt templates
  for (const prompt of prompts) {
    const promptTemplate = await createPromptTemplate(prompt, flowName);
    console.log(`Created prompt template: ${promptTemplate.id}`);
  }

  if (!dryRun) {
    // Save to Firestore
    await saveFlowConfig(flowConfig);
    console.log(`Flow configuration saved: ${flowConfig.id}`);

    // Generate comparison test
    await generateComparisonTest(flowName, flowConfig);
    console.log(`Generated comparison test`);
  }

  return flowConfig;
}

async function parseFlowSteps(flowCode: string): Promise<FlowStep[]> {
  const steps: FlowStep[] = [];
  
  // Simple pattern matching for common flow patterns
  // This is a simplified version - production would need more sophisticated parsing
  
  // Detect AI generation calls
  const generateMatches = flowCode.matchAll(/await\s+ai\.generate\(([\s\S]*?)\)/g);
  let stepIndex = 0;
  
  for (const match of generateMatches) {
    steps.push({
      id: `step_${++stepIndex}`,
      name: `Generation Step ${stepIndex}`,
      type: 'prompt',
      config: {
        promptId: `prompt_${stepIndex}`,
        model: 'gemini-2.0-flash-exp',
        temperature: 0.7
      },
      contextMapping: {
        input: {},
        output: {}
      }
    });
  }

  // Detect tool calls
  const toolMatches = flowCode.matchAll(/tools:\s*\[([\s\S]*?)\]/g);
  for (const match of toolMatches) {
    steps.push({
      id: `step_${++stepIndex}`,
      name: `Tool Step ${stepIndex}`,
      type: 'tool',
      config: {
        toolName: 'extracted_tool',
        parameters: {}
      },
      contextMapping: {
        input: {},
        output: {}
      }
    });
  }

  return steps;
}

function extractPrompts(flowCode: string): string[] {
  const prompts: string[] = [];
  
  // Extract template literals used as prompts
  const promptMatches = flowCode.matchAll(/prompt:\s*`([\s\S]*?)`/g);
  
  for (const match of promptMatches) {
    prompts.push(match[1]);
  }

  return prompts;
}

async function createPromptTemplate(
  template: string,
  flowName: string
): Promise<PromptTemplate> {
  const variables = extractTemplateVariables(template);

  return {
    id: `prompt_${flowName}_${Date.now()}`,
    name: `${flowName} prompt`,
    description: `Extracted from ${flowName}`,
    version: '1.0.0',
    template,
    variables,
    metadata: {
      category: 'migrated',
      tags: [flowName],
      author: 'migration-script',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  };
}

function extractTemplateVariables(template: string): PromptVariable[] {
  const variables: PromptVariable[] = [];
  const varMatches = template.matchAll(/\{\{(\w+)\}\}/g);
  const seenVars = new Set<string>();

  for (const match of varMatches) {
    const varName = match[1];
    if (!seenVars.has(varName)) {
      seenVars.add(varName);
      variables.push({
        name: varName,
        type: 'string',
        description: `Variable: ${varName}`,
        required: true
      });
    }
  }

  return variables;
}

async function generateComparisonTest(
  flowName: string,
  flowConfig: FlowConfig
): Promise<void> {
  const testCode = `
import { ${flowName} } from '../flows/${flowName}';
import { DynamicFlowExecutor } from '../dynamic-flow/executor';
import { flowConfig_${flowName} } from './configs/${flowName}';

describe('${flowName} Migration Comparison', () => {
  it('should produce same output as static flow', async () => {
    const input = {
      // TODO: Add test input
    };

    const staticResult = await ${flowName}(input);
    const dynamicResult = await dynamicExecutor.execute(
      flowConfig_${flowName},
      input
    );

    expect(dynamicResult.output).toEqual(staticResult);
  });
});
`;

  // Write test file
  const fs = await import('fs/promises');
  await fs.writeFile(
    `src/ai/flows/__tests__/${flowName}.migration.test.ts`,
    testCode
  );
}
```

### Migration Validation

```typescript
// scripts/migration/validate-migration.ts
export interface ValidationResult {
  flowName: string;
  passed: boolean;
  issues: ValidationIssue[];
  metrics: ComparisonMetrics;
}

export interface ValidationIssue {
  severity: 'error' | 'warning';
  message: string;
  details?: any;
}

export interface ComparisonMetrics {
  outputMatch: boolean;
  performanceDelta: number; // ms
  tokenDelta: number;
  costDelta: number;
}

/**
 * Validate migrated flow against original
 */
export async function validateMigration(
  flowName: string,
  testCases: any[]
): Promise<ValidationResult> {
  const issues: ValidationIssue[] = [];
  let outputMatch = true;
  let totalPerfDelta = 0;
  let totalTokenDelta = 0;
  let totalCostDelta = 0;

  const staticFlow = await import(`../../src/ai/flows/${flowName}`);
  const flowConfig = await loadFlowConfig(`flow_${flowName}`);
  const executor = createDynamicFlowExecutor();

  for (const testCase of testCases) {
    try {
      // Run both versions
      const [staticResult, dynamicResult] = await Promise.all([
        measureExecution(() => staticFlow[flowName](testCase.input)),
        measureExecution(() => executor.execute(flowConfig, testCase.input))
      ]);

      // Compare outputs
      if (!deepEqual(staticResult.output, dynamicResult.output.output)) {
        outputMatch = false;
        issues.push({
          severity: 'error',
          message: 'Output mismatch',
          details: {
            input: testCase.input,
            static: staticResult.output,
            dynamic: dynamicResult.output.output
          }
        });
      }

      // Compare performance
      const perfDelta = dynamicResult.duration - staticResult.duration;
      totalPerfDelta += perfDelta;

      if (perfDelta > 1000) { // More than 1 second slower
        issues.push({
          severity: 'warning',
          message: `Performance degradation: +${perfDelta}ms`,
          details: { input: testCase.input }
        });
      }

      // Compare token usage
      const tokenDelta = (dynamicResult.output.metrics?.totalTokens || 0) -
                        (staticResult.metrics?.tokens || 0);
      totalTokenDelta += tokenDelta;

      if (Math.abs(tokenDelta) > 100) {
        issues.push({
          severity: 'warning',
          message: `Token usage difference: ${tokenDelta > 0 ? '+' : ''}${tokenDelta}`,
          details: { input: testCase.input }
        });
      }

    } catch (error) {
      issues.push({
        severity: 'error',
        message: `Execution error: ${error.message}`,
        details: { input: testCase.input, error }
      });
    }
  }

  return {
    flowName,
    passed: issues.filter(i => i.severity === 'error').length === 0,
    issues,
    metrics: {
      outputMatch,
      performanceDelta: totalPerfDelta / testCases.length,
      tokenDelta: totalTokenDelta / testCases.length,
      costDelta: totalCostDelta / testCases.length
    }
  };
}

async function measureExecution<T>(
  fn: () => Promise<T>
): Promise<{ output: T; duration: number; metrics?: any }> {
  const start = Date.now();
  const output = await fn();
  const duration = Date.now() - start;
  
  return { output, duration };
}

function deepEqual(a: any, b: any): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
```

---


## Performance & Optimization

### Caching Strategy

#### Multi-Level Caching Architecture

```typescript
// src/lib/cache/flow-cache.ts
export class FlowCache {
  private memoryCache: Map<string, CacheEntry> = new Map();
  private redisClient?: Redis;
  
  constructor(config: CacheConfig) {
    if (config.redis) {
      this.redisClient = new Redis(config.redis);
    }
  }

  /**
   * Get cached step result
   * L1: Memory cache (fast, limited size)
   * L2: Redis cache (shared across instances)
   */
  async get(
    step: FlowStep,
    context: ExecutionContext
  ): Promise<StepResult | null> {
    const key = this.generateCacheKey(step, context);

    // Check memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && !this.isExpired(memoryEntry)) {
      return memoryEntry.value;
    }

    // Check Redis cache
    if (this.redisClient) {
      const redisValue = await this.redisClient.get(key);
      if (redisValue) {
        const entry = JSON.parse(redisValue);
        if (!this.isExpired(entry)) {
          // Populate memory cache
          this.memoryCache.set(key, entry);
          return entry.value;
        }
      }
    }

    return null;
  }

  /**
   * Store step result in cache
   */
  async set(
    step: FlowStep,
    context: ExecutionContext,
    result: StepResult,
    ttl?: number
  ): Promise<void> {
    const key = this.generateCacheKey(step, context);
    const entry: CacheEntry = {
      value: result,
      timestamp: Date.now(),
      ttl: ttl || step.config.caching?.ttl || 3600
    };

    // Store in memory cache
    this.memoryCache.set(key, entry);

    // Store in Redis cache
    if (this.redisClient) {
      await this.redisClient.setex(
        key,
        entry.ttl,
        JSON.stringify(entry)
      );
    }

    // Evict old entries from memory cache
    this.evictExpired();
  }

  /**
   * Invalidate cache for a specific flow
   */
  async invalidate(flowId: string): Promise<void> {
    // Clear from memory
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(flowId)) {
        this.memoryCache.delete(key);
      }
    }

    // Clear from Redis
    if (this.redisClient) {
      const keys = await this.redisClient.keys(`${flowId}:*`);
      if (keys.length > 0) {
        await this.redisClient.del(...keys);
      }
    }
  }

  private generateCacheKey(
    step: FlowStep,
    context: ExecutionContext
  ): string {
    // Create deterministic key based on step config and input
    const input = this.extractStepInput(step, context);
    const inputHash = this.hashObject(input);
    const configHash = this.hashObject(step.config);
    
    return `${context.config.id}:${step.id}:${configHash}:${inputHash}`;
  }

  private hashObject(obj: any): string {
    const crypto = require('crypto');
    return crypto
      .createHash('md5')
      .update(JSON.stringify(obj))
      .digest('hex')
      .substring(0, 8);
  }

  private extractStepInput(step: FlowStep, context: ExecutionContext): any {
    if (!step.contextMapping?.input) {
      return context.input;
    }

    const input: any = {};
    for (const [key, contextPath] of Object.entries(step.contextMapping.input)) {
      input[key] = this.contextManager.getVariable(context, contextPath);
    }
    return input;
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl * 1000;
  }

  private evictExpired(): void {
    if (this.memoryCache.size > 1000) { // Max 1000 entries
      const now = Date.now();
      for (const [key, entry] of this.memoryCache.entries()) {
        if (now - entry.timestamp > entry.ttl * 1000) {
          this.memoryCache.delete(key);
        }
      }
    }
  }
}

interface CacheEntry {
  value: StepResult;
  timestamp: number;
  ttl: number;
}

interface CacheConfig {
  redis?: {
    host: string;
    port: number;
    password?: string;
  };
}
```

### Performance Monitoring

```typescript
// src/lib/monitoring/performance-monitor.ts
export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();

  /**
   * Track flow execution performance
   */
  track(
    flowId: string,
    phase: string,
    duration: number,
    metadata?: any
  ): void {
    if (!this.metrics.has(flowId)) {
      this.metrics.set(flowId, []);
    }

    this.metrics.get(flowId)!.push({
      phase,
      duration,
      timestamp: Date.now(),
      metadata
    });
  }

  /**
   * Generate performance report
   */
  generateReport(flowId: string): PerformanceReport {
    const metrics = this.metrics.get(flowId) || [];
    
    const byPhase = metrics.reduce((acc, m) => {
      if (!acc[m.phase]) {
        acc[m.phase] = [];
      }
      acc[m.phase].push(m.duration);
      return acc;
    }, {} as Record<string, number[]>);

    const report: PerformanceReport = {
      flowId,
      totalExecutions: metrics.length,
      phases: {}
    };

    for (const [phase, durations] of Object.entries(byPhase)) {
      report.phases[phase] = {
        count: durations.length,
        avg: this.average(durations),
        min: Math.min(...durations),
        max: Math.max(...durations),
        p50: this.percentile(durations, 50),
        p95: this.percentile(durations, 95),
        p99: this.percentile(durations, 99)
      };
    }

    return report;
  }

  /**
   * Detect performance regressions
   */
  detectRegressions(
    flowId: string,
    baseline: PerformanceReport
  ): PerformanceRegression[] {
    const current = this.generateReport(flowId);
    const regressions: PerformanceRegression[] = [];

    for (const [phase, currentStats] of Object.entries(current.phases)) {
      const baselineStats = baseline.phases[phase];
      if (!baselineStats) continue;

      const avgIncrease = 
        ((currentStats.avg - baselineStats.avg) / baselineStats.avg) * 100;
      const p95Increase = 
        ((currentStats.p95 - baselineStats.p95) / baselineStats.p95) * 100;

      if (avgIncrease > 20 || p95Increase > 30) {
        regressions.push({
          phase,
          metric: avgIncrease > 20 ? 'avg' : 'p95',
          baseline: avgIncrease > 20 ? baselineStats.avg : baselineStats.p95,
          current: avgIncrease > 20 ? currentStats.avg : currentStats.p95,
          increase: avgIncrease > 20 ? avgIncrease : p95Increase
        });
      }
    }

    return regressions;
  }

  private average(numbers: number[]): number {
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  private percentile(numbers: number[], p: number): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index];
  }
}

interface PerformanceMetric {
  phase: string;
  duration: number;
  timestamp: number;
  metadata?: any;
}

interface PerformanceReport {
  flowId: string;
  totalExecutions: number;
  phases: Record<string, {
    count: number;
    avg: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
  }>;
}

interface PerformanceRegression {
  phase: string;
  metric: 'avg' | 'p95';
  baseline: number;
  current: number;
  increase: number;
}
```

### Query Optimization

```typescript
// Efficient Firestore queries for flow management
export class OptimizedFlowQueries {
  private db = getFirestore();

  /**
   * Get active flows with caching
   */
  async getActiveFlows(category?: string): Promise<FlowConfig[]> {
    const cacheKey = `active_flows:${category || 'all'}`;
    
    // Check cache first
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    // Build query
    let query = this.db
      .collection('flow_configs')
      .where('status', '==', 'active')
      .orderBy('metadata.updatedAt', 'desc');

    if (category) {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.limit(50).get();
    const flows = snapshot.docs.map(doc => doc.data() as FlowConfig);

    // Cache for 5 minutes
    await cache.set(cacheKey, flows, 300);

    return flows;
  }

  /**
   * Get flow with version (with caching)
   */
  async getFlow(flowId: string, version?: string): Promise<FlowConfig | null> {
    const cacheKey = `flow:${flowId}:${version || 'latest'}`;
    
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    if (version) {
      const doc = await this.db
        .collection('flow_configs')
        .doc(flowId)
        .collection('versions')
        .doc(version)
        .get();
      
      if (!doc.exists) return null;
      
      const flow = doc.data() as FlowConfig;
      await cache.set(cacheKey, flow, 600); // Cache for 10 minutes
      return flow;
    }

    const doc = await this.db.collection('flow_configs').doc(flowId).get();
    
    if (!doc.exists) return null;
    
    const flow = doc.data() as FlowConfig;
    await cache.set(cacheKey, flow, 600);
    return flow;
  }

  /**
   * Batch load multiple flows efficiently
   */
  async batchGetFlows(flowIds: string[]): Promise<Map<string, FlowConfig>> {
    const results = new Map<string, FlowConfig>();
    const uncached: string[] = [];

    // Check cache for each flow
    for (const flowId of flowIds) {
      const cached = await cache.get(`flow:${flowId}:latest`);
      if (cached) {
        results.set(flowId, cached);
      } else {
        uncached.push(flowId);
      }
    }

    // Batch fetch uncached flows
    if (uncached.length > 0) {
      // Firestore limits batch get to 10 documents
      const batches = this.chunk(uncached, 10);
      
      for (const batch of batches) {
        const docs = await Promise.all(
          batch.map(id => this.db.collection('flow_configs').doc(id).get())
        );

        for (const doc of docs) {
          if (doc.exists) {
            const flow = doc.data() as FlowConfig;
            results.set(doc.id, flow);
            await cache.set(`flow:${doc.id}:latest`, flow, 600);
          }
        }
      }
    }

    return results;
  }

  private chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
```

---

## Security Considerations

### Authentication & Authorization

```typescript
// src/middleware/flow-authorization.ts
export class FlowAuthorization {
  /**
   * Check if user can execute a flow
   */
  async canExecuteFlow(
    userId: string,
    flowId: string
  ): Promise<boolean> {
    const user = await this.getUser(userId);
    const flow = await this.getFlow(flowId);

    if (!flow) return false;

    // Admin can execute all flows
    if (user.role === 'admin') return true;

    // Check flow access rules
    if (flow.accessRules) {
      return this.evaluateAccessRules(user, flow.accessRules);
    }

    // Default: authenticated users can execute
    return true;
  }

  /**
   * Check if user can modify flow configuration
   */
  async canModifyFlow(
    userId: string,
    flowId: string
  ): Promise<boolean> {
    const user = await this.getUser(userId);
    const flow = await this.getFlow(flowId);

    if (!flow) return false;

    // Only admins can modify flows
    if (user.role !== 'admin') return false;

    // Check if user is the flow author
    if (flow.metadata.author === userId) return true;

    // Check if user has explicit permission
    return flow.permissions?.editors?.includes(userId) || false;
  }

  /**
   * Validate flow configuration for security issues
   */
  async validateFlowSecurity(config: FlowConfig): Promise<ValidationResult> {
    const issues: string[] = [];

    // Check for prompt injection vulnerabilities
    for (const step of config.steps) {
      if (step.type === 'prompt') {
        const promptConfig = step.config as PromptStepConfig;
        const template = await this.getPromptTemplate(promptConfig.promptId);
        
        if (this.hasUnsafeTemplating(template.template)) {
          issues.push(
            `Step ${step.id}: Prompt template may be vulnerable to injection`
          );
        }
      }
    }

    // Check for sensitive data exposure
    if (this.exposesSensitiveData(config)) {
      issues.push('Flow may expose sensitive data in output');
    }

    // Check for excessive resource usage
    if (config.steps.length > 20) {
      issues.push('Flow has too many steps, may cause performance issues');
    }

    // Check for infinite loops
    if (this.hasInfiniteLoopRisk(config)) {
      issues.push('Flow may have infinite loop risk');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  private hasUnsafeTemplating(template: string): boolean {
    // Check for direct user input without sanitization
    const unsafePatterns = [
      /\{\{input\.\w+\}\}/,  // Direct input interpolation
      /\{\{.*eval.*\}\}/,     // eval usage
      /\{\{.*function.*\}\}/  // function definitions
    ];

    return unsafePatterns.some(pattern => pattern.test(template));
  }

  private exposesSensitiveData(config: FlowConfig): boolean {
    // Check if output might contain sensitive fields
    const sensitiveFields = ['password', 'apiKey', 'token', 'secret'];
    const outputStr = JSON.stringify(config.outputSchema);
    
    return sensitiveFields.some(field => 
      outputStr.toLowerCase().includes(field)
    );
  }

  private hasInfiniteLoopRisk(config: FlowConfig): boolean {
    // Check for loops without maxIterations
    for (const step of config.steps) {
      if (step.type === 'loop') {
        const loopConfig = step.config as LoopStepConfig;
        if (!loopConfig.maxIterations) {
          return true;
        }
      }
    }
    return false;
  }
}
```

### Input Validation & Sanitization

```typescript
// src/lib/validation/input-sanitizer.ts
export class InputSanitizer {
  /**
   * Sanitize user input before flow execution
   */
  sanitize(input: any, schema: z.ZodSchema): any {
    // Validate against schema first
    const validated = schema.parse(input);

    // Recursively sanitize
    return this.sanitizeValue(validated);
  }

  private sanitizeValue(value: any): any {
    if (typeof value === 'string') {
      return this.sanitizeString(value);
    }

    if (Array.isArray(value)) {
      return value.map(v => this.sanitizeValue(v));
    }

    if (typeof value === 'object' && value !== null) {
      const sanitized: any = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = this.sanitizeValue(val);
      }
      return sanitized;
    }

    return value;
  }

  private sanitizeString(str: string): string {
    // Remove null bytes
    str = str.replace(/\0/g, '');

    // Limit length to prevent DoS
    if (str.length > 10000) {
      str = str.substring(0, 10000);
    }

    // Remove control characters except newlines and tabs
    str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // Normalize unicode
    str = str.normalize('NFC');

    return str;
  }

  /**
   * Detect and prevent prompt injection attempts
   */
  detectPromptInjection(input: string): boolean {
    const injectionPatterns = [
      /ignore\s+previous\s+instructions/i,
      /disregard\s+all\s+previous/i,
      /forget\s+everything/i,
      /new\s+instructions:/i,
      /system\s*:/i,
      /admin\s+mode/i,
      /<\|.*?\|>/,  // Special tokens
      /\[INST\]/,    // Instruction markers
    ];

    return injectionPatterns.some(pattern => pattern.test(input));
  }
}
```

### Rate Limiting

```typescript
// src/middleware/rate-limiter.ts
export class FlowRateLimiter {
  private limits: Map<string, RateLimitState> = new Map();

  /**
   * Check if user can execute flow (rate limiting)
   */
  async checkRateLimit(
    userId: string,
    flowId: string
  ): Promise<RateLimitResult> {
    const key = `${userId}:${flowId}`;
    const now = Date.now();
    
    let state = this.limits.get(key);
    if (!state) {
      state = {
        count: 0,
        resetAt: now + 60000 // 1 minute window
      };
      this.limits.set(key, state);
    }

    // Reset if window expired
    if (now >= state.resetAt) {
      state.count = 0;
      state.resetAt = now + 60000;
    }

    // Get user tier limits
    const limit = await this.getUserLimit(userId);

    if (state.count >= limit.maxRequestsPerMinute) {
      return {
        allowed: false,
        retryAfter: Math.ceil((state.resetAt - now) / 1000),
        limit: limit.maxRequestsPerMinute,
        remaining: 0
      };
    }

    state.count++;

    return {
      allowed: true,
      limit: limit.maxRequestsPerMinute,
      remaining: limit.maxRequestsPerMinute - state.count
    };
  }

  private async getUserLimit(userId: string): Promise<RateLimit> {
    const user = await this.getUser(userId);
    
    // Different limits based on user tier
    switch (user.tier) {
      case 'free':
        return { maxRequestsPerMinute: 10, maxTokensPerDay: 50000 };
      case 'pro':
        return { maxRequestsPerMinute: 60, maxTokensPerDay: 500000 };
      case 'enterprise':
        return { maxRequestsPerMinute: 300, maxTokensPerDay: 5000000 };
      default:
        return { maxRequestsPerMinute: 10, maxTokensPerDay: 50000 };
    }
  }
}

interface RateLimitState {
  count: number;
  resetAt: number;
}

interface RateLimit {
  maxRequestsPerMinute: number;
  maxTokensPerDay: number;
}

interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
  limit: number;
  remaining: number;
}
```

---

## Best Practices & Guidelines

### Flow Design Principles

1. **Single Responsibility**: Each flow should have one clear purpose
2. **Composability**: Design flows to be composable - larger flows can call smaller ones
3. **Error Handling**: Always define error handling strategies for each step
4. **Idempotency**: Design flows to be safely retryable
5. **Context Management**: Keep context lightweight, only store what's needed

### Step Design Guidelines

```typescript
// ✅ Good: Clear, focused step
{
  id: 'generate_summary',
  name: 'Generate Summary',
  type: 'prompt',
  config: {
    promptId: 'summarize_text',
    model: 'gemini-2.0-flash-exp',
    temperature: 0.7
  },
  contextMapping: {
    input: {
      text: 'input.document'
    },
    output: {
      summary: 'documentSummary'
    }
  },
  errorHandling: {
    retries: 2,
    continueOnError: false
  }
}

// ❌ Bad: Unclear purpose, no error handling
{
  id: 'step1',
  name: 'Do Something',
  type: 'prompt',
  config: {}
}
```

### Prompt Template Best Practices

```handlebars
✅ Good: Clear structure, variables, error handling

You are an academic writing assistant.

Task: {{task}}
Context: {{context}}

Instructions:
1. {{instruction1}}
2. {{instruction2}}

{{#if examples}}
Examples:
{{#each examples}}
- {{this}}
{{/each}}
{{/if}}

Requirements:
- Use {{citationStyle}} citation format
- Maintain {{tone}} tone
- Target length: {{targetLength}} words

Output format: {{outputFormat}}

---

❌ Bad: Unclear, no structure, direct user input injection

Write about {{input.userText}}. Make it good.
```

### Context Mapping Patterns

```typescript
// ✅ Good: Explicit, type-safe mapping
contextMapping: {
  input: {
    topic: 'input.research.topic',
    sources: 'step_research.results',
    style: 'input.citationStyle'
  },
  output: {
    'content': 'generatedContent',
    'citations': 'extractedCitations',
    'metadata.wordCount': 'wordCount'
  }
}

// ❌ Bad: Unclear, implicit
contextMapping: {
  input: {
    data: 'stuff'
  },
  output: {
    result: 'output'
  }
}
```

### Testing Checklist

- [ ] Unit tests for all core components
- [ ] Integration tests for complete flows
- [ ] Comparison tests between static and dynamic versions
- [ ] Performance benchmarks
- [ ] Security validation
- [ ] Error handling scenarios
- [ ] Edge cases and boundary conditions
- [ ] Concurrent execution tests
- [ ] Cache invalidation tests
- [ ] Rate limiting tests

### Monitoring Checklist

- [ ] Execution traces stored in Firestore
- [ ] Performance metrics collected
- [ ] Error rates tracked
- [ ] Cost tracking per flow
- [ ] User usage analytics
- [ ] Cache hit/miss rates
- [ ] Alert thresholds configured
- [ ] Dashboard for real-time monitoring

---

## Appendix

### Quick Reference Commands

```bash
# Development
npm run dev                      # Start Next.js dev server
npm run genkit:dev              # Start Genkit dev UI
npm test                        # Run tests
npm run typecheck              # Type checking

# Migration
npm run migrate:analyze        # Analyze flows for migration
npm run migrate:flow <name>    # Migrate specific flow
npm run migrate:validate       # Validate migrations
npm run migrate:rollback       # Rollback to static flows

# Database
npm run db:seed                # Seed database with test data
npm run db:backup              # Backup Firestore data
npm run db:restore             # Restore from backup

# Deployment
npm run build                  # Build for production
firebase deploy                # Deploy to Firebase
firebase deploy --only hosting # Deploy hosting only
firebase deploy --only firestore # Deploy Firestore rules

# Monitoring
npm run monitor:flows          # View flow execution stats
npm run monitor:performance    # Performance analysis
npm run monitor:errors         # Error analysis
```

### Useful Firestore Queries

```javascript
// Get recent execution traces
db.collection('execution_traces')
  .where('flowId', '==', 'flow_123')
  .orderBy('startTime', 'desc')
  .limit(50)
  .get();

// Get failed executions
db.collection('execution_traces')
  .where('status', '==', 'error')
  .where('startTime', '>', Date.now() - 86400000) // Last 24 hours
  .get();

// Get flow statistics
db.collection('flow_statistics')
  .doc('flow_123')
  .get();

// Get active flows by category
db.collection('flow_configs')
  .where('status', '==', 'active')
  .where('category', '==', 'content-generation')
  .get();
```

### Troubleshooting

**Issue**: Flow execution is slow
- Check cache hit rates
- Review step complexity
- Analyze performance traces
- Consider parallel execution for independent steps

**Issue**: High error rates
- Check execution traces for error patterns
- Validate input schemas
- Review retry configurations
- Check model availability

**Issue**: Inconsistent outputs
- Compare prompt templates between versions
- Check for non-deterministic steps
- Review temperature settings
- Validate context mappings

**Issue**: High costs
- Implement caching for repeated operations
- Optimize prompt lengths
- Use cheaper models for non-critical steps
- Set token limits

---

## Conclusion

This expanded plan provides a comprehensive roadmap for implementing the Dynamic Flow System in Arkan. The system transforms static AI flows into a flexible, configuration-driven architecture that enables:

- **Rapid iteration** on AI behaviors without code deployment
- **A/B testing** of prompts and strategies
- **Complete observability** with execution tracing
- **Scalable architecture** supporting growth
- **Visual management** through admin interfaces

The implementation follows industry best practices for:
- Type safety and validation
- Error handling and resilience
- Performance optimization
- Security and authorization
- Testing and quality assurance

By following this guide, the development team can systematically build and deploy a production-ready dynamic flow system that positions Arkan for rapid innovation and scaling.

---

**Document Version**: 2.0  
**Last Updated**: 2026-01-14  
**Status**: Complete - Ready for Implementation

