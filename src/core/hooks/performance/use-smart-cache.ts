/**
 * نظام التخزين المؤقت الذكي للاستجابات والبيانات
 * يوفر تخزين مؤقت ذكي مع تحليل الاستخدام وتحسين الأداء
 */

import { useCallback, useRef, useState } from 'react';
import { useMemoryManager } from './use-memory-manager';

export interface CacheStrategy {
    type: 'lru' | 'lfu' | 'ttl' | 'adaptive';
    maxSize?: number;
    ttl?: number; // وقت انتهاء الصلاحية بالميلي ثانية
    priority?: 'high' | 'medium' | 'low';
}

export interface CacheConfig {
    defaultStrategy: CacheStrategy;
    strategies?: Record<string, CacheStrategy>;
    enablePredictiveCaching?: boolean;
    enableCompression?: boolean;
    enablePersistence?: boolean;
    maxTotalSize?: number; // الحد الأقصى لإجمالي حجم التخزين المؤقت
}

export interface CacheItem<T = any> {
    key: string;
    data: T;
    timestamp: number;
    lastAccessed: number;
    accessCount: number;
    size: number;
    strategy: CacheStrategy;
    compressed?: boolean;
    metadata?: {
        source: string;
        operation: string;
        userId?: string;
        tags?: string[];
    };
}

export interface CacheStats {
    totalItems: number;
    totalSize: number;
    hitRate: number;
    missRate: number;
    evictionCount: number;
    compressionRatio: number;
    averageAccessTime: number;
}

export interface SmartCache {
    // العمليات الأساسية
    set: <T>(key: string, data: T, strategy?: Partial<CacheStrategy>) => Promise<void>;
    get: <T>(key: string) => Promise<T | null>;
    has: (key: string) => Promise<boolean>;
    delete: (key: string) => Promise<void>;
    clear: () => Promise<void>;

    // العمليات المتقدمة
    setWithMetadata: <T>(
        key: string,
        data: T,
        metadata: CacheItem<T>['metadata'],
        strategy?: Partial<CacheStrategy>
    ) => Promise<void>;

    getWithMetadata: <T>(key: string) => Promise<{ data: T; metadata: CacheItem<T>['metadata'] } | null>;

    // إدارة الاستراتيجيات
    updateStrategy: (key: string, strategy: Partial<CacheStrategy>) => Promise<void>;
    getStrategy: (key: string) => Promise<CacheStrategy | null>;

    // البحث والتصفية
    findByTag: (tag: string) => Promise<string[]>;
    findBySource: (source: string) => Promise<string[]>;
    findByUser: (userId: string) => Promise<string[]>;

    // الإحصائيات والمراقبة
    getStats: () => CacheStats;
    getItemStats: (key: string) => Promise<{
        accessCount: number;
        lastAccessed: Date;
        size: number;
        age: number;
        hitRate: number;
    } | null>;

    // التحسين والتنظيف
    optimize: () => Promise<void>;
    cleanup: () => Promise<void>;
    preload: (keys: string[]) => Promise<void>;

    // التخزين المؤقت التنبؤي
    predictNextAccess: (key: string) => Promise<number>; // احتمالية الوصول التالي
    getRecommendations: () => Promise<{
        itemsToEvict: string[];
        itemsToPreload: string[];
        optimizationSuggestions: string[];
    }>;
}

/**
 * Hook للتخزين المؤقت الذكي
 */
export function useSmartCache(config: CacheConfig = {
    defaultStrategy: { type: 'lru', maxSize: 100, ttl: 300000 },
    strategies: {}
}): SmartCache {
    const {
        defaultStrategy = { type: 'lru', maxSize: 100, ttl: 300000 },
        strategies = {},
        enablePredictiveCaching = true,
        enableCompression = true,
        enablePersistence = true,
        maxTotalSize = 100 * 1024 * 1024 // 100 MB افتراضياً
    } = config;

    const memoryManager = useMemoryManager({
        maxMemoryUsage: maxTotalSize / (1024 * 1024),
        enableCompression,
        enablePersistence
    });

    const cacheRef = useRef<Map<string, CacheItem>>(new Map());
    const accessPatternsRef = useRef<Map<string, number[]>>(new Map());
    const [stats, setStats] = useState<CacheStats>({
        totalItems: 0,
        totalSize: 0,
        hitRate: 0,
        missRate: 0,
        evictionCount: 0,
        compressionRatio: 0,
        averageAccessTime: 0
    });

    // تحديث الإحصائيات
    const updateStats = useCallback(() => {
        const items = Array.from(cacheRef.current.values());
        const totalSize = items.reduce((sum, item) => sum + item.size, 0);
        const totalAccesses = items.reduce((sum, item) => sum + item.accessCount, 0);
        const totalHits = items.reduce((sum, item) => sum + Math.max(0, item.accessCount - 1), 0);

        setStats({
            totalItems: items.length,
            totalSize,
            hitRate: totalAccesses > 0 ? (totalHits / totalAccesses) * 100 : 0,
            missRate: totalAccesses > 0 ? ((totalAccesses - totalHits) / totalAccesses) * 100 : 0,
            evictionCount: stats.evictionCount,
            compressionRatio: enableCompression ? 0.7 : 1.0, // تقدير
            averageAccessTime: 0 // سيتم حسابها لاحقاً
        });
    }, [enableCompression, stats.evictionCount]);

    // حساب حجم البيانات
    const calculateSize = useCallback((data: any): number => {
        try {
            const jsonString = JSON.stringify(data);
            return new Blob([jsonString]).size;
        } catch (error) {
            return 0;
        }
    }, []);

    // ضغط البيانات
    const compressData = useCallback((data: any): any => {
        if (!enableCompression) return data;

        try {
            const jsonString = JSON.stringify(data);
            if (jsonString.length > 1000) {
                return btoa(jsonString);
            }
            return data;
        } catch (error) {
            return data;
        }
    }, [enableCompression]);

    // إلغاء ضغط البيانات
    const decompressData = useCallback((data: any): any => {
        if (!enableCompression) return data;

        try {
            if (typeof data === 'string' && data.startsWith('data:')) {
                return JSON.parse(atob(data));
            }
            return data;
        } catch (error) {
            return data;
        }
    }, [enableCompression]);

    // تطبيق استراتيجية التخزين المؤقت
    const applyStrategy = useCallback((key: string, strategy: CacheStrategy) => {
        const item = cacheRef.current.get(key);
        if (!item) return;

        const now = Date.now();

        // تطبيق TTL
        if (strategy.ttl && now - item.timestamp > strategy.ttl) {
            cacheRef.current.delete(key);
            return;
        }

        // تطبيق LRU
        if (strategy.type === 'lru') {
            const items = Array.from(cacheRef.current.entries());
            items.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

            if (strategy.maxSize && items.length > strategy.maxSize) {
                const toRemove = items.slice(0, items.length - strategy.maxSize);
                toRemove.forEach(([k]) => cacheRef.current.delete(k));
                stats.evictionCount += toRemove.length;
            }
        }

        // تطبيق LFU
        if (strategy.type === 'lfu') {
            const items = Array.from(cacheRef.current.entries());
            items.sort((a, b) => a[1].accessCount - b[1].accessCount);

            if (strategy.maxSize && items.length > strategy.maxSize) {
                const toRemove = items.slice(0, items.length - strategy.maxSize);
                toRemove.forEach(([k]) => cacheRef.current.delete(k));
                stats.evictionCount += toRemove.length;
            }
        }
    }, [stats.evictionCount]);

    // إضافة عنصر للتخزين المؤقت
    const set = useCallback(async <T>(
        key: string,
        data: T,
        strategyOverride?: Partial<CacheStrategy>
    ) => {
        const strategy = { ...defaultStrategy, ...strategies[key], ...strategyOverride };
        const size = calculateSize(data);
        const compressed = enableCompression && size > 1024;
        const processedData = compressed ? compressData(data) : data;

        const cacheItem: CacheItem<T> = {
            key,
            data: processedData,
            timestamp: Date.now(),
            lastAccessed: Date.now(),
            accessCount: 0,
            size,
            strategy,
            compressed
        };

        cacheRef.current.set(key, cacheItem);

        // حفظ في الذاكرة المؤقتة
        await memoryManager.setCache(key, cacheItem);

        // تطبيق الاستراتيجية
        applyStrategy(key, strategy);

        updateStats();
    }, [defaultStrategy, strategies, enableCompression, calculateSize, compressData, memoryManager, applyStrategy, updateStats]);

    // الحصول على عنصر من التخزين المؤقت
    const get = useCallback(async <T>(key: string): Promise<T | null> => {
        const startTime = Date.now();

        let cacheItem = cacheRef.current.get(key);

        // محاولة التحميل من الذاكرة المؤقتة
        if (!cacheItem) {
            const cachedItem = await memoryManager.getCache(key);
            if (cachedItem) {
                cacheItem = cachedItem as CacheItem<T>;
                cacheRef.current.set(key, cacheItem);
            }
        }

        if (!cacheItem) {
            updateStats();
            return null;
        }

        // تحديث إحصائيات الوصول
        cacheItem.accessCount++;
        cacheItem.lastAccessed = Date.now();

        // تسجيل نمط الوصول للتنبؤ
        if (enablePredictiveCaching) {
            const patterns = accessPatternsRef.current.get(key) || [];
            patterns.push(Date.now());
            if (patterns.length > 10) patterns.shift(); // الاحتفاظ بآخر 10 وصولات
            accessPatternsRef.current.set(key, patterns);
        }

        // إلغاء الضغط إذا لزم الأمر
        let data = cacheItem.data;
        if (cacheItem.compressed) {
            data = decompressData(cacheItem.data);
        }

        const accessTime = Date.now() - startTime;
        updateStats();

        return data as T;
    }, [memoryManager, enablePredictiveCaching, decompressData, updateStats]);

    // التحقق من وجود عنصر
    const has = useCallback(async (key: string): Promise<boolean> => {
        return cacheRef.current.has(key) || (await memoryManager.getCache(key)) !== null;
    }, [memoryManager]);

    // حذف عنصر
    const deleteItem = useCallback(async (key: string) => {
        cacheRef.current.delete(key);
        await memoryManager.removeCache(key);
        accessPatternsRef.current.delete(key);
        updateStats();
    }, [memoryManager, updateStats]);

    // مسح جميع العناصر
    const clear = useCallback(async () => {
        cacheRef.current.clear();
        await memoryManager.clearCache();
        accessPatternsRef.current.clear();
        updateStats();
    }, [memoryManager, updateStats]);

    // إضافة عنصر مع بيانات وصفية
    const setWithMetadata = useCallback(async <T>(
        key: string,
        data: T,
        metadata: CacheItem<T>['metadata'],
        strategyOverride?: Partial<CacheStrategy>
    ) => {
        const strategy = { ...defaultStrategy, ...strategies[key], ...strategyOverride };
        const size = calculateSize(data);
        const compressed = enableCompression && size > 1024;
        const processedData = compressed ? compressData(data) : data;

        const cacheItem: CacheItem<T> = {
            key,
            data: processedData,
            timestamp: Date.now(),
            lastAccessed: Date.now(),
            accessCount: 0,
            size,
            strategy,
            compressed,
            metadata
        };

        cacheRef.current.set(key, cacheItem);
        await memoryManager.setCache(key, cacheItem);
        applyStrategy(key, strategy);
        updateStats();
    }, [defaultStrategy, strategies, enableCompression, calculateSize, compressData, memoryManager, applyStrategy, updateStats]);

    // الحصول على عنصر مع بيانات وصفية
    const getWithMetadata = useCallback(async <T>(key: string) => {
        const data = await get<T>(key);
        if (!data) return null;

        const cacheItem = cacheRef.current.get(key);
        return {
            data,
            metadata: cacheItem?.metadata
        };
    }, [get]);

    // البحث بالعلامات
    const findByTag = useCallback(async (tag: string): Promise<string[]> => {
        const results: string[] = [];
        for (const [key, item] of cacheRef.current.entries()) {
            if (item.metadata?.tags?.includes(tag)) {
                results.push(key);
            }
        }
        return results;
    }, []);

    // البحث بالمصدر
    const findBySource = useCallback(async (source: string): Promise<string[]> => {
        const results: string[] = [];
        for (const [key, item] of cacheRef.current.entries()) {
            if (item.metadata?.source === source) {
                results.push(key);
            }
        }
        return results;
    }, []);

    // البحث بالمستخدم
    const findByUser = useCallback(async (userId: string): Promise<string[]> => {
        const results: string[] = [];
        for (const [key, item] of cacheRef.current.entries()) {
            if (item.metadata?.userId === userId) {
                results.push(key);
            }
        }
        return results;
    }, []);

    // التنبؤ بالوصول التالي
    const predictNextAccess = useCallback(async (key: string): Promise<number> => {
        if (!enablePredictiveCaching) return 0;

        const patterns = accessPatternsRef.current.get(key);
        if (!patterns || patterns.length < 3) return 0;

        // حساب متوسط الفترة بين الوصولات
        const intervals = [];
        for (let i = 1; i < patterns.length; i++) {
            intervals.push(patterns[i] - patterns[i - 1]);
        }

        const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        const lastAccess = patterns[patterns.length - 1];
        const timeSinceLastAccess = Date.now() - lastAccess;

        // احتمالية الوصول بناءً على الوقت المنقضي
        return Math.max(0, 1 - (timeSinceLastAccess / averageInterval));
    }, [enablePredictiveCaching]);

    // الحصول على التوصيات
    const getRecommendations = useCallback(async () => {
        const items = Array.from(cacheRef.current.entries());
        const now = Date.now();

        // العناصر المرشحة للحذف
        const itemsToEvict = items
            .filter(([key, item]) => {
                const age = now - item.timestamp;
                const lastAccess = now - item.lastAccessed;
                return age > 600000 || lastAccess > 300000; // 10 دقائق أو 5 دقائق بدون وصول
            })
            .map(([key]) => key);

        // العناصر المرشحة للتحميل المسبق
        const itemsToPreload: string[] = [];
        for (const [key] of items) {
            const prediction = await predictNextAccess(key);
            if (prediction > 0.7) {
                itemsToPreload.push(key);
            }
        }

        // اقتراحات التحسين
        const optimizationSuggestions: string[] = [];

        if (stats.hitRate < 50) {
            optimizationSuggestions.push('Consider increasing cache size or TTL');
        }

        if (stats.totalSize > maxTotalSize * 0.8) {
            optimizationSuggestions.push('Cache size is near limit, consider cleanup');
        }

        if (stats.evictionCount > items.length * 0.1) {
            optimizationSuggestions.push('High eviction rate, consider adjusting strategy');
        }

        return {
            itemsToEvict,
            itemsToPreload,
            optimizationSuggestions
        };
    }, [stats, maxTotalSize, predictNextAccess]);

    // التحسين
    const optimize = useCallback(async () => {
        const recommendations = await getRecommendations();

        // حذف العناصر المرشحة
        for (const key of recommendations.itemsToEvict) {
            await deleteItem(key);
        }

        // تحميل مسبق للعناصر المرشحة
        await preload(recommendations.itemsToPreload);

        await memoryManager.optimize();
        updateStats();
    }, [getRecommendations, deleteItem, memoryManager, updateStats]);

    // التحميل المسبق
    const preload = useCallback(async (keys: string[]) => {
        for (const key of keys) {
            await get(key);
        }
    }, [get]);

    // التنظيف
    const cleanup = useCallback(async () => {
        await memoryManager.cleanup();
        updateStats();
    }, [memoryManager, updateStats]);

    return {
        set,
        get,
        has,
        delete: deleteItem,
        clear,
        setWithMetadata,
        getWithMetadata,
        updateStrategy: async (key: string, strategy: Partial<CacheStrategy>) => {
            const item = cacheRef.current.get(key);
            if (item) {
                item.strategy = { ...item.strategy, ...strategy };
                applyStrategy(key, item.strategy);
            }
        },
        getStrategy: async (key: string) => {
            const item = cacheRef.current.get(key);
            return item?.strategy || null;
        },
        findByTag,
        findBySource,
        findByUser,
        getStats: () => stats,
        getItemStats: async (key: string) => {
            const item = cacheRef.current.get(key);
            if (!item) return null;

            return {
                accessCount: item.accessCount,
                lastAccessed: new Date(item.lastAccessed),
                size: item.size,
                age: Date.now() - item.timestamp,
                hitRate: item.accessCount > 0 ? (item.accessCount - 1) / item.accessCount : 0
            };
        },
        optimize,
        cleanup,
        preload,
        predictNextAccess,
        getRecommendations
    };
}

/**
 * Hook مبسط للتخزين المؤقت السريع
 */
export function useQuickCache() {
    return useSmartCache({
        defaultStrategy: { type: 'lru', maxSize: 50, ttl: 60000 },
        strategies: {},
        enablePredictiveCaching: false,
        enableCompression: false,
        enablePersistence: false,
        maxTotalSize: 10 * 1024 * 1024 // 10 MB
    });
}

/**
 * Hook متقدم للتخزين المؤقت مع جميع الميزات
 */
export function useAdvancedCache() {
    return useSmartCache({
        defaultStrategy: { type: 'adaptive', maxSize: 200, ttl: 600000 },
        strategies: {
            'ai-response': { type: 'lfu', maxSize: 100, ttl: 1800000, priority: 'high' },
            'user-data': { type: 'lru', maxSize: 50, ttl: 300000, priority: 'medium' },
            'temp-data': { type: 'ttl', ttl: 60000, priority: 'low' }
        },
        enablePredictiveCaching: true,
        enableCompression: true,
        enablePersistence: true,
        maxTotalSize: 200 * 1024 * 1024 // 200 MB
    });
}
