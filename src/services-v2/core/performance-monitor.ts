/**
 * مراقبة الأداء المتقدمة - Performance Monitor v2.0
 *
 * نظام مراقبة شامل للأداء مع تحليلات متقدمة وتوصيات ذكية
 */

export interface PerformanceMetric {
    name: string;
    value: number;
    unit: string;
    timestamp: Date;
    tags?: Record<string, string>;
    metadata?: Record<string, any>;
}

export interface PerformanceSnapshot {
    timestamp: Date;
    metrics: Record<string, number>;
    memory: {
        used: number;
        total: number;
        percentage: number;
    };
    cpu: {
        usage: number;
        temperature?: number;
    };
    network?: {
        requests: number;
        errors: number;
        averageResponseTime: number;
    };
    customMetrics: Record<string, number>;
}

export interface PerformanceThreshold {
    metric: string;
    warning: number;
    critical: number;
    action: 'log' | 'alert' | 'restart' | 'scale';
}

export interface PerformanceAlert {
    id: string;
    type: 'warning' | 'critical' | 'info';
    metric: string;
    value: number;
    threshold: number;
    message: string;
    timestamp: Date;
    resolved?: boolean;
    resolution?: string;
}

export interface PerformanceReport {
    period: {
        start: Date;
        end: Date;
    };
    summary: {
        averageResponseTime: number;
        totalRequests: number;
        errorRate: number;
        uptime: number;
    };
    trends: Array<{
        timestamp: Date;
        responseTime: number;
        errorRate: number;
        throughput: number;
    }>;
    recommendations: string[];
    bottlenecks: Array<{
        metric: string;
        impact: number;
        suggestion: string;
    }>;
}

export interface PerformanceConfig {
    enableMetrics: boolean;
    enableAlerts: boolean;
    enableReporting: boolean;
    collectionInterval: number; // بالثواني
    retentionPeriod: number; // بالأيام
    thresholds: PerformanceThreshold[];
    alertEndpoints?: string[];
    enableAutoScaling: boolean;
    scalingRules?: Array<{
        metric: string;
        operator: '>' | '<' | '>=' | '<=';
        value: number;
        action: string;
        cooldown: number; // بالثواني
    }>;
}

export class AdvancedPerformanceMonitor {
    private config: Required<PerformanceConfig>;
    private metrics: Map<string, PerformanceMetric[]> = new Map();
    private snapshots: PerformanceSnapshot[] = [];
    private alerts: PerformanceAlert[] = [];
    private thresholds: Map<string, PerformanceThreshold> = new Map();
    private collectionTimer?: NodeJS.Timeout;
    private isMonitoring = false;

    constructor(config: Partial<PerformanceConfig> = {}) {
        this.config = {
            enableMetrics: config.enableMetrics ?? true,
            enableAlerts: config.enableAlerts ?? true,
            enableReporting: config.enableReporting ?? true,
            collectionInterval: config.collectionInterval || 60, // كل دقيقة
            retentionPeriod: config.retentionPeriod || 30, // 30 يوماً
            thresholds: config.thresholds || [],
            alertEndpoints: config.alertEndpoints || [],
            enableAutoScaling: config.enableAutoScaling ?? false,
            scalingRules: config.scalingRules || []
        };

        this.setupThresholds();
        this.startMonitoring();
    }

    /**
     * تسجيل مقياس أداء
     */
    recordMetric(name: string, value: number, unit: string = 'ms', tags?: Record<string, string>): void {
        if (!this.config.enableMetrics) return;

        const metric: PerformanceMetric = {
            name,
            value,
            unit,
            timestamp: new Date(),
            tags,
            metadata: {
                recordedBy: 'performance-monitor',
                version: '2.0'
            }
        };

        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }

        const metrics = this.metrics.get(name)!;
        metrics.push(metric);

        // الاحتفاظ بالمقاييس للفترة المحددة فقط
        const cutoffDate = new Date(Date.now() - this.config.retentionPeriod * 24 * 60 * 60 * 1000);
        this.metrics.set(name, metrics.filter(m => m.timestamp > cutoffDate));

        // فحص العتبات
        this.checkThresholds(name, value);
    }

    /**
     * تسجيل لقطة أداء شاملة
     */
    recordSnapshot(customMetrics?: Record<string, number>): void {
        const snapshot: PerformanceSnapshot = {
            timestamp: new Date(),
            metrics: {},
            memory: this.getMemoryInfo(),
            cpu: this.getCpuInfo(),
            network: this.getNetworkInfo(),
            customMetrics: customMetrics || {}
        };

        // جمع المقاييس الأساسية
        for (const [name, metrics] of this.metrics) {
            if (metrics.length > 0) {
                const latest = metrics[metrics.length - 1];
                snapshot.metrics[name] = latest.value;
            }
        }

        this.snapshots.push(snapshot);

        // الاحتفاظ باللقطات للفترة المحددة فقط
        const cutoffDate = new Date(Date.now() - this.config.retentionPeriod * 24 * 60 * 60 * 1000);
        this.snapshots = this.snapshots.filter(s => s.timestamp > cutoffDate);
    }

    /**
     * بدء مراقبة الأداء
     */
    startMonitoring(): void {
        if (this.isMonitoring) return;

        this.isMonitoring = true;

        this.collectionTimer = setInterval(() => {
            this.collectSystemMetrics();
            this.recordSnapshot();
        }, this.config.collectionInterval * 1000);
    }

    /**
     * إيقاف مراقبة الأداء
     */
    stopMonitoring(): void {
        if (this.collectionTimer) {
            clearInterval(this.collectionTimer);
            this.collectionTimer = undefined;
        }
        this.isMonitoring = false;
    }

    /**
     * قياس وقت تنفيذ عملية
     */
    async measureOperation<T>(
        name: string,
        operation: () => Promise<T>,
        tags?: Record<string, string>
    ): Promise<{ result: T; duration: number; metrics: Record<string, number> }> {
        const startTime = performance.now();
        const startMemory = this.getMemoryUsage();

        try {
            const result = await operation();
            const endTime = performance.now();
            const endMemory = this.getMemoryUsage();

            const duration = endTime - startTime;
            const memoryDelta = endMemory - startMemory;

            this.recordMetric(`${name}_duration`, duration, 'ms', { ...tags, operation: name });
            this.recordMetric(`${name}_memory_delta`, memoryDelta, 'bytes', { ...tags, operation: name });

            return {
                result,
                duration,
                metrics: {
                    duration,
                    memoryDelta,
                    startMemory,
                    endMemory
                }
            };
        } catch (error) {
            const endTime = performance.now();
            const duration = endTime - startTime;

            this.recordMetric(`${name}_duration`, duration, 'ms', { ...tags, operation: name, error: 'true' });

            throw error;
        }
    }

    /**
     * الحصول على إحصائيات الأداء
     */
    getPerformanceStats(): {
        totalMetrics: number;
        totalSnapshots: number;
        activeAlerts: number;
        averageResponseTime: number;
        errorRate: number;
        uptime: number;
    } {
        const totalMetrics = Array.from(this.metrics.values()).reduce((sum, metrics) => sum + metrics.length, 0);
        const activeAlerts = this.alerts.filter(alert => !alert.resolved).length;

        // حساب متوسط وقت الاستجابة
        const responseTimeMetrics = this.metrics.get('response_time') || [];
        const averageResponseTime = responseTimeMetrics.length > 0
            ? responseTimeMetrics.reduce((sum, metric) => sum + metric.value, 0) / responseTimeMetrics.length
            : 0;

        // حساب معدل الأخطاء
        const errorMetrics = this.metrics.get('error_count') || [];
        const totalErrors = errorMetrics.reduce((sum, metric) => sum + metric.value, 0);
        const totalRequests = this.metrics.get('request_count')?.reduce((sum, metric) => sum + metric.value, 0) || 1;
        const errorRate = totalRequests > 0 ? totalErrors / totalRequests : 0;

        return {
            totalMetrics,
            totalSnapshots: this.snapshots.length,
            activeAlerts,
            averageResponseTime,
            errorRate,
            uptime: this.calculateUptime()
        };
    }

    /**
     * توليد تقرير أداء
     */
    generateReport(timeRange: { start: Date; end: Date }): PerformanceReport {
        const filteredSnapshots = this.snapshots.filter(
            snapshot => snapshot.timestamp >= timeRange.start && snapshot.timestamp <= timeRange.end
        );

        if (filteredSnapshots.length === 0) {
            return this.createEmptyReport(timeRange);
        }

        const summary = this.calculateSummaryStats(filteredSnapshots);
        const trends = this.calculateTrends(filteredSnapshots);
        const recommendations = this.generateRecommendations(filteredSnapshots);
        const bottlenecks = this.identifyBottlenecks(filteredSnapshots);

        return {
            period: timeRange,
            summary,
            trends,
            recommendations,
            bottlenecks
        };
    }

    /**
     * إضافة عتبة أداء
     */
    addThreshold(threshold: PerformanceThreshold): void {
        this.thresholds.set(threshold.metric, threshold);
        this.config.thresholds.push(threshold);
    }

    /**
     * إزالة عتبة أداء
     */
    removeThreshold(metric: string): void {
        this.thresholds.delete(metric);
        this.config.thresholds = this.config.thresholds.filter(t => t.metric !== metric);
    }

    /**
     * الحصول على التنبيهات النشطة
     */
    getActiveAlerts(): PerformanceAlert[] {
        return this.alerts.filter(alert => !alert.resolved);
    }

    /**
     * حل تنبيه
     */
    resolveAlert(alertId: string, resolution?: string): void {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.resolved = true;
            alert.resolution = resolution;
        }
    }

    /**
     * تصدير البيانات
     */
    exportData(format: 'json' | 'csv' = 'json'): string {
        const data = {
            metrics: Object.fromEntries(this.metrics),
            snapshots: this.snapshots,
            alerts: this.alerts,
            config: this.config,
            exportedAt: new Date()
        };

        if (format === 'csv') {
            // تحويل إلى CSV
            const headers = ['timestamp', 'metric', 'value', 'unit'];
            const rows: string[] = [];

            for (const [metricName, metrics] of this.metrics) {
                for (const metric of metrics) {
                    rows.push([
                        metric.timestamp.toISOString(),
                        metricName,
                        metric.value.toString(),
                        metric.unit
                    ].join(','));
                }
            }

            return [headers.join(','), ...rows].join('\n');
        }

        return JSON.stringify(data, null, 2);
    }

    // الطرق المساعدة الخاصة

    private collectSystemMetrics(): void {
        // جمع مقاييس النظام الأساسية
        this.recordMetric('memory_usage', this.getMemoryUsage(), 'bytes');
        this.recordMetric('cpu_usage', this.getCpuUsage(), 'percentage');

        if (typeof window !== 'undefined') {
            this.recordMetric('page_load_time', performance.now(), 'ms');
            this.recordMetric('dom_elements', document.querySelectorAll('*').length, 'count');
        }
    }

    private checkThresholds(metricName: string, value: number): void {
        const threshold = this.thresholds.get(metricName);
        if (!threshold) return;

        if (value >= threshold.critical) {
            this.createAlert('critical', metricName, value, threshold.critical, `Critical threshold exceeded for ${metricName}`);
        } else if (value >= threshold.warning) {
            this.createAlert('warning', metricName, value, threshold.warning, `Warning threshold exceeded for ${metricName}`);
        }
    }

    private createAlert(type: 'warning' | 'critical' | 'info', metric: string, value: number, threshold: number, message: string): void {
        const alert: PerformanceAlert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            metric,
            value,
            threshold,
            message,
            timestamp: new Date()
        };

        this.alerts.push(alert);

        if (this.config.enableAlerts) {
            this.sendAlert(alert);
        }
    }

    private sendAlert(alert: PerformanceAlert): void {
        // إرسال التنبيه إلى نقاط النهاية المحددة
        this.config.alertEndpoints?.forEach(endpoint => {
            fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(alert)
            }).catch(error => {
                console.error('Failed to send alert:', error);
            });
        });

        // تسجيل في نظام التسجيل
        const { logger } = require('./logger');
        logger.warn(`Performance Alert: ${alert.message}`, {
            alertId: alert.id,
            metric: alert.metric,
            value: alert.value,
            threshold: alert.threshold
        }, ['performance', 'alert']);
    }

    private setupThresholds(): void {
        this.config.thresholds.forEach(threshold => {
            this.thresholds.set(threshold.metric, threshold);
        });
    }

    private calculateSummaryStats(snapshots: PerformanceSnapshot[]) {
        const responseTimes = snapshots.map(s => s.metrics.response_time || 0).filter(t => t > 0);
        const errors = snapshots.map(s => s.metrics.error_count || 0);
        const requests = snapshots.map(s => s.metrics.request_count || 0);

        const averageResponseTime = responseTimes.length > 0
            ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
            : 0;

        const totalErrors = errors.reduce((sum, error) => sum + error, 0);
        const totalRequests = requests.reduce((sum, request) => sum + request, 0);
        const errorRate = totalRequests > 0 ? totalErrors / totalRequests : 0;

        return {
            averageResponseTime,
            totalRequests,
            errorRate,
            uptime: this.calculateUptime(snapshots)
        };
    }

    private calculateTrends(snapshots: PerformanceSnapshot[]) {
        return snapshots.map(snapshot => ({
            timestamp: snapshot.timestamp,
            responseTime: snapshot.metrics.response_time || 0,
            errorRate: (snapshot.metrics.error_count || 0) / Math.max(snapshot.metrics.request_count || 1, 1),
            throughput: snapshot.metrics.request_count || 0
        }));
    }

    private generateRecommendations(snapshots: PerformanceSnapshot[]): string[] {
        const recommendations: string[] = [];

        const avgMemory = snapshots.reduce((sum, s) => sum + s.memory.percentage, 0) / snapshots.length;
        if (avgMemory > 80) {
            recommendations.push('Consider optimizing memory usage or increasing available memory');
        }

        const avgCpu = snapshots.reduce((sum, s) => sum + s.cpu.usage, 0) / snapshots.length;
        if (avgCpu > 70) {
            recommendations.push('High CPU usage detected. Consider optimizing algorithms or scaling horizontally');
        }

        const avgResponseTime = snapshots.reduce((sum, s) => sum + (s.metrics.response_time || 0), 0) / snapshots.length;
        if (avgResponseTime > 1000) {
            recommendations.push('Response time is above 1 second. Consider caching or optimization');
        }

        return recommendations;
    }

    private identifyBottlenecks(snapshots: PerformanceSnapshot[]) {
        const bottlenecks: Array<{ metric: string; impact: number; suggestion: string }> = [];

        // تحليل الاختناقات بناءً على البيانات
        const highMemorySnapshots = snapshots.filter(s => s.memory.percentage > 85).length;
        if (highMemorySnapshots > snapshots.length * 0.3) {
            bottlenecks.push({
                metric: 'memory_usage',
                impact: 0.8,
                suggestion: 'Memory usage is consistently high. Consider implementing memory pooling or increasing server capacity.'
            });
        }

        return bottlenecks;
    }

    private calculateUptime(snapshots?: PerformanceSnapshot[]): number {
        if (!snapshots || snapshots.length === 0) return 100;

        const errors = snapshots.filter(s => (s.metrics.error_count || 0) > 0).length;
        return Math.max(0, 100 - (errors / snapshots.length) * 100);
    }

    private createEmptyReport(timeRange: { start: Date; end: Date }): PerformanceReport {
        return {
            period: timeRange,
            summary: {
                averageResponseTime: 0,
                totalRequests: 0,
                errorRate: 0,
                uptime: 100
            },
            trends: [],
            recommendations: ['No data available for the selected time range'],
            bottlenecks: []
        };
    }

    private getMemoryInfo() {
        if (typeof window !== 'undefined' && 'memory' in performance) {
            const memory = (performance as any).memory;
            return {
                used: memory.usedJSHeapSize,
                total: memory.totalJSHeapSize,
                percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
            };
        }

        return { used: 0, total: 0, percentage: 0 };
    }

    private getCpuInfo() {
        // في البيئة الحقيقية، سنستخدم APIs مختلفة للحصول على معلومات CPU
        return { usage: 0, temperature: undefined };
    }

    private getNetworkInfo() {
        // في البيئة الحقيقية، سنستخدم Performance API للحصول على معلومات الشبكة
        return {
            requests: 0,
            errors: 0,
            averageResponseTime: 0
        };
    }

    private getMemoryUsage(): number {
        if (typeof window !== 'undefined' && 'memory' in performance) {
            return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
    }

    private getCpuUsage(): number {
        // تقدير بسيط لاستخدام CPU بناءً على وقت المعالجة
        return Math.min(100, performance.now() / 10);
    }

    /**
     * إغلاق مراقب الأداء
     */
    close(): void {
        this.stopMonitoring();
    }
}

/**
 * مثيل عام لمراقب الأداء
 */
export const performanceMonitor = new AdvancedPerformanceMonitor();

/**
 * دالة مساعدة للحصول على مراقب الأداء
 */
export function getPerformanceMonitor(): AdvancedPerformanceMonitor {
    return performanceMonitor;
}