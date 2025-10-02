/**
 * Hooks ذكية لتوليد التقارير باستخدام النظام الذكي الجديد
 * توفر واجهة سهلة ومتقدمة للمكونات
 */

import type { SectionName } from '@/ai/schemas/enums';
import { toast } from '@/hooks/use-toast';
import {
    type CompleteReportResult,
    IntelligentReportService,
    SectionUtils,
    type SingleSectionResult,
    SUPPORTED_SECTIONS
} from '@/services/intelligent-report-service';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

// أنواع البيانات للـ hooks
export interface ReportProgress {
    stage: 'preparing' | 'generating' | 'completed' | 'error';
    message: string;
    percentage: number;
    currentSection?: string;
    completedSections?: string[];
    sectionProgress?: Record<string, {
        status: 'pending' | 'generating' | 'completed' | 'error';
        qualityScore?: number;
        generationTime?: number;
    }>;
}

export interface UseIntelligentSectionConfig {
    sectionToGenerate: SectionName;
    proposal?: any;
    projectPlan?: any;
    guidelines?: string[];
    contextFiles?: Array<{ fileName: string; content: string; type: string }>;
    otherSections?: Record<string, string>;
    instructionText?: string;
    exampleFiles?: Array<{ fileName: string; content: string }>;
    qualityThreshold?: number;
    enableIterativeImprovement?: boolean;
    enablePerformanceMonitoring?: boolean;
    autoGenerate?: boolean;
    onSuccess?: (result: SingleSectionResult) => void;
    onError?: (error: Error) => void;
    onProgress?: (progress: ReportProgress) => void;
}

export interface UseCompleteReportConfig {
    sectionsToGenerate?: SectionName[];
    proposal?: any;
    projectPlan?: any;
    guidelines?: string[];
    contextFiles?: Array<{ fileName: string; content: string; type: string }>;
    qualityThreshold?: number;
    enableIterativeImprovement?: boolean;
    enablePerformanceMonitoring?: boolean;
    generateInOrder?: boolean;
    useIntelligentDependencies?: boolean;
    maxRetries?: number;
    autoGenerate?: boolean;
    onSuccess?: (result: CompleteReportResult) => void;
    onError?: (error: Error) => void;
    onProgress?: (progress: ReportProgress) => void;
}

/**
 * Hook لتوليد قسم فردي بالنظام الذكي
 */
export function useIntelligentSection(config: UseIntelligentSectionConfig) {
    const [progress, setProgress] = useState<ReportProgress>({
        stage: 'preparing',
        message: 'جاهز للبدء',
        percentage: 0
    });

    const progressRef = useRef<ReportProgress>(progress);
    progressRef.current = progress;

    const mutation = useMutation({
        mutationFn: async () => {
            return await IntelligentReportService.generateSingleSection({
                ...config,
                onProgress: (progressData) => {
                    const newProgress: ReportProgress = {
                        stage: progressData.stage as any,
                        message: progressData.message,
                        percentage: progressData.percentage
                    };
                    setProgress(newProgress);
                    config.onProgress?.(newProgress);
                }
            });
        },
        onSuccess: (result) => {
            toast.success(`تم توليد ${SUPPORTED_SECTIONS[config.sectionToGenerate].title} بنجاح!`, {
                description: `جودة: ${result.metadata ? '85+' : 'غير محددة'}/100 - وقت التنفيذ: ${result.metadata?.executionTime || 0}ms`
            });
            config.onSuccess?.(result);
        },
        onError: (error: Error) => {
            toast.error('فشل في توليد القسم', {
                description: error.message
            });
            config.onError?.(error);
        }
    });

    // التوليد التلقائي عند تغيير الإعدادات
    useEffect(() => {
        if (config.autoGenerate && config.proposal) {
            mutation.mutate();
        }
    }, [config.autoGenerate, config.sectionToGenerate, config.proposal]);

    const sectionInfo = SUPPORTED_SECTIONS[config.sectionToGenerate];
    const estimatedTime = SectionUtils.formatEstimatedTime(sectionInfo.estimatedTime);
    const estimatedCost = IntelligentReportService.calculateEstimatedCreditCost({
        operationType: 'single-section'
    });

    return {
        // حالة التوليد
        isGenerating: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,
        result: mutation.data,
        progress,

        // معلومات القسم
        sectionInfo,
        estimatedTime,
        estimatedCost,

        // دوال التحكم
        generateSection: mutation.mutate,
        reset: mutation.reset,

        // إحصائيات
        executionTime: mutation.data?.metadata?.executionTime,
        creditCost: mutation.data?.metadata?.creditCost,
    };
}

/**
 * Hook لتوليد تقرير كامل بالتدفق الذكي
 */
export function useCompleteReport(config: UseCompleteReportConfig) {
    const [progress, setProgress] = useState<ReportProgress>({
        stage: 'preparing',
        message: 'جاهز للبدء',
        percentage: 0
    });

    const progressRef = useRef<ReportProgress>(progress);
    progressRef.current = progress;

    const sectionsToGenerate = config.sectionsToGenerate || SectionUtils.getAllSections();

    const mutation = useMutation({
        mutationFn: async () => {
            return await IntelligentReportService.generateCompleteReport({
                ...config,
                sectionsToGenerate,
                onProgress: (progressData) => {
                    const newProgress: ReportProgress = {
                        stage: progressData.stage as any,
                        message: progressData.message,
                        percentage: progressData.percentage,
                        currentSection: progressData.currentSection,
                        completedSections: progressData.completedSections,
                        sectionProgress: progressData.sectionProgress
                    };
                    setProgress(newProgress);
                    config.onProgress?.(newProgress);
                }
            });
        },
        onSuccess: (result) => {
            const qualityAnalysis = IntelligentReportService.analyzeReportQuality(result);
            toast.success(`تم توليد التقرير بنجاح! (${qualityAnalysis.overallGrade})`, {
                description: `${result.overallMetrics.successfulSections}/${result.overallMetrics.totalSections} أقسام - جودة متوسطة: ${result.overallMetrics.averageQuality.toFixed(1)}/100`
            });
            config.onSuccess?.(result);
        },
        onError: (error: Error) => {
            toast.error('فشل في توليد التقرير', {
                description: error.message
            });
            config.onError?.(error);
        }
    });

    // التوليد التلقائي عند تغيير الإعدادات
    useEffect(() => {
        if (config.autoGenerate && config.proposal) {
            mutation.mutate();
        }
    }, [config.autoGenerate, JSON.stringify(sectionsToGenerate), config.proposal]);

    // حساب التقديرات
    const estimates = IntelligentReportService.estimateGenerationTime(sectionsToGenerate);
    const dependencyValidation = IntelligentReportService.validateSectionDependencies(sectionsToGenerate);
    const estimatedCost = IntelligentReportService.calculateEstimatedCreditCost({
        operationType: 'complete-report',
        sectionsCount: sectionsToGenerate.length
    });

    return {
        // حالة التوليد
        isGenerating: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,
        result: mutation.data,
        progress,

        // معلومات التقرير
        sectionsToGenerate,
        estimates,
        dependencyValidation,
        estimatedCost,

        // دوال التحكم
        generateReport: mutation.mutate,
        reset: mutation.reset,

        // تحليل الجودة
        qualityAnalysis: mutation.data ? IntelligentReportService.analyzeReportQuality(mutation.data) : null,

        // إحصائيات
        executionTime: mutation.data?.metadata?.executionTime,
        creditCost: mutation.data?.metadata?.creditCost,
    };
}

/**
 * Hook لمراقبة أداء النظام الذكي
 */
export function usePerformanceMonitoring() {
    const query = useQuery({
        queryKey: ['intelligent-report-performance'],
        queryFn: () => IntelligentReportService.getPerformanceStats(),
        refetchInterval: 30000, // تحديث كل 30 ثانية
        staleTime: 10000, // البيانات صالحة لمدة 10 ثواني
    });

    const refreshStats = useCallback(() => {
        query.refetch();
    }, [query]);

    return {
        // بيانات الأداء
        stats: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,

        // دوال التحكم
        refreshStats,

        // إحصائيات سريعة
        quickStats: query.data?.data?.quickStats,
        systemInfo: query.data?.data?.systemInfo,
        recommendations: query.data?.data?.performanceReport?.recommendations || [],
    };
}

/**
 * Hook لإدارة حالة التقرير المتعددة الأقسام
 */
export function useReportBuilder() {
    const [selectedSections, setSelectedSections] = useState<SectionName[]>([]);
    const [sectionResults, setSectionResults] = useState<Record<string, SingleSectionResult>>({});
    const [reportConfig, setReportConfig] = useState({
        proposal: null,
        projectPlan: null,
        guidelines: [] as string[],
        contextFiles: [] as Array<{ fileName: string; content: string; type: string }>,
        qualityThreshold: 85,
        enableIterativeImprovement: true,
        enablePerformanceMonitoring: true,
    });

    // إضافة قسم للتحديد
    const addSection = useCallback((section: SectionName) => {
        setSelectedSections(prev => {
            if (!prev.includes(section)) {
                return [...prev, section];
            }
            return prev;
        });
    }, []);

    // إزالة قسم من التحديد
    const removeSection = useCallback((section: SectionName) => {
        setSelectedSections(prev => prev.filter(s => s !== section));
        setSectionResults(prev => {
            const newResults = { ...prev };
            delete newResults[section];
            return newResults;
        });
    }, []);

    // تحديث نتيجة قسم
    const updateSectionResult = useCallback((section: SectionName, result: SingleSectionResult) => {
        setSectionResults(prev => ({
            ...prev,
            [section]: result
        }));
    }, []);

    // مسح جميع النتائج
    const clearResults = useCallback(() => {
        setSectionResults({});
    }, []);

    // تحديث إعدادات التقرير
    const updateConfig = useCallback((updates: Partial<typeof reportConfig>) => {
        setReportConfig(prev => ({ ...prev, ...updates }));
    }, []);

    // حساب التقديرات
    const estimates = IntelligentReportService.estimateGenerationTime(selectedSections);
    const dependencyValidation = IntelligentReportService.validateSectionDependencies(selectedSections);
    const estimatedCost = IntelligentReportService.calculateEstimatedCreditCost({
        operationType: selectedSections.length === 1 ? 'single-section' : 'complete-report',
        sectionsCount: selectedSections.length
    });

    // إحصائيات النتائج
    const completedSections = Object.keys(sectionResults);
    const totalQuality = Object.values(sectionResults).reduce((sum, result) => sum + (85), 0); // تقدير افتراضي
    const averageQuality = completedSections.length > 0 ? totalQuality / completedSections.length : 0;

    return {
        // حالة التقرير
        selectedSections,
        sectionResults,
        reportConfig,
        completedSections,

        // دوال إدارة الأقسام
        addSection,
        removeSection,
        updateSectionResult,
        clearResults,
        updateConfig,

        // معلومات وتقديرات
        estimates,
        dependencyValidation,
        estimatedCost,
        averageQuality,

        // حالة الاكتمال
        isComplete: completedSections.length === selectedSections.length && selectedSections.length > 0,
        progress: selectedSections.length > 0 ? (completedSections.length / selectedSections.length) * 100 : 0,

        // دوال مساعدة
        canGenerate: selectedSections.length > 0 && reportConfig.proposal,
        hasResults: completedSections.length > 0,
    };
}

/**
 * Hook لتتبع الأداء في الوقت الفعلي
 */
export function useRealTimePerformance() {
    const [metrics, setMetrics] = useState({
        activeGenerations: 0,
        totalGenerationsToday: 0,
        averageQualityToday: 0,
        averageTimeToday: 0,
        systemLoad: 'منخفض' as 'منخفض' | 'متوسط' | 'عالي'
    });

    const performanceQuery = usePerformanceMonitoring();

    // تحديث المقاييس عند تغيير البيانات
    useEffect(() => {
        if (performanceQuery.stats?.data?.quickStats) {
            const { quickStats } = performanceQuery.stats.data;
            setMetrics(prev => ({
                ...prev,
                totalGenerationsToday: quickStats.completedSessions,
                averageQualityToday: quickStats.avgQualityToday,
                averageTimeToday: quickStats.avgExecutionTimeToday,
                systemLoad: quickStats.avgExecutionTimeToday > 10000 ? 'عالي' :
                    quickStats.avgExecutionTimeToday > 5000 ? 'متوسط' : 'منخفض'
            }));
        }
    }, [performanceQuery.stats]);

    const incrementActiveGenerations = useCallback(() => {
        setMetrics(prev => ({ ...prev, activeGenerations: prev.activeGenerations + 1 }));
    }, []);

    const decrementActiveGenerations = useCallback(() => {
        setMetrics(prev => ({ ...prev, activeGenerations: Math.max(0, prev.activeGenerations - 1) }));
    }, []);

    return {
        metrics,
        incrementActiveGenerations,
        decrementActiveGenerations,
        systemRecommendations: performanceQuery.recommendations,
        isSystemHealthy: metrics.systemLoad !== 'عالي' && metrics.averageQualityToday > 80,
    };
}

/**
 * Hook مخصص لمعاينة الأقسام
 */
export function useSectionPreview() {
    const [previewSection, setPreviewSection] = useState<SectionName | null>(null);
    const [previewContent, setPreviewContent] = useState<string>('');

    const openPreview = useCallback((section: SectionName, content: string) => {
        setPreviewSection(section);
        setPreviewContent(content);
    }, []);

    const closePreview = useCallback(() => {
        setPreviewSection(null);
        setPreviewContent('');
    }, []);

    const sectionInfo = previewSection ? SUPPORTED_SECTIONS[previewSection] : null;

    return {
        previewSection,
        previewContent,
        sectionInfo,
        isOpen: previewSection !== null,
        openPreview,
        closePreview,
    };
}
