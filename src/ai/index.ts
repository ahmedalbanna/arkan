/**
 * src/ai barrel
 *
 * Provides a single entrypoint for common ai exports. This file does NOT re-implement
 * business logic - it re-exports modules in-place to provide a consistent import surface.
 */

export * as schemas from './schemas';
export * from './genkit';
export * from './dev';
export { getModelForFlow, FLOW_MODEL_MAPPING, FLOWS_BY_CATEGORY } from './models/model-mapping';
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
} from './models/model-selector';
export * from './models/model-performance-monitor';
export * from './models/model-request-queue';
export * from './models/model-health-check';
export * from './models/model-utils';
