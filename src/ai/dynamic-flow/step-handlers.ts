/**
 * Step Handlers for Dynamic Flow Execution
 * 
 * Implements handlers for all step types:
 * - retrieve: RAG retrieval from vector store
 * - generate: LLM text generation
 * - tool: Tool execution
 * - format: Output formatting and transformation
 */

import { ai } from '@/ai/genkit';
import { FlowStep } from '@/lib/models/flow-config';
import { ContextManager } from './context-manager';
import { retrieveContext, RetrievalOptions } from '@/lib/rag/retrieval';
import { executeTool } from '@/services/tool-registry-service';

/**
 * Step execution result
 */
export interface StepExecutionResult {
  output: any;
  metadata?: {
    tokensUsed?: number;
    model?: string;
    duration?: number;
    sources?: Array<{
      content: string;
      score: number;
      sourceFile?: string;
      type: string;
    }>;
    [key: string]: any;
  };
}

/**
 * Execute a step based on its type
 */
export async function executeStep(
  step: FlowStep,
  input: Record<string, any>,
  context: ContextManager
): Promise<StepExecutionResult> {
  const startTime = Date.now();

  try {
    let result: StepExecutionResult;

    switch (step.type) {
      case 'RETRIEVE':
        result = await executeRetrieveStep(step, input, context);
        break;

      case 'GENERATE':
        result = await executeGenerateStep(step, input, context);
        break;

      case 'TOOL':
        result = await executeToolStep(step, input, context);
        break;

      case 'FORMAT':
        result = await executeFormatStep(step, input, context);
        break;

      default:
        throw new UnsupportedStepTypeError(step.type);
    }

    // Add execution duration to metadata
    const duration = Date.now() - startTime;
    result.metadata = {
      ...result.metadata,
      duration,
    };

    return result;
  } catch (error) {
    console.error(`Step execution failed: ${step.name}`, error);
    throw error;
  }
}

/**
 * Execute a RAG retrieval step
 * 
 * Retrieves relevant context from the vector store based on query
 */
export async function executeRetrieveStep(
  step: FlowStep,
  input: Record<string, any>,
  context: ContextManager
): Promise<StepExecutionResult> {
  try {
    const {
      query,
      topK = 5,
      minScore = 0.5,
      projectId,
      userId,
      includeTypes,
      useCache = true,
      rerank = false,
      rerankStrategy = 'hybrid',
      enhanced = false,
    } = input;

    if (!query) {
      throw new StepValidationError('retrieve', 'query parameter is required');
    }

    const options: RetrievalOptions = {
      topK,
      minScore,
      projectId,
      userId,
      includeTypes,
      useCache,
      rerank,
      rerankStrategy,
    };

    // Use enhanced retrieval if requested
    let result;
    if (enhanced) {
      const { retrieveContextEnhanced } = await import('@/lib/rag/retrieval');
      result = await retrieveContextEnhanced(query, options);
    } else {
      result = await retrieveContext(query, options);
    }

    return {
      output: {
        context: result.context,
        sources: result.sources,
        retrievedCount: result.sources.length,
      },
      metadata: {
        sources: result.sources,
        query,
        topK,
        minScore,
      },
    };
  } catch (error) {
    console.error('Retrieve step failed:', error);
    // Re-throw validation errors as-is
    if (error instanceof StepValidationError) {
      throw error;
    }
    throw new StepExecutionError('retrieve', step.name, error);
  }
}

/**
 * Execute an LLM generation step
 * 
 * Generates text using the configured model and prompt
 */
export async function executeGenerateStep(
  step: FlowStep,
  input: Record<string, any>,
  context: ContextManager
): Promise<StepExecutionResult> {
  try {
    const {
      prompt,
      model = 'ollama/phi3:mini', // Default model
      systemPrompt,
      temperature = 0.7,
      maxTokens = 2000,
      topP = 0.9,
      topK = 40,
      stopSequences,
    } = input;

    if (!prompt) {
      throw new StepValidationError('generate', 'prompt parameter is required');
    }

    // Build the generation config
    const config: any = {
      temperature,
      maxOutputTokens: maxTokens,
      topP,
      topK,
    };

    if (stopSequences && stopSequences.length > 0) {
      config.stopSequences = stopSequences;
    }

    // Execute generation
    const response = await ai.generate({
      model,
      prompt: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
      config,
    });

    // Extract text from response
    const generatedText = response.text;

    return {
      output: {
        text: generatedText,
        model,
      },
      metadata: {
        model,
        tokensUsed: response.usage?.totalTokens,
        temperature,
        maxTokens,
      },
    };
  } catch (error) {
    console.error('Generate step failed:', error);
    // Re-throw validation errors as-is
    if (error instanceof StepValidationError) {
      throw error;
    }
    throw new StepExecutionError('generate', step.name, error);
  }
}

/**
 * Execute a tool step
 * 
 * Executes a registered tool with provided parameters
 */
export async function executeToolStep(
  step: FlowStep,
  input: Record<string, any>,
  context: ContextManager
): Promise<StepExecutionResult> {
  try {
    const {
      toolName,
      parameters = {},
      timeout,
    } = input;

    if (!toolName) {
      throw new StepValidationError('tool', 'toolName parameter is required');
    }

    // Execute the tool through the registry service
    const toolResult = await executeTool(toolName, parameters, timeout);

    return {
      output: {
        result: toolResult,
        toolName,
      },
      metadata: {
        toolName,
        parametersCount: Object.keys(parameters).length,
      },
    };
  } catch (error) {
    console.error('Tool step failed:', error);
    // Re-throw validation errors as-is
    if (error instanceof StepValidationError) {
      throw error;
    }
    throw new StepExecutionError('tool', step.name, error);
  }
}

/**
 * Execute a format step
 * 
 * Formats and transforms data using templates and transformations
 */
export async function executeFormatStep(
  step: FlowStep,
  input: Record<string, any>,
  context: ContextManager
): Promise<StepExecutionResult> {
  try {
    const {
      template,
      format = 'text',
      data,
      transformation,
    } = input;

    if (!data) {
      throw new StepValidationError('format', 'data parameter is required');
    }

    let output: any;

    // Apply transformation if specified
    const transformedData = transformation 
      ? applyTransformation(data, transformation)
      : data;

    // Format based on type
    switch (format) {
      case 'json':
        output = formatAsJSON(transformedData);
        break;

      case 'markdown':
        output = formatAsMarkdown(transformedData, template);
        break;

      case 'text':
        output = formatAsText(transformedData, template);
        break;

      case 'html':
        output = formatAsHTML(transformedData, template);
        break;

      case 'csv':
        output = formatAsCSV(transformedData);
        break;

      default:
        throw new StepValidationError('format', `Unsupported format: ${format}`);
    }

    return {
      output: {
        formatted: output,
        format,
      },
      metadata: {
        format,
        hasTemplate: !!template,
        hasTransformation: !!transformation,
      },
    };
  } catch (error) {
    console.error('Format step failed:', error);
    // Re-throw validation errors as-is
    if (error instanceof StepValidationError) {
      throw error;
    }
    throw new StepExecutionError('format', step.name, error);
  }
}

/**
 * Apply a transformation to data
 */
function applyTransformation(data: any, transformation: string): any {
  try {
    // Support simple transformations
    switch (transformation) {
      case 'uppercase':
        return typeof data === 'string' ? data.toUpperCase() : data;

      case 'lowercase':
        return typeof data === 'string' ? data.toLowerCase() : data;

      case 'trim':
        return typeof data === 'string' ? data.trim() : data;

      case 'stringify':
        return JSON.stringify(data, null, 2);

      case 'parse':
        return typeof data === 'string' ? JSON.parse(data) : data;

      case 'flatten':
        return Array.isArray(data) ? data.flat() : data;

      case 'compact':
        return Array.isArray(data) ? data.filter(Boolean) : data;

      default:
        // Try to execute as a JavaScript expression
        // Note: This is potentially dangerous and should be sandboxed in production
        console.warn('Custom transformation not sandboxed:', transformation);
        return data;
    }
  } catch (error) {
    console.error('Transformation failed:', error);
    return data;
  }
}

/**
 * Format data as JSON
 */
function formatAsJSON(data: any): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Format data as Markdown
 */
function formatAsMarkdown(data: any, template?: string): string {
  if (template) {
    return interpolateTemplate(template, data);
  }

  // Default markdown formatting
  if (typeof data === 'string') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item, idx) => `${idx + 1}. ${formatAsMarkdown(item)}`).join('\n');
  }

  if (typeof data === 'object' && data !== null) {
    return Object.entries(data)
      .map(([key, value]) => `**${key}**: ${value}`)
      .join('\n\n');
  }

  return String(data);
}

/**
 * Format data as plain text
 */
function formatAsText(data: any, template?: string): string {
  if (template) {
    return interpolateTemplate(template, data);
  }

  // Default text formatting
  if (typeof data === 'string') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.join('\n');
  }

  if (typeof data === 'object' && data !== null) {
    return Object.entries(data)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  }

  return String(data);
}

/**
 * Format data as HTML
 */
function formatAsHTML(data: any, template?: string): string {
  if (template) {
    return interpolateTemplate(template, data);
  }

  // Default HTML formatting
  if (typeof data === 'string') {
    return `<p>${escapeHTML(data)}</p>`;
  }

  if (Array.isArray(data)) {
    const items = data.map(item => `<li>${escapeHTML(String(item))}</li>`).join('');
    return `<ul>${items}</ul>`;
  }

  if (typeof data === 'object' && data !== null) {
    const items = Object.entries(data)
      .map(([key, value]) => `<dt>${escapeHTML(key)}</dt><dd>${escapeHTML(String(value))}</dd>`)
      .join('');
    return `<dl>${items}</dl>`;
  }

  return `<p>${escapeHTML(String(data))}</p>`;
}

/**
 * Format data as CSV
 */
function formatAsCSV(data: any): string {
  if (!Array.isArray(data)) {
    throw new Error('CSV format requires array data');
  }

  if (data.length === 0) {
    return '';
  }

  // Assume array of objects
  if (typeof data[0] === 'object' && data[0] !== null) {
    const headers = Object.keys(data[0]);
    const headerRow = headers.map(escapeCSV).join(',');
    const dataRows = data.map(row =>
      headers.map(header => escapeCSV(String(row[header] ?? ''))).join(',')
    );
    return [headerRow, ...dataRows].join('\n');
  }

  // Array of primitives
  return data.map(item => escapeCSV(String(item))).join(',');
}

/**
 * Interpolate template with data
 */
function interpolateTemplate(template: string, data: any): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();
    const value = getNestedValue(data, trimmedKey);
    return value !== undefined ? String(value) : match;
  });
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Escape HTML special characters
 */
function escapeHTML(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}

/**
 * Escape CSV values
 */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Custom error classes
 */
export class StepExecutionError extends Error {
  public readonly stepType: string;
  public readonly stepName: string;
  public readonly cause?: any;

  constructor(stepType: string, stepName: string, cause?: any) {
    const message = cause instanceof Error 
      ? `${stepType} step "${stepName}" failed: ${cause.message}`
      : `${stepType} step "${stepName}" failed`;
    super(message);
    this.name = 'StepExecutionError';
    this.stepType = stepType;
    this.stepName = stepName;
    this.cause = cause;
  }
}

export class StepValidationError extends Error {
  public readonly stepType: string;

  constructor(stepType: string, message: string) {
    super(`${stepType} step validation failed: ${message}`);
    this.name = 'StepValidationError';
    this.stepType = stepType;
  }
}

export class UnsupportedStepTypeError extends Error {
  constructor(stepType: string) {
    super(`Unsupported step type: ${stepType}`);
    this.name = 'UnsupportedStepTypeError';
  }
}

/**
 * Export all step handlers
 */
export const stepHandlers = {
  retrieve: executeRetrieveStep,
  generate: executeGenerateStep,
  tool: executeToolStep,
  format: executeFormatStep,
};
