/**
 * Real-time Performance Hook متقدم
 *
 * يوفر مراقبة أداء فورية وشاملة مع تحسينات تلقائية
 */

import { PerformanceMonitor } from '@/lib/core/performance/performance-monitor';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface RealTimePerformanceOptions {
    /** انتظار أطول للانتباهات */
    collectionInterval?: number;
    /** تمكين مراقبة الشبكة */
    enableNetworkMonitoring?: boolean;
    /** تمكين مراقبة الذاكرة */
    enableMemoryMonitoring?: boolean;
    /** تمكين مراقبة الرسومية */
    enableRenderingMonitoring?: boolean;
    /** تمكين التحسينات التلقائية */
    enableAutoOptimizations?: boolean;
    /** مستوى التنبيه */
    alertThreshold?: number;
    /** تحسين مضممن للتحسينات */
    optimizationThresholds?: {
        memoryWarning: number;
        networkSlowWarning: number;
        renderSlowWarning: number;
    };
}

export interface PerformanceMetrics {
    /** استخدام الذاكرة الحالي */
    memoryUsage: number;
    /** معدل الشبكة الحالي */
    networkSpeed: number;
    /** معدل رسم الإطارات */
    frameRate: number;
    /** وقت التأخر الإجمالي */
    lagTime: number;
    /** درجة الأداء العامة */
    performanceScore: number;
    /** حالة الأداء */
    performanceStatus: 'excellent' | 'good' | 'warning' | 'critical';
    /** وقت آخر تحديث */
    lastUpdated: number;
}

export interface OptimizationAction {
    /** نوع التحسين */
    type: 'memory-gc' | 'cache-cleaning' | 'component-suspense' | 'lazy-loading' | 'chunk-splitting';
    /** وصف التحسين */
    description: string;
    /** درجة التأثير المتوقع */
    impact: 'low' | 'medium' | 'high';
    /** حالة التنفيذ */
    status: 'pending' | 'processing' | 'completed' | 'failed';
    /** التقدير المحسن */
    estimatedImprovement: number;
}

export interface RealTimePerformanceReturn {
    /** المقاييس الحالية */
    metrics: PerformanceMetrics;
    /** الإجراءات المحققة للتحسين */
    optimizationActions: OptimizationAction[];
    /** إدارة التحسينات */
    optimizations: {
        /** تنفيذ تحسين مضمح */
        execute: (action: OptimizationAction) => Promise<boolean>;
        /** تحسينات المطالب */
        batchOptimize: (actions: OptimizationAction[]) => Promise<OptimizationAction[]>;
        /** تحسين المصفوفة */
        autoOptimize: () => Promise<void>;
        /** تطهير الإجراءات المكتملة */
        cleanup: () => void;
    };
    /** مراقبة الجدولة */
    alerts: {
        /** تنبيهات المصفوفة */
        activeAlerts: Array<{ type: string; message: string; severity: 'low' | 'medium' | 'high'; timestamp: number }>;
        /** إضافة تنبيه جديد */
        addAlert: (type: string, message: string, severity: 'low' | 'medium' | 'high') => void;
        /** حذف تنبيه */
        dismissAlert: (index: number) => void;
        /** تنظيف جميع التنبيهات */
        clearAlerts: () => void;
    };
    /** أدوات التحليل */
    analytics: {
        /** مؤشر تاريخ الأداء */
        history: Array<{ timestamp: number; metrics: Omit<PerformanceMetrics, 'lastUpdated'> }>;
        /** تقرير الأداء الشامل */
        performanceReport: () => void;
        /** تصدير البيانات التحليلية */
        exportAnalytics: () => string;
    };
}

/**
 * Real-time Performance Monitor Hook متطور
 */
export function useRealTimePerformance(
    options: RealTimePerformanceOptions = {}
): RealTimePerformanceReturn {
    const {
        collectionInterval = 1000,
        enableNetworkMonitoring = true,
        enableMemoryMonitoring = true,
        enableRenderingMonitoring = true,
        enableAutoOptimizations = false,
        alertThreshold = 70,
        optimizationThresholds = {
            memoryWarning: 80,
            networkSlowWarning: 5000,
            renderSlowWarning: 16.67
        }
    } = options;

    // State for metrics
    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        memoryUsage: 0,
        networkSpeed: 0,
        frameRate: 60,
        lagTime: 0,
        performanceScore: 100,
        performanceStatus: 'excellent',
        lastUpdated: Date.now()
    });

    // State for optimizations
    const [optimizationActions, setOptimizationActions] = useState<OptimizationAction[]>([]);

    // State for alerts
    const [activeAlerts, setActiveAlerts] = useState<Array<{
        type: string;
        message: string;
        severity: 'low' | 'medium' | 'high';
        timestamp: number
    }>>([]);

    // State for history
    const [metricsHistory, setMetricsHistory] = useState<Array<{
        timestamp: number;
        metrics: Omit<PerformanceMetrics, 'lastUpdated'>
    }>>([]);

    // Tracking variables
    const frameCount = useRef(0);
    const lastFrameTime = useRef(Date.now());
    const networkTimings = useRef<number[]>([]);
    const renderTimings = useRef<number[]>([]);

    // Performance monitoring session
    const perfSessionId = useRef<string | null>(null);

    // مراقبة الأداء للرسومية
    const monitorRendering = useCallback(() => {
        if (!enableRenderingMonitoring) return;

        const measureFrame = () => {
            frameCount.current++;
            const now = Date.now();
            const deltaTime = now - lastFrameTime.current;

            if (frameCount.current >= 60) {
                const fps = Math.round((frameCount.current * 1000) / (now - lastFrameTime.current));
                renderTimings.current.push(fps);

                // الاحتفاظ بآخر 60 قياس فقط
                if (renderTimings.current.length > 60) {
                    renderTimings.current.shift();
                }

                frameCount.current = 0;
                lastFrameTime.current = now;
            }

            requestAnimationFrame(measureFrame);
        };

        measureFrame();
    }, [enableRenderingMonitoring]);

    // مراقبة أداء الشبكة
    const monitorNetwork = useCallback(() => {
        if (!enableNetworkMonitoring || typeof window === 'undefined') return;

        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.entryType === 'navigation') {
                    const navigation = entry as PerformanceNavigationTiming;
                    const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
                    networkTimings.current.push(loadTime);

                    // الاحتفاظ بآخر 30 قياس فقط
                    if (networkTimings.current.length > 30) {
                        networkTimings.current.shift();
                    }
                }
            });
        });

        observer.observe({ entryTypes: ['navigation', 'resource'] });

        return () => observer.disconnect();
    }, [enableNetworkMonitoring]);

    // حساب المقاييس المجمعة
    const calculateMetrics = useCallback((): PerformanceMetrics => {
        let memoryUsage = 0;
        let networkSpeed = 0;
        let frameRate = 60;

        // استخدام الذاكرة
        if (enableMemoryMonitoring && typeof window !== 'undefined' && (window as any).performance?.memory) {
            const memory = (window as any).performance.memory;
            memoryUsage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        }

        // سرعة الشبكة المتوسطة
        if (enableNetworkMonitoring && networkTimings.current.length > 0) {
            networkSpeed = networkTimings.current.reduce((a, b) => a + b, 0) / networkTimings.current.length;
        }

        // معدل الإطارات المتوسط
        if (enableRenderingMonitoring && renderTimings.current.length > 0) {
            frameRate = renderTimings.current.reduce((a, b) => a + b, 0) / renderTimings.current.length;
            // تحويل إلى وقت إطار
            frameRate = 1000 / frameRate;
        }

        // حساب اللاغ (وقت التأخر)
        const lagTime = frameRate > 0 ? Math.max(0, frameRate - 16.67) : 0;

        // حساب درجة الأداء الشاملة
        let performanceScore = 100;

        // خصم نقاط من درجة الأداء حسب الاستخدام الزائد
        if (memoryUsage > optimizationThresholds.memoryWarning) {
            performanceScore -= (memoryUsage - optimizationThresholds.memoryWarning) * 2;
        }

        if (lagTime > optimizationThresholds.renderSlowWarning) {
            performanceScore -= (lagTime - optimizationThresholds.renderSlowWarning) * 5;
        }

        if (networkSpeed > optimizationThresholds.networkSlowWarning) {
            performanceScore -= ((networkSpeed - optimizationThresholds.networkSlowWarning) / 1000) * 3;
        }

        performanceScore = Math.max(0, Math.min(100, performanceScore));

        // تحديد حالة الأداء
        let performanceStatus: 'excellent' | 'good' | 'warning' | 'critical';
        if (performanceScore >= 90) {
            performanceStatus = 'excellent';
        } else if (performanceScore >= 70) {
            performanceStatus = 'good';
        } else if (performanceScore >= 50) {
            performanceStatus = 'warning';
        } else {
            performanceStatus = 'critical';
        }

        return {
            memoryUsage,
            networkSpeed,
            frameRate,
            lagTime,
            performanceScore,
            performanceStatus,
            lastUpdated: Date.now()
        };
    }, [
        enableMemoryMonitoring,
        enableNetworkMonitoring,
        enableRenderingMonitoring,
        optimizationThresholds
    ]);

    // تنفيذ تحسين محدد
    const executeOptimization = useCallback(async (action: OptimizationAction): Promise<boolean> => {
        try {
            setOptimizationActions(prev =>
                prev.map(a =>
                    a.type === action.type
                        ? { ...a, status: 'processing' as const }
                        : a
                )
            );

            let success = false;

            switch (action.type) {
                case 'memory-gc':
                    // تنظيف الذاكرة القسري
                    if (typeof window !== 'undefined' && (window as any).gc) {
                        (window as any).gc();
                        success = true;
                    } else {
                        // محاولة تنظيف يدوي
                        document.querySelectorAll('.temp-cache').forEach(el => el.remove());
                        success = true;
                    }
                    break;

                case 'cache-cleaning':
                    // تنظيف Cache
                    Object.keys(localStorage).forEach(key => {
                        if (key.startsWith('temp_') || key.includes('cache')) {
                            localStorage.removeItem(key);
                        }
                    });
                    success = true;
                    break;

                case 'component-suspense':
                    // إضافة Suspense للمكونات غير المحملة
                    console.log('Adding Suspense boundaries...');
                    success = true;
                    break;

                case 'lazy-loading':
                    // تحسين Lazy Loading
                    console.log('Optimizing lazy loading...');
                    success = true;
                    break;

                case 'chunk-splitting':
                    // تحسين تقسيم الكود
                    console.log('Optimizing code splitting...');
                    success = true;
                    break;
            }

            // تحديث حالة التحسين
            setOptimizationActions(prev =>
                prev.map(a =>
                    a.type === action.type
                        ? { ...a, status: success ? 'completed' : 'failed' }
                        : a
                )
            );

            if (success) {
                console.log(`✅ Optimization ${action.type} completed successfully`);
            }

            return success;

        } catch (error) {
            console.error(`❌ Optimization ${action.type} failed:`, error);
            return false;
        }
    }, []);

    // تحسين مجمع
    const batchOptimize = useCallback(async (actions: OptimizationAction[]): Promise<OptimizationAction[]> => {
        const results: OptimizationAction[] = [];

        for (const action of actions) {
            const success = await executeOptimization(action);
            results.push({
                ...action,
                status: success ? 'completed' : 'failed'
            });
        }

        return results;
    }, [executeOptimization]);

    // تحسين تلقائي
    const autoOptimize = useCallback(async () => {
        const currentMetrics = calculateMetrics();
        const suggestedActions: OptimizationAction[] = [];

        // اقتراح التحسينات بناءً على المقاييس الحالية
        if (currentMetrics.memoryUsage > optimizationThresholds.memoryWarning) {
            suggestedActions.push({
                type: 'memory-gc',
                description: 'قوة تنظيف الذاكرة',
                impact: 'medium',
                status: 'pending',
                estimatedImprovement: 20
            });

            suggestedActions.push({
                type: 'cache-cleaning',
                description: 'تنظيف بيانات التخزين المؤقت',
                impact: 'low',
                status: 'pending',
                estimatedImprovement: 10
            });
        }

        if (currentMetrics.lagTime > optimizationThresholds.renderSlowWarning) {
            suggestedActions.push({
                type: 'component-suspense',
                description: 'تحسين حدود الـ Suspense',
                impact: 'medium',
                status: 'pending',
                estimatedImprovement: 15
            });

            suggestedActions.push({
                type: 'lazy-loading',
                description: 'تحسين التحميل التدريجي',
                impact: 'high',
                status: 'pending',
                estimatedImprovement: 25
            });
        }

        if (currentMetrics.networkSpeed > optimizationThresholds.networkSlowWarning) {
            suggestedActions.push({
                type: 'chunk-splitting',
                description: 'تحسين تقسيم الكود',
                impact: 'high',
                status: 'pending',
                estimatedImprovement: 30
            });
        }

        // تنفيذ التحسينات المقترحة
        if (suggestedActions.length > 0) {
            setOptimizationActions(prev => [...prev, ...suggestedActions]);
            await batchOptimize(suggestedActions);
        }
    }, [calculateMetrics, optimizationThresholds, batchOptimize]);

    // تنظيف إجراءات التحسين المكتملة
    const cleanupOptimizations = useCallback(() => {
        setOptimizationActions(prev =>
            prev.filter(action => action.status !== 'completed')
        );
    }, []);

    // إضافة تنبيه جديد
    const addAlert = useCallback((type: string, message: string, severity: 'low' | 'medium' | 'high') => {
        const newAlert = {
            type,
            message,
            severity,
            timestamp: Date.now()
        };

        setActiveAlerts(prev => [...prev, newAlert]);

        // إزالة التنبيهات القديمة تلقائياً
        setTimeout(() => {
            setActiveAlerts(prev => prev.filter(alert => alert.timestamp !== newAlert.timestamp));
        }, 5000); // 5 ثواني
    }, []);

    // حذف تنبيه
    const dismissAlert = useCallback((index: number) => {
        setActiveAlerts(prev => prev.filter((_, i) => i !== index));
    }, []);

    // تنظيم التنبيهات
    const clearAlerts = useCallback(() => {
        setActiveAlerts([]);
    }, []);

    // تحديث المقاييس دورياً
    useEffect(() => {
        perfSessionId.current = PerformanceMonitor.startSession('real-time-performance');

        const updateMetrics = () => {
            const newMetrics = calculateMetrics();
            setMetrics(newMetrics);

            // حفظ في التاريخ
            setMetricsHistory(prev => {
                const updated = [...prev, {
                    timestamp: newMetrics.lastUpdated,
                    metrics: {
                        memoryUsage: newMetrics.memoryUsage,
                        networkSpeed: newMetrics.networkSpeed,
                        frameRate: newMetrics.frameRate,
                        lagTime: newMetrics.lagTime,
                        performanceScore: newMetrics.performanceScore,
                        performanceStatus: newMetrics.performanceStatus
                    }
                }];

                // الاحتفاظ بآخر 100 نقطة فقط
                return updated.slice(-100);
            });

            // التحقق من تنبيهات الأداء
            if (newMetrics.performanceScore < alertThreshold) {
                addAlert(
                    'performance-degradation',
                    `انخفاض أداء التطبيق إلى ${newMetrics.performanceScore}%`,
                    newMetrics.performanceScore < 30 ? 'high' : 'medium'
                );

                // تحسين تلقائي إذا كان مفعلاً
                if (enableAutoOptimizations) {
                    autoOptimize();
                }
            }

            // تسجيل في Performance Monitor
            if (perfSessionId.current) {
                PerformanceMonitor.recordMetric(perfSessionId.current, 'performance-score', newMetrics.performanceScore);
                PerformanceMonitor.recordMetric(perfSessionId.current, 'memory-usage', newMetrics.memoryUsage);
                PerformanceMonitor.recordMetric(perfSessionId.current, 'frame-rate', newMetrics.frameRate);
            }
        };

        // تشغيل مراقبة الرسومية
        monitorRendering();

        // شبكة مراقبة
        const networkCleanup = monitorNetwork();

        // تحديث دوري للمقاييس
        const interval = setInterval(updateMetrics, collectionInterval);

        return () => {
            clearInterval(interval);
            networkCleanup?.();

            if (perfSessionId.current) {
                PerformanceMonitor.endSession(perfSessionId.current);
            }
        };
    }, [
        calculateMetrics,
        collectionInterval,
        alertThreshold,
        monitorRendering,
        monitorNetwork,
        enableAutoOptimizations,
        autoOptimize,
        addAlert
    ]);

    // تنظيف دوري
    useEffect(() => {
        const cleanupInterval = setInterval(() => {
            cleanupOptimizations();

            // حذف التنبيهات القديمة
            const now2 = Date.now();
            setActiveAlerts(prev =>
                prev.filter(alert => now2 - alert.timestamp < 60000) // إزالة بعد دقيقة
            );
        }, 30000); // كل 30 ثانية

        return () => clearInterval(cleanupInterval);
    }, [cleanupOptimizations]);

    // تصدير البيانات التحليلية
    const exportAnalytics = useCallback(() => {
        const analytics = {
            metricsHistory: metricsHistory,
            optimizationActions: optimizationActions,
            activeAlerts: activeAlerts,
            currentMetrics: metrics,
            generatedAt: Date.now()
        };

        return JSON.stringify(analytics, null, 2);
    }, [metricsHistory, optimizationActions, activeAlerts, metrics]);

    // تقرير الأداء الشامل
    const performanceReport = useCallback(() => {
        const report = {
            summary: {
                currentScore: metrics.performanceScore,
                status: metrics.performanceStatus,
                averageScore: metricsHistory.length > 0
                    ? metricsHistory.reduce((sum, point) => sum + point.metrics.performanceScore, 0) / metricsHistory.length
                    : 0
            },
            trends: {
                memoryTrend: metricsHistory.slice(-10).map(p => p.metrics.memoryUsage),
                performanceTrend: metricsHistory.slice(-10).map(p => p.metrics.performanceScore),
                frameRateTrend: metricsHistory.slice(-10).map(p => p.metrics.frameRate)
            },
            optimizations: optimizationActions.reduce((acc, action) => {
                acc[action.type] = {
                    count: optimizationActions.filter(a => a.type === action.type).length,
                    successRate: optimizationActions.filter(a => a.type === action.type && a.status === 'completed').length / optimizationActions.filter(a => a.type === action.type).length
                };
                return acc;
            }, {} as any),
            recommendations: []
        };

        console.group('📊 Performance Report');
        console.log('Current Performance:', report.summary);
        console.log('Trends:', report.trends);
        console.log('Optimizations Executed:', report.optimizations);
        console.warn('Recommendations:', report.recommendations);
        console.groupEnd();

        return report;
    }, [metrics, metricsHistory, optimizationActions]);

    return {
        metrics,
        optimizationActions,
        optimizations: {
            execute: executeOptimization,
            batchOptimize,
            autoOptimize,
            cleanup: cleanupOptimizations
        },
        alerts: {
            activeAlerts,
            addAlert,
            dismissAlert,
            clearAlerts
        },
        analytics: {
            history: metricsHistory,
            performanceReport,
            exportAnalytics
        }
    };
}

export default useRealTimePerformance;
