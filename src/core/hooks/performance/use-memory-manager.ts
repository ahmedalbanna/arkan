/**
 * Memory Manager Hook متقدم
 *
 * يوفر إدارة ذكية للذاكرة مع مراقبة وتحسين الأداء
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface MemoryManagerOptions {
    /** تمكين مراقبة الذاكرة */
    enableMonitoring?: boolean;
    /** معدل مراقبة الذاكرة بالميللي ثانية */
    monitoringInterval?: number;
    /** حد أقصى لاستخدام الذاكرة بالميجابايت */
    memoryThreshold?: number;
    /** إستراتيجية التنظيف */
    cleanupStrategy?: 'lru' | 'lfu' | 'ttl' | 'hybrid';
    /** حجم Cache لأغراض التنظيف */
    cacheSizeLimit?: number;
    /** مدة تنظيف دوري بالميللي ثانية */
    cleanupInterval?: number;
}

export interface MemoryInfo {
    /** استخدام الذاكرة الحالي بالميجابايت */
    usedJSHeapSize: number;
    /** ماكسيموم حجم الذاكرة المتاح */
    totalJSHeapSize: number;
    /** الحد الأقصى للذاكرة */
    jsHeapSizeLimit: number;
    /** نسبة الاستخدام */
    usagePercentage: number;
    /** ما إذا كان البحث عن تجاوز الحد */
    isOverThreshold: boolean;
}

export interface CacheEntry<T> {
    key: string;
    value: T;
    timestamp: number;
    accessCount: number;
    lastAccessed: number;
    size: number;
    priority: number;
}

export interface MemoryManagerReturn {
    /** معلومات الذاكرة الحالية */
    memoryInfo: MemoryInfo;
    /** Cache management */
    cache: {
        set: <T>(key: string, value: T, priority?: number) => void;
        get: <T>(key: string) => T | null;
        delete: (key: string) => boolean;
        clear: () => void;
        stats: {
            size: number;
            memoryUsed: number;
            hitRate: number;
            avgAccessTime: number;
        };
    };
    /** ذكية garbage collection */
    gc: {
        /** فرض تنظيف فوري */
        force: () => void;
        /** تنظيف حسب الأولوية */
        cleanupByPriority: (threshold: number) => number;
        /** تنظيف العناصر القديمة */
        cleanupOldItems: (maxAge: number) => number;
        /** تحليل الذاكرة */
        analyze: () => void;
    };
    /** أدوات التحليل */
    analytics: {
        /** تاريخ استخدام الذاكرة */
        memoryHistory: Array<{ timestamp: number; usage: number }>;
        /** ذروات الاستخدام */
        peakUsage: number;
        /** متوسط الاستخدام */
        averageUsage: number;
        /** تقرير حالة الذاكرة */
        healthReport: {
            status: 'healthy' | 'warning' | 'critical';
            recommendations: string[];
        };
    };
}

/**
 * Memory Manager Hook ذكي ومتطور
 */
export function useMemoryManager(options: MemoryManagerOptions = {}): MemoryManagerReturn {
    const {
        enableMonitoring = true,
        monitoringInterval = 5000,
        memoryThreshold = 100,
        cleanupStrategy = 'hybrid',
        cacheSizeLimit = 1000,
        cleanupInterval = 60000
    } = options;

    // State management
    const [memoryInfo, setMemoryInfo] = useState<MemoryInfo>({
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0,
        usagePercentage: 0,
        isOverThreshold: false
    });

    const [memoryHistory, setMemoryHistory] = useState<Array<{ timestamp: number; usage: number }>>([]);
    const [peakUsage, setPeakUsage] = useState(0);

    // Refs for performance optimization
    const cacheRef = useRef<Map<string, CacheEntry<any>>>(new Map());
    const statsRef = useRef({
        hits: 0,
        misses: 0,
        totalAccessTime: 0,
        accessCount: 0
    });

    // Performance API access
    const getMemoryInfo = useCallback((): MemoryInfo => {
        if (typeof window !== 'undefined' && (window as any).performance?.memory) {
            const memory = (window as any).performance.memory;
            const used = memory.usedJSHeapSize / (1024 * 1024); // تحويل إلى MB
            const total = memory.totalJSHeapSize / (1024 * 1024);
            const limit = memory.jsHeapSizeLimit / (1024 * 1024);

            return {
                usedJSHeapSize: used,
                totalJSHeapSize: total,
                jsHeapSizeLimit: limit,
                usagePercentage: Math.round((used / limit) * 100),
                isOverThreshold: used > memoryThreshold
            };
        }

        return {
            usedJSHeapSize: 0,
            totalJSHeapSize: 0,
            jsHeapSizeLimit: 0,
            usagePercentage: 0,
            isOverThreshold: false
        };
    }, [memoryThreshold]);

    // حساب حجم البيانات في الذاكرة
    const calculateSize = useCallback((value: any): number => {
        try {
            const serialized = JSON.stringify(value);
            return new Blob([serialized]).size / 1024; // KB
        } catch {
            return 1; // KB افتراضي
        }
    }, []);

    // تنظيف Cache بناءً على الإستراتيجية
    const cleanupCache = useCallback((forceAmount?: number): number => {
        const cache = cacheRef.current;
        const entries = Array.from(cache.entries());

        if (entries.length === 0) return 0;

        let sizeToCleanup = forceAmount || Math.max(cacheSizeLimit * 0.1, entries.length * 0.1);
        let cleaned = 0;

        // تطبيق إستراتيجية التنظيف
        let sortedEntries = entries;

        switch (cleanupStrategy) {
            case 'lru':
                // Least Recently Used
                sortedEntries = entries.sort((a, b) =>
                    a[1].lastAccessed - b[1].lastAccessed
                );
                break;
            case 'lfu':
                // Least Frequently Used
                sortedEntries = entries.sort((a, b) =>
                    a[1].accessCount - b[1].accessCount
                );
                break;
            case 'ttl':
                // Time To Live
                const now = Date.now();
                sortedEntries = entries.filter(([_, entry]) =>
                    now - entry.timestamp > 300000 // 5 دقائق
                ).sort((a, b) => a[1].timestamp - b[1].timestamp);
                break;
            case 'hybrid':
                // استراتيجية مختلطة (LRU + LFU + TTL)
                const hybridNow = Date.now();
                sortedEntries = entries
                    .map(([key, entry]) => ({
                        key,
                        entry: {
                            ...entry,
                            score: (entry.accessCount * 10) / (hybridNow - entry.lastAccessed) + (hybridNow - entry.timestamp) / 1000000
                        }
                    }))
                    .sort((a, b) => a.entry.score - b.entry.score)
                    .map(({ key, entry }) => [key, entry] as [string, CacheEntry<any>]);
                break;
        }

        // تنفيذ التنظيف
        for (const [key, entry] of sortedEntries) {
            if (cleaned >= sizeToCleanup) break;

            cache.delete(key);
            cleaned++;
        }

        if (cleaned > 0) {
            console.log(`🧹 Memory cleanup: removed ${cleaned} items`);

            // فرض garbage collection
            if (typeof window !== 'undefined' && (window as any).gc) {
                (window as any).gc();
            }
        }

        return cleaned;
    }, [cleanupStrategy, cacheSizeLimit]);

    // تنظيف أولوية
    const cleanupByPriority = useCallback((threshold: number): number => {
        const cache = cacheRef.current;
        const entries = Array.from(cache.entries());

        const lowPriorityItems = entries
            .filter(([_, entry]) => entry.priority < threshold)
            .sort((a, b) => a[1].priority - b[1].priority);

        let cleaned = 0;
        for (const [key] of lowPriorityItems) {
            cache.delete(key);
            cleaned++;
        }

        return cleaned;
    }, []);

    // تنظيف العناصر القديمة
    const cleanupOldItems = useCallback((maxAge: number): number => {
        const cache = cacheRef.current;
        const now = Date.now();
        let cleaned = 0;

        for (const [key, entry] of cache) {
            if (now - entry.timestamp > maxAge) {
                cache.delete(key);
                cleaned++;
            }
        }

        return cleaned;
    }, []);

    // تحليل الذاكرة المتقدم
    const analyzeMemory = useCallback(() => {
        const cache = cacheRef.current;
        const memoryData = getMemoryInfo();

        console.group('🔍 Memory Analysis Report');
        console.log('Current Usage:', memoryData.usedJSHeapSize.toFixed(2), 'MB');
        console.log('Usage Percentage:', memoryData.usagePercentage + '%');
        console.log('Cache Size:', cache.size);
        console.log('Memory History Length:', memoryHistory.length);
        console.log('Peak Usage:', peakUsage.toFixed(2), 'MB');

        // تحليل Cache
        const cacheAnalysis = Array.from(cache.values()).reduce(
            (acc, entry) => {
                acc.totalSize += entry.size;
                acc.totalAccess += entry.accessCount;
                acc.avgAge += Date.now() - entry.timestamp;
                return acc;
            },
            { totalSize: 0, totalAccess: 0, avgAge: 0 }
        );

        console.log('Cache Analysis:');
        console.log('- Total Cache Size:', cacheAnalysis.totalSize.toFixed(2), 'KB');
        console.log('- Average Access Count:', (cacheAnalysis.totalAccess / cache.size).toFixed(2));
        console.log('- Average Age:', (cacheAnalysis.avgAge / cache.size / 1000).toFixed(2), 'sec');
        console.groupEnd();

        return {
            memoryData,
            cacheAnalysis,
            recommendations: getRecommendations(memoryData, cacheAnalysis)
        };
    }, [memoryHistory, peakUsage, getMemoryInfo]);

    // اقتراحات التحسين
    const getRecommendations = useCallback((memoryData: MemoryInfo, cacheAnalysis: any): string[] => {
        const recommendations: string[] = [];

        if (memoryData.usagePercentage > 80) {
            recommendations.push('⚠️ High memory usage detected. Consider reducing cache size.');
        }

        if (memoryData.isOverThreshold) {
            recommendations.push('🚨 Memory threshold exceeded. Immediate cleanup recommended.');
        }

        if (cacheAnalysis.totalSize > 1000) { // 1MB
            recommendations.push('💾 Large cache size. Consider implementing cache invalidation.');
        }

        if (memoryHistory.length > 100) {
            recommendations.push('📊 Memory history is large. Consider clearing old records.');
        }

        return recommendations;
    }, []);

    // مراقبة الذاكرة دورياً
    useEffect(() => {
        if (!enableMonitoring) return;

        const monitorInterval = setInterval(() => {
            const newMemoryInfo = getMemoryInfo();
            setMemoryInfo(newMemoryInfo);

            // تحديث التاريخ
            setMemoryHistory(prev => {
                const updated = [...prev, {
                    timestamp: Date.now(),
                    usage: newMemoryInfo.usedJSHeapSize
                }];

                // الاحتفاظ بآخر 100 نقطة فقط
                return updated.slice(-100);
            });

            // تحديث الذروة
            if (newMemoryInfo.usedJSHeapSize > peakUsage) {
                setPeakUsage(newMemoryInfo.usedJSHeapSize);
            }

            // تنبيه وإجراء تنظيف إذا لزم الأمر
            if (newMemoryInfo.isOverThreshold || newMemoryInfo.usagePercentage > 85) {
                console.warn('⚠️ High memory usage detected:', newMemoryInfo);

                // نظف فورياً
                const cleaned = cleanupCache(cacheSizeLimit * 0.3);
                console.log(`🧹 Emergency cleanup: removed ${cleaned} items`);
            }
        }, monitoringInterval);

        return () => clearInterval(monitorInterval);
    }, [enableMonitoring, monitoringInterval, getMemoryInfo, peakUsage, cleanupCache, cacheSizeLimit]);

    // تنظيف دوري
    useEffect(() => {
        const cleanupInterval = setInterval(() => {
            cleanupCache();
            cleanupOldItems(300000); // تنظيف العناصر القديمة (5 دقائق)
        }, cleanupInterval);

        return () => clearInterval(cleanupInterval);
    }, [cleanupCache, cleanupOldItems, cleanupInterval]);

    // Cache API
    const cache = {
        set: <T>(key: string, value: T, priority: number = 1) => {
            const cache = cacheRef.current;
            const size = calculateSize(value);

            cache.set(key, {
                key,
                value,
                timestamp: Date.now(),
                accessCount: 0,
                lastAccessed: Date.now(),
                size,
                priority
            });

            // التحقق من الحد الأقصى للحجم
            if (cache.size > cacheSizeLimit) {
                cleanupCache(cacheSizeLimit * 0.1);
            }
        },

        get: <T>(key: string): T | null => {
            const startTime = performance.now();
            const cache = cacheRef.current;
            const entry = cache.get(key);

            if (entry) {
                entry.accessCount++;
                entry.lastAccessed = Date.now();
                statsRef.current.hits++;

                const accessTime = performance.now() - startTime;
                statsRef.current.totalAccessTime += accessTime;

                return entry.value;
            }

            statsRef.current.misses++;
            return null;
        },

        delete: (key: string): boolean => {
            const removed = cacheRef.current.delete(key);
            return removed;
        },

        clear: () => {
            cacheRef.current.clear();
            statsRef.current = { hits: 0, misses: 0, totalAccessTime: 0, accessCount: 0 };
            console.log('🗑️ Memory cache cleared');
        },

        stats: {
            get size() { return cacheRef.current.size; },
            get memoryUsed() {
                return Array.from(cacheRef.current.values())
                    .reduce((sum, entry) => sum + entry.size, 0);
            },
            get hitRate() {
                const total = statsRef.current.hits + statsRef.current.misses;
                return total > 0 ? (statsRef.current.hits / total) * 100 : 0;
            },
            get avgAccessTime() {
                return statsRef.current.accessCount > 0
                    ? statsRef.current.totalAccessTime / statsRef.current.accessCount
                    : 0;
            }
        }
    };

    // أدوات GC
    const gc = {
        force: () => {
            const cleaned = cleanupCache(cacheSizeLimit * 0.5); // نظف 50%
            console.log(`🧹 Force cleanup: removed ${cleaned} items`);

            if (typeof window !== 'undefined' && (window as any).gc) {
                (window as any).gc();
            }
        },

        cleanupByPriority,
        cleanupOldItems,
        analyze: analyzeMemory
    };

    // أدوات التحليل
    const analytics = {
        memoryHistory,
        peakUsage,

        get averageUsage() {
            if (memoryHistory.length === 0) return 0;
            const sum = memoryHistory.reduce((acc, entry) => acc + entry.usage, 0);
            return sum / memoryHistory.length;
        },

        get healthReport() {
            const memoryData = memoryInfo;
            const cacheStats = cache.stats;

            let status: 'healthy' | 'warning' | 'critical' = 'healthy';
            const recommendations: string[] = [];

            if (memoryData.usagePercentage > 90 || memoryData.isOverThreshold) {
                status = 'critical';
                recommendations.push('🚨 Critical memory usage - immediate action required');
            } else if (memoryData.usagePercentage > 75) {
                status = 'warning';
                recommendations.push('⚠️ High memory usage - consider optimization');
            }

            if (cacheStats.hitRate < 50) {
                status = status === 'healthy' ? 'warning' : status;
                recommendations.push('📉 Low cache hit rate - review caching strategy');
            }

            if (cacheStats.memoryUsed > 5) { // 5MB
                status = status === 'healthy' ? 'warning' : status;
                recommendations.push('💾 Large cache memory usage - consider size limits');
            }

            if (recommendations.length === 0) {
                recommendations.push('✅ Memory usage within healthy parameters');
            }

            return { status, recommendations };
        }
    };

    return {
        memoryInfo,
        cache,
        gc,
        analytics
    };
}

export default useMemoryManager;
