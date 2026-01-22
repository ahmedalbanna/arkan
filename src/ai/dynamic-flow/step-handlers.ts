/**
 * Step Handlers
 * Week 2 - Day 1-2: Step Handlers Implementation
 * 
 * Implements execution logic for all step types in dynamic flows.
 * Each handler is responsible for executing a specific type of step.
 */

import { ai } from '../genkit';
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
import crypto from 'crypto';

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
// Step-Level Cache
// ============================================================================

interface CacheEntry {
  output: any;
  timestamp: number;
  hits: number;
}

class StepCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly defaultTTL: number = 5 * 60 * 1000; // 5 minutes
  private readonly maxSize: number = 100;
  private cleanupInterval?: NodeJS.Timeout;

  constructor() {
    // Auto-cleanup expired entries every minute
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => {
        this.cleanExpired();
      }, 60 * 1000);
    }
  }

  /**
   * Generate cache key from step config and inputs
   */
  generateKey(stepType: string, config: any, inputs?: any): string {
    const data = JSON.stringify({ stepType, config, inputs });
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Get cached result
   */
  get(key: string, ttl?: number): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const effectiveTTL = ttl || this.defaultTTL;
    const now = Date.now();
    
    if (now - entry.timestamp > effectiveTTL) {
      this.cache.delete(key);
      return null;
    }

    // Update hit count
    entry.hits++;
    
    return entry.output;
  }

  /**
   * Set cache entry
   */
  set(key: string, output: any): void {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.findOldest();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      output,
      timestamp: Date.now(),
      hits: 0,
    });
  }

  /**
   * Clear specific entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.defaultTTL) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Find oldest entry for eviction
   */
  private findOldest(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    let totalHits = 0;
    
    for (const entry of this.cache.values()) {
      totalHits += entry.hits;
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalHits,
      avgHitsPerEntry: this.cache.size > 0 ? totalHits / this.cache.size : 0,
    };
  }

  /**
   * Cleanup on shutdown
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
    this.cache.clear();
  }
}

// Global cache instance
const stepCache = new StepCache();

// Cleanup on process exit
if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => {
    stepCache.destroy();
  });
}

/**
 * Execute step with caching support
 */
async function executeWithCache<T>(
  cacheKey: string,
  cacheTTL: number | undefined,
  cacheEnabled: boolean,
  executor: () => Promise<T>
): Promise<T> {
  // Check if caching is enabled
  if (!cacheEnabled) {
    return executor();
  }

  // Try to get from cache
  const cached = stepCache.get(cacheKey, cacheTTL);
  if (cached !== null) {
    console.log(`Cache hit for key: ${cacheKey.substring(0, 16)}...`);
    return cached;
  }

  // Execute and cache result
  const result = await executor();
  stepCache.set(cacheKey, result);
  
  return result;
}

/**
 * Execute with timeout
 */
async function executeWithTimeout<T>(
  executor: () => Promise<T>,
  timeout: number,
  timeoutMessage: string
): Promise<T> {
  return Promise.race([
    executor(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), timeout)
    ),
  ]);
}

// ============================================================================
// RETRIEVE Step Handler (RAG)
// ============================================================================

/**
 * Execute RAG retrieval step with caching and timeout
 * Retrieves relevant documents from vector database
 */
export async function executeRetrieveStep(
  config: RetrieveStepConfig,
  context: ContextManager
): Promise<any> {
  try {
    // Resolve query template
    const query = context.resolve(config.query);
    
    // Generate cache key
    const cacheKey = stepCache.generateKey('retrieve', {
      query,
      collection: config.collection,
      limit: config.limit,
      minScore: config.minScore,
      filters: config.filters,
    });

    // Check if caching is enabled (default: true for expensive operations)
    const cacheEnabled = config.cache !== false;
    const cacheTTL = config.cacheTTL || 5 * 60 * 1000; // 5 minutes default
    const timeout = config.timeout || 30000; // 30 seconds default

    // Execute with caching and timeout
    return await executeWithCache(
      cacheKey,
      cacheTTL,
      cacheEnabled,
      async () => {
        return await executeWithTimeout(
          async () => {
            // Import RAG service dynamically
            const { searchDocuments } = await import('../../services/rag-service');

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
          },
          timeout,
          `RAG retrieval timeout after ${timeout}ms`
        );
      }
    );

  } catch (_error) {
    console.error('Retrieve step error:', error);
    throw new Error(`RAG retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================================================
// GENERATE Step Handler (LLM)
// ============================================================================

/**
 * Execute LLM generation step with caching and timeout
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

    // Generate cache key based on prompt and config
    const cacheKey = stepCache.generateKey('generate', {
      prompt: promptText,
      model: modelConfig?.name,
      temperature: modelConfig?.temperature,
      maxTokens: modelConfig?.maxTokens,
      outputFormat: config.outputFormat,
    });

    // Check if caching is enabled (default: true for LLM calls)
    const cacheEnabled = config.cache !== false;
    const cacheTTL = config.cacheTTL || 10 * 60 * 1000; // 10 minutes default for LLM
    const timeout = config.timeout || 60000; // 60 seconds default for LLM

    // Execute with caching and timeout
    return await executeWithCache(
      cacheKey,
      cacheTTL,
      cacheEnabled,
      async () => {
        return await executeWithTimeout(
          async () => {
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
            const response = await ai.generate(options);

            // Extract output based on format
            let output: any;
            const text = response.text;

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
          },
          timeout,
          `LLM generation timeout after ${timeout}ms`
        );
      }
    );

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
 * Execute tool step with caching and timeout
 * Calls a registered tool with parameters
 */
export async function executeToolStep(
  config: ToolStepConfig,
  context: ContextManager
): Promise<any> {
  try {
    // Resolve parameters
    const resolvedParams = context.resolveObject(config.parameters);

    // Generate cache key
    const cacheKey = stepCache.generateKey('tool', {
      toolName: config.toolName,
      parameters: resolvedParams,
    });
    // Import tool registry
    const { executeTool } = await import('../core/tool-registry');

    // Check if caching is enabled (default: false for tools, as they may have side effects)
    const cacheEnabled = config.cache === true;
    const cacheTTL = config.cacheTTL || 5 * 60 * 1000; // 5 minutes default
    const timeout = config.timeout || 30000; // 30 seconds default

    // Execute with caching and timeout
    return await executeWithCache(
      cacheKey,
      cacheTTL,
      cacheEnabled,
      async () => {
        return await executeWithTimeout(
          async () => {
            // Execute tool
            return await executeTool(config.toolName, resolvedParams);
          },
          timeout,
          `Tool execution timeout after ${timeout}ms`
        );
      }
    );

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
    const { getCustomTransformer } = await import('../core/custom-transformers');
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
 * Evaluate a condition expression using the safe ConditionEvaluator
 * Supports basic comparisons and logical operators WITHOUT using eval/Function
 */
function evaluateCondition(expression: string, context: ContextManager): boolean {
  try {
    // Use the secure ConditionEvaluator from the dynamic-flow module
    const { ConditionEvaluator } = require('./condition-evaluator');
    const evaluator = new ConditionEvaluator();
    
    // Build context object for evaluator
    const evalContext = {
      variables: new Map(),
      stepResults: new Map(),
    };
    
    // Add all context variables to eval context
    const allVars = context.getAllVariables();
    for (const [key, value] of Object.entries(allVars)) {
      evalContext.variables.set(key, value);
    }
    
    // Evaluate using the safe evaluator
    return evaluator.evaluate(expression, evalContext as any);
    
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

// Export cache for testing and monitoring
export { stepCache };
