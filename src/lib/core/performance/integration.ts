/**
 * تكامل نظام الأداء
 *
 * هذا الملف يحتوي على تكامل نظام الأداء
 * مع النظام الأساسي والمكونات الأخرى
 */

import { Analytics } from './analytics';
import { ApiOptimizer } from './api-optimizer';
import { CacheOptimizer } from './cache-optimizer';
import { PerformanceMonitor } from './performance-monitor';

/**
 * إعدادات التكامل
 */
export interface IntegrationConfig {
    /** تفعيل/إلغاء تفعيل Analytics */
    analyticsEnabled?: boolean;
    /** تفعيل/إلغاء تفعيل مراقبة الأداء */
    performanceMonitoringEnabled?: boolean;
    /** تفعيل/إلغاء تفعيل تحسين Cache */
    cacheOptimizationEnabled?: boolean;
    /** تفعيل/إلغاء تفعيل تحسين API */
    apiOptimizationEnabled?: boolean;
    /** معرف المستخدم */
    userId?: string;
    /** معرف الجلسة */
    sessionId?: string;
    /** URL خدمة التحليلات */
    analyticsUrl?: string;
    /** مفتاح API للتحليلات */
    analyticsApiKey?: string;
}

/**
 * مدير التكامل
 */
export class PerformanceIntegration {
    private static config: IntegrationConfig = {
        analyticsEnabled: true,
        performanceMonitoringEnabled: true,
        cacheOptimizationEnabled: true,
        apiOptimizationEnabled: true,
    };

    /**
     * تهيئة نظام الأداء
     */
    static initialize(config: IntegrationConfig = {}): void {
        this.config = { ...this.config, ...config };

        // تهيئة Analytics
        if (this.config.analyticsEnabled) {
            Analytics.setEnabled(true);
            if (this.config.userId) {
                Analytics.setUserId(this.config.userId);
            }
        }

        // تهيئة مراقبة الأداء
        if (this.config.performanceMonitoringEnabled) {
            PerformanceMonitor.setEnabled(true);
            PerformanceMonitor.startAutoMonitoring();
        }

        // تهيئة تحسين Cache
        if (this.config.cacheOptimizationEnabled) {
            // Cache يتم تهيئته تلقائياً
        }

        // تهيئة تحسين API
        if (this.config.apiOptimizationEnabled) {
            // API Optimizer يتم تهيئته تلقائياً
        }

        // تسجيل حدث التهيئة
        this.trackEvent('performance_system_initialized', {
            config: this.config,
            timestamp: Date.now(),
        });
    }

    /**
     * تتبع حدث
     */
    static trackEvent(name: string, properties?: Record<string, any>, value?: number): void {
        if (this.config.analyticsEnabled) {
            Analytics.trackCustom(name, properties, value);
        }
    }

    /**
     * تتبع أداء
     */
    static trackPerformance(metric: string, value: number, properties?: Record<string, any>): void {
        if (this.config.performanceMonitoringEnabled) {
            PerformanceMonitor.recordEvent({
                type: 'performance',
                name: metric,
                value,
                unit: 'ms',
                metadata: properties,
            });
        }

        if (this.config.analyticsEnabled) {
            Analytics.trackPerformance(metric, value, properties);
        }
    }

    /**
     * تتبع خطأ
     */
    static trackError(error: Error, context?: string, properties?: Record<string, any>): void {
        if (this.config.performanceMonitoringEnabled) {
            PerformanceMonitor.recordEvent({
                type: 'error',
                name: 'error_occurred',
                value: 0,
                unit: 'count',
                metadata: {
                    message: error.message,
                    stack: error.stack,
                    context,
                    ...properties,
                },
            });
        }

        if (this.config.analyticsEnabled) {
            Analytics.trackError(error, context, properties);
        }
    }

    /**
     * تتبع API call
     */
    static trackApiCall(
        url: string,
        method: string,
        duration: number,
        success: boolean,
        statusCode?: number
    ): void {
        if (this.config.performanceMonitoringEnabled) {
            PerformanceMonitor.measureApiCall(url, method, Date.now() - duration, Date.now(), success);
        }

        if (this.config.analyticsEnabled) {
            Analytics.trackApiCall(url, method, duration, success, statusCode);
        }
    }

    /**
     * تتبع عرض الصفحة
     */
    static trackPageView(page: string, properties?: Record<string, any>): void {
        if (this.config.analyticsEnabled) {
            Analytics.trackPageView(page, properties);
        }
    }

    /**
     * تتبع إجراء المستخدم
     */
    static trackUserAction(action: string, properties?: Record<string, any>, value?: number): void {
        if (this.config.analyticsEnabled) {
            Analytics.trackUserAction(action, properties, value);
        }
    }

    /**
     * قياس دالة
     */
    static measureFunction<T>(
        name: string,
        fn: () => T,
        properties?: Record<string, any>
    ): T {
        if (this.config.performanceMonitoringEnabled) {
            return PerformanceMonitor.measureFunction(name, fn, properties);
        }
        return fn();
    }

    /**
     * قياس دالة غير متزامنة
     */
    static async measureAsyncFunction<T>(
        name: string,
        fn: () => Promise<T>,
        properties?: Record<string, any>
    ): Promise<T> {
        if (this.config.performanceMonitoringEnabled) {
            return PerformanceMonitor.measureAsyncFunction(name, fn, properties);
        }
        return fn();
    }

    /**
     * الحصول على جميع المقاييس
     */
    static getAllMetrics(): {
        performance: any;
        analytics: any;
        cache: any;
        api: any;
    } {
        return {
            performance: this.config.performanceMonitoringEnabled ? PerformanceMonitor.getMetrics() : null,
            analytics: this.config.analyticsEnabled ? Analytics.getAppMetrics() : null,
            cache: this.config.cacheOptimizationEnabled ? CacheOptimizer.getStats() : null,
            api: this.config.apiOptimizationEnabled ? ApiOptimizer.getStats() : null,
        };
    }

    /**
     * تصدير جميع البيانات
     */
    static exportAllData(): string {
        const data = {
            config: this.config,
            performance: this.config.performanceMonitoringEnabled ? PerformanceMonitor.exportData() : null,
            analytics: this.config.analyticsEnabled ? Analytics.exportData() : null,
            cache: this.config.cacheOptimizationEnabled ? CacheOptimizer.exportCache() : null,
            api: this.config.apiOptimizationEnabled ? ApiOptimizer.exportData() : null,
            timestamp: Date.now(),
        };

        return JSON.stringify(data, null, 2);
    }

    /**
     * تحليل الأداء
     */
    static analyzePerformance(): {
        score: number;
        recommendations: string[];
        metrics: any;
    } {
        const metrics = this.getAllMetrics();
        const recommendations: string[] = [];
        let score = 100;

        // تحليل أداء الصفحة
        if (metrics.performance) {
            if (metrics.performance.pageLoadTime > 3000) {
                score -= 20;
                recommendations.push('تحسين وقت تحميل الصفحة (أكثر من 3 ثوان)');
            }

            if (metrics.performance.memoryUsage.percentage > 80) {
                score -= 15;
                recommendations.push('تحسين استخدام الذاكرة (أكثر من 80%)');
            }

            if (metrics.performance.errorRate > 5) {
                score -= 25;
                recommendations.push('تقليل معدل الأخطاء (أكثر من 5%)');
            }
        }

        // تحليل أداء Cache
        if (metrics.cache) {
            if (metrics.cache.hitRate < 70) {
                score -= 10;
                recommendations.push('تحسين معدل نجاح Cache (أقل من 70%)');
            }

            if (metrics.cache.totalSize > 50 * 1024 * 1024) { // 50MB
                score -= 10;
                recommendations.push('تقليل حجم Cache (أكثر من 50MB)');
            }
        }

        // تحليل أداء API
        if (metrics.api) {
            if (metrics.api.averageResponseTime > 2000) {
                score -= 15;
                recommendations.push('تحسين وقت استجابة API (أكثر من 2 ثانية)');
            }

            if (metrics.api.pendingRequests > 10) {
                score -= 10;
                recommendations.push('تقليل عدد الطلبات المعلقة (أكثر من 10)');
            }
        }

        // تحليل Analytics
        if (metrics.analytics) {
            if (metrics.analytics.errorRate > 3) {
                score -= 20;
                recommendations.push('تقليل معدل الأخطاء العام (أكثر من 3%)');
            }
        }

        return {
            score: Math.max(0, score),
            recommendations,
            metrics,
        };
    }

    /**
     * تحسين تلقائي
     */
    static autoOptimize(): void {
        // تحسين Cache
        if (this.config.cacheOptimizationEnabled) {
            CacheOptimizer.optimize();
        }

        // تنظيف البيانات القديمة
        if (this.config.performanceMonitoringEnabled) {
            PerformanceMonitor.clearEvents();
        }

        if (this.config.analyticsEnabled) {
            Analytics.clearData();
        }

        // تسجيل حدث التحسين
        this.trackEvent('auto_optimization_performed', {
            timestamp: Date.now(),
        });
    }

    /**
     * إعادة تعيين النظام
     */
    static reset(): void {
        if (this.config.performanceMonitoringEnabled) {
            PerformanceMonitor.clearEvents();
        }

        if (this.config.analyticsEnabled) {
            Analytics.clearData();
        }

        if (this.config.cacheOptimizationEnabled) {
            CacheOptimizer.clear();
        }

        // تسجيل حدث إعادة التعيين
        this.trackEvent('performance_system_reset', {
            timestamp: Date.now(),
        });
    }

    /**
     * الحصول على التقرير الشامل
     */
    static getComprehensiveReport(): string {
        const analysis = this.analyzePerformance();
        const metrics = this.getAllMetrics();
        const config = this.config;

        return `
# تقرير الأداء الشامل

## الإعدادات
- Analytics: ${config.analyticsEnabled ? 'مفعل' : 'معطل'}
- مراقبة الأداء: ${config.performanceMonitoringEnabled ? 'مفعل' : 'معطل'}
- تحسين Cache: ${config.cacheOptimizationEnabled ? 'مفعل' : 'معطل'}
- تحسين API: ${config.apiOptimizationEnabled ? 'مفعل' : 'معطل'}

## تقييم الأداء
- **الدرجة**: ${analysis.score}/100
- **التوصيات**: ${analysis.recommendations.length > 0 ? analysis.recommendations.join(', ') : 'لا توجد توصيات'}

## المقاييس
${JSON.stringify(metrics, null, 2)}

## التوقيت
- **تاريخ التقرير**: ${new Date().toISOString()}
- **معرف الجلسة**: ${config.sessionId || 'غير محدد'}
- **معرف المستخدم**: ${config.userId || 'غير محدد'}
    `.trim();
    }
}
