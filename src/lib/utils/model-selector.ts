/**
 * AI Model Selection Logic
 * Dynamically selects the best model based on task complexity
 */

import { ModelConfig, SectionComplexity } from '@/types';
import { Section } from '@/lib/models/section';
import { logger } from './logger';

/**
 * Model configurations for different complexity levels
 */
const MODEL_CONFIGS: Record<SectionComplexity, ModelConfig> = {
  [SectionComplexity.SIMPLE]: {
    model: 'ollama/gemma:2b',
    temperature: 0.3,
    maxTokens: 1000,
  },
  [SectionComplexity.MEDIUM]: {
    model: 'ollama/phi3:mini',
    temperature: 0.4,
    maxTokens: 2000,
  },
  [SectionComplexity.COMPLEX]: {
    model: 'ollama/llama3:8b',
    temperature: 0.5,
    maxTokens: 3000,
  },
  [SectionComplexity.EXPERT]: {
    model: 'ollama/qwen2.5:latest',
    temperature: 0.6,
    maxTokens: 4000,
  },
};

/**
 * Determine section complexity based on various factors
 */
export function assessSectionComplexity(section: Section): SectionComplexity {
  let complexityScore = 0;

  // Factor 1: Word count requirement
  const wordCountStr = section.controls?.wordCount || '';
  const wordCount = parseInt(wordCountStr, 10) || 0;
  if (wordCount > 1500) complexityScore += 3;
  else if (wordCount > 800) complexityScore += 2;
  else if (wordCount > 400) complexityScore += 1;

  // Factor 2: Number of guidelines
  const guidelinesCount = section.guidelines?.length || 0;
  if (guidelinesCount > 5) complexityScore += 2;
  else if (guidelinesCount > 2) complexityScore += 1;

  // Factor 3: Complexity control
  const complexity = section.controls?.complexity || 50;
  if (complexity > 80) complexityScore += 3;
  else if (complexity > 60) complexityScore += 2;
  else if (complexity > 40) complexityScore += 1;

  // Factor 4: Context dependencies
  const contextCount = (Object.keys(section.context?.sections || {}).length || 0) + (Object.keys(section.context?.externalContext || {}).length || 0);
  if (contextCount > 5) complexityScore += 2;
  else if (contextCount > 2) complexityScore += 1;

  // Factor 5: Behaviors complexity
  const behaviorsCount = section.behaviors?.length || 0;
  if (behaviorsCount > 3) complexityScore += 1;

  // Factor 6: Section type
  if (section.type === 'diagram' || section.type === 'code' || section.type === 'presentation') {
    complexityScore += 2; // Structured content is more complex
  }

  // Map score to complexity level
  if (complexityScore >= 9) return SectionComplexity.EXPERT;
  if (complexityScore >= 6) return SectionComplexity.COMPLEX;
  if (complexityScore >= 3) return SectionComplexity.MEDIUM;
  return SectionComplexity.SIMPLE;
}

/**
 * Select the appropriate model configuration for a section
 */
export function selectModelForSection(section: Section): ModelConfig {
  const complexity = assessSectionComplexity(section);
  const config = MODEL_CONFIGS[complexity];
  
  logger.info(`Selected model: ${config.model} (complexity: ${complexity}, section: ${section.title})`);
  
  return config;
}

/**
 * Get model config by complexity level (for testing or manual selection)
 */
export function getModelConfig(complexity: SectionComplexity): ModelConfig {
  return MODEL_CONFIGS[complexity];
}

/**
 * Override model selection with custom configuration
 * Useful for testing or user preferences
 */
export function createCustomModelConfig(
  modelName?: string,
  temperature?: number,
  maxTokens?: number
): ModelConfig {
  return {
    model: modelName || MODEL_CONFIGS[SectionComplexity.MEDIUM].model,
    temperature: temperature ?? 0.4,
    maxTokens: maxTokens ?? 2000,
  };
}
