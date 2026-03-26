/**
 * src/ai barrel
 *
 * Provides a single entrypoint for common ai exports. This file does NOT re-implement
 * business logic - it re-exports modules in-place to provide a consistent import surface.
 */

export * as schemas from '../../domain/schemas';
export * from './Genkit';
export * from './legacy-index';
export { getModelForFlow, FLOW_MODEL_MAPPING, FLOWS_BY_CATEGORY } from './model-mapping';
export {
  TaskComplexity,
  PerformancePriority,
  selectModel,
  selectModelByComplexity,
  selectModelByPriority,
  selectModelByTokenCount,
  selectModelWithMetadata,
  getModelCharacteristics,
  compareModels,
  canHandleConcurrentRequest,
  getMaxConcurrentRequests,
  getModelsSortedBy,
  isModelSuitableForTask,
  getFallbackModel,
} from './model-selector';
export * from './model-performance-monitor';
export * from './model-request-queue';
export * from './model-health-check';
export * from './Genkit';
