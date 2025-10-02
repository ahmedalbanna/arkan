/**
 * React Hooks للتفاعل مع نظام أقسام المقترح الذكية
 * يوفر واجهة تفاعلية لتوليد وإدارة أقسام المقترح
 */

import {
    intelligentProposalService,
    PROPOSAL_SECTION_TYPES,
    type CompleteProposalGenerationOptions,
    type CompleteProposalResult,
    type ProposalComplexity,
    type ProposalSectionFilter,
    type ProposalSectionGenerationOptions,
    type ProposalSectionResult,
    type ProposalSectionStats,
    type ProposalSectionType,
    type ProposalStyle
} from '@/services/intelligent-proposal-service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

// أنواع البيانات للـ hooks
export interface ProposalSectionGeneratorState {
    isGenerating: boolean;
    result: ProposalSectionResult | null;
    error: string | null;
    progress: {
        message: string;
        percentage: number;
    };
    estimatedTime: string;
    qualityScore: number;
    executionTime: number;
    iterations: number;
}

export interface CompleteProposalGeneratorState {
    isGenerating: boolean;
    result: CompleteProposalResult | null;
    error: string | null;
    progress: {
        currentSection: string;
        completedSections: number;
        totalSections: number;
        message: string;
        percentage: number;
    };
    estimatedTime: string;
    overallQuality: number;
    totalExecutionTime: number;
}

export interface ProposalSectionLibraryState {
    sections: ProposalSectionResult[];
    totalSections: number;
    isLoading: boolean;
    error: string | null;
}

export interface ProposalStatsState {
    stats: ProposalSectionStats | null;
    isLoading: boolean;
    error: string | null;
}

// إعدادات مولد القسم
export interface UseProposalSectionGeneratorConfig {
    type: ProposalSectionType;
    projectContext: ProposalSectionGenerationOptions['projectContext'];
    style?: ProposalStyle;
    complexity?: ProposalComplexity;
    referenceContent?: ProposalSectionGenerationOptions['referenceContent'];
    intelligentSettings?: ProposalSectionGenerationOptions['intelligentSettings'];
    onSuccess?: (result: ProposalSectionResult) => void;
    onError?: (error: string) => void;
}

/**
 * Hook لتوليد قسم واحد من المقترح
 */
export function useProposalSectionGenerator(config: UseProposalSectionGeneratorConfig) {
    const [state, setState] = useState<ProposalSectionGeneratorState>({
        isGenerating: false,
        result: null,
        error: null,
        progress: { message: '', percentage: 0 },
        estimatedTime: '30 ثانية',
        qualityScore: 0,
        executionTime: 0,
        iterations: 0
    });

    const queryClient = useQueryClient();

    // حساب الوقت المتوقع
    useEffect(() => {
        const hasContext = !!config.referenceContent?.existingSections;
        const estimatedTime = intelligentProposalService.estimateGenerationTime(
            config.complexity || 'detailed',
            hasContext
        );
        setState(prev => ({ ...prev, estimatedTime }));
    }, [config.complexity, config.referenceContent]);

    // Mutation لتوليد القسم
    const generateMutation = useMutation({
        mutationFn: async (options: ProposalSectionGenerationOptions) => {
            return intelligentProposalService.generateSection(options);
        },
        onMutate: () => {
            setState(prev => ({
                ...prev,
                isGenerating: true,
                error: null,
                progress: { message: 'بدء التوليد...', percentage: 10 }
            }));
        },
        onSuccess: (result) => {
            console.log('🎉 نتيجة التوليد:', result);

            // التحقق من وجود البيانات المطلوبة
            const qualityScore = result?.qualityScore ?? result?.metadata?.qualityScore ?? 0;
            const executionTime = result?.metadata?.executionTime ?? 0;
            const iterations = result?.metadata?.iterations ?? 1;

            console.log('📊 معلومات الجودة:', { qualityScore, executionTime, iterations });

            setState(prev => ({
                ...prev,
                isGenerating: false,
                result,
                qualityScore,
                executionTime,
                iterations,
                progress: { message: 'تم التوليد بنجاح', percentage: 100 }
            }));

            // إشعار النجاح
            toast.success('تم توليد القسم بنجاح! 🎉', {
                description: `جودة: ${qualityScore}/100 - وقت التنفيذ: ${executionTime}ms`
            });

            // استدعاء callback النجاح
            config.onSuccess?.(result);

            // تحديث الكاش
            queryClient.invalidateQueries({ queryKey: ['proposal-sections'] });
        },
        onError: (error: any) => {
            const errorMessage = error?.message || 'فشل في توليد القسم';
            setState(prev => ({
                ...prev,
                isGenerating: false,
                error: errorMessage,
                progress: { message: 'فشل في التوليد', percentage: 0 }
            }));

            // إشعار الخطأ
            toast.error('فشل في توليد القسم', {
                description: errorMessage
            });

            // استدعاء callback الخطأ
            config.onError?.(errorMessage);
        }
    });

    // تحديث التقدم أثناء التوليد
    useEffect(() => {
        if (generateMutation.isPending) {
            const interval = setInterval(() => {
                setState(prev => {
                    if (prev.progress.percentage < 90) {
                        const newPercentage = prev.progress.percentage + 10;
                        let message = 'جاري التوليد...';

                        if (newPercentage >= 20) message = 'تحليل السياق...';
                        if (newPercentage >= 40) message = 'بناء المحتوى...';
                        if (newPercentage >= 60) message = 'تحسين الجودة...';
                        if (newPercentage >= 80) message = 'المراجعة النهائية...';

                        return {
                            ...prev,
                            progress: { message, percentage: newPercentage }
                        };
                    }
                    return prev;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [generateMutation.isPending]);

    // دالة توليد القسم
    const generateSection = useCallback(() => {
        console.log('🚀 بدء توليد القسم مع الإعدادات:', config);

        const options: any = {
            type: config.type,
            projectContext: config.projectContext,
            style: {
                ...(config.style || {}),
                tone: config.style?.tone || 'professional',
                length: config.style?.length || 'moderate',
                format: config.style?.format || 'structured',
                language: config.style?.language || 'ar'
            },
            complexity: config.complexity || 'detailed',
            referenceContent: config.referenceContent,
            intelligentSettings: config.intelligentSettings,
            outputPreferences: {
                includeOutline: true,
                includeKeyPoints: true,
                generateSuggestions: true,
                validateContent: true
            }
        };

        console.log('📤 الخيارات المرسلة إلى API:', options);

        generateMutation.mutate(options);
    }, [config, generateMutation]);

    // دالة إعادة التعيين
    const reset = useCallback(() => {
        setState({
            isGenerating: false,
            result: null,
            error: null,
            progress: { message: '', percentage: 0 },
            estimatedTime: '30 ثانية',
            qualityScore: 0,
            executionTime: 0,
            iterations: 0
        });
        generateMutation.reset();
    }, [generateMutation]);

    return {
        ...state,
        generateSection,
        reset,
        canGenerate: !state.isGenerating
    };
}

/**
 * Hook لتوليد مقترح كامل
 */
export function useCompleteProposalGenerator() {
    const [state, setState] = useState<CompleteProposalGeneratorState>({
        isGenerating: false,
        result: null,
        error: null,
        progress: {
            currentSection: '',
            completedSections: 0,
            totalSections: 0,
            message: '',
            percentage: 0
        },
        estimatedTime: '5 دقائق',
        overallQuality: 0,
        totalExecutionTime: 0
    });

    const queryClient = useQueryClient();

    // Mutation لتوليد المقترح الكامل
    const generateMutation = useMutation({
        mutationFn: async (options: CompleteProposalGenerationOptions) => {
            return intelligentProposalService.generateCompleteProposal(options);
        },
        onMutate: (options) => {
            setState(prev => ({
                ...prev,
                isGenerating: true,
                error: null,
                progress: {
                    currentSection: '',
                    completedSections: 0,
                    totalSections: options.sectionsToGenerate.length,
                    message: 'بدء توليد المقترح الكامل...',
                    percentage: 5
                }
            }));
        },
        onSuccess: (result) => {
            setState(prev => ({
                ...prev,
                isGenerating: false,
                result,
                overallQuality: result.overallQuality,
                totalExecutionTime: result.performanceMetrics.totalExecutionTime,
                progress: {
                    ...prev.progress,
                    message: 'تم توليد المقترح بنجاح',
                    percentage: 100
                }
            }));

            // إشعار النجاح
            toast.success('تم توليد المقترح الكامل بنجاح! 🎉', {
                description: `${result.performanceMetrics.sectionsGenerated} أقسام - جودة: ${Math.round(result.overallQuality)}/100`
            });

            // تحديث الكاش
            queryClient.invalidateQueries({ queryKey: ['proposal-sections'] });
        },
        onError: (error: any) => {
            const errorMessage = error?.message || 'فشل في توليد المقترح';
            setState(prev => ({
                ...prev,
                isGenerating: false,
                error: errorMessage,
                progress: {
                    ...prev.progress,
                    message: 'فشل في التوليد',
                    percentage: 0
                }
            }));

            // إشعار الخطأ
            toast.error('فشل في توليد المقترح الكامل', {
                description: errorMessage
            });
        }
    });

    // محاكاة تقدم التوليد
    useEffect(() => {
        if (generateMutation.isPending && state.progress.totalSections > 0) {
            const interval = setInterval(() => {
                setState(prev => {
                    if (prev.progress.percentage < 95) {
                        const sectionsPercentage = (prev.progress.completedSections / prev.progress.totalSections) * 80;
                        const newPercentage = Math.min(95, 10 + sectionsPercentage);

                        return {
                            ...prev,
                            progress: {
                                ...prev.progress,
                                percentage: newPercentage,
                                message: `جاري توليد القسم ${prev.progress.completedSections + 1} من ${prev.progress.totalSections}...`
                            }
                        };
                    }
                    return prev;
                });
            }, 2000);

            return () => clearInterval(interval);
        }
    }, [generateMutation.isPending, state.progress.totalSections]);

    // دالة توليد المقترح الكامل
    const generateCompleteProposal = useCallback((options: CompleteProposalGenerationOptions) => {
        // حساب الوقت المتوقع
        const estimatedMinutes = Math.ceil(options.sectionsToGenerate.length * 0.5);
        setState(prev => ({
            ...prev,
            estimatedTime: `${estimatedMinutes} دقيقة`
        }));

        generateMutation.mutate(options);
    }, [generateMutation]);

    // دالة إعادة التعيين
    const reset = useCallback(() => {
        setState({
            isGenerating: false,
            result: null,
            error: null,
            progress: {
                currentSection: '',
                completedSections: 0,
                totalSections: 0,
                message: '',
                percentage: 0
            },
            estimatedTime: '5 دقائق',
            overallQuality: 0,
            totalExecutionTime: 0
        });
        generateMutation.reset();
    }, [generateMutation]);

    return {
        ...state,
        generateCompleteProposal,
        reset,
        canGenerate: !state.isGenerating
    };
}

/**
 * Hook لإحصائيات أقسام المقترح
 */
export function useProposalStats() {
    // Query لجلب الإحصائيات
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['proposal-stats'],
        queryFn: async () => {
            try {
                const stats = await intelligentProposalService.getStats();
                return stats;
            } catch (error) {
                console.error('خطأ في جلب الإحصائيات:', error);
                // إرجاع بيانات افتراضية في حالة الخطأ
                return {
                    totalGenerated: 0,
                    byType: {},
                    byCategory: {},
                    averageQuality: 0,
                    averageWordCount: 0,
                    mostUsedTypes: [],
                    averageGenerationTime: 0
                };
            }
        },
        staleTime: 5 * 60 * 1000, // 5 دقائق
        refetchInterval: 30 * 1000, // تحديث كل 30 ثانية
        retry: 3,
        retryDelay: 1000
    });

    return {
        stats: data || null,
        isLoading,
        error: error?.message || null,
        refetch
    };
}

/**
 * Hook لإدارة مكتبة أقسام المقترح
 */
export function useProposalSectionLibrary(filter?: ProposalSectionFilter) {
    const [state, setState] = useState<ProposalSectionLibraryState>({
        sections: [],
        totalSections: 0,
        isLoading: false,
        error: null
    });

    // محاكاة مكتبة الأقسام (يمكن ربطها بـ API لاحقاً)
    useEffect(() => {
        setState(prev => ({
            ...prev,
            isLoading: true
        }));

        // محاكاة تحميل البيانات
        setTimeout(() => {
            const mockSections: ProposalSectionResult[] = [
                {
                    type: 'executive_summary',
                    title: 'الملخص التنفيذي - نظام إدارة المكتبة',
                    content: 'هذا ملخص تنفيذي لمشروع نظام إدارة المكتبة الذكي...',
                    outline: ['نظرة عامة', 'الأهداف', 'الفوائد'],
                    keyPoints: ['تحسين الكفاءة', 'تقليل التكاليف', 'تحسين الخدمة'],
                    wordCount: 250,
                    qualityScore: 88,
                    completeness: 90,
                    clarity: 85,
                    relevance: 90,
                    suggestions: ['إضافة المزيد من الأرقام'],
                    metadata: {
                        generatedAt: new Date().toISOString(),
                        executionTime: 2500,
                        modelUsed: 'gemini-pro',
                        iterations: 2,
                        qualityScore: 88
                    },
                    relatedSections: ['problem_statement', 'objectives']
                }
            ];

            setState({
                sections: mockSections,
                totalSections: mockSections.length,
                isLoading: false,
                error: null
            });
        }, 1000);
    }, [filter]);

    // دالة حفظ قسم
    const saveSection = useCallback((section: ProposalSectionResult) => {
        setState(prev => ({
            ...prev,
            sections: [...prev.sections, section],
            totalSections: prev.totalSections + 1
        }));

        toast.success('تم حفظ القسم في المكتبة');
    }, []);

    // دالة حذف قسم
    const deleteSection = useCallback((sectionId: string) => {
        setState(prev => ({
            ...prev,
            sections: prev.sections.filter(s => s.metadata.generatedAt !== sectionId),
            totalSections: prev.totalSections - 1
        }));

        toast.success('تم حذف القسم من المكتبة');
    }, []);

    return {
        ...state,
        saveSection,
        deleteSection
    };
}

/**
 * Hook لمعاينة أقسام المقترح
 */
export function useProposalSectionPreview() {
    const [previewSection, setPreviewSection] = useState<ProposalSectionResult | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const openPreview = useCallback((section: ProposalSectionResult) => {
        setPreviewSection(section);
        setIsPreviewOpen(true);
    }, []);

    const closePreview = useCallback(() => {
        setIsPreviewOpen(false);
        setPreviewSection(null);
    }, []);

    return {
        previewSection,
        isPreviewOpen,
        openPreview,
        closePreview
    };
}

/**
 * Hook لتحسين أقسام المقترح
 */
export function useProposalSectionImprovement() {
    const [isImproving, setIsImproving] = useState(false);
    const [improvementResult, setImprovementResult] = useState<{
        improvedContent: string;
        improvements: string[];
        qualityScore: number;
    } | null>(null);

    const improveMutation = useMutation({
        mutationFn: async ({
            type,
            content,
            improvementAreas
        }: {
            type: ProposalSectionType;
            content: string;
            improvementAreas: string[];
        }) => {
            return intelligentProposalService.improveSection(type, content, improvementAreas);
        },
        onMutate: () => {
            setIsImproving(true);
        },
        onSuccess: (result) => {
            setIsImproving(false);
            setImprovementResult(result);

            toast.success('تم تحسين القسم بنجاح!', {
                description: `نقاط الجودة الجديدة: ${result.qualityScore}/100`
            });
        },
        onError: (error: any) => {
            setIsImproving(false);
            toast.error('فشل في تحسين القسم', {
                description: error?.message || 'حدث خطأ غير متوقع'
            });
        }
    });

    const improveSection = useCallback((
        type: ProposalSectionType,
        content: string,
        improvementAreas: string[]
    ) => {
        improveMutation.mutate({ type, content, improvementAreas });
    }, [improveMutation]);

    const reset = useCallback(() => {
        setImprovementResult(null);
        improveMutation.reset();
    }, [improveMutation]);

    return {
        isImproving,
        improvementResult,
        improveSection,
        reset
    };
}

/**
 * Hook لمراقبة الأداء في الوقت الفعلي
 */
export function useProposalRealTimePerformance() {
    const [performanceData, setPerformanceData] = useState({
        activeGenerations: 0,
        systemLoad: 0,
        averageQuality: 0,
        successRate: 100,
        recommendations: [] as string[]
    });

    // محاكاة بيانات الأداء
    useEffect(() => {
        const interval = setInterval(() => {
            setPerformanceData({
                activeGenerations: Math.floor(Math.random() * 5),
                systemLoad: Math.floor(Math.random() * 100),
                averageQuality: 75 + Math.floor(Math.random() * 20),
                successRate: 95 + Math.floor(Math.random() * 5),
                recommendations: [
                    'النظام يعمل بكفاءة عالية',
                    'جودة المخرجات ممتازة',
                    'أوقات الاستجابة مثلى'
                ]
            });
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return performanceData;
}

/**
 * Hook شامل لبناء المقترح
 */
export function useProposalBuilder() {
    const [selectedSections, setSelectedSections] = useState<ProposalSectionType[]>([]);
    const [projectContext, setProjectContext] = useState<any>(null);
    const [style, setStyle] = useState<ProposalStyle>({
        tone: 'professional',
        length: 'moderate',
        format: 'structured',
        language: 'ar'
    });
    const [complexity, setComplexity] = useState<ProposalComplexity>('detailed');

    const completeGenerator = useCompleteProposalGenerator();

    // دالة إضافة قسم
    const addSection = useCallback((sectionType: ProposalSectionType) => {
        setSelectedSections(prev => {
            if (!prev.includes(sectionType)) {
                return [...prev, sectionType];
            }
            return prev;
        });
    }, []);

    // دالة إزالة قسم
    const removeSection = useCallback((sectionType: ProposalSectionType) => {
        setSelectedSections(prev => prev.filter(s => s !== sectionType));
    }, []);

    // دالة توليد المقترح
    const generateProposal = useCallback(() => {
        if (!projectContext || selectedSections.length === 0) {
            toast.error('يرجى تحديد سياق المشروع والأقسام المطلوبة');
            return;
        }

        const options: CompleteProposalGenerationOptions = {
            projectContext,
            sectionsToGenerate: selectedSections,
            style,
            complexity,
            intelligentSettings: {
                generateInOrder: true,
                useIntelligentDependencies: true,
                enableCrossReferencing: true,
                enableConsistencyCheck: true,
                qualityThreshold: 80,
                maxRetries: 3
            }
        };

        completeGenerator.generateCompleteProposal(options);
    }, [projectContext, selectedSections, style, complexity, completeGenerator]);

    // تقدير إجمالي الكلمات
    const estimatedWordCount = selectedSections.reduce((total, type) => {
        return total + PROPOSAL_SECTION_TYPES[type].estimatedLength;
    }, 0);

    // تقدير وقت القراءة
    const estimatedReadingTime = intelligentProposalService.estimateReadingTime(estimatedWordCount);

    return {
        selectedSections,
        projectContext,
        style,
        complexity,
        estimatedWordCount,
        estimatedReadingTime,
        addSection,
        removeSection,
        setProjectContext,
        setStyle,
        setComplexity,
        generateProposal,
        generationState: completeGenerator,
        canGenerate: selectedSections.length > 0 && !!projectContext && !completeGenerator.isGenerating
    };
}
