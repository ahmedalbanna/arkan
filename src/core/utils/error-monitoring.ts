/**
 * نظام مراقبة وتتبع الأخطاء المتقدم
 * يوفر رؤية شاملة عن الأخطاء وإحصائيات مفصلة
 */

import { EnhancedError, ErrorCategory, ErrorSeverity } from '../types/error-types';

export interface ErrorMetrics {
    totalErrors: number;
    errorsByCategory: Record<ErrorCategory, number>;
    errorsBySeverity: Record<ErrorSeverity, number>;
    errorsByHour: Record<number, number>;
    errorsByDay: Record<string, number>;
    averageResolutionTime: number;
    retrySuccessRate: number;
    fallbackUsageRate: number;
}

export interface ErrorTrend {
    period: 'hour' | 'day' | 'week' | 'month';
    data: Array<{
        timestamp: string;
        count: number;
        category: ErrorCategory;
        severity: ErrorSeverity;
    }>;
}

export interface ErrorAlert {
    id: string;
    type: 'threshold' | 'trend' | 'pattern';
    condition: string;
    threshold?: number;
    isActive: boolean;
    lastTriggered?: string;
    count: number;
}

export class ErrorMonitoringService {
    private static instance: ErrorMonitoringService;
    private errorHistory: Map<string, EnhancedError[]> = new Map();
    private errorMetrics: ErrorMetrics;
    private alerts: Map<string, ErrorAlert> = new Map();
    private trends: Map<string, ErrorTrend> = new Map();
    private isInitialized = false;

    private constructor() {
        this.errorMetrics = this.initializeMetrics();
        this.initializeAlerts();
    }

    static getInstance(): ErrorMonitoringService {
        if (!ErrorMonitoringService.instance) {
            ErrorMonitoringService.instance = new ErrorMonitoringService();
        }
        return ErrorMonitoringService.instance;
    }

    /**
     * تهيئة المقاييس
     */
    private initializeMetrics(): ErrorMetrics {
        return {
            totalErrors: 0,
            errorsByCategory: {} as Record<ErrorCategory, number>,
            errorsBySeverity: {} as Record<ErrorSeverity, number>,
            errorsByHour: {} as Record<number, number>,
            errorsByDay: {} as Record<string, number>,
            averageResolutionTime: 0,
            retrySuccessRate: 0,
            fallbackUsageRate: 0
        };
    }

    /**
     * تهيئة التنبيهات
     */
    private initializeAlerts() {
        // تنبيه للأخطاء الحرجة
        this.alerts.set('critical_errors', {
            id: 'critical_errors',
            type: 'threshold',
            condition: 'critical_errors_count > 5',
            threshold: 5,
            isActive: true,
            count: 0
        });

        // تنبيه لمعدل الأخطاء العالي
        this.alerts.set('high_error_rate', {
            id: 'high_error_rate',
            type: 'threshold',
            condition: 'errors_per_minute > 10',
            threshold: 10,
            isActive: true,
            count: 0
        });

        // تنبيه لأخطاء الذكاء الاصطناعي
        this.alerts.set('ai_errors', {
            id: 'ai_errors',
            type: 'threshold',
            condition: 'ai_errors_count > 3',
            threshold: 3,
            isActive: true,
            count: 0
        });
    }

    /**
     * تسجيل خطأ
     */
    recordError(error: EnhancedError, operationId: string = 'default'): void {
        // إضافة الخطأ إلى التاريخ
        const history = this.errorHistory.get(operationId) || [];
        history.push(error);
        this.errorHistory.set(operationId, history);

        // تحديث المقاييس
        this.updateMetrics(error);

        // التحقق من التنبيهات
        this.checkAlerts(error);

        // تحديث الاتجاهات
        this.updateTrends(error);

        // إرسال إلى خدمة المراقبة الخارجية
        this.sendToExternalService(error);
    }

    /**
     * تحديث المقاييس
     */
    private updateMetrics(error: EnhancedError): void {
        this.errorMetrics.totalErrors++;

        // تحديث الأخطاء حسب الفئة
        this.errorMetrics.errorsByCategory[error.category] =
            (this.errorMetrics.errorsByCategory[error.category] || 0) + 1;

        // تحديث الأخطاء حسب الشدة
        this.errorMetrics.errorsBySeverity[error.severity] =
            (this.errorMetrics.errorsBySeverity[error.severity] || 0) + 1;

        // تحديث الأخطاء حسب الساعة
        const hour = new Date(error.timestamp).getHours();
        this.errorMetrics.errorsByHour[hour] =
            (this.errorMetrics.errorsByHour[hour] || 0) + 1;

        // تحديث الأخطاء حسب اليوم
        const day = new Date(error.timestamp).toISOString().split('T')[0];
        this.errorMetrics.errorsByDay[day] =
            (this.errorMetrics.errorsByDay[day] || 0) + 1;
    }

    /**
     * التحقق من التنبيهات
     */
    private checkAlerts(error: EnhancedError): void {
        for (const alert of this.alerts.values()) {
            if (!alert.isActive) continue;

            let shouldTrigger = false;

            switch (alert.id) {
                case 'critical_errors':
                    if (error.severity === 'critical') {
                        alert.count++;
                        shouldTrigger = alert.count > (alert.threshold || 0);
                    }
                    break;

                case 'high_error_rate':
                    const recentErrors = this.getRecentErrors(5); // آخر 5 دقائق
                    shouldTrigger = recentErrors.length > (alert.threshold || 0);
                    break;

                case 'ai_errors':
                    if (error.category === 'ai_generation') {
                        alert.count++;
                        shouldTrigger = alert.count > (alert.threshold || 0);
                    }
                    break;
            }

            if (shouldTrigger) {
                this.triggerAlert(alert, error);
            }
        }
    }

    /**
     * تفعيل التنبيه
     */
    private triggerAlert(alert: ErrorAlert, error: EnhancedError): void {
        alert.lastTriggered = new Date().toISOString();

        console.warn(`[Error Alert] ${alert.id}: ${alert.condition}`, {
            error: error.code,
            category: error.category,
            severity: error.severity,
            timestamp: error.timestamp
        });

        // إرسال تنبيه للمطورين
        this.sendAlertNotification(alert, error);
    }

    /**
     * تحديث الاتجاهات
     */
    private updateTrends(error: EnhancedError): void {
        const now = new Date();
        const hourKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;

        if (!this.trends.has(hourKey)) {
            this.trends.set(hourKey, {
                period: 'hour',
                data: []
            });
        }

        const trend = this.trends.get(hourKey)!;
        trend.data.push({
            timestamp: error.timestamp,
            count: 1,
            category: error.category,
            severity: error.severity
        });
    }

    /**
     * إرسال إلى خدمة المراقبة الخارجية
     */
    private sendToExternalService(error: EnhancedError): void {
        // إرسال إلى Google Analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'exception', {
                description: error.message,
                fatal: error.severity === 'critical',
                custom_map: {
                    error_code: error.code,
                    error_category: error.category,
                    error_severity: error.severity,
                    error_retryable: error.isRetryable,
                    error_fallback: error.fallbackAvailable
                }
            });
        }

        // إرسال إلى Firebase Crashlytics (إذا كان متاحاً)
        if (typeof window !== 'undefined' && (window as any).firebase?.crashlytics) {
            (window as any).firebase.crashlytics().recordError(new Error(error.message), {
                code: error.code,
                category: error.category,
                severity: error.severity
            });
        }
    }

    /**
     * إرسال تنبيه للمطورين
     */
    private sendAlertNotification(alert: ErrorAlert, error: EnhancedError): void {
        // يمكن إضافة تكامل مع خدمات التنبيه مثل Slack أو Discord
        console.error(`[CRITICAL ALERT] ${alert.id}`, {
            alert: alert.condition,
            error: {
                code: error.code,
                category: error.category,
                severity: error.severity,
                message: error.message
            },
            timestamp: new Date().toISOString()
        });
    }

    /**
     * الحصول على الأخطاء الحديثة
     */
    private getRecentErrors(minutes: number): EnhancedError[] {
        const cutoff = new Date(Date.now() - minutes * 60 * 1000);
        const recentErrors: EnhancedError[] = [];

        for (const history of this.errorHistory.values()) {
            for (const error of history) {
                if (new Date(error.timestamp) > cutoff) {
                    recentErrors.push(error);
                }
            }
        }

        return recentErrors;
    }

    /**
     * الحصول على المقاييس
     */
    getMetrics(): ErrorMetrics {
        return { ...this.errorMetrics };
    }

    /**
     * الحصول على الاتجاهات
     */
    getTrends(period: 'hour' | 'day' | 'week' | 'month' = 'day'): ErrorTrend[] {
        const trends: ErrorTrend[] = [];

        for (const trend of this.trends.values()) {
            if (trend.period === period) {
                trends.push(trend);
            }
        }

        return trends;
    }

    /**
     * الحصول على التنبيهات
     */
    getAlerts(): ErrorAlert[] {
        return Array.from(this.alerts.values());
    }

    /**
     * الحصول على تاريخ الأخطاء
     */
    getErrorHistory(operationId?: string): EnhancedError[] {
        if (operationId) {
            return this.errorHistory.get(operationId) || [];
        }

        const allErrors: EnhancedError[] = [];
        for (const history of this.errorHistory.values()) {
            allErrors.push(...history);
        }

        return allErrors.sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    }

    /**
     * الحصول على إحصائيات مفصلة
     */
    getDetailedStats(): {
        metrics: ErrorMetrics;
        trends: ErrorTrend[];
        alerts: ErrorAlert[];
        topErrors: Array<{ code: string; count: number; category: ErrorCategory }>;
        errorDistribution: Record<string, number>;
    } {
        const metrics = this.getMetrics();
        const trends = this.getTrends();
        const alerts = this.getAlerts();

        // الأخطاء الأكثر شيوعاً
        const errorCounts = new Map<string, { count: number; category: ErrorCategory }>();
        for (const history of this.errorHistory.values()) {
            for (const error of history) {
                const key = error.code;
                const existing = errorCounts.get(key);
                if (existing) {
                    existing.count++;
                } else {
                    errorCounts.set(key, { count: 1, category: error.category });
                }
            }
        }

        const topErrors = Array.from(errorCounts.entries())
            .map(([code, data]) => ({ code, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // توزيع الأخطاء
        const errorDistribution: Record<string, number> = {};
        for (const [category, count] of Object.entries(metrics.errorsByCategory)) {
            errorDistribution[category] = count;
        }

        return {
            metrics,
            trends,
            alerts,
            topErrors,
            errorDistribution
        };
    }

    /**
     * مسح البيانات القديمة
     */
    cleanup(daysToKeep: number = 30): void {
        const cutoff = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

        for (const [operationId, history] of this.errorHistory.entries()) {
            const filteredHistory = history.filter(error =>
                new Date(error.timestamp) > cutoff
            );

            if (filteredHistory.length === 0) {
                this.errorHistory.delete(operationId);
            } else {
                this.errorHistory.set(operationId, filteredHistory);
            }
        }

        // مسح الاتجاهات القديمة
        for (const [key, trend] of this.trends.entries()) {
            const filteredData = trend.data.filter(item =>
                new Date(item.timestamp) > cutoff
            );

            if (filteredData.length === 0) {
                this.trends.delete(key);
            } else {
                this.trends.set(key, { ...trend, data: filteredData });
            }
        }
    }

    /**
     * تصدير البيانات
     */
    exportData(): {
        metrics: ErrorMetrics;
        trends: ErrorTrend[];
        alerts: ErrorAlert[];
        errorHistory: Record<string, EnhancedError[]>;
    } {
        return {
            metrics: this.getMetrics(),
            trends: this.getTrends(),
            alerts: this.getAlerts(),
            errorHistory: Object.fromEntries(this.errorHistory)
        };
    }

    /**
     * استيراد البيانات
     */
    importData(data: {
        metrics: ErrorMetrics;
        trends: ErrorTrend[];
        alerts: ErrorAlert[];
        errorHistory: Record<string, EnhancedError[]>;
    }): void {
        this.errorMetrics = data.metrics;
        this.trends = new Map(data.trends.map(trend => [trend.period, trend]));
        this.alerts = new Map(data.alerts.map(alert => [alert.id, alert]));
        this.errorHistory = new Map(Object.entries(data.errorHistory));
    }
}
