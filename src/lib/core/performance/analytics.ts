/**
 * نظام Analytics وMonitoring
 *
 * هذا الملف يحتوي على نظام شامل للتحليلات
 * ومراقبة الأداء
 */

import { ApiOptimizer } from './api-optimizer';
import { CacheOptimizer } from './cache-optimizer';
import { PerformanceMonitor } from './performance-monitor';

/**
 * نوع الحدث
 */
export type AnalyticsEventType =
    | 'page_view'
    | 'user_action'
    | 'api_call'
    | 'error'
    | 'performance'
    | 'custom';

/**
 * حدث Analytics
 */
export interface AnalyticsEvent {
    /** نوع الحدث */
    type: AnalyticsEventType;
    /** اسم الحدث */
    name: string;
    /** القيمة */
    value?: number;
    /** الخصائص */
    properties?: Record<string, any>;
    /** الطابع الزمني */
    timestamp: number;
    /** معرف المستخدم */
    userId?: string;
    /** معرف الجلسة */
    sessionId?: string;
    /** معرف الطلب */
    requestId?: string;
}

/**
 * مقاييس المستخدم
 */
export interface UserMetrics {
    /** معرف المستخدم */
    userId: string;
    /** عدد الجلسات */
    sessionCount: number;
    /** مدة الجلسة الإجمالية */
    totalSessionDuration: number;
    /** متوسط مدة الجلسة */
    averageSessionDuration: number;
    /** عدد الصفحات المُشاهدة */
    pageViews: number;
    /** عدد الإجراءات */
    actions: number;
    /** عدد الأخطاء */
    errors: number;
    /** معدل الارتداد */
    bounceRate: number;
    /** آخر نشاط */
    lastActivity: number;
}

/**
 * مقاييس التطبيق
 */
export interface AppMetrics {
    /** عدد المستخدمين النشطين */
    activeUsers: number;
    /** عدد الجلسات */
    totalSessions: number;
    /** متوسط مدة الجلسة */
    averageSessionDuration: number;
    /** معدل الأخطاء */
    errorRate: number;
    /** أداء API */
    apiPerformance: {
        averageResponseTime: number;
        successRate: number;
        totalRequests: number;
    };
    /** أداء Cache */
    cachePerformance: {
        hitRate: number;
        missRate: number;
        totalSize: number;
    };
    /** أداء الصفحة */
    pagePerformance: {
        averageLoadTime: number;
        averageFirstContentfulPaint: number;
        averageLargestContentfulPaint: number;
    };
}

/**
 * نظام Analytics
 */
export class Analytics {
    private static events: AnalyticsEvent[] = [];
    private static userMetrics = new Map<string, UserMetrics>();
    private static isEnabled = true;
    private static maxEvents = 10000;
    private static sessionId = this.generateSessionId();
    private static userId: string | null = null;

    /**
     * تفعيل/إلغاء تفعيل Analytics
     */
    static setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
    }

    /**
     * تعيين معرف المستخدم
     */
    static setUserId(userId: string): void {
        this.userId = userId;
    }

    /**
     * تسجيل حدث
     */
    static track(
        type: AnalyticsEventType,
        name: string,
        properties?: Record<string, any>,
        value?: number
    ): void {
        if (!this.isEnabled) return;

        const event: AnalyticsEvent = {
            type,
            name,
            value,
            properties,
            timestamp: Date.now(),
            userId: this.userId || undefined,
            sessionId: this.sessionId,
            requestId: this.generateRequestId(),
        };

        this.events.push(event);

        // الحفاظ على الحد الأقصى للأحداث
        if (this.events.length > this.maxEvents) {
            this.events = this.events.slice(-this.maxEvents);
        }

        // تحديث مقاييس المستخدم
        this.updateUserMetrics(event);

        // إرسال الحدث إلى خدمة التحليلات
        this.sendToAnalyticsService(event);
    }

    /**
     * تتبع عرض الصفحة
     */
    static trackPageView(page: string, properties?: Record<string, any>): void {
        this.track('page_view', 'page_view', {
            page,
            url: typeof window !== 'undefined' ? window.location.href : '',
            referrer: typeof document !== 'undefined' ? document.referrer : '',
            ...properties,
        });
    }

    /**
     * تتبع إجراء المستخدم
     */
    static trackUserAction(
        action: string,
        properties?: Record<string, any>,
        value?: number
    ): void {
        this.track('user_action', action, properties, value);
    }

    /**
     * تتبع استدعاء API
     */
    static trackApiCall(
        endpoint: string,
        method: string,
        duration: number,
        success: boolean,
        statusCode?: number,
        userId?: string
    ): void {
        // حفظ userId الحالي مؤقتاً
        const currentUserId = this.userId;

        // تعيين userId الجديد مؤقتاً
        if (userId) {
            this.userId = userId;
        }

        this.track('api_call', 'api_call', {
            endpoint,
            method,
            success,
            statusCode,
            duration,
        }, duration);

        // استعادة userId الأصلي
        this.userId = currentUserId;
    }

    /**
     * تتبع خطأ
     */
    static trackError(
        error: Error,
        context?: string,
        properties?: Record<string, any>
    ): void {
        this.track('error', 'error', {
            message: error.message,
            stack: error.stack,
            context,
            ...properties,
        });
    }

    /**
     * تتبع أداء
     */
    static trackPerformance(
        metric: string,
        value: number,
        properties?: Record<string, any>
    ): void {
        this.track('performance', metric, properties, value);
    }

    /**
     * تتبع حدث مخصص
     */
    static trackCustom(
        name: string,
        properties?: Record<string, any>,
        value?: number
    ): void {
        this.track('custom', name, properties, value);
    }

    /**
     * الحصول على مقاييس المستخدم
     */
    static getUserMetrics(userId: string): UserMetrics | null {
        return this.userMetrics.get(userId) || null;
    }

    /**
     * الحصول على مقاييس التطبيق
     */
    static getAppMetrics(): AppMetrics {
        const now = Date.now();
        const last24Hours = now - (24 * 60 * 60 * 1000);
        const recentEvents = this.events.filter(event => event.timestamp > last24Hours);

        // حساب المقاييس
        const uniqueUsers = new Set(recentEvents.map(e => e.userId).filter(Boolean)).size;
        const sessions = new Set(recentEvents.map(e => e.sessionId)).size;

        const pageViewEvents = recentEvents.filter(e => e.type === 'page_view');
        const actionEvents = recentEvents.filter(e => e.type === 'user_action');
        const errorEvents = recentEvents.filter(e => e.type === 'error');
        const apiEvents = recentEvents.filter(e => e.type === 'api_call');

        // حساب متوسط مدة الجلسة
        const sessionDurations = this.calculateSessionDurations(recentEvents);
        const averageSessionDuration = sessionDurations.length > 0
            ? sessionDurations.reduce((sum, duration) => sum + duration, 0) / sessionDurations.length
            : 0;

        // حساب أداء API
        const apiPerformance = this.calculateApiPerformance(apiEvents);

        // حساب أداء Cache
        const cacheStats = CacheOptimizer.getStats();
        const cachePerformance = {
            hitRate: cacheStats.hitRate,
            missRate: cacheStats.missRate,
            totalSize: cacheStats.totalSize,
        };

        // حساب أداء الصفحة
        const pagePerformance = this.calculatePagePerformance(recentEvents);

        return {
            activeUsers: uniqueUsers,
            totalSessions: sessions,
            averageSessionDuration,
            errorRate: recentEvents.length > 0 ? (errorEvents.length / recentEvents.length) * 100 : 0,
            apiPerformance,
            cachePerformance,
            pagePerformance,
        };
    }

    /**
     * الحصول على جميع الأحداث
     */
    static getEvents(): AnalyticsEvent[] {
        return [...this.events];
    }

    /**
     * تصدير البيانات
     */
    static exportData(): string {
        return JSON.stringify({
            events: this.events,
            userMetrics: Object.fromEntries(this.userMetrics),
            appMetrics: this.getAppMetrics(),
            performanceMetrics: PerformanceMonitor.getMetrics(),
            cacheStats: CacheOptimizer.getStats(),
            apiStats: ApiOptimizer.getStats(),
            timestamp: Date.now(),
        }, null, 2);
    }

    /**
     * مسح البيانات
     */
    static clearData(): void {
        this.events = [];
        this.userMetrics.clear();
    }

    /**
     * تحديث مقاييس المستخدم
     */
    private static updateUserMetrics(event: AnalyticsEvent): void {
        if (!event.userId) return;

        const existing = this.userMetrics.get(event.userId);
        const now = Date.now();

        if (existing) {
            existing.actions++;
            if (event.type === 'page_view') existing.pageViews++;
            if (event.type === 'error') existing.errors++;
            existing.lastActivity = now;
        } else {
            this.userMetrics.set(event.userId, {
                userId: event.userId,
                sessionCount: 1,
                totalSessionDuration: 0,
                averageSessionDuration: 0,
                pageViews: event.type === 'page_view' ? 1 : 0,
                actions: 1,
                errors: event.type === 'error' ? 1 : 0,
                bounceRate: 0,
                lastActivity: now,
            });
        }
    }

    /**
     * حساب مدة الجلسات
     */
    private static calculateSessionDurations(events: AnalyticsEvent[]): number[] {
        const sessionMap = new Map<string, { start: number; end: number }>();

        events.forEach(event => {
            const session = sessionMap.get(event.sessionId || '') || { start: event.timestamp, end: event.timestamp };
            session.start = Math.min(session.start, event.timestamp);
            session.end = Math.max(session.end, event.timestamp);
            sessionMap.set(event.sessionId || '', session);
        });

        return Array.from(sessionMap.values()).map(session => session.end - session.start);
    }

    /**
     * حساب أداء API
     */
    private static calculateApiPerformance(apiEvents: AnalyticsEvent[]): {
        averageResponseTime: number;
        successRate: number;
        totalRequests: number;
    } {
        if (apiEvents.length === 0) {
            return { averageResponseTime: 0, successRate: 0, totalRequests: 0 };
        }

        const totalRequests = apiEvents.length;
        const successfulRequests = apiEvents.filter(e => e.properties?.success).length;
        const successRate = (successfulRequests / totalRequests) * 100;

        const responseTimes = apiEvents
            .map(e => e.value || 0)
            .filter(time => time > 0);

        const averageResponseTime = responseTimes.length > 0
            ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
            : 0;

        return {
            averageResponseTime,
            successRate,
            totalRequests,
        };
    }

    /**
     * حساب أداء الصفحة
     */
    private static calculatePagePerformance(events: AnalyticsEvent[]): {
        averageLoadTime: number;
        averageFirstContentfulPaint: number;
        averageLargestContentfulPaint: number;
    } {
        const performanceEvents = events.filter(e => e.type === 'performance');

        const loadTimes = performanceEvents
            .filter(e => e.name === 'page_load_time')
            .map(e => e.value || 0);

        const fcpTimes = performanceEvents
            .filter(e => e.name === 'first_contentful_paint')
            .map(e => e.value || 0);

        const lcpTimes = performanceEvents
            .filter(e => e.name === 'largest_contentful_paint')
            .map(e => e.value || 0);

        return {
            averageLoadTime: loadTimes.length > 0 ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length : 0,
            averageFirstContentfulPaint: fcpTimes.length > 0 ? fcpTimes.reduce((sum, time) => sum + time, 0) / fcpTimes.length : 0,
            averageLargestContentfulPaint: lcpTimes.length > 0 ? lcpTimes.reduce((sum, time) => sum + time, 0) / lcpTimes.length : 0,
        };
    }

    /**
     * إنشاء معرف الجلسة
     */
    private static generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    }

    /**
     * إنشاء معرف الطلب
     */
    private static generateRequestId(): string {
        return `req_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    }

    /**
     * إرسال البيانات إلى خدمة التحليلات
     */
    private static sendToAnalyticsService(event: AnalyticsEvent): void {
        // TODO: تنفيذ إرسال البيانات إلى خدمة التحليلات
        // يمكن استخدام Google Analytics, Mixpanel, Amplitude, أو خدمة مخصصة

        if (process.env.NODE_ENV === 'development') {
            console.log('Analytics Event:', event);
        }
    }
}
