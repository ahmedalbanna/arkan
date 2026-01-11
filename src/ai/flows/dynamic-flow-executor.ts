/**
 * Dynamic Flow Executor
 * 
 * Executes flows based on database configurations rather than hardcoded logic.
 * This is the core runtime engine for the dynamic flow system.
 */

'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ContextManager } from '@/ai/dynamic-flow/context-manager';
import { schemaValidator } from '@/ai/dynamic-flow/schema-validator';
import { FlowConfiguration, FlowStep } from '@/lib/models/flow-config';
import { 
  ExecutionTrace, 
  StepTrace, 
  createExecutionTrace, 
  createStepTrace,
  completeStepTrace,
  failStepTrace,
  completeExecutionTrace,
  failExecutionTrace,
} from '@/lib/models/execution-trace';
import { Timestamp } from 'firebase/firestore';

/**
 * Input schema for dynamic flow executor
 */
const DynamicFlowInputSchema = z.object({
  flowName: z.string().describe('Name of the flow to execute'),
  payload: z.record(z.any()).describe('Input data for the flow'),
  userId: z.string().optional().describe('ID of the user executing the flow'),
  requestId: z.string().optional().describe('Request ID for tracking'),
  enableTracing: z.boolean().optional().default(true).describe('Enable execution tracing'),
});

/**
 * Output schema for dynamic flow executor
 */
const DynamicFlowOutputSchema = z.object({
  success: z.boolean(),
  output: z.any().optional(),
  error: z.string().optional(),
  executionId: z.string().optional(),
  traceId: z.string().optional(),
  duration: z.number().optional(),
});

/**
 * Dynamic Flow Executor
 * 
 * Main entry point for executing configuration-driven flows
 */
export const dynamicFlowExecutor = ai.defineFlow(
  {
    name: 'DynamicFlowExecutor',
    inputSchema: DynamicFlowInputSchema,
    outputSchema: DynamicFlowOutputSchema,
  },
  async (input) => {
    const startTime = Date.now();
    const executionId = generateExecutionId();
    
    try {
      // 1. Load flow configuration from database
      const flowConfig = await loadFlowConfiguration(input.flowName);
      
      if (!flowConfig) {
        throw new FlowNotFoundError(input.flowName);
      }
      
      if (flowConfig.status !== 'active') {
        throw new FlowNotActiveError(input.flowName, flowConfig.status);
      }
      
      // 2. Create execution trace
      let trace: ExecutionTrace | null = null;
      if (input.enableTracing) {
        trace = createExecutionTrace(
          flowConfig.id,
          flowConfig.name,
          flowConfig.version,
          input.payload,
          input.userId,
          input.requestId
        ) as ExecutionTrace;
        trace.id = executionId;
      }
      
      // 3. Validate input against flow schema
      const validatedInput = schemaValidator.validateAndTransform(
        input.payload,
        flowConfig.inputSchema
      );
      
      // 4. Initialize context manager
      const context = new ContextManager(validatedInput);
      
      // 5. Execute steps sequentially
      for (let i = 0; i < flowConfig.steps.length; i++) {
        const step = flowConfig.steps[i];
        
        // Create step trace
        let stepTrace: StepTrace | null = null;
        if (trace) {
          stepTrace = createStepTrace(
            step.id,
            step.name,
            step.type,
            i,
            context.snapshot().variables
          );
          stepTrace.status = 'running';
          trace.stepTraces.push(stepTrace);
        }
        
        try {
          // Check condition if exists
          if (step.condition && !context.evaluateCondition(step.condition)) {
            console.log(`Skipping step ${step.name}: condition not met`);
            if (stepTrace) {
              stepTrace.status = 'skipped';
              stepTrace.endTime = Timestamp.now();
            }
            continue;
          }
          
          // Map inputs from context
          const stepInput = mapInputsFromContext(step, context);
          
          // Validate step input
          const validatedStepInput = schemaValidator.validateStepInput(
            stepInput,
            step.inputSchema,
            step.name
          );
          
          if (stepTrace) {
            stepTrace.input = validatedStepInput;
          }
          
          // Execute step (placeholder - will implement in next file)
          const stepOutput = await executeStep(step, validatedStepInput, context);
          
          // Validate step output
          const validatedStepOutput = schemaValidator.validateStepOutput(
            stepOutput,
            step.outputSchema,
            step.name
          );
          
          // Update context
          context.updateFromStep(step.id, step.name, validatedStepOutput, step.outputMapping);
          
          // Complete step trace
          if (stepTrace) {
            completeStepTrace(stepTrace, validatedStepOutput, context.snapshot().variables);
          }
          
        } catch (error) {
          // Handle step error
          console.error(`Step ${step.name} failed:`, error);
          
          if (stepTrace) {
            failStepTrace(stepTrace, {
              message: error instanceof Error ? error.message : 'Unknown error',
              type: error instanceof Error ? error.constructor.name : 'UnknownError',
              recoverable: step.onError !== 'stop',
            });
          }
          
          const handled = await handleStepError(error, step, context, flowConfig);
          
          if (!handled) {
            throw new StepExecutionError(step.name, error);
          }
        }
      }
      
      // 6. Extract final output
      const output = context.getFinalOutput();
      
      // 7. Validate output against flow schema
      const validatedOutput = schemaValidator.validateAndTransform(
        output,
        flowConfig.outputSchema
      );
      
      // 8. Complete execution trace
      const duration = Date.now() - startTime;
      
      if (trace) {
        completeExecutionTrace(trace, validatedOutput);
        // TODO: Save trace to database
      }
      
      return {
        success: true,
        output: validatedOutput,
        executionId,
        traceId: trace?.id,
        duration,
      };
      
    } catch (error) {
      console.error('Flow execution failed:', error);
      
      const duration = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionId,
        duration,
      };
    }
  }
);

/**
 * Load flow configuration from database
 */
async function loadFlowConfiguration(flowName: string): Promise<FlowConfiguration | null> {
  const { getFlowConfiguration } = await import('@/services/flow-config-service');
  return await getFlowConfiguration(flowName);
}

/**
 * Execute a single step
 * TODO: Implement actual step execution
 */
async function executeStep(
  step: FlowStep,
  input: Record<string, any>,
  context: ContextManager
): Promise<any> {
  // Placeholder implementation
  // Will be implemented in step-executor.ts
  console.warn('executeStep is a placeholder - implement step handlers');
  throw new Error('Step execution not yet implemented');
}

/**
 * Map inputs from context based on step's input mapping
 */
function mapInputsFromContext(
  step: FlowStep,
  context: ContextManager
): Record<string, any> {
  if (!step.inputMapping) {
    // No mapping - pass all context variables
    return context.getAllVariables();
  }
  
  const result: Record<string, any> = {};
  
  for (const [targetKey, sourceExpression] of Object.entries(step.inputMapping)) {
    const value = context.resolveExpression(sourceExpression);
    result[targetKey] = value;
  }
  
  return result;
}

/**
 * Handle step execution error based on error handling strategy
 */
async function handleStepError(
  error: Error,
  step: FlowStep,
  context: ContextManager,
  flowConfig: FlowConfiguration
): Promise<boolean> {
  switch (step.onError) {
    case 'skip':
      console.warn(`Step ${step.id} failed, skipping:`, error.message);
      return true; // Error handled, continue execution
      
    case 'retry':
      const retryCount = step.retryCount || 3;
      console.log(`Step ${step.id} will be retried (max ${retryCount} attempts)`);
      // TODO: Implement retry logic
      return false; // Not handled yet
      
    case 'stop':
    default:
      return false; // Not handled, will throw
  }
}

/**
 * Generate unique execution ID
 */
function generateExecutionId(): string {
  return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Custom error classes
 */
export class FlowNotFoundError extends Error {
  constructor(flowName: string) {
    super(`Flow not found: ${flowName}`);
    this.name = 'FlowNotFoundError';
  }
}

export class FlowNotActiveError extends Error {
  constructor(flowName: string, status: string) {
    super(`Flow is not active: ${flowName} (status: ${status})`);
    this.name = 'FlowNotActiveError';
  }
}

export class StepExecutionError extends Error {
  public readonly stepName: string;
  public readonly cause?: Error;
  
  constructor(stepName: string, cause: Error) {
    super(`Step execution failed: ${stepName} - ${cause.message}`);
    this.name = 'StepExecutionError';
    this.stepName = stepName;
    this.cause = cause;
  }
}

export class FlowTimeoutError extends Error {
  constructor(flowName: string, timeout: number) {
    super(`Flow execution timeout: ${flowName} (${timeout}ms)`);
    this.name = 'FlowTimeoutError';
  }
}

/**
 * Export for use in other modules
 */
export { DynamicFlowInputSchema, DynamicFlowOutputSchema };
