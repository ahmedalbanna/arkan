/**
 * مراقب الأداء
 *
 * هذا الملف يحتوي على نظام مراقبة الأداء
 * وقياس المقاييس المختلفة
 */

/**
 * مقاييس الأداء
 */
export interface PerformanceMetrics {
    /** وقت تحميل الصفحة */
    pageLoadTime: number;
    /** وقت التفاعل الأول */
    firstContentfulPaint: number;
    /** وقت الرسم الأكبر */
    largestContentfulPaint: number;
    /** تأخير الإدخال الأول */
    firstInputDelay: number;
    /** تأخير التخطيط التراكمي */
    cumulativeLayoutShift: number;
    /** استخدام الذاكرة */
    memoryUsage: {
        used: number;
        total: number;
        percentage: number;
    };
    /** عدد الطلبات */
    requestCount: number;
    /** متوسط وقت الاستجابة */
    averageResponseTime: number;
    /** معدل الأخطاء */
    errorRate: number;
}

/**
 * حدث الأداء
 */
export interface PerformanceEvent {
    /** نوع الحدث */
    type: 'page_load' | 'api_call' | 'error' | 'user_interaction' | 'memory_usage';
    /** اسم الحدث */
    name: string;
    /** القيمة */
    value: number;
    /** الوحدة */
    unit: 'ms' | 'bytes' | 'count' | 'percentage';
    /** الطابع الزمني */
    timestamp: number;
    /** البيانات الإضافية */
    metadata?: Record<string, any>;
}

/**
 * مراقب الأداء
 */
export class PerformanceMonitor {
    private static events: PerformanceEvent[] = [];
    private static isEnabled = true;
    private static maxEvents = 1000;

    /**
     * تفعيل/إلغاء تفعيل المراقبة
     */
    static setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
    }

    /**
     * تسجيل حدث أداء
     */
    static recordEvent(event: Omit<PerformanceEvent, 'timestamp'>): void {
        if (!this.isEnabled) return;

        const fullEvent: PerformanceEvent = {
            ...event,
            timestamp: Date.now(),
        };

        this.events.push(fullEvent);

        // الحفاظ على الحد الأقصى للأحداث
        if (this.events.length > this.maxEvents) {
            this.events = this.events.slice(-this.maxEvents);
        }

        // إرسال الحدث إلى خدمة المراقبة
        this.sendToMonitoringService(fullEvent);
    }

    /**
     * قياس وقت تنفيذ دالة
     */
    static measureFunction<T>(
        name: string,
        fn: () => T,
        metadata?: Record<string, any>
    ): T {
        const startTime = performance.now();

        try {
            const result = fn();
            const endTime = performance.now();

            this.recordEvent({
                type: 'user_interaction',
                name: `function_${name}`,
                value: endTime - startTime,
                unit: 'ms',
                metadata: {
                    ...metadata,
                    success: true,
                },
            });

            return result;
        } catch (error) {
            const endTime = performance.now();

            this.recordEvent({
                type: 'error',
                name: `function_${name}_error`,
                value: endTime - startTime,
                unit: 'ms',
                metadata: {
                    ...metadata,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                },
            });

            throw error;
        }
    }

    /**
     * قياس وقت تنفيذ دالة غير متزامنة
     */
    static async measureAsyncFunction<T>(
        name: string,
        fn: () => Promise<T>,
        metadata?: Record<string, any>
    ): Promise<T> {
        const startTime = performance.now();

        try {
            const result = await fn();
            const endTime = performance.now();

            this.recordEvent({
                type: 'user_interaction',
                name: `async_function_${name}`,
                value: endTime - startTime,
                unit: 'ms',
                metadata: {
                    ...metadata,
                    success: true,
                },
            });

            return result;
        } catch (error) {
            const endTime = performance.now();

            this.recordEvent({
                type: 'error',
                name: `async_function_${name}_error`,
                value: endTime - startTime,
                unit: 'ms',
                metadata: {
                    ...metadata,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                },
            });

            throw error;
        }
    }

    /**
     * قياس وقت تحميل الصفحة
     */
    static measurePageLoad(): void {
        if (typeof window === 'undefined') return;

        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

            if (navigation) {
                this.recordEvent({
                    type: 'page_load',
                    name: 'page_load_time',
                    value: navigation.loadEventEnd - navigation.navigationStart,
                    unit: 'ms',
                    metadata: {
                        url: window.location.href,
                        userAgent: navigator.userAgent,
                    },
                });
            }
        });
    }

    /**
     * قياس استخدام الذاكرة
     */
    static measureMemoryUsage(): void {
        if (typeof window === 'undefined') return;
        if (!('memory' in performance)) return;

        const memory = (performance as any).memory;

        this.recordEvent({
            type: 'memory_usage',
            name: 'memory_used',
            value: memory.usedJSHeapSize,
            unit: 'bytes',
            metadata: {
                total: memory.totalJSHeapSize,
                limit: memory.jsHeapSizeLimit,
                percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
            },
        });
    }

    /**
     * قياس API call
     */
    static measureApiCall(
        url: string,
        method: string,
        startTime: number,
        endTime: number,
        success: boolean,
        statusCode?: number
    ): void {
        this.recordEvent({
            type: 'api_call',
            name: `api_${method.toLowerCase()}_${url}`,
            value: endTime - startTime,
            unit: 'ms',
            metadata: {
                url,
                method,
                success,
                statusCode,
            },
        });
    }

    /**
     * الحصول على مقاييس الأداء
     */
    static getMetrics(): PerformanceMetrics {
        const now = Date.now();
        const last5Minutes = now - (5 * 60 * 1000);
        const recentEvents = this.events.filter(event => event.timestamp > last5Minutes);

        // حساب مقاييس الأداء
        const pageLoadEvents = recentEvents.filter(e => e.type === 'page_load');
        const apiCallEvents = recentEvents.filter(e => e.type === 'api_call');
        const errorEvents = recentEvents.filter(e => e.type === 'error');
        const memoryEvents = recentEvents.filter(e => e.type === 'memory_usage');

        const pageLoadTime = pageLoadEvents.length > 0
            ? pageLoadEvents.reduce((sum, e) => sum + e.value, 0) / pageLoadEvents.length
            : 0;

        const averageResponseTime = apiCallEvents.length > 0
            ? apiCallEvents.reduce((sum, e) => sum + e.value, 0) / apiCallEvents.length
            : 0;

        const errorRate = recentEvents.length > 0
            ? (errorEvents.length / recentEvents.length) * 100
            : 0;

        const latestMemoryEvent = memoryEvents[memoryEvents.length - 1];
        const memoryUsage = latestMemoryEvent?.metadata || {
            used: 0,
            total: 0,
            percentage: 0,
        };

        return {
            pageLoadTime,
            firstContentfulPaint: 0, // TODO: تنفيذ قياس FCP
            largestContentfulPaint: 0, // TODO: تنفيذ قياس LCP
            firstInputDelay: 0, // TODO: تنفيذ قياس FID
            cumulativeLayoutShift: 0, // TODO: تنفيذ قياس CLS
            memoryUsage: {
                used: memoryUsage.used || 0,
                total: memoryUsage.total || 0,
                percentage: memoryUsage.percentage || 0,
            },
            requestCount: apiCallEvents.length,
            averageResponseTime,
            errorRate,
        };
    }

    /**
     * الحصول على جميع الأحداث
     */
    static getEvents(): PerformanceEvent[] {
        return [...this.events];
    }

    /**
     * مسح الأحداث
     */
    static clearEvents(): void {
        this.events = [];
    }

    /**
     * تصدير البيانات
     */
    static exportData(): string {
        return JSON.stringify({
            events: this.events,
            metrics: this.getMetrics(),
            timestamp: Date.now(),
        }, null, 2);
    }

    /**
     * إرسال البيانات إلى خدمة المراقبة
     */
    private static sendToMonitoringService(event: PerformanceEvent): void {
        // TODO: تنفيذ إرسال البيانات إلى خدمة المراقبة
        // يمكن استخدام services مثل Sentry, LogRocket, أو خدمة مخصصة

        if (process.env.NODE_ENV === 'development') {
            console.log('Performance Event:', event);
        }
    }

    /**
     * بدء المراقبة التلقائية
     */
    static startAutoMonitoring(): void {
        if (typeof window === 'undefined') return;

        // قياس تحميل الصفحة
        this.measurePageLoad();

        // قياس استخدام الذاكرة كل 30 ثانية
        setInterval(() => {
            this.measureMemoryUsage();
        }, 30000);

        // مراقبة الأخطاء
        window.addEventListener('error', (event) => {
            this.recordEvent({
                type: 'error',
                name: 'javascript_error',
                value: 0,
                unit: 'count',
                metadata: {
                    message: event.message,
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                },
            });
        });

        // مراقبة Promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.recordEvent({
                type: 'error',
                name: 'unhandled_promise_rejection',
                value: 0,
                unit: 'count',
                metadata: {
                    reason: event.reason,
                },
            });
        });
    }
}
