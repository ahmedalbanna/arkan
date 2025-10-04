/**
 * هوك يدير عمليات التقرير المختلط
 */

'use client';

import type { SectionName } from '@/ai/schemas/enums';
import { useCallback, useState } from 'react';

interface HybridModeConfig {
    enabled: boolean;
    sectionModes: Record<SectionName, 'intelligent' | 'traditional'>;
    intelligentThreshold: number;
    fallbackToTraditional: boolean;
}

interface HybridReportResult {
    intelligentResults: any;
    traditionalResults: any;
    hybridMetrics: {
        totalSections: number;
        intelligentSections: number;
        traditionalSections: number;
        totalTime: number;
        averageQuality: number;
        modeDistribution: Record<string, number>;
    };
    mergedResults: any;
}

export function useHybridReport() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState({
        stage: 'idle' as 'idle' | 'preparing' | 'executing' | 'merging' | 'completed' | 'error',
        message: 'جاهز للتوليد',
        percentage: 0,
        currentPhase: 'تجهيز العملية'
    });
    const [result, setResult] = useState<HybridReportResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const generateHybridReport = useCallback(async (config: {
        sectionsToGenerate: SectionName[];
        hybridConfig: HybridModeConfig;
        proposal?: any;
        projectPlan?: any;
        guidelines?: string[];
        contextFiles?: Array<{ fileName: string; content: string; type: string }>;
        onProgress?: (progress: typeof progress) => void;
    }) => {
        setIsGenerating(true);
        setError(null);

        try {
            // تحديث حالة التحضير
            const updateProgress = (update: Partial<typeof progress>) => {
                const newProgress = { ...progress, ...update };
                setProgress(newProgress);
                config.onProgress?.(newProgress);
            };

            updateProgress({
                stage: 'preparing',
                message: 'تحضير التقرير المختلط...',
                percentage: 10,
                currentPhase: 'تحليل الأقسام وتجميع التكوين'
            });

            // فصل الأقسام إلى ذكية وتقليدية
            const intelligentSections = config.sectionsToGenerate.filter(section =>
                config.hybridConfig.sectionModes[section] === 'intelligent'
            );
            const traditionalSections = config.sectionsToGenerate.filter(section =>
                config.hybridConfig.sectionModes[section] === 'traditional'
            );

            updateProgress({
                stage: 'executing',
                message: `بدء التوليد المختلط: ${intelligentSections.length} قسم ذكي، ${traditionalSections.length} قسم تقليدي`,
                percentage: 30,
                currentPhase: 'تنفيذ التوليد المختلط'
            });

            let intelligentResults = null;
            let traditionalResults = null;

            // تنفيذ التوليد الذكي
            if (intelligentSections.length > 0) {
                updateProgress({
                    percentage: 40,
                    currentPhase: 'توليد الأقسام الذكية'
                });

                const intelligentResponse = await fetch('/api/generate/report', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        operationType: 'complete-report',
                        sectionsToGenerate: intelligentSections,
                        proposal: config.proposal,
                        projectPlan: config.projectPlan,
                        guidelines: config.guidelines,
                        contextFiles: config.contextFiles,
                        hybridMode: config.hybridConfig
                    })
                });

                if (!intelligentResponse.ok) {
                    throw new Error('خطأ في توليد الأقسام الذكية');
                }

                intelligentResults = await intelligentResponse.json();
            }

            // تنفيذ التوليد التقليدي
            if (traditionalSections.length > 0) {
                updateProgress({
                    percentage: 60,
                    currentPhase: 'توليد الأقسام التقليدية'
                });

                // محاكاة التوليد التقليدي (يجب استبدالها بـ API call فعلي للنظام التقليدي)
                traditionalResults = {
                    generatedSections: traditionalSections.reduce((acc, section) => {
                        acc[section] = `محتوى القسم التقليدي ${section}. تم توليده بسرعة عالية وبدون تحليل ذكي متقدم.`;
                        return acc;
                    }, {} as Record<string, string>),
                    sectionMetadata: traditionalSections.reduce((acc, section) => {
                        acc[section] = {
                            generationMode: 'traditional',
                            generationTime: Math.random() * 5000 + 3000, // 3-8 seconds
                            qualityScore: Math.random() * 15 + 75, // 75-90
                            iterations: 1,
                            modelUsed: 'traditional-engine'
                        };
                        return acc;
                    }, {} as Record<string, any>),
                    overallMetrics: {
                        successfulSections: traditionalSections.length,
                        averageQuality: 82,
                        totalTime: traditionalSections.length * 5000
                    }
                };
            }

            updateProgress({
                stage: 'merging',
                message: 'دمج نتائج التوليد المختلط...',
                percentage: 80,
                currentPhase: 'دمج النتائج وإنتاج التقرير النهائي'
            });

            // دمج النتائج
            const mergedSections = {
                ...(intelligentResults?.generatedSections || {}),
                ...(traditionalResults?.generatedSections || {})
            };

            const mergedMetadata = {
                ...(intelligentResults?.sectionMetadata || {}),
                ...(traditionalResults?.sectionMetadata || {})
            };

            // إضافة معلومات الوضع المختلط
            config.sectionsToGenerate.forEach(section => {
                if (mergedMetadata[section]) {
                    mergedMetadata[section].hybridMode = config.hybridConfig.sectionModes[section];
                }
            });

            const hybridMetrics = {
                totalSections: config.sectionsToGenerate.length,
                intelligentSections: intelligentSections.length,
                traditionalSections: traditionalSections.length,
                totalTime: (intelligentResults?.overallMetrics?.totalTime || 0) +
                    (traditionalResults?.overallMetrics?.totalTime || 0),
                averageQuality: ((intelligentResults?.overallMetrics?.averageQuality || 0) * intelligentSections.length +
                    (traditionalResults?.overallMetrics?.averageQuality || 0) * traditionalSections.length) /
                    config.sectionsToGenerate.length,
                modeDistribution: {
                    intelligent: intelligentSections.length,
                    traditional: traditionalSections.length
                }
            };

            const finalResult: HybridReportResult = {
                intelligentResults,
                traditionalResults,
                hybridMetrics,
                mergedResults: {
                    generatedSections: mergedSections,
                    sectionMetadata: mergedMetadata,
                    hybridMetrics,
                    modeDistribution: hybridMetrics.modeDistribution,
                    completeReport: true,
                    hybridReport: true
                }
            };

            setResult(finalResult);

            updateProgress({
                stage: 'completed',
                message: 'تم إنشاء التقرير المختلط بنجاح!',
                percentage: 100,
                currentPhase: 'اكتمال التوليد'
            });

            return finalResult;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف في التوليد المختلط';
            setError(errorMessage);
            setProgress({
                stage: 'error',
                message: errorMessage,
                percentage: 0,
                currentPhase: 'خطأ في التوليد'
            });
            throw err;
        } finally {
            setIsGenerating(false);
        }
    }, []);

    const reset = useCallback(() => {
        setResult(null);
        setError(null);
        setIsGenerating(false);
        setProgress({
            stage: 'idle',
            message: 'جاهز للتوليد',
            percentage: 0,
            currentPhase: 'تجهيز العملية'
        });
    }, []);

    return {
        isGenerating,
        progress,
        result,
        error,
        generateHybridReport,
        reset
    };
}
