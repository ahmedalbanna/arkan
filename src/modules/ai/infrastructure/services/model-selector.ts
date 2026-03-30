/**
 * Model Selection Utilities
 * 
 * Provides intelligent model selection based on various factors:
 * - Task type and complexity
 * - Content length and context size
 * - Performance requirements
 * - Resource availability
 */

import { OLLAMA_MODELS, MODEL_BY_TASK } from '../../domain/constants/AiModels';
import { getModelForFlow } from './model-mapping';

/**
 * Task complexity levels
 */
export enum TaskComplexity {
  SIMPLE = 'simple',       // Basic text operations
  MODERATE = 'moderate',   // Analysis, structured output
  COMPLEX = 'complex',     // Academic, research, reasoning
}

/**
 * Performance priority settings
 */
export enum PerformancePriority {
  SPEED = 'speed',         // Prioritize fast response
  BALANCED = 'balanced',   // Balance speed and quality
  QUALITY = 'quality',     // Prioritize output quality
}

/**
 * Model selection criteria
 */
export interface ModelSelectionCriteria {
  flowName?: string;
  taskComplexity?: TaskComplexity;
  performancePriority?: PerformancePriority;
  inputTokens?: number;
  requiresStructuredOutput?: boolean;
  requiresDeepReasoning?: boolean;
  isAcademic?: boolean;
  hasRAGContext?: boolean;
}

/**
 * Model characteristics for selection logic
 */
interface ModelCharacteristics {
  speed: number;           // 1-10 (higher is faster)
  quality: number;         // 1-10 (higher is better)
  reasoning: number;       // 1-10 (higher is better)
  structuredOutput: number; // 1-10 (higher is better)
  memoryUsage: number;     // GB
  maxConcurrent: number;   // Recommended concurrent requests
}

const MODEL_CHARACTERISTICS: Record<string, ModelCharacteristics> = {
  [OLLAMA_MODELS.GEMMA_2B]: {
    speed: 9,
    quality: 6,
    reasoning: 5,
    structuredOutput: 6,
    memoryUsage: 2.5,
    maxConcurrent: 5,
  },
  [OLLAMA_MODELS.PHI3_MINI]: {
    speed: 7,
    quality: 8,
    reasoning: 8,
    structuredOutput: 9,
    memoryUsage: 3.3,
    maxConcurrent: 3,
  },
  [OLLAMA_MODELS.LLAMA3_8B]: {
    speed: 4,
    quality: 10,
    reasoning: 10,
    structuredOutput: 8,
    memoryUsage: 4.7,
    maxConcurrent: 1,
  },
};

/**
 * Select model based on task complexity
 */
export function selectModelByComplexity(complexity: TaskComplexity): string {
  switch (complexity) {
    case TaskComplexity.SIMPLE:
      return OLLAMA_MODELS.GEMMA_2B;
    case TaskComplexity.MODERATE:
      return OLLAMA_MODELS.PHI3_MINI;
    case TaskComplexity.COMPLEX:
      return OLLAMA_MODELS.LLAMA3_8B;
    default:
      return OLLAMA_MODELS.GEMMA_2B;
  }
}

/**
 * Select model based on performance priority
 */
export function selectModelByPriority(priority: PerformancePriority): string {
  switch (priority) {
    case PerformancePriority.SPEED:
      return OLLAMA_MODELS.GEMMA_2B;
    case PerformancePriority.BALANCED:
      return OLLAMA_MODELS.PHI3_MINI;
    case PerformancePriority.QUALITY:
      return OLLAMA_MODELS.LLAMA3_8B;
    default:
      return OLLAMA_MODELS.PHI3_MINI;
  }
}

/**
 * Select model based on input token count
 */
export function selectModelByTokenCount(tokens: number): string {
  // For very large inputs, use models with better context handling
  if (tokens > 4000) {
    return OLLAMA_MODELS.LLAMA3_8B;
  } else if (tokens > 2000) {
    return OLLAMA_MODELS.PHI3_MINI;
  }
  return OLLAMA_MODELS.GEMMA_2B;
}

/**
 * Intelligent model selection based on multiple criteria
 */
export function selectModel(criteria: ModelSelectionCriteria): string {
  // Priority 1: If flow name is specified, use predefined mapping
  if (criteria.flowName) {
    const flowModel = getModelForFlow(criteria.flowName);
    if (flowModel) return flowModel;
  }

  // Priority 2: Academic tasks always use Llama 3 8B
  if (criteria.isAcademic) {
    return OLLAMA_MODELS.LLAMA3_8B;
  }

  // Priority 3: Deep reasoning tasks
  if (criteria.requiresDeepReasoning) {
    return criteria.hasRAGContext ? OLLAMA_MODELS.LLAMA3_8B : OLLAMA_MODELS.PHI3_MINI;
  }

  // Priority 4: Structured output needs
  if (criteria.requiresStructuredOutput) {
    return OLLAMA_MODELS.PHI3_MINI;
  }

  // Priority 5: Performance priority
  if (criteria.performancePriority) {
    return selectModelByPriority(criteria.performancePriority);
  }

  // Priority 6: Task complexity
  if (criteria.taskComplexity) {
    return selectModelByComplexity(criteria.taskComplexity);
  }

  // Priority 7: Input token count
  if (criteria.inputTokens) {
    return selectModelByTokenCount(criteria.inputTokens);
  }

  // Default: Use Phi-3 Mini for balanced performance
  return OLLAMA_MODELS.PHI3_MINI;
}

/**
 * Get model characteristics
 */
export function getModelCharacteristics(model: string): ModelCharacteristics | null {
  return MODEL_CHARACTERISTICS[model] || null;
}

/**
 * Compare two models and return the better one based on criteria
 */
export function compareModels(
  model1: string,
  model2: string,
  priority: 'speed' | 'quality' | 'reasoning' | 'structuredOutput'
): string {
  const char1 = MODEL_CHARACTERISTICS[model1];
  const char2 = MODEL_CHARACTERISTICS[model2];

  if (!char1 || !char2) {
    return model1;
  }

  return char1[priority] >= char2[priority] ? model1 : model2;
}

/**
 * Check if model is available for concurrent requests
 */
export function canHandleConcurrentRequest(model: string, currentRequests: number): boolean {
  const characteristics = MODEL_CHARACTERISTICS[model];
  if (!characteristics) return false;
  return currentRequests < characteristics.maxConcurrent;
}

/**
 * Get recommended concurrent request limit for a model
 */
export function getMaxConcurrentRequests(model: string): number {
  const characteristics = MODEL_CHARACTERISTICS[model];
  return characteristics?.maxConcurrent || 1;
}

/**
 * Get all available models sorted by a characteristic
 */
export function getModelsSortedBy(
  characteristic: 'speed' | 'quality' | 'reasoning' | 'structuredOutput'
): string[] {
  return Object.entries(MODEL_CHARACTERISTICS)
    .sort((a, b) => b[1][characteristic] - a[1][characteristic])
    .map(([model]) => model);
}

/**
 * Check if model is suitable for task
 */
export function isModelSuitableForTask(model: string, criteria: ModelSelectionCriteria): boolean {
  const characteristics = MODEL_CHARACTERISTICS[model];
  if (!characteristics) return false;

  // Check academic requirement
  if (criteria.isAcademic && model !== OLLAMA_MODELS.LLAMA3_8B) {
    return false;
  }

  // Check structured output requirement
  if (criteria.requiresStructuredOutput && characteristics.structuredOutput < 8) {
    return false;
  }

  // Check deep reasoning requirement
  if (criteria.requiresDeepReasoning && characteristics.reasoning < 8) {
    return false;
  }

  return true;
}

/**
 * Get fallback model if primary is unavailable
 */
export function getFallbackModel(primaryModel: string): string {
  // If Llama 3 8B fails, fall back to Phi-3 Mini
  if (primaryModel === OLLAMA_MODELS.LLAMA3_8B) {
    return OLLAMA_MODELS.PHI3_MINI;
  }

  // If Phi-3 Mini fails, fall back to Gemma 2B
  if (primaryModel === OLLAMA_MODELS.PHI3_MINI) {
    return OLLAMA_MODELS.GEMMA_2B;
  }

  // Gemma 2B is the ultimate fallback
  return OLLAMA_MODELS.GEMMA_2B;
}

/**
 * Model selection result with metadata
 */
export interface ModelSelectionResult {
  model: string;
  reason: string;
  characteristics: ModelCharacteristics | null;
  fallbackModel: string;
  warnings: string[];
}

/**
 * Select model with detailed result information
 */
export function selectModelWithMetadata(criteria: ModelSelectionCriteria): ModelSelectionResult {
  const warnings: string[] = [];
  let reason = 'Default balanced selection';

  // Determine model
  let model: string;

  if (criteria.flowName) {
    model = getModelForFlow(criteria.flowName);
    reason = `Predefined mapping for flow: ${criteria.flowName}`;
  } else if (criteria.isAcademic) {
    model = OLLAMA_MODELS.LLAMA3_8B;
    reason = 'Academic task requires highest quality model';
    if (!criteria.hasRAGContext) {
      warnings.push('Academic tasks should use RAG context for best results');
    }
  } else if (criteria.requiresDeepReasoning) {
    model = criteria.hasRAGContext ? OLLAMA_MODELS.LLAMA3_8B : OLLAMA_MODELS.PHI3_MINI;
    reason = 'Deep reasoning task';
  } else if (criteria.requiresStructuredOutput) {
    model = OLLAMA_MODELS.PHI3_MINI;
    reason = 'Structured output requires Phi-3 Mini';
  } else if (criteria.performancePriority) {
    model = selectModelByPriority(criteria.performancePriority);
    reason = `Performance priority: ${criteria.performancePriority}`;
  } else if (criteria.taskComplexity) {
    model = selectModelByComplexity(criteria.taskComplexity);
    reason = `Task complexity: ${criteria.taskComplexity}`;
  } else if (criteria.inputTokens) {
    model = selectModelByTokenCount(criteria.inputTokens);
    reason = `Based on input token count: ${criteria.inputTokens}`;
  } else {
    model = OLLAMA_MODELS.PHI3_MINI;
  }

  // Add warnings for resource-intensive models
  const characteristics = MODEL_CHARACTERISTICS[model];
  if (model === OLLAMA_MODELS.LLAMA3_8B) {
    warnings.push('Llama 3 8B uses significant RAM (~4.7GB). Run one request at a time.');
    warnings.push('Consider using request queuing for multiple Llama 3 8B requests.');
  }

  if (criteria.inputTokens && criteria.inputTokens > 2000) {
    warnings.push('Large input detected. Monitor memory usage carefully.');
  }

  return {
    model,
    reason,
    characteristics,
    fallbackModel: getFallbackModel(model),
    warnings,
  };
}

/**
 * Export all model constants for convenience
 */
export { OLLAMA_MODELS, MODEL_BY_TASK };
