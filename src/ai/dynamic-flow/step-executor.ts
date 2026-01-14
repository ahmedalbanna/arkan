/**
 * Step Executor for Dynamic Flows
 * Week 1 - Day 4-5: Step Executor
 * 
 * Coordinates execution of individual flow steps.
 * Handles different step types: prompt, tool, condition, loop, parallel
 */

import { ai } from '../genkit';
import type { ExecutionContext, ContextManager } from './context-manager';
import type { TemplateEngine } from './template-engine';
import type { 
  FlowStep, 
  StepResult, 
  PromptStepConfig,
  ToolStepConfig,
  ConditionStepConfig,
  LoopStepConfig,
  ParallelStepConfig 
} from '../../lib/models/flow-config';

// ============================================================================
// Step Executor Class
// ============================================================================

export class StepExecutor {
  constructor(
    private contextManager: ContextManager,
    private templateEngine: TemplateEngine
  ) {}

  /**
   * Execute a single flow step
   */
  async execute(
    step: FlowStep,
    context: ExecutionContext
  ): Promise<StepResult> {
    const startTime = Date.now();

    try {
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
          throw new Error(`Unknown step type: ${(step as any).type}`);
      }

      // Add execution metrics
      result.metrics = {
        ...result.metrics,
        duration: Date.now() - startTime
      };

      return result;

    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error : new Error(String(error)),
        output: null,
        metrics: {
          duration: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Execute a prompt step (AI generation)
   */
  private async executePromptStep(
    step: FlowStep,
    input: any,
    context: ExecutionContext
  ): Promise<StepResult> {
    const config = step.config as PromptStepConfig;

    // Render prompt with context variables
    const renderedPrompt = this.templateEngine.render(
      config.prompt || '',
      context
    );

    // Execute AI generation
    const result = await ai.generate({
      model: config.model || 'gemini-2.0-flash-exp',
      prompt: renderedPrompt,
      config: {
        temperature: config.temperature ?? 0.7,
        maxOutputTokens: config.maxTokens ?? 2048,
        topK: config.topK,
        topP: config.topP
      }
    });

    return {
      status: 'success',
      output: result.text,
      metrics: {
        tokens: result.usage?.totalTokens || 0,
        inputTokens: result.usage?.inputTokens || 0,
        outputTokens: result.usage?.outputTokens || 0,
        cost: this.calculateCost(result.usage),
        model: config.model
      }
    };
  }

  /**
   * Execute a tool step
   */
  private async executeToolStep(
    step: FlowStep,
    input: any,
    context: ExecutionContext
  ): Promise<StepResult> {
    const config = step.config as ToolStepConfig;

    // Resolve parameters from context
    const parameters = this.resolveParameters(config.parameters || {}, context);

    // Get tool function (simplified - in production, use tool registry)
    const toolFunction = await this.getToolFunction(config.toolName);
    
    if (!toolFunction) {
      throw new Error(`Tool not found: ${config.toolName}`);
    }

    // Execute tool
    const result = await toolFunction(parameters);

    return {
      status: 'success',
      output: result,
      metrics: {
        tool: config.toolName
      }
    };
  }

  /**
   * Execute a condition step
   */
  private async executeConditionStep(
    step: FlowStep,
    input: any,
    context: ExecutionContext
  ): Promise<StepResult> {
    const config = step.config as ConditionStepConfig;

    // Import ConditionEvaluator dynamically to avoid circular deps
    const { ConditionEvaluator } = await import('./condition-evaluator');
    const evaluator = new ConditionEvaluator();

    // Evaluate condition
    const conditionResult = evaluator.evaluate(
      config.expression,
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

  /**
   * Execute a loop step
   */
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

      // Store loop context
      this.contextManager.setVariable(context, 'loop.index', i);
      this.contextManager.setVariable(context, 'loop.item', item);

      // Execute loop body steps
      if (config.steps) {
        const stepResults: any[] = [];
        for (const loopStep of config.steps) {
          const result = await this.execute(loopStep, context);
          stepResults.push(result.output);
        }
        results.push(stepResults);
      }
    }

    return {
      status: 'success',
      output: results,
      metrics: {
        iterations: results.length
      }
    };
  }

  /**
   * Execute parallel steps
   */
  private async executeParallelStep(
    step: FlowStep,
    input: any,
    context: ExecutionContext
  ): Promise<StepResult> {
    const config = step.config as ParallelStepConfig;

    if (!config.steps || config.steps.length === 0) {
      return {
        status: 'success',
        output: [],
        metrics: { parallelSteps: 0 }
      };
    }

    // Execute all parallel steps concurrently
    const promises = config.steps.map(parallelStep =>
      this.execute(parallelStep, context)
    );

    const results = await Promise.allSettled(promises);

    // Check if any failed
    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length > 0 && !config.allowPartialFailure) {
      throw new Error(
        `${failures.length} parallel steps failed`
      );
    }

    return {
      status: 'success',
      output: results.map((r, i) => ({
        stepId: config.steps![i].id,
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

  /**
   * Prepare step input from context
   */
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

  /**
   * Resolve parameters from context (handles template variables)
   */
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
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Recursively resolve nested objects
        resolved[key] = this.resolveParameters(value, context);
      } else if (Array.isArray(value)) {
        // Handle arrays
        resolved[key] = value.map(item => 
          typeof item === 'object' && item !== null
            ? this.resolveParameters(item, context)
            : item
        );
      } else {
        resolved[key] = value;
      }
    }

    return resolved;
  }

  /**
   * Get tool function by name
   * In production, this would use a ToolRegistry
   */
  private async getToolFunction(toolName: string): Promise<Function | null> {
    // Import tool registry dynamically
    try {
      const { toolRegistry } = await import('../tool-registry');
      return toolRegistry.getTool(toolName);
    } catch (error) {
      console.warn(`Tool registry not available: ${error}`);
      return null;
    }
  }

  /**
   * Calculate cost based on token usage
   */
  private calculateCost(usage: any): number {
    if (!usage) return 0;
    
    // Gemini 2.0 Flash pricing (example rates)
    const inputCostPer1M = 0.075;   // $0.075 per 1M input tokens
    const outputCostPer1M = 0.30;   // $0.30 per 1M output tokens
    
    const inputCost = (usage.inputTokens / 1_000_000) * inputCostPer1M;
    const outputCost = (usage.outputTokens / 1_000_000) * outputCostPer1M;
    
    return inputCost + outputCost;
  }
}

// ============================================================================
// Exports
// ============================================================================

export type { StepResult } from '../../lib/models/flow-config';
