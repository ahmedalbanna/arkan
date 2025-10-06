/**
 * مثال عملي لتكامل نظام الأداء مع مولد التقارير
 * يوضح كيفية استخدام جميع مكونات النظام معاً
 */

'use client';

import { SectionName } from '@/ai/schemas';
import {
    useComprehensivePerformanceSystem
} from '@/core/hooks/performance';
import { useGenerateReportSection } from '@/hooks/use-report-generation';
import { useCallback, useEffect, useState } from 'react';

interface PerformanceIntegratedReportGeneratorProps {
    projectId: string;
    userId: string;
}

export function PerformanceIntegratedReportGenerator({
    projectId,
    userId
}: PerformanceIntegratedReportGeneratorProps) {
    // النظام الشامل للأداء
    const performanceSystem = useComprehensivePerformanceSystem({
        memory: {
            maxMemoryUsage: 100,
            cleanupInterval: 30000,
            enableCompression: true,
            enablePersistence: true
        },
        cache: {
            defaultStrategy: { type: 'adaptive', maxSize: 100, ttl: 600000 },
            strategies: {
                'ai-response': {
                    type: 'lfu',
                    maxSize: 50,
                    ttl: 1800000,
                    priority: 'high'
                },
                'user-data': {
                    type: 'lru',
                    maxSize: 25,
                    ttl: 300000,
                    priority: 'medium'
                },
                'temp-data': {
                    type: 'ttl',
                    ttl: 60000,
                    priority: 'low'
                }
            },
            enablePredictiveCaching: true,
            enableCompression: true,
            enablePersistence: true,
            maxTotalSize: 100 * 1024 * 1024 // 100 MB
        },
        monitoring: {
            enableMemoryMonitoring: true,
            enableCPUMonitoring: true,
            enableNetworkMonitoring: true,
            enableRenderingMonitoring: true,
            samplingInterval: 1000,
            thresholds: [
                { metric: 'memory-used', warning: 50, critical: 100, unit: 'MB' },
                { metric: 'fps', warning: 30, critical: 15, unit: 'fps' },
                { metric: 'average-response-time', warning: 1000, critical: 3000, unit: 'ms' }
            ],
            enableAlerts: true,
            enableReporting: true
        },
        optimization: {
            enableMemoryOptimization: true,
            enableCPUOptimization: true,
            enableNetworkOptimization: true,
            enableRenderingOptimization: true,
            optimizationThreshold: 70,
            aggressiveMode: false,
            enablePredictiveOptimization: true
        }
    });

    // مولد التقارير المحسن
    const reportGenerator = useGenerateReportSection();

    // حالة المكون
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [performanceStats, setPerformanceStats] = useState<any>(null);
    const [optimizationRecommendations, setOptimizationRecommendations] = useState<string[]>([]);

    // بدء مراقبة الأداء
    useEffect(() => {
        performanceSystem.performanceMonitor.startMonitoring();

        return () => {
            performanceSystem.performanceMonitor.stopMonitoring();
        };
    }, [performanceSystem.performanceMonitor]);

    // مراقبة الأداء وتحديث الإحصائيات
    useEffect(() => {
        const updateStats = () => {
            const stats = {
                memory: performanceSystem.memoryManager.getMemoryStats(),
                cache: performanceSystem.smartCache.getStats(),
                performance: performanceSystem.performanceMonitor.getPerformanceScore(),
                optimization: performanceSystem.resourceOptimizer.getOptimizationScore(),
                overall: performanceSystem.getOverallPerformanceScore()
            };

            setPerformanceStats(stats);

            // الحصول على التوصيات
            const recommendations = performanceSystem.resourceOptimizer.getOptimizationScore() < 70
                ? performanceSystem.resourceOptimizer.getRecommendations()
                : [];

            setOptimizationRecommendations(recommendations);
        };

        const interval = setInterval(updateStats, 5000); // كل 5 ثوان
        updateStats(); // تحديث فوري

        return () => clearInterval(interval);
    }, [performanceSystem]);

    // توليد قسم مع تحسين الأداء
    const generateSectionWithOptimization = useCallback(async (section: SectionName) => {
        setIsGenerating(true);
        setGenerationProgress(0);

        try {
            // إنشاء مفتاح التخزين المؤقت الذكي
            const cacheKey = `report-${projectId}-${section}-${userId}-${Date.now()}`;

            // محاولة الحصول من التخزين المؤقت أولاً
            const cached = await performanceSystem.smartCache.get(cacheKey);
            if (cached) {
                console.log('✅ تم العثور على النتيجة في التخزين المؤقت');
                setGenerationProgress(100);
                return cached;
            }

            // بدء عملية التوليد مع مراقبة الأداء
            const operationId = `generate-${section}-${Date.now()}`;
            performanceSystem.memoryManager.startOperation(operationId);

            // إضافة مقياس الأداء
            performanceSystem.performanceMonitor.addCustomMetric('ai-generation-start', Date.now(), 'timestamp', {
                operation: 'report-generation',
                section,
                projectId,
                userId
            });

            setGenerationProgress(25);

            // توليد المحتوى
            const result = await reportGenerator.mutation.mutateAsync({
                body: {
                    sectionToGenerate: section,
                    projectId,
                    userId
                }
            });

            setGenerationProgress(75);

            // حفظ في التخزين المؤقت مع بيانات وصفية
            await performanceSystem.smartCache.setWithMetadata(cacheKey, result, {
                source: 'ai-service',
                operation: 'report-generation',
                userId,
                projectId,
                section,
                tags: ['report', 'ai', section, projectId]
            });

            // إضافة مقياس الأداء
            const generationTime = Date.now() - performanceSystem.performanceMonitor.getCurrentMetrics()
                .find(m => m.name === 'ai-generation-start')?.value || Date.now();

            performanceSystem.performanceMonitor.addCustomMetric('ai-generation-time', generationTime, 'ms', {
                operation: 'report-generation',
                section,
                projectId,
                userId
            });

            setGenerationProgress(100);

            return result;

        } catch (error) {
            console.error('❌ خطأ في توليد القسم:', error);

            // إضافة مقياس الخطأ
            performanceSystem.performanceMonitor.addCustomMetric('ai-generation-error', 1, 'count', {
                operation: 'report-generation',
                section,
                projectId,
                userId,
                error: error instanceof Error ? error.message : 'Unknown error'
            });

            throw error;
        } finally {
            // إنهاء العملية
            const operationId = `generate-${section}-${Date.now()}`;
            performanceSystem.memoryManager.endOperation(operationId);
            setIsGenerating(false);
            setGenerationProgress(0);
        }
    }, [
        projectId,
        userId,
        performanceSystem,
        reportGenerator.mutation
    ]);

    // تحسين تلقائي عند الحاجة
    const handleAutoOptimization = useCallback(async () => {
        if (performanceSystem.resourceOptimizer.isOptimizationNeeded()) {
            console.log('🔧 بدء التحسين التلقائي...');

            const actions = await performanceSystem.optimizeAll();
            console.log('✅ تم تنفيذ التحسينات:', actions);

            // إضافة مقياس التحسين
            performanceSystem.performanceMonitor.addCustomMetric('auto-optimization', actions.length, 'count', {
                operation: 'auto-optimization',
                actionsCount: actions.length
            });
        }
    }, [performanceSystem]);

    // تنظيف دوري للذاكرة
    useEffect(() => {
        const cleanupInterval = setInterval(async () => {
            const memoryStats = performanceSystem.memoryManager.getMemoryStats();

            if (memoryStats.usedMemory > 80) {
                console.log('🧹 تنظيف الذاكرة التلقائي...');
                await performanceSystem.memoryManager.cleanup();
            }

            // تحسين تلقائي
            await handleAutoOptimization();
        }, 30000); // كل 30 ثانية

        return () => clearInterval(cleanupInterval);
    }, [performanceSystem.memoryManager, handleAutoOptimization]);

    // الحصول على تقرير الأداء الشامل
    const getComprehensiveReport = useCallback(() => {
        return performanceSystem.getComprehensiveReport();
    }, [performanceSystem]);

    return {
        // وظائف التوليد
        generateSection: generateSectionWithOptimization,
        isGenerating,
        generationProgress,

        // إحصائيات الأداء
        performanceStats,
        optimizationRecommendations,

        // وظائف الأداء
        getComprehensiveReport,
        optimizeAll: performanceSystem.optimizeAll,

        // مكونات النظام
        memoryManager: performanceSystem.memoryManager,
        smartCache: performanceSystem.smartCache,
        performanceMonitor: performanceSystem.performanceMonitor,
        resourceOptimizer: performanceSystem.resourceOptimizer
    };
}

/**
 * مكون UI لعرض إحصائيات الأداء
 */
export function PerformanceStatsPanel({
    performanceStats,
    optimizationRecommendations
}: {
    performanceStats: any;
    optimizationRecommendations: string[];
}) {
    if (!performanceStats) return null;

    return (
        <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">إحصائيات الأداء</h3>

            {/* النقاط العامة */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-3 rounded">
                    <div className="text-sm text-gray-600">النقاط العامة</div>
                    <div className="text-2xl font-bold text-blue-600">
                        {Math.round(performanceStats.overall)}/100
                    </div>
                </div>

                <div className="bg-white p-3 rounded">
                    <div className="text-sm text-gray-600">معدل التخزين المؤقت</div>
                    <div className="text-2xl font-bold text-green-600">
                        {Math.round(performanceStats.cache.hitRate)}%
                    </div>
                </div>
            </div>

            {/* تفاصيل الذاكرة */}
            <div className="bg-white p-3 rounded mb-4">
                <div className="text-sm text-gray-600 mb-2">استخدام الذاكرة</div>
                <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${performanceStats.memory.usedMemory / performanceStats.memory.totalMemory * 100}%` }}
                        />
                    </div>
                    <span className="text-sm text-gray-600">
                        {Math.round(performanceStats.memory.usedMemory)}MB / {Math.round(performanceStats.memory.totalMemory)}MB
                    </span>
                </div>
            </div>

            {/* التوصيات */}
            {optimizationRecommendations.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <div className="text-sm font-medium text-yellow-800 mb-2">توصيات التحسين</div>
                    <ul className="text-sm text-yellow-700 space-y-1">
                        {optimizationRecommendations.map((rec, index) => (
                            <li key={index}>• {rec}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

/**
 * مثال على الاستخدام
 */
export function ExampleUsage() {
    const reportGenerator = PerformanceIntegratedReportGenerator({
        projectId: 'project-123',
        userId: 'user-456'
    });

    const handleGenerateSection = async (section: SectionName) => {
        try {
            const result = await reportGenerator.generateSection(section);
            console.log('تم توليد القسم:', result);
        } catch (error) {
            console.error('فشل في توليد القسم:', error);
        }
    };

    return (
        <div className="space-y-4">
            {/* أزرار التوليد */}
            <div className="flex gap-2">
                <button
                    onClick={() => handleGenerateSection('introduction')}
                    disabled={reportGenerator.isGenerating}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                >
                    توليد المقدمة
                </button>

                <button
                    onClick={() => handleGenerateSection('conclusion')}
                    disabled={reportGenerator.isGenerating}
                    className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
                >
                    توليد الخاتمة
                </button>
            </div>

            {/* شريط التقدم */}
            {reportGenerator.isGenerating && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${reportGenerator.generationProgress}%` }}
                    />
                </div>
            )}

            {/* لوحة الإحصائيات */}
            <PerformanceStatsPanel
                performanceStats={reportGenerator.performanceStats}
                optimizationRecommendations={reportGenerator.optimizationRecommendations}
            />

            {/* تقرير شامل */}
            <button
                onClick={() => {
                    const report = reportGenerator.getComprehensiveReport();
                    console.log('تقرير الأداء الشامل:', report);
                }}
                className="px-4 py-2 bg-purple-500 text-white rounded"
            >
                عرض التقرير الشامل
            </button>
        </div>
    );
}
