/**
 * Performance Hooks Index
 *
 * تصدير جميع hooks الأداء المتقدمة
 */

// React Performance Hooks
export { useFastMemo, useMemorizedCallback } from './use-memorized-callback';
export { usePerformanceBatching } from './use-performance-batching';
export { useVirtualScroller } from './use-virtual-scroller';

// AI Performance Hooks
export { useAIPerformance } from './use-ai-performance';

// Memory Management Hooks
export { useMemoryManager } from './use-memory-manager';

// Real-time Performance Hooks
export { useRealTimePerformance } from './use-real-time-performance';

// Types
export type { AIOperationResult, AIPerformanceHookReturn, AIPerformanceOptions } from './use-ai-performance';
export type { MemorizedCallbackOptions, MemorizedCallbackReturn } from './use-memorized-callback';
export type { CacheEntry, MemoryInfo, MemoryManagerOptions, MemoryManagerReturn } from './use-memory-manager';
export type { BatcherReturn, BatchOperation, BatchOptions } from './use-performance-batching';
export type { OptimizationAction, PerformanceMetrics, RealTimePerformanceOptions, RealTimePerformanceReturn } from './use-real-time-performance';
export type { VirtualScrollerOptions, VirtualScrollerReturn } from './use-virtual-scroller';

