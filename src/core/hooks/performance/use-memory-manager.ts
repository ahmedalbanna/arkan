/**
 * نظام إدارة الذاكرة الذكي للعمليات الطويلة
 * يوفر إدارة ذكية للذاكرة مع تحسين الأداء وتقليل استهلاك الموارد
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface MemoryManagerConfig {
    maxMemoryUsage?: number; // الحد الأقصى لاستخدام الذاكرة (بالميجابايت)
    cleanupInterval?: number; // فترة التنظيف (بالميلي ثانية)
    enableCompression?: boolean; // تفعيل ضغط البيانات
    enablePersistence?: boolean; // تفعيل الحفظ المؤقت
    maxCacheSize?: number; // الحد الأقصى لحجم التخزين المؤقت
}

export interface MemoryUsageStats {
    usedMemory: number; // الذاكرة المستخدمة (بالميجابايت)
    totalMemory: number; // إجمالي الذاكرة المتاحة (بالميجابايت)
    cacheSize: number; // حجم التخزين المؤقت (بالميجابايت)
    activeOperations: number; // عدد العمليات النشطة
    lastCleanup: Date; // آخر عملية تنظيف
}

export interface CachedItem<T = any> {
    key: string;
    data: T;
    timestamp: number;
    size: number;
    accessCount: number;
    lastAccessed: number;
    compressed?: boolean;
}

export interface MemoryManager {
    // إدارة الذاكرة
    getMemoryStats: () => MemoryUsageStats;
    cleanup: () => Promise<void>;
    optimize: () => Promise<void>;

    // إدارة التخزين المؤقت
    setCache: <T>(key: string, data: T, ttl?: number) => Promise<void>;
    getCache: <T>(key: string) => Promise<T | null>;
    removeCache: (key: string) => Promise<void>;
    clearCache: () => Promise<void>;

    // إدارة العمليات
    startOperation: (operationId: string) => void;
    endOperation: (operationId: string) => void;
    isOperationActive: (operationId: string) => boolean;

    // إدارة البيانات المؤقتة
    setTempData: <T>(key: string, data: T) => void;
    getTempData: <T>(key: string) => T | null;
    removeTempData: (key: string) => void;

    // مراقبة الأداء
    getPerformanceMetrics: () => {
        averageResponseTime: number;
        cacheHitRate: number;
        memoryEfficiency: number;
        operationSuccessRate: number;
    };
}

/**
 * Hook لإدارة الذاكرة الذكية
 */
export function useMemoryManager(config: MemoryManagerConfig = {}): MemoryManager {
    const {
        maxMemoryUsage = 100, // 100 MB افتراضياً
        cleanupInterval = 30000, // 30 ثانية
        enableCompression = true,
        enablePersistence = true,
        maxCacheSize = 50 // 50 MB
    } = config;

    // حالة الذاكرة
    const [memoryStats, setMemoryStats] = useState<MemoryUsageStats>({
        usedMemory: 0,
        totalMemory: 0,
        cacheSize: 0,
        activeOperations: 0,
        lastCleanup: new Date()
    });

    // مراجع للتخزين المؤقت والعمليات
    const cacheRef = useRef<Map<string, CachedItem>>(new Map());
    const tempDataRef = useRef<Map<string, any>>(new Map());
    const activeOperationsRef = useRef<Set<string>>(new Set());
    const performanceMetricsRef = useRef({
        responseTimes: [] as number[],
        cacheHits: 0,
        cacheMisses: 0,
        operationSuccesses: 0,
        operationFailures: 0
    });

    // مراقبة استخدام الذاكرة
    const updateMemoryStats = useCallback(() => {
        if (typeof window !== 'undefined' && 'memory' in performance) {
            const memory = (performance as any).memory;
            const cacheSize = Array.from(cacheRef.current.values())
                .reduce((total, item) => total + item.size, 0) / (1024 * 1024); // تحويل إلى MB

            setMemoryStats({
                usedMemory: memory.usedJSHeapSize / (1024 * 1024),
                totalMemory: memory.totalJSHeapSize / (1024 * 1024),
                cacheSize,
                activeOperations: activeOperationsRef.current.size,
                lastCleanup: new Date()
            });
        }
    }, []);

    // ضغط البيانات
    const compressData = useCallback((data: any): string => {
        if (!enableCompression) return JSON.stringify(data);

        try {
            // استخدام ضغط بسيط للبيانات الكبيرة
            const jsonString = JSON.stringify(data);
            if (jsonString.length > 1000) {
                // ضغط بسيط باستخدام تقنيات JavaScript
                return btoa(jsonString); // Base64 encoding
            }
            return jsonString;
        } catch (error) {
            console.warn('Failed to compress data:', error);
            return JSON.stringify(data);
        }
    }, [enableCompression]);

    // إلغاء ضغط البيانات
    const decompressData = useCallback((compressedData: string): any => {
        if (!enableCompression) return JSON.parse(compressedData);

        try {
            // محاولة إلغاء الضغط
            if (compressedData.startsWith('data:')) {
                return JSON.parse(atob(compressedData));
            }
            return JSON.parse(compressedData);
        } catch (error) {
            console.warn('Failed to decompress data:', error);
            return JSON.parse(compressedData);
        }
    }, [enableCompression]);

    // حساب حجم البيانات
    const calculateDataSize = useCallback((data: any): number => {
        try {
            const jsonString = JSON.stringify(data);
            return new Blob([jsonString]).size;
        } catch (error) {
            return 0;
        }
    }, []);

    // تنظيف التخزين المؤقت القديم
    const cleanupOldCache = useCallback(() => {
        const now = Date.now();
        const maxAge = 5 * 60 * 1000; // 5 دقائق
        const maxCacheSizeBytes = maxCacheSize * 1024 * 1024; // تحويل إلى بايت

        let currentCacheSize = 0;
        const entries = Array.from(cacheRef.current.entries());

        // ترتيب حسب آخر استخدام
        entries.sort((a, b) => b[1].lastAccessed - a[1].lastAccessed);

        // إزالة العناصر القديمة أو التي تتجاوز الحد الأقصى
        for (const [key, item] of entries) {
            if (now - item.timestamp > maxAge || currentCacheSize + item.size > maxCacheSizeBytes) {
                cacheRef.current.delete(key);
            } else {
                currentCacheSize += item.size;
            }
        }
    }, [maxCacheSize]);

    // تنظيف الذاكرة العامة
    const cleanup = useCallback(async () => {
        console.log('🧹 Starting memory cleanup...');

        // تنظيف التخزين المؤقت القديم
        cleanupOldCache();

        // تنظيف البيانات المؤقتة القديمة
        const now = Date.now();
        const maxTempAge = 2 * 60 * 1000; // 2 دقيقة
        for (const [key, data] of tempDataRef.current.entries()) {
            if (data.timestamp && now - data.timestamp > maxTempAge) {
                tempDataRef.current.delete(key);
            }
        }

        // إجبار garbage collection إذا كان متاحاً
        if (typeof window !== 'undefined' && 'gc' in window) {
            (window as any).gc();
        }

        updateMemoryStats();
        console.log('✅ Memory cleanup completed');
    }, [cleanupOldCache, updateMemoryStats]);

    // تحسين الذاكرة
    const optimize = useCallback(async () => {
        console.log('⚡ Starting memory optimization...');

        // تحسين التخزين المؤقت
        const cacheEntries = Array.from(cacheRef.current.entries());
        cacheEntries.sort((a, b) => b[1].accessCount - a[1].accessCount);

        // الاحتفاظ فقط بالعناصر الأكثر استخداماً
        const keepCount = Math.floor(cacheEntries.length * 0.7); // الاحتفاظ بـ 70%
        for (let i = keepCount; i < cacheEntries.length; i++) {
            cacheRef.current.delete(cacheEntries[i][0]);
        }

        // ضغط البيانات المتبقية
        if (enableCompression) {
            for (const [key, item] of cacheRef.current.entries()) {
                if (!item.compressed && item.size > 1024) { // ضغط البيانات الأكبر من 1KB
                    try {
                        const compressed = compressData(item.data);
                        cacheRef.current.set(key, {
                            ...item,
                            data: compressed,
                            compressed: true,
                            size: compressed.length
                        });
                    } catch (error) {
                        console.warn(`Failed to compress cache item ${key}:`, error);
                    }
                }
            }
        }

        updateMemoryStats();
        console.log('✅ Memory optimization completed');
    }, [enableCompression, compressData, updateMemoryStats]);

    // إدارة التخزين المؤقت
    const setCache = useCallback(async <T>(key: string, data: T, ttl: number = 300000) => {
        const size = calculateDataSize(data);
        const compressed = enableCompression && size > 1024;
        const processedData = compressed ? compressData(data) : data;

        const cacheItem: CachedItem<T> = {
            key,
            data: processedData as T,
            timestamp: Date.now(),
            size,
            accessCount: 0,
            lastAccessed: Date.now(),
            compressed
        };

        cacheRef.current.set(key, cacheItem);

        // حفظ في localStorage إذا كان مفعلاً
        if (enablePersistence && typeof window !== 'undefined') {
            try {
                localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
            } catch (error) {
                console.warn('Failed to persist cache item:', error);
            }
        }

        updateMemoryStats();
    }, [calculateDataSize, enableCompression, enablePersistence, compressData, updateMemoryStats]);

    const getCache = useCallback(async <T>(key: string): Promise<T | null> => {
        let cacheItem = cacheRef.current.get(key);

        // محاولة التحميل من localStorage إذا لم يكن في الذاكرة
        if (!cacheItem && enablePersistence && typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem(`cache_${key}`);
                if (stored) {
                    const parsedItem = JSON.parse(stored) as CachedItem<T>;
                    cacheItem = parsedItem;
                    cacheRef.current.set(key, parsedItem);
                }
            } catch (error) {
                console.warn('Failed to load cache from storage:', error);
            }
        }

        if (!cacheItem) {
            performanceMetricsRef.current.cacheMisses++;
            return null;
        }

        // تحديث إحصائيات الوصول
        cacheItem.accessCount++;
        cacheItem.lastAccessed = Date.now();
        performanceMetricsRef.current.cacheHits++;

        // إلغاء الضغط إذا لزم الأمر
        let data = cacheItem.data;
        if (cacheItem.compressed) {
            data = decompressData(cacheItem.data as string);
        }

        return data as T;
    }, [enablePersistence, decompressData]);

    const removeCache = useCallback(async (key: string) => {
        cacheRef.current.delete(key);

        if (enablePersistence && typeof window !== 'undefined') {
            localStorage.removeItem(`cache_${key}`);
        }

        updateMemoryStats();
    }, [enablePersistence, updateMemoryStats]);

    const clearCache = useCallback(async () => {
        cacheRef.current.clear();

        if (enablePersistence && typeof window !== 'undefined') {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('cache_')) {
                    localStorage.removeItem(key);
                }
            });
        }

        updateMemoryStats();
    }, [enablePersistence, updateMemoryStats]);

    // إدارة العمليات
    const startOperation = useCallback((operationId: string) => {
        activeOperationsRef.current.add(operationId);
        updateMemoryStats();
    }, [updateMemoryStats]);

    const endOperation = useCallback((operationId: string) => {
        activeOperationsRef.current.delete(operationId);
        updateMemoryStats();
    }, [updateMemoryStats]);

    const isOperationActive = useCallback((operationId: string) => {
        return activeOperationsRef.current.has(operationId);
    }, []);

    // إدارة البيانات المؤقتة
    const setTempData = useCallback(<T>(key: string, data: T) => {
        tempDataRef.current.set(key, {
            data,
            timestamp: Date.now()
        });
    }, []);

    const getTempData = useCallback(<T>(key: string): T | null => {
        const item = tempDataRef.current.get(key);
        return item ? item.data : null;
    }, []);

    const removeTempData = useCallback((key: string) => {
        tempDataRef.current.delete(key);
    }, []);

    // مراقبة الأداء
    const getPerformanceMetrics = useCallback(() => {
        const { responseTimes, cacheHits, cacheMisses, operationSuccesses, operationFailures } = performanceMetricsRef.current;

        const totalCacheRequests = cacheHits + cacheMisses;
        const totalOperations = operationSuccesses + operationFailures;

        return {
            averageResponseTime: responseTimes.length > 0
                ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
                : 0,
            cacheHitRate: totalCacheRequests > 0 ? (cacheHits / totalCacheRequests) * 100 : 0,
            memoryEfficiency: memoryStats.totalMemory > 0
                ? ((memoryStats.totalMemory - memoryStats.usedMemory) / memoryStats.totalMemory) * 100
                : 0,
            operationSuccessRate: totalOperations > 0 ? (operationSuccesses / totalOperations) * 100 : 0
        };
    }, [memoryStats]);

    // إعداد التنظيف التلقائي
    useEffect(() => {
        const interval = setInterval(() => {
            updateMemoryStats();

            // تنظيف تلقائي إذا تجاوز استخدام الذاكرة الحد الأقصى
            if (memoryStats.usedMemory > maxMemoryUsage) {
                cleanup();
            }
        }, cleanupInterval);

        return () => clearInterval(interval);
    }, [cleanupInterval, maxMemoryUsage, memoryStats.usedMemory, cleanup, updateMemoryStats]);

    // تنظيف عند إلغاء التحميل
    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    return {
        getMemoryStats: () => memoryStats,
        cleanup,
        optimize,
        setCache,
        getCache,
        removeCache,
        clearCache,
        startOperation,
        endOperation,
        isOperationActive,
        setTempData,
        getTempData,
        removeTempData,
        getPerformanceMetrics
    };
}

/**
 * Hook مبسط لإدارة الذاكرة السريعة
 */
export function useQuickMemoryManager() {
    return useMemoryManager({
        maxMemoryUsage: 50,
        cleanupInterval: 15000,
        enableCompression: false,
        enablePersistence: false,
        maxCacheSize: 20
    });
}

/**
 * Hook متقدم لإدارة الذاكرة مع جميع الميزات
 */
export function useAdvancedMemoryManager() {
    return useMemoryManager({
        maxMemoryUsage: 200,
        cleanupInterval: 10000,
        enableCompression: true,
        enablePersistence: true,
        maxCacheSize: 100
    });
}
