/**
 * Unified AI Generation Schema
 * Single interface for all text generation tasks (Section, Grammar, Translation, etc.)
 */

import { z } from 'zod';

/**
 * Process types for different generation tasks
 */
export enum GenerationProcessType {
  SECTION = 'section',           // Generate report sections
  GRAMMAR = 'grammar',           // Grammar correction
  TRANSLATION = 'translation',   // Text translation
  SUMMARIZATION = 'summarization', // Text summarization
  EXPANSION = 'expansion',       // Text expansion
  REWRITE = 'rewrite',          // Text rewriting
  CHAT = 'chat',                // Chat/conversation
  CUSTOM = 'custom',            // Custom generation
}

/**
 * Unified input schema for all generation requests
 */
export const UnifiedGenerationInputSchema = z.object({
  // Process identification
  processType: z.nativeEnum(GenerationProcessType)
    .describe('Type of generation process'),
  
  processId: z.string().min(1)
    .describe('Unique identifier for this generation (e.g., section-id, task-id)'),
  
  // Prompts (required)
  systemPrompt: z.string().min(10)
    .describe('System instructions defining AI role and behavior'),
  
  userPrompt: z.string().min(10)
    .describe('User task description and context'),
  
  // Optional configuration
  modelConfig: z.object({
    modelName: z.string().optional()
      .describe('AI model to use (e.g., ollama/gemma:2b)'),
    temperature: z.number().min(0).max(2).optional()
      .describe('Temperature for generation (0.0-2.0)'),
    maxTokens: z.number().positive().optional()
      .describe('Maximum tokens to generate'),
  }).optional(),
  
  // Optional metadata for logging/tracking
  metadata: z.record(z.any()).optional()
    .describe('Additional metadata for logging'),
});

export type UnifiedGenerationInput = z.infer<typeof UnifiedGenerationInputSchema>;

/**
 * Unified output schema for all generation responses
 */
export const UnifiedGenerationOutputSchema = z.object({
  processType: z.nativeEnum(GenerationProcessType)
    .describe('Type of generation process'),
  
  processId: z.string()
    .describe('Unique identifier for this generation'),
  
  content: z.string()
    .describe('Generated content (plain markdown text)'),
  
  metadata: z.object({
    modelUsed: z.string()
      .describe('AI model that generated the content'),
    generatedAt: z.string()
      .describe('ISO timestamp of generation'),
    tokensUsed: z.number().optional()
      .describe('Number of tokens used (if available)'),
    processingTimeMs: z.number().optional()
      .describe('Processing time in milliseconds'),
  }),
});

export type UnifiedGenerationOutput = z.infer<typeof UnifiedGenerationOutputSchema>;

/**
 * Default model configurations for different process types
 */
export const DEFAULT_MODEL_CONFIGS: Record<GenerationProcessType, {
  modelName: string;
  temperature: number;
  maxTokens?: number;
}> = {
  [GenerationProcessType.SECTION]: {
    modelName: 'ollama/gemma:2b',
    temperature: 0.3,
    maxTokens: 3000,
  },
  [GenerationProcessType.GRAMMAR]: {
    modelName: 'ollama/phi3:mini',
    temperature: 0.1, // Low for accuracy
    maxTokens: 2000,
  },
  [GenerationProcessType.TRANSLATION]: {
    modelName: 'ollama/phi3:mini',
    temperature: 0.2,
    maxTokens: 2000,
  },
  [GenerationProcessType.SUMMARIZATION]: {
    modelName: 'ollama/gemma:2b',
    temperature: 0.3,
    maxTokens: 1000,
  },
  [GenerationProcessType.EXPANSION]: {
    modelName: 'ollama/llama3:8b',
    temperature: 0.5,
    maxTokens: 3000,
  },
  [GenerationProcessType.REWRITE]: {
    modelName: 'ollama/phi3:mini',
    temperature: 0.4,
    maxTokens: 2000,
  },
  [GenerationProcessType.CHAT]: {
    modelName: 'ollama/llama3:8b',
    temperature: 0.7,
    maxTokens: 2000,
  },
  [GenerationProcessType.CUSTOM]: {
    modelName: 'ollama/gemma:2b',
    temperature: 0.5,
    maxTokens: 2000,
  },
};

/**
 * Helper to get default model config for a process type
 */
export function getDefaultModelConfig(processType: GenerationProcessType) {
  return DEFAULT_MODEL_CONFIGS[processType];
}

/**
 * Helper to merge user config with defaults
 */
export function mergeModelConfig(
  processType: GenerationProcessType,
  userConfig?: UnifiedGenerationInput['modelConfig']
) {
  const defaults = getDefaultModelConfig(processType);
  
  return {
    modelName: userConfig?.modelName || defaults.modelName,
    temperature: userConfig?.temperature ?? defaults.temperature,
    maxTokens: userConfig?.maxTokens || defaults.maxTokens,
  };
}
