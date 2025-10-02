/**
 * نظام مراقبة الأداء المتقدم
 * يوفر تتبع شامل للأداء وتحليل البيانات
 */

import React from 'react';
import { MemoryManager, MemoryStats } from '../utils/memory-manager';

// أنواع البيانات
export interface PerformanceMetric {
    name: string;
    value: number;
    unit: string;
    timestamp: number;
    context?: Record<string, any>;
}

export interface ComponentPerformance {
    componentName: string;
    mountTime: number;
    renderTime: number;
    unmountTime?: number;
    renderCount: number;
    memoryUsage: number;
    isSlow: boolean;
}

export interface HookPerformance {
    hookName: string;
    executionTime: number;
    success: boolean;
    context?: string;
    timestamp: number;
}

export interface BundlePerformance {
    chunkName: string;
    loadTime: number;
    size: number;
    cacheHit: boolean;
    timestamp: number;
}

export interface PerformanceReport {
    timestamp: number;
    duration: number;
    metrics: PerformanceMetric[];
    components: ComponentPerformance[];
    hooks: HookPerformance[];
    bundles: BundlePerformance[];
    memory: MemoryStats;
    recommendations: string[];
}

export interface PerformanceConfig {
    enableTracking: boolean;
    slowThreshold: number; // milliseconds
    memoryThreshold: number; // bytes
    reportInterval: number; // milliseconds
    maxHistorySize: number;
}

// نظام مراقبة الأداء الرئيسي
export class PerformanceTracker {
    private static config: PerformanceConfig = {
        enableTracking: true,
        slowThreshold: 100, // 100ms
        memoryThreshold: 10 * 1024 * 1024, // 10MB
        reportInterval: 60000, // 1 minute
        maxHistorySize: 1000
    };

    private static metrics: PerformanceMetric[] = [];
    private static components: ComponentPerformance[] = [];
    private static hooks: HookPerformance[] = [];
    private static bundles: BundlePerformance[] = [];
    private static reports: PerformanceReport[] = [];

    private static isMonitoring = false;
    private static reportTimer: NodeJS.Timeout | null = null;
    private static listeners = new Set<(report: PerformanceReport) => void>();

    // تهيئة النظام
    static initialize(config?: Partial<PerformanceConfig>): void {
        if (config) {
            this.config = { ...this.config, ...config };
        }

        if (this.config.enableTracking) {
            this.startMonitoring();
            this.startReporting();
        }
    }

    // تتبع تحميل المكونات
    static trackComponentLoad(
        componentName: string,
        loadTime: number,
        success: boolean
    ): void {
        if (!this.config.enableTracking) return;

        const component: ComponentPerformance = {
            componentName,
            mountTime: loadTime,
            renderTime: 0,
            renderCount: 1,
            memoryUsage: 0,
            isSlow: loadTime > this.config.slowThreshold
        };

        this.components.push(component);
        this.trimHistory('components');

        // تسجيل metric
        this.addMetric('component_load_time', loadTime, 'ms', {
            component: componentName,
            success,
            slow: component.isSlow
        });

        if (component.isSlow) {
            console.warn(`Slow component detected: ${componentName} took ${loadTime}ms`);
        }
    }

    // تتبع تحميل الـ modules
    static trackModuleLoad(
        modulePath: string,
        loadTime: number,
        success: boolean
    ): void {
        if (!this.config.enableTracking) return;

        const bundle: BundlePerformance = {
            chunkName: modulePath,
            loadTime,
            size: 0, // سيتم تحديثه لاحقاً
            cacheHit: false,
            timestamp: Date.now()
        };

        this.bundles.push(bundle);
        this.trimHistory('bundles');

        // تسجيل metric
        this.addMetric('module_load_time', loadTime, 'ms', {
            module: modulePath,
            success,
            slow: loadTime > this.config.slowThreshold
        });
    }

    // تتبع أداء الـ hooks
    static trackHookPerformance(
        hookName: string,
        executionTime: number,
        success: boolean,
        context?: string
    ): void {
        if (!this.config.enableTracking) return;

        const hook: HookPerformance = {
            hookName,
            executionTime,
            success,
            context,
            timestamp: Date.now()
        };

        this.hooks.push(hook);
        this.trimHistory('hooks');

        // تسجيل metric
        this.addMetric('hook_execution_time', executionTime, 'ms', {
            hook: hookName,
            success,
            context,
            slow: executionTime > this.config.slowThreshold
        });

        if (executionTime > this.config.slowThreshold) {
            console.warn(`Slow hook detected: ${hookName} took ${executionTime}ms`);
        }
    }

    // تتبع أداء الوظائف
    static trackFunctionPerformance<T>(
        functionName: string,
        fn: () => T,
        context?: Record<string, any>
    ): T {
        if (!this.config.enableTracking) {
            return fn();
        }

        const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
        let success = true;
        let result: T;

        try {
            result = fn();
        } catch (error) {
            success = false;
            throw error;
        } finally {
            const executionTime = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime;

            this.addMetric('function_execution_time', executionTime, 'ms', {
                function: functionName,
                success,
                context,
                slow: executionTime > this.config.slowThreshold
            });

            if (executionTime > this.config.slowThreshold) {
                console.warn(`Slow function detected: ${functionName} took ${executionTime}ms`);
            }
        }

        return result;
    }

    // تتبع أداء الوظائف غير المتزامنة
    static async trackAsyncFunctionPerformance<T>(
        functionName: string,
        fn: () => Promise<T>,
        context?: Record<string, any>
    ): Promise<T> {
        if (!this.config.enableTracking) {
            return fn();
        }

        const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
        let success = true;
        let result: T;

        try {
            result = await fn();
        } catch (error) {
            success = false;
            throw error;
        } finally {
            const executionTime = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime;

            this.addMetric('async_function_execution_time', executionTime, 'ms', {
                function: functionName,
                success,
                context,
                slow: executionTime > this.config.slowThreshold
            });

            if (executionTime > this.config.slowThreshold) {
                console.warn(`Slow async function detected: ${functionName} took ${executionTime}ms`);
            }
        }

        return result;
    }

    // تتبع أداء الشبكة
    static trackNetworkPerformance(
        url: string,
        method: string,
        duration: number,
        status: number,
        size?: number
    ): void {
        if (!this.config.enableTracking) return;

        this.addMetric('network_request_duration', duration, 'ms', {
            url,
            method,
            status,
            size,
            slow: duration > this.config.slowThreshold * 2 // عتبة أعلى للشبكة
        });

        if (size) {
            this.addMetric('network_request_size', size, 'bytes', {
                url,
                method,
                status
            });
        }
    }

    // تتبع أداء الرسم
    static trackRenderPerformance(
        componentName: string,
        renderTime: number,
        renderCount: number
    ): void {
        if (!this.config.enableTracking) return;

        // البحث عن المكون وتحديث بياناته
        const component = this.components.find(c => c.componentName === componentName);
        if (component) {
            component.renderTime = renderTime;
            component.renderCount = renderCount;
        }

        this.addMetric('render_time', renderTime, 'ms', {
            component: componentName,
            renderCount,
            slow: renderTime > this.config.slowThreshold
        });
    }

    // إضافة metric جديد
    private static addMetric(
        name: string,
        value: number,
        unit: string,
        context?: Record<string, any>
    ): void {
        const metric: PerformanceMetric = {
            name,
            value,
            unit,
            timestamp: Date.now(),
            context
        };

        this.metrics.push(metric);
        this.trimHistory('metrics');
    }

    // بدء المراقبة
    private static startMonitoring(): void {
        if (this.isMonitoring) return;

        this.isMonitoring = true;

        // مراقبة Core Web Vitals
        this.observeCoreWebVitals();

        // مراقبة استخدام الذاكرة
        this.observeMemoryUsage();

        // مراقبة أداء الصفحة
        this.observePagePerformance();
    }

    // مراقبة Core Web Vitals
    private static observeCoreWebVitals(): void {
        // التأكد من أننا في بيئة المتصفح
        if (typeof window === 'undefined') return;

        // Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];

                this.addMetric('lcp', lastEntry.startTime, 'ms', {
                    element: lastEntry.element?.tagName
                });
            });

            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        }

        // First Input Delay (FID)
        if ('PerformanceObserver' in window) {
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry: any) => {
                    this.addMetric('fid', entry.processingStart - entry.startTime, 'ms', {
                        eventType: entry.name
                    });
                });
            });

            fidObserver.observe({ entryTypes: ['first-input'] });
        }

        // Cumulative Layout Shift (CLS)
        if ('PerformanceObserver' in window) {
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry: any) => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });

                this.addMetric('cls', clsValue, 'score');
            });

            clsObserver.observe({ entryTypes: ['layout-shift'] });
        }
    }

    // مراقبة استخدام الذاكرة
    private static observeMemoryUsage(): void {
        setInterval(() => {
            const memoryStats = MemoryManager.getMemoryStats();

            if (memoryStats.used > this.config.memoryThreshold) {
                this.addMetric('memory_usage_warning', memoryStats.used, 'bytes', {
                    percentage: memoryStats.percentage,
                    threshold: this.config.memoryThreshold
                });
            }
        }, 10000); // كل 10 ثوان
    }

    // مراقبة أداء الصفحة
    private static observePagePerformance(): void {
        // التأكد من أننا في بيئة المتصفح
        if (typeof window === 'undefined') return;

        // Navigation Timing
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

            this.addMetric('page_load_time', navigation.loadEventEnd - navigation.fetchStart, 'ms');
            this.addMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart, 'ms');
            this.addMetric('first_paint', navigation.responseEnd - navigation.fetchStart, 'ms');
        });
    }

    // بدء إنتاج التقارير
    private static startReporting(): void {
        if (this.reportTimer) {
            clearInterval(this.reportTimer);
        }

        this.reportTimer = setInterval(() => {
            this.generateReport();
        }, this.config.reportInterval);
    }

    // إنتاج تقرير الأداء
    private static generateReport(): void {
        const report: PerformanceReport = {
            timestamp: Date.now(),
            duration: this.config.reportInterval,
            metrics: [...this.metrics],
            components: [...this.components],
            hooks: [...this.hooks],
            bundles: [...this.bundles],
            memory: MemoryManager.getMemoryStats(),
            recommendations: this.generateRecommendations()
        };

        this.reports.push(report);
        this.trimHistory('reports');

        // إشعار المستمعين
        this.listeners.forEach(listener => {
            try {
                listener(report);
            } catch (error) {
                console.error('Error in performance report listener:', error);
            }
        });

        // طباعة التقرير في وضع التطوير
        if (process.env.NODE_ENV === 'development') {
            this.printReport(report);
        }
    }

    // إنتاج التوصيات
    private static generateRecommendations(): string[] {
        const recommendations: string[] = [];

        // تحليل المكونات البطيئة
        const slowComponents = this.components.filter(c => c.isSlow);
        if (slowComponents.length > 0) {
            recommendations.push(`Consider optimizing ${slowComponents.length} slow components`);
        }

        // تحليل الـ hooks البطيئة
        const slowHooks = this.hooks.filter(h => h.executionTime > this.config.slowThreshold);
        if (slowHooks.length > 0) {
            recommendations.push(`Consider optimizing ${slowHooks.length} slow hooks`);
        }

        // تحليل استخدام الذاكرة
        const memoryStats = MemoryManager.getMemoryStats();
        if (memoryStats.percentage > 0.8) {
            recommendations.push('High memory usage detected, consider reducing cache size');
        }

        // تحليل Bundle Size
        const largeBundles = this.bundles.filter(b => b.size > 100000); // 100KB
        if (largeBundles.length > 0) {
            recommendations.push(`Consider code splitting for ${largeBundles.length} large bundles`);
        }

        return recommendations;
    }

    // طباعة التقرير
    private static printReport(report: PerformanceReport): void {
        console.group('🚀 Performance Report');
        console.log('📊 Metrics:', report.metrics.length);
        console.log('🧩 Components:', report.components.length);
        console.log('🪝 Hooks:', report.hooks.length);
        console.log('📦 Bundles:', report.bundles.length);
        console.log('💾 Memory Usage:', `${Math.round(report.memory.percentage * 100)}%`);

        if (report.recommendations.length > 0) {
            console.log('💡 Recommendations:');
            report.recommendations.forEach(rec => console.log(`  - ${rec}`));
        }

        console.groupEnd();
    }

    // تقليم التاريخ
    private static trimHistory(type: 'metrics' | 'components' | 'hooks' | 'bundles' | 'reports'): void {
        const array = this[type];
        if (array.length > this.config.maxHistorySize) {
            array.splice(0, array.length - this.config.maxHistorySize);
        }
    }

    // الحصول على إحصائيات الأداء
    static getPerformanceStats(): {
        totalMetrics: number;
        slowComponents: number;
        slowHooks: number;
        averageRenderTime: number;
        memoryUsage: number;
        recommendations: string[];
    } {
        const slowComponents = this.components.filter(c => c.isSlow).length;
        const slowHooks = this.hooks.filter(h => h.executionTime > this.config.slowThreshold).length;
        const averageRenderTime = this.components.length > 0
            ? this.components.reduce((sum, c) => sum + c.renderTime, 0) / this.components.length
            : 0;

        const memoryStats = MemoryManager.getMemoryStats();

        return {
            totalMetrics: this.metrics.length,
            slowComponents,
            slowHooks,
            averageRenderTime,
            memoryUsage: memoryStats.percentage,
            recommendations: this.generateRecommendations()
        };
    }

    // إضافة مستمع للتقارير
    static addReportListener(listener: (report: PerformanceReport) => void): void {
        this.listeners.add(listener);
    }

    // إزالة مستمع
    static removeReportListener(listener: (report: PerformanceReport) => void): void {
        this.listeners.delete(listener);
    }

    // تنظيف الموارد
    static cleanup(): void {
        if (this.reportTimer) {
            clearInterval(this.reportTimer);
            this.reportTimer = null;
        }

        this.metrics = [];
        this.components = [];
        this.hooks = [];
        this.bundles = [];
        this.reports = [];
        this.listeners.clear();
        this.isMonitoring = false;
    }
}

// Hook للاستخدام في React Components
export function usePerformanceTracking(componentName: string) {
    const [performanceStats, setPerformanceStats] = React.useState<any>(null);

    React.useEffect(() => {
        const listener = (report: PerformanceReport) => {
            const componentStats = report.components.find(c => c.componentName === componentName);
            if (componentStats) {
                setPerformanceStats(componentStats);
            }
        };

        PerformanceTracker.addReportListener(listener);

        return () => {
            PerformanceTracker.removeReportListener(listener);
        };
    }, [componentName]);

    return performanceStats;
}

// تصدير الـ utilities
// PerformanceTracker is already exported as a class above

// تصدير الـ types
export type {
    BundlePerformance, ComponentPerformance,
    HookPerformance, PerformanceConfig, PerformanceMetric, PerformanceReport
};

