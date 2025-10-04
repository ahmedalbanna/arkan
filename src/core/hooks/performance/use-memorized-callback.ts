/**
 * Hook محسن للـ Callbacks مع Memory Management
 *
 * يوفر دعوتين محسنين مع إدارة ذكية للذاكرة وتقليل re-renders
 */

import { useCallback, useMemo, useRef } from 'react';

export interface MemorizedCallbackOptions {
    /** تمكين WeakMap للدعم القوي للذاكرة */
    useWeakMode?: boolean;
    /** الحد الأقصى لحجم Cache */
    maxCacheSize?: number;
    /** مدة انتهاء صلاحية Cache (ميللي ثانية) */
    cacheTtl?: number;
    /** تمكين تسجيل الأداء */
    enablePerfLogging?: boolean;
}

export interface MemorizedCallbackReturn<T extends (...args: any[]) => any> {
    callback: T;
    /** تنظيف Cache يدوياً */
    clearCache: () => void;
    /** إحصائيات Cache */
    cacheStats: {
        size: number;
        hits: number;
        misses: number;
        hitRate: number;
    };
    /** تنظيف الذاكرة التلقائية */
    cleanup: () => void;
}

/**
 * Hook محسن للـ Callback مع ذاكرة قوية
 */
export function useMemorizedCallback<T extends (...args: any[]) => any>(
    fn: T,
    deps: React.DependencyList,
    options: MemorizedCallbackOptions = {}
): MemorizedCallbackReturn<T> {
    const {
        useWeakMode = true,
        maxCacheSize = 10,
        cacheTtl = 60000, // 1 دقيقة
        enablePerfLogging = false
    } = options;

    const cacheRef = useRef(
        useWeakMode
            ? new WeakMap<any, { result: any; timestamp: number }>()
            : new Map<any, { result: any; timestamp: number }>()
    );

    const statsRef = useRef({
        hits: 0,
        misses: 0,
        lastCleanup: Date.now()
    });

    const memFn = useMemo(() => fn, deps);

    const cleanup = useCallback(() => {
        const now = Date.now();
        const cache = cacheRef.current;
        const stats = statsRef.current;

        if (!useWeakMode && cache instanceof Map) {
            // تنظيف العناصر المنتهية الصلاحية
            for (const [key, value] of cache.entries()) {
                if (now - value.timestamp > cacheTtl) {
                    cache.delete(key);
                }
            }

            // تنظيف إذا تجاوز الحد الأقصى
            if (cache.size > maxCacheSize) {
                const entries = Array.from(cache.entries());
                entries
                    .sort((a, b) => a[1].timestamp - b[1].timestamp)
                    .slice(0, cache.size - maxCacheSize)
                    .forEach(([key]) => cache.delete(key));
            }
        }

        stats.lastCleanup = now;
    }, [maxCacheSize, cacheTtl, useWeakMode]);

    const callback = useCallback((...args: Parameters<T>): ReturnType<T> => {
        const startTime = enablePerfLogging ? performance.now() : 0;
        const cache = cacheRef.current;
        const stats = statsRef.current;

        // تنظيف دوري
        if (Date.now() - stats.lastCleanup > cacheTtl) {
            cleanup();
        }

        const cacheKey = useWeakMode ? args[0] : JSON.stringify(args);

        if (cache.has(cacheKey)) {
            stats.hits++;
            if (enablePerfLogging) {
                console.log(`🎯 Cache hit: ${performance.now() - startTime}ms`);
            }
            return cache.get(cacheKey)!.result;
        }

        stats.misses++;
        const result = memFn(...args);

        // حفظ في Cache فقط إذا لم تتجاوز المساحة
        if (useWeakMode || !(cache instanceof Map) || cache.size < maxCacheSize) {
            cache.set(cacheKey, { result, timestamp: Date.now() });
        }

        if (enablePerfLogging) {
            console.log(`⏱️ Callback execution: ${performance.now() - startTime}ms`);
        }

        return result;
    }, [memFn, cleanup, maxCacheSize, cacheTtl, useWeakMode, enablePerfLogging]);

    const clearCache = useCallback(() => {
        cacheRef.current.clear();
        statsRef.current = { hits: 0, misses: 0, lastCleanup: Date.now() };
    }, []);

    const cacheStats = useMemo(() => {
        const stats = statsRef.current;
        const cacheSize = useWeakMode ?
            'Indeterminate (WeakMap)' :
            (cacheRef.current as Map<any, any>).size;

        return {
            size: cacheSize,
            hits: stats.hits,
            misses: stats.misses,
            hitRate: stats.hits + stats.misses > 0
                ? stats.hits / (stats.hits + stats.misses)
                : 0
        };
    }, [useWeakMode]);

    return {
        callback,
        clearCache,
        cacheStats,
        cleanup
    };
}

/**
 * نسخة محسنة من useCallback مع ذاكرة افتراضية أسرع
 */
export function useFastMemo<T extends (...args: any[]) => any>(
    fn: T,
    deps: React.DependencyList
): T {
    return useCallback(fn, deps);
}
