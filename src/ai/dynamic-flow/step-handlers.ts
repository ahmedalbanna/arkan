/**
 * Step Handlers
 * Week 2 - Day 1-2: Step Handlers Implementation
 * 
 * Implements execution logic for all step types in dynamic flows.
 * Each handler is responsible for executing a specific type of step.
 */

import { generate } from '@genkit-ai/ai';
import { gemini15Flash, gemini15Pro } from '@genkit-ai/googleai';
import type { ContextManager } from './context-manager';
import type { 
  RetrieveStepConfig,
  GenerateStepConfig,
  ToolStepConfig,
  FormatStepConfig,
  TransformStepConfig,
  _ConditionStepConfig,
  _LoopStepConfig,
  PromptReference,
  ModelConfig
} from '../../lib/models/flow-config';

// ============================================================================
// Step Handler Interface
// ============================================================================

export interface StepHandlerContext {
  context: ContextManager;
  config: any;
  stepId: string;
}

export interface StepHandlerResult {
  success: boolean;
  output?: any;
  error?: Error;
  metadata?: Record<string, any>;
}

// ============================================================================
// RETRIEVE Step Handler (RAG)
// ============================================================================

/**
 * Execute RAG retrieval step
 * Retrieves relevant documents from vector database
 */
export async function executeRetrieveStep(
  config: RetrieveStepConfig,
  context: ContextManager
): Promise<any> {
  try {
    // Import RAG service dynamically
    const { searchDocuments } = await import('../../services/rag-service');

    // Resolve query template
    const query = context.resolve(config.query);

    // Perform RAG search
    const results = await searchDocuments({
      query,
      collection: config.collection,
      limit: config.limit || 10,
      minScore: config.minScore || 0.7,
      filters: config.filters,
    });

    // Format results
    const documents = results.map(result => ({
      content: result.content,
      metadata: result.metadata,
      score: result.score,
    }));

    return {
      documents,
      count: documents.length,
      query,
    };

  } catch (_error) {
    console.error('Retrieve step error:', error);
    throw new Error(`RAG retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================================================
// GENERATE Step Handler (LLM)
// ============================================================================

/**
 * Execute LLM generation step
 * Generates text using AI models via Genkit
 */
export async function executeGenerateStep(
  config: GenerateStepConfig,
  context: ContextManager
): Promise<any> {
  try {
    // Get prompt content
    let promptText: string;
    let modelConfig: ModelConfig | undefined = config.model;

    if (typeof config.prompt === 'string') {
      // Inline prompt - resolve templates
      promptText = context.resolve(config.prompt);
    } else {
      // Prompt reference - load from database
      const promptRef = config.prompt as PromptReference;
      const promptData = await loadPrompt(promptRef.id, promptRef.version);
      
      // Apply variables to prompt template
      promptText = applyPromptVariables(
        promptData.template,
        config.variables || {},
        context
      );
      
      // Use prompt's model config if not overridden
      if (!modelConfig && promptData.modelConfig) {
        modelConfig = promptData.modelConfig;
      }
    }

    // Select model
    const model = selectModel(modelConfig?.name);

    // Prepare generation options
    const options: any = {
      model,
      prompt: promptText,
      config: {
        temperature: modelConfig?.temperature ?? 0.7,
        maxOutputTokens: modelConfig?.maxTokens ?? 2048,
        topP: modelConfig?.topP,
        topK: modelConfig?.topK,
        stopSequences: modelConfig?.stopSequences,
      },
    };

    // Generate text
    const response = await generate(options);

    // Extract output based on format
    let output: any;
    const text = response.text();

    switch (config.outputFormat) {
      case 'json':
        try {
          output = JSON.parse(text);
        } catch {
          throw new Error('Failed to parse JSON output');
        }
        break;

      case 'markdown':
      case 'text':
      default:
        output = text;
        break;
    }

    return output;

  } catch (_error) {
    console.error('Generate step error:', error);
    throw new Error(`LLM generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Load prompt from database
 */
async function loadPrompt(promptId: string, version?: string): Promise<any> {
  try {
    const { getPromptById } = await import('../../services/prompt-management-service');
    const prompt = await getPromptById(promptId, version);
    
    if (!prompt) {
      throw new Error(`Prompt not found: ${promptId}`);
    }
    
    return prompt;
  } catch (_error) {
    // Fallback: return a basic prompt structure
    console.warn('Failed to load prompt from database, using inline prompt');
    return {
      template: '{{prompt}}',
      modelConfig: {},
    };
  }
}

/**
 * Apply variables to prompt template
 */
function applyPromptVariables(
  template: string,
  variables: Record<string, string>,
  context: ContextManager
): string {
  // Create a temporary context with prompt variables
  const promptContext = context.clone();
  
  // Resolve variables from context and add to prompt context
  Object.entries(variables).forEach(([key, value]) => {
    const resolvedValue = context.resolve(value);
    promptContext.set(key, resolvedValue);
  });
  
  // Resolve the template
  return promptContext.resolve(template);
}

/**
 * Select model based on name
 */
function selectModel(modelName?: string): any {
  const name = modelName?.toLowerCase() || 'gemini-1.5-flash';
  
  if (name.includes('pro')) {
    return gemini15Pro;
  } else if (name.includes('flash')) {
    return gemini15Flash;
  } else {
    // Default to flash for speed
    return gemini15Flash;
  }
}

// ============================================================================
// TOOL Step Handler
// ============================================================================

/**
 * Execute tool step
 * Calls a registered tool with parameters
 */
export async function executeToolStep(
  config: ToolStepConfig,
  context: ContextManager
): Promise<any> {
  try {
    // Resolve parameters
    const resolvedParams = context.resolveObject(config.parameters);

    // Import tool registry
    const { executeTool } = await import('../tool-registry');

    // Execute tool with timeout
    const timeout = config.timeout || 30000;
    const result = await Promise.race([
      executeTool(config.toolName, resolvedParams),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Tool execution timeout')), timeout)
      ),
    ]);

    return result;

  } catch (_error) {
    console.error('Tool step error:', error);
    throw new Error(`Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================================================
// FORMAT Step Handler
// ============================================================================

/**
 * Execute format step
 * Formats data using templates
 */
export async function executeFormatStep(
  config: FormatStepConfig,
  context: ContextManager
): Promise<any> {
  try {
    // Resolve template
    const formatted = context.resolve(config.template);

    // Apply format-specific processing
    let output: any;

    switch (config.format) {
      case 'json':
        try {
          output = JSON.parse(formatted);
        } catch {
          // If parsing fails, wrap in object
          output = { value: formatted };
        }
        break;

      case 'markdown':
        output = formatted;
        // Could add markdown processing here
        break;

      case 'html':
        output = formatted;
        // Could add HTML sanitization here
        break;

      case 'text':
      default:
        output = formatted;
        break;
    }

    return output;

  } catch (_error) {
    console.error('Format step error:', error);
    throw new Error(`Formatting failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================================================
// TRANSFORM Step Handler
// ============================================================================

/**
 * Execute transform step
 * Applies data transformations
 */
export async function executeTransformStep(
  config: TransformStepConfig,
  context: ContextManager
): Promise<any> {
  try {
    // Get input value
    const input = context.get(config.input);

    if (input === undefined) {
      throw new Error(`Input variable not found: ${config.input}`);
    }

    // Apply transformer
    const output = await applyTransformer(
      config.transformer,
      input,
      config.parameters || {}
    );

    return output;

  } catch (_error) {
    console.error('Transform step error:', error);
    throw new Error(`Transformation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Apply transformer function
 */
async function applyTransformer(
  transformerName: string,
  input: any,
  parameters: Record<string, any>
): Promise<any> {
  // Built-in transformers
  const transformers: Record<string, (input: any, params: any) => any> = {
    // String transformers
    'uppercase': (input) => String(input).toUpperCase(),
    'lowercase': (input) => String(input).toLowerCase(),
    'trim': (input) => String(input).trim(),
    'capitalize': (input) => {
      const str = String(input);
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },
    
    // Array transformers
    'join': (input, params) => Array.isArray(input) ? input.join(params.separator || ', ') : input,
    'split': (input, params) => String(input).split(params.separator || ','),
    'filter': (input, _params) => Array.isArray(input) ? input.filter((item: any) => item) : input,
    'map': (input, _params) => Array.isArray(input) ? input.map((item: any) => item) : input,
    'first': (input) => Array.isArray(input) ? input[0] : input,
    'last': (input) => Array.isArray(input) ? input[input.length - 1] : input,
    'length': (input) => Array.isArray(input) ? input.length : String(input).length,
    
    // Object transformers
    'keys': (input) => typeof input === 'object' && input !== null ? Object.keys(input) : [],
    'values': (input) => typeof input === 'object' && input !== null ? Object.values(input) : [],
    'pick': (input, params) => {
      if (typeof input !== 'object' || !input) return input;
      const keys = params.keys || [];
      const result: any = {};
      keys.forEach((key: string) => {
        if (key in input) result[key] = input[key];
      });
      return result;
    },
    'omit': (input, params) => {
      if (typeof input !== 'object' || !input) return input;
      const keys = params.keys || [];
      const result: any = { ...input };
      keys.forEach((key: string) => delete result[key]);
      return result;
    },
    
    // Type transformers
    'toString': (input) => String(input),
    'toNumber': (input) => Number(input),
    'toBoolean': (input) => Boolean(input),
    'toJSON': (input) => JSON.stringify(input, null, 2),
    'parseJSON': (input) => JSON.parse(String(input)),
    
    // Utility transformers
    'default': (input, params) => input !== undefined && input !== null ? input : params.value,
    'replace': (input, params) => String(input).replace(
      new RegExp(params.pattern || '', params.flags || 'g'),
      params.replacement || ''
    ),
  };

  // Check if transformer exists
  if (transformerName in transformers) {
    return transformers[transformerName](input, parameters);
  }

  // Try to load custom transformer
  try {
    const { getCustomTransformer } = await import('../custom-transformers');
    const customTransformer = await getCustomTransformer(transformerName);
    return customTransformer(input, parameters);
  } catch {
    throw new Error(`Transformer not found: ${transformerName}`);
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create step handler context
 */
export function createStepHandlerContext(
  context: ContextManager,
  config: any,
  stepId: string
): StepHandlerContext {
  return { context, config, stepId };
}

/**
 * Wrap handler result
 */
export function wrapHandlerResult(
  output: any,
  metadata?: Record<string, any>
): StepHandlerResult {
  return {
    success: true,
    output,
    metadata,
  };
}

/**
 * Wrap handler error
 */
export function wrapHandlerError(error: Error): StepHandlerResult {
  return {
    success: false,
    error,
  };
}

// ============================================================================
// CONDITION Step Handler
// ============================================================================

/**
 * Execute condition step
 * Evaluates a condition and returns which branch to take
 */
export async function executeConditionStep(
  config: any,
  context: ContextManager
): Promise<any> {
  try {
    // Resolve condition expression
    const conditionExpression = context.resolve(config.condition);
    
    // Evaluate condition
    const result = evaluateCondition(conditionExpression, context);
    
    // Return which steps to execute
    return {
      conditionResult: result,
      nextSteps: result ? config.thenSteps : (config.elseSteps || []),
    };

  } catch (_error) {
    console.error('Condition step error:', error);
    throw new Error(`Condition evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Evaluate a condition expression
 * Supports basic comparisons and logical operators
 */
function evaluateCondition(expression: string, context: ContextManager): boolean {
  try {
    // Replace variable references with their values
    let resolvedExpression = expression;
    
    // Find all {{variable}} references
    const variablePattern = /\{\{([^}]+)\}\}/g;
    let match;
    
    while ((match = variablePattern.exec(expression)) !== null) {
      const variableName = match[1].trim();
      const value = context.get(variableName);
      
      // Convert value to string for replacement
      let valueStr: string;
      if (typeof value === 'string') {
        valueStr = `"${value}"`;
      } else if (value === null || value === undefined) {
        valueStr = 'null';
      } else {
        valueStr = String(value);
      }
      
      resolvedExpression = resolvedExpression.replace(match[0], valueStr);
    }
    
    // Evaluate the expression safely
    // Note: In production, consider using a safer expression evaluator
    const result = new Function(`return ${resolvedExpression}`)();
    
    return Boolean(result);
    
  } catch (_error) {
    console.error('Condition evaluation error:', error);
    throw new Error(`Invalid condition expression: ${expression}`);
  }
}

// ============================================================================
// LOOP Step Handler
// ============================================================================

/**
 * Execute loop step
 * Iterates over an array and executes steps for each item
 */
export async function executeLoopStep(
  config: any,
  context: ContextManager
): Promise<any> {
  try {
    // Get the array to iterate over
    const arrayVariable = config.iterateOver;
    const array = context.get(arrayVariable);
    
    if (!Array.isArray(array)) {
      throw new Error(`Loop variable is not an array: ${arrayVariable}`);
    }
    
    // Check max iterations
    const maxIterations = config.maxIterations || array.length;
    const iterationsToRun = Math.min(array.length, maxIterations);
    
    // Return loop configuration for executor to handle
    return {
      array: array.slice(0, iterationsToRun),
      itemVariable: config.itemVariable,
      steps: config.steps,
      totalIterations: iterationsToRun,
    };

  } catch (_error) {
    console.error('Loop step error:', error);
    throw new Error(`Loop execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Export all handlers
export const stepHandlers = {
  executeRetrieveStep,
  executeGenerateStep,
  executeToolStep,
  executeFormatStep,
  executeTransformStep,
  executeConditionStep,
  executeLoopStep,
};
