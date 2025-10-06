/**
 * نظام الأداء والتحسين الشامل
 * يوفر جميع hooks الأداء والتحسين في مكان واحد
 */

// إدارة الذاكرة
export {
    useAdvancedMemoryManager, useMemoryManager,
    useQuickMemoryManager, type CachedItem,
    type MemoryManager, type MemoryManagerConfig,
    type MemoryUsageStats
} from './use-memory-manager';

// التخزين المؤقت الذكي
export {
    useAdvancedCache, useQuickCache, useSmartCache, type CacheConfig,
    type CacheItem,
    type CacheStats, type CacheStrategy, type SmartCache
} from './use-smart-cache';

// مراقبة الأداء
export {
    useAdvancedPerformanceMonitor, useBasicPerformanceMonitor, usePerformanceMonitor, type PerformanceAlert, type PerformanceMetric, type PerformanceMonitor, type PerformanceMonitorConfig, type PerformanceReport, type PerformanceThreshold
} from './use-performance-monitor';

// تحسين الموارد
export {
    useAdvancedResourceOptimizer, useBasicResourceOptimizer, useResourceOptimizer, type OptimizationAction, type ResourceOptimizationConfig, type ResourceOptimizer, type ResourceUsage
} from './use-resource-optimizer';

/**
 * Hook شامل يجمع جميع أنظمة الأداء
 */
export function useComprehensivePerformanceSystem(config?: {
    memory?: any;
    cache?: any;
    monitoring?: any;
    optimization?: any;
}) {
    // استيراد الـ hooks
    const { useMemoryManager } = require('./use-memory-manager');
    const { useSmartCache } = require('./use-smart-cache');
    const { usePerformanceMonitor } = require('./use-performance-monitor');
    const { useResourceOptimizer } = require('./use-resource-optimizer');

    const memoryManager = useMemoryManager(config?.memory);
    const smartCache = useSmartCache(config?.cache);
    const performanceMonitor = usePerformanceMonitor(config?.monitoring);
    const resourceOptimizer = useResourceOptimizer(config?.optimization);

    return {
        memoryManager,
        smartCache,
        performanceMonitor,
        resourceOptimizer,

        // وظائف مشتركة
        getOverallPerformanceScore: () => {
            const memoryScore = memoryManager.getMemoryStats().usedMemory < 50 ? 100 : 50;
            const cacheScore = smartCache.getStats().hitRate;
            const performanceScore = performanceMonitor.getPerformanceScore();
            const optimizationScore = resourceOptimizer.getOptimizationScore();

            return (memoryScore + cacheScore + performanceScore + optimizationScore) / 4;
        },

        optimizeAll: async () => {
            await memoryManager.optimize();
            await smartCache.optimize();
            await resourceOptimizer.optimize();
        },

        getComprehensiveReport: () => {
            return {
                memory: memoryManager.getMemoryStats(),
                cache: smartCache.getStats(),
                performance: performanceMonitor.generateReport(),
                optimization: resourceOptimizer.getOptimizationStats(),
                overallScore: 0 // سيتم حسابها
            };
        }
    };
}
