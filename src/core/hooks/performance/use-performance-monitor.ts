/**
 * نظام مراقبة الأداء الشامل
 * يوفر مراقبة شاملة للأداء مع تحليل مفصل وإحصائيات متقدمة
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface PerformanceMetric {
    name: string;
    value: number;
    unit: string;
    timestamp: number;
    category: 'memory' | 'cpu' | 'network' | 'rendering' | 'ai' | 'custom';
    tags?: Record<string, string>;
}

export interface PerformanceThreshold {
    metric: string;
    warning: number;
    critical: number;
    unit: string;
}

export interface PerformanceAlert {
    id: string;
    metric: string;
    value: number;
    threshold: number;
    severity: 'warning' | 'critical';
    timestamp: number;
    message: string;
    resolved?: boolean;
}

export interface PerformanceReport {
    timestamp: number;
    duration: number;
    metrics: PerformanceMetric[];
    alerts: PerformanceAlert[];
    summary: {
        overallScore: number;
        memoryScore: number;
        cpuScore: number;
        networkScore: number;
        renderingScore: number;
        aiScore: number;
    };
    recommendations: string[];
}

export interface PerformanceMonitorConfig {
    enableMemoryMonitoring?: boolean;
    enableCPUMonitoring?: boolean;
    enableNetworkMonitoring?: boolean;
    enableRenderingMonitoring?: boolean;
    enableAIMonitoring?: boolean;
    samplingInterval?: number;
    maxMetricsHistory?: number;
    thresholds?: PerformanceThreshold[];
    enableAlerts?: boolean;
    enableReporting?: boolean;
}

export interface PerformanceMonitor {
    // المراقبة الأساسية
    startMonitoring: () => void;
    stopMonitoring: () => void;
    isMonitoring: boolean;

    // إضافة المقاييس
    addMetric: (metric: Omit<PerformanceMetric, 'timestamp'>) => void;
    addCustomMetric: (name: string, value: number, unit: string, tags?: Record<string, string>) => void;

    // الحصول على البيانات
    getMetrics: (category?: string, timeRange?: { start: number; end: number }) => PerformanceMetric[];
    getCurrentMetrics: () => PerformanceMetric[];
    getAlerts: (severity?: 'warning' | 'critical') => PerformanceAlert[];

    // التقارير والتحليل
    generateReport: (timeRange?: { start: number; end: number }) => PerformanceReport;
    getPerformanceScore: () => number;
    getRecommendations: () => string[];

    // إدارة التنبيهات
    clearAlerts: () => void;
    resolveAlert: (alertId: string) => void;

    // الإحصائيات
    getStats: () => {
        totalMetrics: number;
        activeAlerts: number;
        averageScore: number;
        monitoringDuration: number;
    };
}

/**
 * Hook لمراقبة الأداء الشاملة
 */
export function usePerformanceMonitor(config: PerformanceMonitorConfig = {}): PerformanceMonitor {
    const {
        enableMemoryMonitoring = true,
        enableCPUMonitoring = true,
        enableNetworkMonitoring = true,
        enableRenderingMonitoring = true,
        enableAIMonitoring = true,
        samplingInterval = 1000,
        maxMetricsHistory = 1000,
        thresholds = [],
        enableAlerts = true,
        enableReporting = true
    } = config;

    const [isMonitoring, setIsMonitoring] = useState(false);
    const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
    const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
    const [startTime, setStartTime] = useState<number>(0);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const observerRef = useRef<PerformanceObserver | null>(null);

    // إضافة مقياس جديد
    const addMetric = useCallback((metric: Omit<PerformanceMetric, 'timestamp'>) => {
        const newMetric: PerformanceMetric = {
            ...metric,
            timestamp: Date.now()
        };

        setMetrics(prev => {
            const updated = [...prev, newMetric];
            return updated.slice(-maxMetricsHistory);
        });

        // فحص العتبات
        if (enableAlerts) {
            const threshold = thresholds.find(t => t.metric === metric.name);
            if (threshold) {
                let severity: 'warning' | 'critical' | null = null;

                if (metric.value >= threshold.critical) {
                    severity = 'critical';
                } else if (metric.value >= threshold.warning) {
                    severity = 'warning';
                }

                if (severity) {
                    const alert: PerformanceAlert = {
                        id: `${metric.name}_${Date.now()}`,
                        metric: metric.name,
                        value: metric.value,
                        threshold: severity === 'critical' ? threshold.critical : threshold.warning,
                        severity,
                        timestamp: Date.now(),
                        message: `${metric.name} exceeded ${severity} threshold: ${metric.value}${metric.unit}`
                    };

                    setAlerts(prev => [...prev, alert]);
                }
            }
        }
    }, [maxMetricsHistory, enableAlerts, thresholds]);

    // إضافة مقياس مخصص
    const addCustomMetric = useCallback((
        name: string,
        value: number,
        unit: string,
        tags?: Record<string, string>
    ) => {
        addMetric({
            name,
            value,
            unit,
            category: 'custom',
            tags
        });
    }, [addMetric]);

    // مراقبة الذاكرة
    const monitorMemory = useCallback(() => {
        if (!enableMemoryMonitoring || typeof window === 'undefined') return;

        if ('memory' in performance) {
            const memory = (performance as any).memory;

            addMetric({
                name: 'memory-used',
                value: memory.usedJSHeapSize / (1024 * 1024), // MB
                unit: 'MB',
                category: 'memory'
            });

            addMetric({
                name: 'memory-total',
                value: memory.totalJSHeapSize / (1024 * 1024), // MB
                unit: 'MB',
                category: 'memory'
            });

            addMetric({
                name: 'memory-limit',
                value: memory.jsHeapSizeLimit / (1024 * 1024), // MB
                unit: 'MB',
                category: 'memory'
            });
        }
    }, [enableMemoryMonitoring, addMetric]);

    // مراقبة الأداء العام
    const monitorPerformance = useCallback(() => {
        if (!enableCPUMonitoring || typeof window === 'undefined') return;

        // مراقبة وقت الاستجابة
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
            addMetric({
                name: 'page-load-time',
                value: navigation.loadEventEnd - navigation.loadEventStart,
                unit: 'ms',
                category: 'rendering'
            });

            addMetric({
                name: 'dom-content-loaded',
                value: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                unit: 'ms',
                category: 'rendering'
            });
        }

        // مراقبة العمليات الطويلة
        const longTasks = performance.getEntriesByType('longtask');
        addMetric({
            name: 'long-tasks-count',
            value: longTasks.length,
            unit: 'count',
            category: 'cpu'
        });

        if (longTasks.length > 0) {
            const totalLongTaskTime = longTasks.reduce((sum, task) => sum + task.duration, 0);
            addMetric({
                name: 'long-tasks-duration',
                value: totalLongTaskTime,
                unit: 'ms',
                category: 'cpu'
            });
        }
    }, [enableCPUMonitoring, enableRenderingMonitoring, addMetric]);

    // مراقبة الشبكة
    const monitorNetwork = useCallback(() => {
        if (!enableNetworkMonitoring || typeof window === 'undefined') return;

        const networkEntries = performance.getEntriesByType('resource');
        const recentEntries = networkEntries.filter(entry =>
            Date.now() - entry.startTime < 5000 // آخر 5 ثوان
        );

        addMetric({
            name: 'network-requests',
            value: recentEntries.length,
            unit: 'count',
            category: 'network'
        });

        if (recentEntries.length > 0) {
            const averageResponseTime = recentEntries.reduce((sum, entry) => {
                const resourceEntry = entry as PerformanceResourceTiming;
                return sum + (resourceEntry.responseEnd - resourceEntry.requestStart);
            }, 0) / recentEntries.length;

            addMetric({
                name: 'average-response-time',
                value: averageResponseTime,
                unit: 'ms',
                category: 'network'
            });
        }
    }, [enableNetworkMonitoring, addMetric]);

    // مراقبة التصيير
    const monitorRendering = useCallback(() => {
        if (!enableRenderingMonitoring || typeof window === 'undefined') return;

        // مراقبة FPS (تقدير)
        const now = performance.now();
        const frameTime = now - (window as any).lastFrameTime || 16;
        (window as any).lastFrameTime = now;

        const fps = 1000 / frameTime;
        addMetric({
            name: 'fps',
            value: fps,
            unit: 'fps',
            category: 'rendering'
        });

        // مراقبة استخدام GPU (إذا كان متاحاً)
        if ('gpu' in performance) {
            const gpu = (performance as any).gpu;
            addMetric({
                name: 'gpu-memory-used',
                value: gpu.memoryUsed || 0,
                unit: 'MB',
                category: 'rendering'
            });
        }
    }, [enableRenderingMonitoring, addMetric]);

    // مراقبة الذكاء الاصطناعي
    const monitorAI = useCallback(() => {
        if (!enableAIMonitoring) return;

        // مراقبة عمليات AI (سيتم إضافتها من الخارج)
        addMetric({
            name: 'ai-operations-active',
            value: 0, // سيتم تحديثها من الخارج
            unit: 'count',
            category: 'ai'
        });
    }, [enableAIMonitoring, addMetric]);

    // دورة المراقبة الرئيسية
    const monitoringCycle = useCallback(() => {
        monitorMemory();
        monitorPerformance();
        monitorNetwork();
        monitorRendering();
        monitorAI();
    }, [monitorMemory, monitorPerformance, monitorNetwork, monitorRendering, monitorAI]);

    // بدء المراقبة
    const startMonitoring = useCallback(() => {
        if (isMonitoring) return;

        setIsMonitoring(true);
        setStartTime(Date.now());

        // إعداد Performance Observer
        if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
            observerRef.current = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'measure') {
                        addMetric({
                            name: `measure-${entry.name}`,
                            value: entry.duration,
                            unit: 'ms',
                            category: 'custom'
                        });
                    }
                }
            });

            observerRef.current.observe({ entryTypes: ['measure'] });
        }

        // بدء المراقبة الدورية
        intervalRef.current = setInterval(monitoringCycle, samplingInterval);
    }, [isMonitoring, monitoringCycle, samplingInterval, addMetric]);

    // إيقاف المراقبة
    const stopMonitoring = useCallback(() => {
        if (!isMonitoring) return;

        setIsMonitoring(false);

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }
    }, [isMonitoring]);

    // الحصول على المقاييس
    const getMetrics = useCallback((
        category?: string,
        timeRange?: { start: number; end: number }
    ) => {
        let filteredMetrics = metrics;

        if (category) {
            filteredMetrics = filteredMetrics.filter(m => m.category === category);
        }

        if (timeRange) {
            filteredMetrics = filteredMetrics.filter(m =>
                m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
            );
        }

        return filteredMetrics;
    }, [metrics]);

    // الحصول على المقاييس الحالية
    const getCurrentMetrics = useCallback(() => {
        const now = Date.now();
        const recentThreshold = 5000; // آخر 5 ثوان

        return metrics.filter(m => now - m.timestamp < recentThreshold);
    }, [metrics]);

    // الحصول على التنبيهات
    const getAlerts = useCallback((severity?: 'warning' | 'critical') => {
        let filteredAlerts = alerts.filter(alert => !alert.resolved);

        if (severity) {
            filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
        }

        return filteredAlerts;
    }, [alerts]);

    // حساب نقاط الأداء
    const getPerformanceScore = useCallback(() => {
        const currentMetrics = getCurrentMetrics();
        if (currentMetrics.length === 0) return 100;

        let totalScore = 0;
        let metricCount = 0;

        // حساب نقاط الذاكرة
        const memoryMetrics = currentMetrics.filter(m => m.category === 'memory');
        if (memoryMetrics.length > 0) {
            const memoryUsed = memoryMetrics.find(m => m.name === 'memory-used')?.value || 0;
            const memoryLimit = memoryMetrics.find(m => m.name === 'memory-limit')?.value || 100;
            const memoryScore = Math.max(0, 100 - (memoryUsed / memoryLimit) * 100);
            totalScore += memoryScore;
            metricCount++;
        }

        // حساب نقاط التصيير
        const renderingMetrics = currentMetrics.filter(m => m.category === 'rendering');
        if (renderingMetrics.length > 0) {
            const fpsMetric = renderingMetrics.find(m => m.name === 'fps');
            if (fpsMetric) {
                const fpsScore = Math.min(100, (fpsMetric.value / 60) * 100);
                totalScore += fpsScore;
                metricCount++;
            }
        }

        // حساب نقاط الشبكة
        const networkMetrics = currentMetrics.filter(m => m.category === 'network');
        if (networkMetrics.length > 0) {
            const responseTimeMetric = networkMetrics.find(m => m.name === 'average-response-time');
            if (responseTimeMetric) {
                const networkScore = Math.max(0, 100 - (responseTimeMetric.value / 1000) * 100);
                totalScore += networkScore;
                metricCount++;
            }
        }

        return metricCount > 0 ? totalScore / metricCount : 100;
    }, [getCurrentMetrics]);

    // الحصول على التوصيات
    const getRecommendations = useCallback(() => {
        const recommendations: string[] = [];
        const currentMetrics = getCurrentMetrics();
        const score = getPerformanceScore();

        if (score < 50) {
            recommendations.push('Performance is critically low. Consider optimizing memory usage and reducing CPU load.');
        } else if (score < 70) {
            recommendations.push('Performance could be improved. Consider optimizing rendering and network requests.');
        }

        // توصيات الذاكرة
        const memoryUsed = currentMetrics.find(m => m.name === 'memory-used')?.value || 0;
        if (memoryUsed > 100) {
            recommendations.push('High memory usage detected. Consider implementing memory cleanup strategies.');
        }

        // توصيات التصيير
        const fpsMetric = currentMetrics.find(m => m.name === 'fps');
        if (fpsMetric && fpsMetric.value < 30) {
            recommendations.push('Low FPS detected. Consider optimizing rendering performance.');
        }

        // توصيات الشبكة
        const responseTimeMetric = currentMetrics.find(m => m.name === 'average-response-time');
        if (responseTimeMetric && responseTimeMetric.value > 1000) {
            recommendations.push('Slow network responses detected. Consider implementing caching strategies.');
        }

        return recommendations;
    }, [getCurrentMetrics, getPerformanceScore]);

    // توليد التقرير
    const generateReport = useCallback((
        timeRange?: { start: number; end: number }
    ): PerformanceReport => {
        const reportMetrics = getMetrics(undefined, timeRange);
        const reportAlerts = getAlerts();
        const score = getPerformanceScore();
        const recommendations = getRecommendations();

        // حساب النقاط حسب الفئة
        const memoryScore = reportMetrics.filter(m => m.category === 'memory').length > 0 ?
            Math.max(0, 100 - (reportMetrics.find(m => m.name === 'memory-used')?.value || 0) / 2) : 100;

        const cpuScore = reportMetrics.filter(m => m.category === 'cpu').length > 0 ?
            Math.max(0, 100 - (reportMetrics.find(m => m.name === 'long-tasks-duration')?.value || 0) / 10) : 100;

        const networkScore = reportMetrics.filter(m => m.category === 'network').length > 0 ?
            Math.max(0, 100 - (reportMetrics.find(m => m.name === 'average-response-time')?.value || 0) / 20) : 100;

        const renderingScore = reportMetrics.filter(m => m.category === 'rendering').length > 0 ?
            Math.min(100, (reportMetrics.find(m => m.name === 'fps')?.value || 60) / 60 * 100) : 100;

        const aiScore = reportMetrics.filter(m => m.category === 'ai').length > 0 ? 100 : 100;

        return {
            timestamp: Date.now(),
            duration: timeRange ? timeRange.end - timeRange.start : Date.now() - startTime,
            metrics: reportMetrics,
            alerts: reportAlerts,
            summary: {
                overallScore: score,
                memoryScore,
                cpuScore,
                networkScore,
                renderingScore,
                aiScore
            },
            recommendations
        };
    }, [getMetrics, getAlerts, getPerformanceScore, getRecommendations, startTime]);

    // مسح التنبيهات
    const clearAlerts = useCallback(() => {
        setAlerts([]);
    }, []);

    // حل التنبيه
    const resolveAlert = useCallback((alertId: string) => {
        setAlerts(prev => prev.map(alert =>
            alert.id === alertId ? { ...alert, resolved: true } : alert
        ));
    }, []);

    // الحصول على الإحصائيات
    const getStats = useCallback(() => {
        const activeAlerts = alerts.filter(alert => !alert.resolved).length;
        const averageScore = getPerformanceScore();
        const monitoringDuration = isMonitoring ? Date.now() - startTime : 0;

        return {
            totalMetrics: metrics.length,
            activeAlerts,
            averageScore,
            monitoringDuration
        };
    }, [alerts, getPerformanceScore, isMonitoring, startTime, metrics.length]);

    // تنظيف عند إلغاء التحميل
    useEffect(() => {
        return () => {
            stopMonitoring();
        };
    }, [stopMonitoring]);

    return {
        startMonitoring,
        stopMonitoring,
        isMonitoring,
        addMetric,
        addCustomMetric,
        getMetrics,
        getCurrentMetrics,
        getAlerts,
        generateReport,
        getPerformanceScore,
        getRecommendations,
        clearAlerts,
        resolveAlert,
        getStats
    };
}

/**
 * Hook مبسط لمراقبة الأداء الأساسية
 */
export function useBasicPerformanceMonitor() {
    return usePerformanceMonitor({
        enableMemoryMonitoring: true,
        enableCPUMonitoring: false,
        enableNetworkMonitoring: false,
        enableRenderingMonitoring: true,
        enableAIMonitoring: false,
        samplingInterval: 5000,
        maxMetricsHistory: 100,
        enableAlerts: false,
        enableReporting: false
    });
}

/**
 * Hook متقدم لمراقبة الأداء الشاملة
 */
export function useAdvancedPerformanceMonitor() {
    return usePerformanceMonitor({
        enableMemoryMonitoring: true,
        enableCPUMonitoring: true,
        enableNetworkMonitoring: true,
        enableRenderingMonitoring: true,
        enableAIMonitoring: true,
        samplingInterval: 1000,
        maxMetricsHistory: 2000,
        thresholds: [
            { metric: 'memory-used', warning: 50, critical: 100, unit: 'MB' },
            { metric: 'fps', warning: 30, critical: 15, unit: 'fps' },
            { metric: 'average-response-time', warning: 1000, critical: 3000, unit: 'ms' }
        ],
        enableAlerts: true,
        enableReporting: true
    });
}
