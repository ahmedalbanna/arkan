/**
 * نظام إدارة الذاكرة المتقدم
 * يوفر تحكم ذكي في استخدام الذاكرة وتحسين الأداء
 */

import React from 'react';

// أنواع البيانات
export interface MemoryStats {
    used: number;
    total: number;
    limit: number;
    percentage: number;
    timestamp: number;
}

export interface CacheEntry<T = any> {
    key: string;
    value: T;
    size: number;
    lastAccessed: number;
    accessCount: number;
    ttl?: number; // Time to live in milliseconds
}

export interface MemoryConfig {
    maxCacheSize: number; // بالبايت
    maxEntries: number;
    cleanupInterval: number; // بالمللي ثانية
    warningThreshold: number; // نسبة التحذير (0-1)
    criticalThreshold: number; // نسبة الخطر (0-1)
}

// نظام إدارة الذاكرة الرئيسي
export class MemoryManager {
    private static cache = new Map<string, CacheEntry>();
    private static config: MemoryConfig = {
        maxCacheSize: 50 * 1024 * 1024, // 50MB
        maxEntries: 1000,
        cleanupInterval: 30000, // 30 seconds
        warningThreshold: 0.7, // 70%
        criticalThreshold: 0.9, // 90%
    };

    private static cleanupTimer: NodeJS.Timeout | null = null;
    private static listeners = new Set<(stats: MemoryStats) => void>();
    private static isMonitoring = false;

    // تهيئة النظام
    static initialize(config?: Partial<MemoryConfig>): void {
        if (config) {
            this.config = { ...this.config, ...config };
        }

        this.startMonitoring();
        this.startCleanupTimer();
    }

    // إضافة عنصر إلى الـ cache
    static set<T>(key: string, value: T, ttl?: number): boolean {
        try {
            const size = this.calculateSize(value);
            const now = Date.now();

            // التحقق من الحد الأقصى للحجم
            if (size > this.config.maxCacheSize) {
                console.warn(`Value too large for cache: ${key} (${size} bytes)`);
                return false;
            }

            // إزالة العناصر القديمة إذا تجاوزنا الحد الأقصى
            this.ensureSpace(size);

            const entry: CacheEntry<T> = {
                key,
                value,
                size,
                lastAccessed: now,
                accessCount: 0,
                ttl
            };

            this.cache.set(key, entry);
            this.notifyListeners();

            return true;
        } catch (error) {
            console.error('Error setting cache entry:', error);
            return false;
        }
    }

    // الحصول على عنصر من الـ cache
    static get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // التحقق من انتهاء الصلاحية
        if (entry.ttl && Date.now() - entry.lastAccessed > entry.ttl) {
            this.cache.delete(key);
            return null;
        }

        // تحديث إحصائيات الوصول
        entry.lastAccessed = Date.now();
        entry.accessCount++;

        return entry.value;
    }

    // التحقق من وجود عنصر
    static has(key: string): boolean {
        const entry = this.cache.get(key);

        if (!entry) {
            return false;
        }

        // التحقق من انتهاء الصلاحية
        if (entry.ttl && Date.now() - entry.lastAccessed > entry.ttl) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }

    // حذف عنصر
    static delete(key: string): boolean {
        return this.cache.delete(key);
    }

    // مسح الـ cache بالكامل
    static clear(): void {
        this.cache.clear();
        this.notifyListeners();
    }

    // الحصول على إحصائيات الذاكرة
    static getMemoryStats(): MemoryStats {
        const totalSize = Array.from(this.cache.values())
            .reduce((sum, entry) => sum + entry.size, 0);

        const browserMemory = this.getBrowserMemoryInfo();

        return {
            used: totalSize,
            total: this.config.maxCacheSize,
            limit: browserMemory.limit,
            percentage: totalSize / this.config.maxCacheSize,
            timestamp: Date.now()
        };
    }

    // الحصول على إحصائيات الـ cache
    static getCacheStats(): {
        size: number;
        entries: number;
        hitRate: number;
        averageSize: number;
        oldestEntry: number;
        mostAccessed: string;
    } {
        const entries = Array.from(this.cache.values());
        const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
        const totalAccesses = entries.reduce((sum, entry) => sum + entry.accessCount, 0);

        const oldestEntry = entries.length > 0
            ? Math.min(...entries.map(entry => entry.lastAccessed))
            : 0;

        const mostAccessed = entries.length > 0
            ? entries.reduce((max, entry) =>
                entry.accessCount > max.accessCount ? entry : max
            ).key
            : '';

        return {
            size: totalSize,
            entries: entries.length,
            hitRate: totalAccesses / Math.max(entries.length, 1),
            averageSize: totalSize / Math.max(entries.length, 1),
            oldestEntry,
            mostAccessed
        };
    }

    // بدء مراقبة الذاكرة
    private static startMonitoring(): void {
        if (this.isMonitoring) return;

        this.isMonitoring = true;

        // مراقبة استخدام الذاكرة كل 5 ثوان
        setInterval(() => {
            const stats = this.getMemoryStats();

            // إرسال تحذير إذا تجاوزنا العتبة
            if (stats.percentage >= this.config.criticalThreshold) {
                this.handleCriticalMemoryUsage();
            } else if (stats.percentage >= this.config.warningThreshold) {
                this.handleWarningMemoryUsage();
            }

            this.notifyListeners();
        }, 5000);
    }

    // بدء timer للتنظيف التلقائي
    private static startCleanupTimer(): void {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }

        this.cleanupTimer = setInterval(() => {
            this.performCleanup();
        }, this.config.cleanupInterval);
    }

    // تنظيف الـ cache
    private static performCleanup(): void {
        const now = Date.now();
        const entriesToDelete: string[] = [];

        // إزالة العناصر المنتهية الصلاحية
        for (const [key, entry] of this.cache.entries()) {
            if (entry.ttl && now - entry.lastAccessed > entry.ttl) {
                entriesToDelete.push(key);
            }
        }

        // إزالة العناصر الأقل استخداماً إذا تجاوزنا الحد الأقصى
        if (this.cache.size > this.config.maxEntries) {
            const sortedEntries = Array.from(this.cache.entries())
                .sort((a, b) => {
                    // ترتيب حسب آخر استخدام وعدد المرات
                    const scoreA = a[1].lastAccessed + (a[1].accessCount * 1000);
                    const scoreB = b[1].lastAccessed + (b[1].accessCount * 1000);
                    return scoreA - scoreB;
                });

            const excessCount = this.cache.size - this.config.maxEntries;
            for (let i = 0; i < excessCount; i++) {
                entriesToDelete.push(sortedEntries[i][0]);
            }
        }

        // حذف العناصر المحددة
        entriesToDelete.forEach(key => this.cache.delete(key));

        if (entriesToDelete.length > 0) {
            console.log(`Cleaned up ${entriesToDelete.length} cache entries`);
            this.notifyListeners();
        }
    }

    // التأكد من وجود مساحة كافية
    private static ensureSpace(requiredSize: number): void {
        const currentSize = Array.from(this.cache.values())
            .reduce((sum, entry) => sum + entry.size, 0);

        if (currentSize + requiredSize > this.config.maxCacheSize) {
            // إزالة العناصر الأقدم حتى نجد مساحة كافية
            const sortedEntries = Array.from(this.cache.entries())
                .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

            let freedSize = 0;
            for (const [key, entry] of sortedEntries) {
                this.cache.delete(key);
                freedSize += entry.size;

                if (freedSize >= requiredSize) {
                    break;
                }
            }
        }
    }

    // حساب حجم القيمة
    private static calculateSize(value: any): number {
        try {
            const jsonString = JSON.stringify(value);
            return new Blob([jsonString]).size;
        } catch (error) {
            // تقدير تقريبي إذا فشل التحويل
            return 1024; // 1KB كتقدير افتراضي
        }
    }

    // الحصول على معلومات ذاكرة المتصفح
    private static getBrowserMemoryInfo(): { used: number; total: number; limit: number } {
        if (performance.memory) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }

        return { used: 0, total: 0, limit: 0 };
    }

    // معالجة استخدام الذاكرة الحرجة
    private static handleCriticalMemoryUsage(): void {
        console.error('Critical memory usage detected! Performing emergency cleanup...');

        // تنظيف طارئ - إزالة 50% من الـ cache
        const entriesToDelete = Math.floor(this.cache.size * 0.5);
        const sortedEntries = Array.from(this.cache.entries())
            .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

        for (let i = 0; i < entriesToDelete; i++) {
            this.cache.delete(sortedEntries[i][0]);
        }

        // إشعار المطورين
        this.notifyListeners();
    }

    // معالجة تحذير استخدام الذاكرة
    private static handleWarningMemoryUsage(): void {
        console.warn('High memory usage detected. Consider optimizing cache usage.');
    }

    // إضافة مستمع للتغييرات
    static addListener(listener: (stats: MemoryStats) => void): void {
        this.listeners.add(listener);
    }

    // إزالة مستمع
    static removeListener(listener: (stats: MemoryStats) => void): void {
        this.listeners.delete(listener);
    }

    // إشعار المستمعين
    private static notifyListeners(): void {
        const stats = this.getMemoryStats();
        this.listeners.forEach(listener => {
            try {
                listener(stats);
            } catch (error) {
                console.error('Error in memory listener:', error);
            }
        });
    }

    // تنظيف الموارد
    static cleanup(): void {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }

        this.cache.clear();
        this.listeners.clear();
        this.isMonitoring = false;
    }
}

// نظام إدارة الذاكرة للـ React Components
export class ComponentMemoryManager {
    private static componentCache = new Map<string, any>();
    private static componentStats = new Map<string, {
        mountTime: number;
        unmountTime?: number;
        renderCount: number;
        memoryUsage: number;
    }>();

    // تسجيل مكون جديد
    static registerComponent(componentName: string, instance: any): void {
        const mountTime = Date.now();
        const memoryUsage = this.estimateComponentMemory(instance);

        this.componentStats.set(componentName, {
            mountTime,
            renderCount: 1,
            memoryUsage
        });

        this.componentCache.set(componentName, instance);
    }

    // تسجيل إعادة الرسم
    static recordRender(componentName: string): void {
        const stats = this.componentStats.get(componentName);
        if (stats) {
            stats.renderCount++;
        }
    }

    // تسجيل إلغاء التحميل
    static unregisterComponent(componentName: string): void {
        const stats = this.componentStats.get(componentName);
        if (stats) {
            stats.unmountTime = Date.now();
        }

        this.componentCache.delete(componentName);
    }

    // الحصول على إحصائيات المكونات
    static getComponentStats(): Array<{
        name: string;
        mountTime: number;
        unmountTime?: number;
        renderCount: number;
        memoryUsage: number;
        lifetime: number;
    }> {
        return Array.from(this.componentStats.entries()).map(([name, stats]) => ({
            name,
            mountTime: stats.mountTime,
            unmountTime: stats.unmountTime,
            renderCount: stats.renderCount,
            memoryUsage: stats.memoryUsage,
            lifetime: stats.unmountTime
                ? stats.unmountTime - stats.mountTime
                : Date.now() - stats.mountTime
        }));
    }

    // تقدير استخدام الذاكرة للمكون
    private static estimateComponentMemory(instance: any): number {
        try {
            // تقدير تقريبي بناءً على خصائص المكون
            const props = instance.props || {};
            const state = instance.state || {};

            return JSON.stringify({ props, state }).length;
        } catch (error) {
            return 1024; // تقدير افتراضي
        }
    }

    // تنظيف المكونات القديمة
    static cleanupOldComponents(maxAge: number = 300000): void { // 5 minutes
        const now = Date.now();
        const toDelete: string[] = [];

        for (const [name, stats] of this.componentStats.entries()) {
            if (stats.unmountTime && now - stats.unmountTime > maxAge) {
                toDelete.push(name);
            }
        }

        toDelete.forEach(name => {
            this.componentStats.delete(name);
        });
    }
}

// Hook للاستخدام في React Components
export function useMemoryOptimization(componentName: string) {
    const [memoryStats, setMemoryStats] = React.useState<MemoryStats | null>(null);

    React.useEffect(() => {
        // تسجيل المكون
        ComponentMemoryManager.registerComponent(componentName, {});

        // إضافة مستمع لإحصائيات الذاكرة
        const listener = (stats: MemoryStats) => {
            setMemoryStats(stats);
        };

        MemoryManager.addListener(listener);

        return () => {
            // تنظيف عند إلغاء التحميل
            ComponentMemoryManager.unregisterComponent(componentName);
            MemoryManager.removeListener(listener);
        };
    }, [componentName]);

    return memoryStats;
}

// تصدير الـ utilities
export {
    ComponentMemoryManager, MemoryManager
};

// تصدير الـ types
export type {
    CacheEntry,
    MemoryConfig, MemoryStats
};

