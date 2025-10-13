/**
 * AI Performance Optimization Hook
 *
 * يوفر تحسينات متقدمة لعمليات الذكاء الاصطناعي
 * مع deduplication وcaching وretry logic ذكي
 */

import { PerformanceMonitor } from '@/core/performance/performance-monitor';
import { useCallback, useEffect, useMemo, useRef } from 'react';

export interface AIPerformanceOptions {
    /** تمكين Cache الذكي */
    enableCache?: boolean;
    /** مدة Cache بالميللي ثانية */
    cacheTtl?: number;
    /** تمكين Deduplication */
    enableDeduplication?: boolean;
    /** حد أقصى لحجم Cache */
    maxCacheSize?: number;
    /** عدد المحاولات */
    maxRetries?: number;
    /** تأخير المحاولة بالميللي ثانية */
    retryDelay?: number;
    /** مهلة زمنية للمطلب */
    timeout?: number;
    /** تمكين تتبع الأداء */
    enablePerformanceTracking?: boolean;
    /** مفتاح Cache */
    cacheKey?: string;
}

export interface AIOperationResult<T = any> {
    /** البيانات المسترجعة */
    data: T;
    /** معلومات الأداء */
    performance: {
        startTime: number;
        endTime: number;
        duration: number;
        cacheHit: boolean;
        retryCount: number;
        source: 'cache' | 'fresh' | 'retry';
    };
    /** حالة العملية */
    status: 'success' | 'error' | 'timeout';
}

export interface AIPerformanceHookReturn<T = any> {
    /** تنفيذ العملية */
    execute: (operation: () => Promise<T>, options?: AIPerformanceOptions) => Promise<AIOperationResult<T>>;
    /** Cache Management */
    cache: {
        clear: () => void;
        stats: {
            size: number;
            hits: number;
            misses: number;
            hitRate: number;
            memoryUsage: number;
        };
    };
    /** إحصائيات العمليات */
    stats: {
        totalOperations: number;
        successfulOperations: number;
        failedOperations: number;
        averageExecutionTime: number;
        totalCacheHits: number;
        performanceScore: number;
    };
    /** عمليات متعددة */
    batchExecute: (operations: Array<() => Promise<T>>, options?: AIPerformanceOptions) => Promise<AIOperationResult<T>[]>;
    /** عملية خلفية */
    backgroundExecute: (operation: () => Promise<T>, options?: AIPerformanceOptions) => Promise<void>;
}

/**
 * Cache Entry للمراقبة والتنظيف
 */
interface CacheEntry<T> {
    data: T;
    timestamp: number;
    accessCount: number;
    size: number;
}

/**
 * AI Performance Hook متقدم
 */
export function useAIPerformance(): AIPerformanceHookReturn {
    const cacheRef = useRef<Map<string, CacheEntry<any>>>(new Map());
    const statsRef = useRef({
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        totalExecutionTime: 0,
        totalCacheHits: 0,
        cacheHits: 0
    });

    // حساب مفتاح Cache ذكي
    const generateCacheKey = useCallback((
        operation: () => Promise<any>,
        options?: AIPerformanceOptions
    ): string => {
        const key = options?.cacheKey || operation.toString().slice(0, 100);
        return `ai_perf_${btoa(key)}`;
    }, []);

    // حساب حجم البيانات في الذاكرة
    const calculateDataSize = useCallback((data: any): number => {
        try {
            return new Blob([JSON.stringify(data)]).size;
        } catch {
            return 1000; // تقدير افتراضي
        }
    }, []);

    // تنظيف Cache الذكي
    const cleanupCache = useCallback((maxSize: number, ttl: number) => {
        const cache = cacheRef.current;
        const now = Date.now();

        // إزالة العناصر المنتهية الصلاحية
        for (const [key, entry] of cache) {
            if (now - entry.timestamp > ttl) {
                cache.delete(key);
            }
        }

        // إزالة العناصر الأكبر حجماً إذا تجاوز الحد
        if (cache.size > maxSize) {
            const entries = Array.from(cache.entries());
            entries
                .sort((a, b) => b[1].accessCount - a[1].accessCount) // ترتيب حسب الاستخدام
                .slice(maxSize)
                .forEach(([key]) => cache.delete(key));
        }
    }, []);

    // تنفيذ العملية الأساسية
    const execute = useCallback(async <T>(
        operation: () => Promise<T>,
        options: AIPerformanceOptions = {}
    ): Promise<AIOperationResult<T>> => {
        const {
            enableCache = true,
            cacheTtl = 300000, // 5 دقائق
            enableDeduplication = true,
            maxCacheSize = 50,
            maxRetries = 3,
            retryDelay = 1000,
            timeout = 30000,
            enablePerformanceTracking = true
        } = options;

        const cacheKey = generateCacheKey(operation, options);
        const startTime = Date.now();
        let retryCount = 0;
        let cacheHit = false;
        let source: 'cache' | 'fresh' | 'retry' = 'fresh';

        statsRef.current.totalOperations++;

        // إنشاء Performance Session
        const perfSessionId = enablePerformanceTracking
            ? PerformanceMonitor.startSession('ai-operation')
            : null;

        try {
            // التحقق من Cache أولاً
            if (enableCache) {
                const cached = cacheRef.current.get(cacheKey);
                if (cached && (Date.now() - cached.timestamp) < cacheTtl) {
                    cached.accessCount++;
                    cacheHit = true;
                    source = 'cache';
                    statsRef.current.cacheHits++;

                    return {
                        data: cached.data,
                        performance: {
                            startTime,
                            endTime: Date.now(),
                            duration: Date.now() - startTime,
                            cacheHit,
                            retryCount,
                            source
                        },
                        status: 'success'
                    };
                }
            }

            // تنفيذ العملية مع Retry Logic
            let lastError: Error | null = null;
            for (let attempt = 0; attempt <= maxRetries; attempt++) {
                if (attempt > 0) {
                    retryCount = attempt;
                    source = 'retry';

                    // تأخير تصاعدي
                    await new Promise(resolve =>
                        setTimeout(resolve, retryDelay * Math.pow(2, attempt - 1))
                    );
                }

                try {
                    // تنفيذ العملية مع timeout
                    const data = await Promise.race([
                        operation(),
                        new Promise<never>((_, reject) =>
                            setTimeout(() => reject(new Error('Operation timeout')), timeout)
                        )
                    ]);

                    const endTime = Date.now();
                    const duration = endTime - startTime;

                    // حفظ في Cache
                    if (enableCache && data) {
                        cleanupCache(maxCacheSize, cacheTtl);
                        cacheRef.current.set(cacheKey, {
                            data,
                            timestamp: Date.now(),
                            accessCount: 1,
                            size: calculateDataSize(data)
                        });
                    }

                    statsRef.current.successfulOperations++;
                    statsRef.current.totalExecutionTime += duration;

                    if (perfSessionId) {
                        PerformanceMonitor.endSession(perfSessionId, { duration, retryCount });
                    }

                    return {
                        data,
                        performance: {
                            startTime,
                            endTime,
                            duration,
                            cacheHit,
                            retryCount,
                            source
                        },
                        status: 'success'
                    };

                } catch (error) {
                    lastError = error as Error;

                    // لا نعيد المحاولة للأخطاء المؤقتة إذا كانت آخر محاولة
                    if (attempt === maxRetries) {
                        break;
                    }
                }
            }

            // فشلت العملية
            statsRef.current.failedOperations++;

            if (perfSessionId) {
                PerformanceMonitor.recordError(perfSessionId, lastError?.message || 'Unknown error');
            }

            throw lastError || new Error('Operation failed after all retries');

        } catch (error) {
            const endTime = Date.now();
            const duration = endTime - startTime;

            statsRef.current.failedOperations++;

            return {
                data: null as any,
                performance: {
                    startTime,
                    endTime,
                    duration,
                    cacheHit,
                    retryCount,
                    source
                },
                status: 'error'
            };
        }
    }, [generateCacheKey, cleanupCache, calculateDataSize]);

    // تنفيذ مجمع للعمليات المتعددة
    const batchExecute = useCallback(async <T>(
        operations: Array<() => Promise<T>>,
        options: AIPerformanceOptions = {}
    ): Promise<AIOperationResult<T>[]> => {
        const batchStartTime = Date.now();

        // تنفيذ متوازي مع حد أقصى
        const batches = [];
        const batchSize = 5; // حد أقصى 5 عمليات متوازية

        for (let i = 0; i < operations.length; i += batchSize) {
            const batch = operations.slice(i, i + batchSize);
            const batchPromises = batch.map(operation => execute(operation, options));
            batches.push(batchPromises);
        }

        const results = [];
        for (const batch of batches) {
            const batchResults = await Promise.all(batch);
            results.push(...batchResults);
        }

        const totalTime = Date.now() - batchStartTime;
        console.log(`🚀 Batch execution completed: ${operations.length} operations in ${totalTime}ms`);

        return results;
    }, [execute]);

    // تنفيذ في الخلفية
    const backgroundExecute = useCallback(async <T>(
        operation: () => Promise<T>,
        options: AIPerformanceOptions = {}
    ): Promise<void> => {
        // لا ننتظر النتيجة
        execute(operation, { ...options, enablePerformanceTracking: false })
            .then(result => {
                if (result.status === 'success') {
                    console.log('🔄 Background operation completed successfully');
                } else {
                    console.warn('⚠️ Background operation failed:', result);
                }
            })
            .catch(error => {
                console.error('❌ Background operation error:', error);
            });
    }, [execute]);

    // تنظيف Cache يدوي
    const clearCache = useCallback(() => {
        cacheRef.current.clear();
        statsRef.current.cacheHits = 0;
        console.log('🗑️ AI Performance cache cleared');
    }, []);

    // إحصائيات Cache
    const cacheStats = useMemo(() => {
        const cache = cacheRef.current;
        const totalMemory = Array.from(cache.values())
            .reduce((sum, entry) => sum + entry.size, 0);

        return {
            size: cache.size,
            hits: statsRef.current.cacheHits,
            misses: statsRef.current.totalOperations - statsRef.current.cacheHits,
            hitRate: statsRef.current.totalOperations > 0
                ? (statsRef.current.cacheHits / statsRef.current.totalOperations) * 100
                : 0,
            memoryUsage: totalMemory
        };
    }, []);

    // إحصائيات عامة
    const stats = useMemo(() => {
        const total = statsRef.current.totalOperations;
        const failed = statsRef.current.failedOperations;
        const success = statsRef.current.successfulOperations;

        return {
            totalOperations: total,
            successfulOperations: success,
            failedOperations: failed,
            averageExecutionTime: total > 0
                ? statsRef.current.totalExecutionTime / total
                : 0,
            totalCacheHits: statsRef.current.cacheHits,
            performanceScore: total > 0
                ? Math.round(((success / total) * (statsRef.current.cacheHits / total)) * 100)
                : 0
        };
    }, []);

    // تنظيف دوري للذاكرة
    useEffect(() => {
        const cleanupInterval = setInterval(() => {
            cleanupCache(50, 300000); // تنظيف كل 30 ثانية
        }, 30000);

        return () => clearInterval(cleanupInterval);
    }, [cleanupCache]);

    return {
        execute,
        cache: {
            clear: clearCache,
            stats: cacheStats
        },
        stats,
        batchExecute,
        backgroundExecute
    };
}

export default useAIPerformance;
