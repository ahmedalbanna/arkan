/**
 * Hooks ذكية لتوليد وإدارة مخططات PlantUML
 * توفر واجهة سهلة ومتقدمة للمكونات
 */

import type { SectionName } from '@/ai/schemas/enums';
import { toast } from '@/hooks/use-toast';
import {
    DIAGRAM_TYPES,
    DiagramUtils,
    IntelligentDiagramService,
    type DiagramGenerationConfig,
    type DiagramResult,
    type DiagramType
} from '@/services/intelligent-diagram-service';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

// أنواع البيانات للـ hooks
export interface DiagramProgress {
    stage: 'preparing' | 'analyzing' | 'generating' | 'optimizing' | 'completed' | 'error';
    message: string;
    percentage: number;
}

export interface UseDiagramGeneratorConfig {
    type: DiagramType;
    title?: string;
    description?: string;
    context?: {
        projectData?: any;
        sectionContent?: string;
        requirements?: string[];
        stakeholders?: string[];
        technologies?: string[];
    };
    style?: {
        theme?: 'default' | 'modern' | 'minimal' | 'colorful';
        direction?: 'top-bottom' | 'left-right' | 'bottom-top' | 'right-left';
        showDetails?: boolean;
        includeNotes?: boolean;
    };
    complexity?: 'basic' | 'detailed' | 'comprehensive';
    language?: 'ar' | 'en';
    autoGenerate?: boolean;
    onSuccess?: (result: DiagramResult) => void;
    onError?: (error: Error) => void;
    onProgress?: (progress: DiagramProgress) => void;
}

export interface UseDiagramCollectionConfig {
    sectionName?: SectionName;
    projectData?: any;
    autoGenerate?: boolean;
    maxDiagrams?: number;
    onSuccess?: (results: DiagramResult[]) => void;
    onError?: (error: Error) => void;
    onProgress?: (progress: { completed: number; total: number; current?: string }) => void;
}

/**
 * Hook لتوليد مخطط واحد
 */
export function useDiagramGenerator(config: UseDiagramGeneratorConfig) {
    const [progress, setProgress] = useState<DiagramProgress>({
        stage: 'preparing',
        message: 'جاهز للبدء',
        percentage: 0
    });

    const mutation = useMutation({
        mutationFn: async () => {
            const generationConfig: DiagramGenerationConfig = {
                type: config.type,
                title: config.title || DIAGRAM_TYPES[config.type].title,
                description: config.description,
                context: config.context || {},
                style: {
                    theme: 'modern',
                    direction: 'top-bottom',
                    showDetails: true,
                    includeNotes: true,
                    ...config.style
                },
                complexity: config.complexity || 'detailed',
                language: config.language || 'ar'
            };

            // تحديث التقدم
            setProgress({
                stage: 'preparing',
                message: 'جاري تحضير بيانات المخطط...',
                percentage: 10
            });
            config.onProgress?.({
                stage: 'preparing',
                message: 'جاري تحضير بيانات المخطط...',
                percentage: 10
            });

            setProgress({
                stage: 'analyzing',
                message: 'جاري تحليل السياق والمتطلبات...',
                percentage: 30
            });
            config.onProgress?.({
                stage: 'analyzing',
                message: 'جاري تحليل السياق والمتطلبات...',
                percentage: 30
            });

            setProgress({
                stage: 'generating',
                message: 'جاري توليد كود PlantUML...',
                percentage: 60
            });
            config.onProgress?.({
                stage: 'generating',
                message: 'جاري توليد كود PlantUML...',
                percentage: 60
            });

            const result = await IntelligentDiagramService.generateDiagram(generationConfig);

            setProgress({
                stage: 'optimizing',
                message: 'جاري تحسين وتحليل المخطط...',
                percentage: 90
            });
            config.onProgress?.({
                stage: 'optimizing',
                message: 'جاري تحسين وتحليل المخطط...',
                percentage: 90
            });

            setProgress({
                stage: 'completed',
                message: 'تم التوليد بنجاح!',
                percentage: 100
            });
            config.onProgress?.({
                stage: 'completed',
                message: 'تم التوليد بنجاح!',
                percentage: 100
            });

            return result;
        },
        onSuccess: (result) => {
            toast.success(`تم توليد ${DIAGRAM_TYPES[config.type].title} بنجاح!`, {
                description: `جودة: ${result.metadata.qualityScore}/100 - وقت التنفيذ: ${result.metadata.generationTime}ms`
            });
            config.onSuccess?.(result);
        },
        onError: (error: Error) => {
            setProgress({
                stage: 'error',
                message: `خطأ في التوليد: ${error.message}`,
                percentage: 0
            });
            toast.error('فشل في توليد المخطط', {
                description: error.message
            });
            config.onError?.(error);
        }
    });

    // التوليد التلقائي عند تغيير الإعدادات
    useEffect(() => {
        if (config.autoGenerate && config.context?.projectData) {
            mutation.mutate();
        }
    }, [config.autoGenerate, config.type, JSON.stringify(config.context?.projectData)]);

    const diagramInfo = DIAGRAM_TYPES[config.type];
    const estimatedTime = DiagramUtils.formatEstimatedTime(diagramInfo.estimatedTime);

    return {
        // حالة التوليد
        isGenerating: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,
        result: mutation.data,
        progress,

        // معلومات المخطط
        diagramInfo,
        estimatedTime,

        // دوال التحكم
        generateDiagram: mutation.mutate,
        reset: mutation.reset,

        // إحصائيات
        executionTime: mutation.data?.metadata?.generationTime,
        qualityScore: mutation.data?.metadata?.qualityScore,
        elementCount: mutation.data?.metadata?.elementCount,
    };
}

/**
 * Hook لتوليد مجموعة من المخططات لقسم معين
 */
export function useDiagramCollection(config: UseDiagramCollectionConfig) {
    const [progress, setProgress] = useState({ completed: 0, total: 0, current: undefined as string | undefined });
    const [results, setResults] = useState<DiagramResult[]>([]);

    const mutation = useMutation({
        mutationFn: async () => {
            if (!config.sectionName || !config.projectData) {
                throw new Error('اسم القسم وبيانات المشروع مطلوبة');
            }

            // الحصول على أنواع المخططات المناسبة
            const relevantTypes = IntelligentDiagramService.getRelevantDiagramTypes(config.sectionName);
            const typesToGenerate = relevantTypes.slice(0, config.maxDiagrams || 3);

            setProgress({ completed: 0, total: typesToGenerate.length });
            config.onProgress?.({ completed: 0, total: typesToGenerate.length });

            const generatedResults: DiagramResult[] = [];

            for (let i = 0; i < typesToGenerate.length; i++) {
                const type = typesToGenerate[i];
                const typeInfo = DIAGRAM_TYPES[type];

                setProgress({
                    completed: i,
                    total: typesToGenerate.length,
                    current: typeInfo.title
                });
                config.onProgress?.({
                    completed: i,
                    total: typesToGenerate.length,
                    current: typeInfo.title
                });

                try {
                    const generationConfig: DiagramGenerationConfig = {
                        type,
                        title: `${typeInfo.title} - ${config.projectData.projectTitle || 'المشروع'}`,
                        context: {
                            projectData: config.projectData,
                            sectionContent: '', // يمكن إضافة محتوى القسم هنا
                            requirements: config.projectData.objectives || [],
                            stakeholders: config.projectData.stakeholders || [],
                            technologies: config.projectData.technologies || []
                        },
                        style: {
                            theme: 'modern',
                            direction: 'top-bottom',
                            showDetails: true,
                            includeNotes: true
                        },
                        complexity: 'detailed',
                        language: 'ar'
                    };

                    const result = await IntelligentDiagramService.generateDiagram(generationConfig);
                    generatedResults.push(result);

                } catch (error) {
                    console.warn(`فشل في توليد مخطط ${type}:`, error);
                }
            }

            setProgress({
                completed: typesToGenerate.length,
                total: typesToGenerate.length,
                current: undefined
            });
            config.onProgress?.({
                completed: typesToGenerate.length,
                total: typesToGenerate.length
            });

            return generatedResults;
        },
        onSuccess: (results) => {
            setResults(results);
            toast.success(`تم توليد ${results.length} مخطط بنجاح!`, {
                description: `للقسم: ${config.sectionName}`
            });
            config.onSuccess?.(results);
        },
        onError: (error: Error) => {
            toast.error('فشل في توليد المخططات', {
                description: error.message
            });
            config.onError?.(error);
        }
    });

    // التوليد التلقائي
    useEffect(() => {
        if (config.autoGenerate && config.sectionName && config.projectData) {
            mutation.mutate();
        }
    }, [config.autoGenerate, config.sectionName, JSON.stringify(config.projectData)]);

    return {
        // حالة التوليد
        isGenerating: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,
        results,
        progress,

        // دوال التحكم
        generateDiagrams: mutation.mutate,
        reset: () => {
            mutation.reset();
            setResults([]);
            setProgress({ completed: 0, total: 0, current: undefined });
        },

        // معلومات
        relevantTypes: config.sectionName ? IntelligentDiagramService.getRelevantDiagramTypes(config.sectionName) : [],
    };
}

/**
 * Hook لإحصائيات المخططات
 */
export function useDiagramStats() {
    const query = useQuery({
        queryKey: ['diagram-stats'],
        queryFn: () => IntelligentDiagramService.getDiagramStats(),
        refetchInterval: 60000, // تحديث كل دقيقة
        staleTime: 30000, // البيانات صالحة لمدة 30 ثانية
    });

    const refreshStats = useCallback(() => {
        query.refetch();
    }, [query]);

    return {
        // بيانات الإحصائيات
        stats: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,

        // دوال التحكم
        refreshStats,

        // إحصائيات سريعة
        totalGenerated: query.data?.totalGenerated || 0,
        averageQuality: query.data?.averageQuality || 0,
        mostUsedTypes: query.data?.mostUsedTypes || [],
    };
}

/**
 * Hook لإدارة مجموعة من المخططات
 */
export function useDiagramManager() {
    const [diagrams, setDiagrams] = useState<DiagramResult[]>([]);
    const [selectedDiagram, setSelectedDiagram] = useState<DiagramResult | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'preview'>('grid');

    // إضافة مخطط جديد
    const addDiagram = useCallback((diagram: DiagramResult) => {
        setDiagrams(prev => [...prev, diagram]);
    }, []);

    // إزالة مخطط
    const removeDiagram = useCallback((diagramId: string) => {
        setDiagrams(prev => prev.filter(d => d.id !== diagramId));
        if (selectedDiagram?.id === diagramId) {
            setSelectedDiagram(null);
        }
    }, [selectedDiagram]);

    // تحديث مخطط
    const updateDiagram = useCallback((diagramId: string, updates: Partial<DiagramResult>) => {
        setDiagrams(prev => prev.map(d =>
            d.id === diagramId ? { ...d, ...updates } : d
        ));
        if (selectedDiagram?.id === diagramId) {
            setSelectedDiagram(prev => prev ? { ...prev, ...updates } : null);
        }
    }, [selectedDiagram]);

    // مسح جميع المخططات
    const clearDiagrams = useCallback(() => {
        setDiagrams([]);
        setSelectedDiagram(null);
    }, []);

    // تصفية المخططات حسب النوع
    const filterByType = useCallback((type: DiagramType) => {
        return diagrams.filter(d => d.type === type);
    }, [diagrams]);

    // البحث في المخططات
    const searchDiagrams = useCallback((query: string) => {
        return diagrams.filter(d =>
            d.title.toLowerCase().includes(query.toLowerCase()) ||
            d.type.includes(query.toLowerCase())
        );
    }, [diagrams]);

    // ترتيب المخططات
    const sortDiagrams = useCallback((
        sortBy: 'title' | 'type' | 'quality' | 'date',
        order: 'asc' | 'desc' = 'desc'
    ) => {
        return [...diagrams].sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'title':
                    comparison = a.title.localeCompare(b.title);
                    break;
                case 'type':
                    comparison = a.type.localeCompare(b.type);
                    break;
                case 'quality':
                    comparison = a.metadata.qualityScore - b.metadata.qualityScore;
                    break;
                case 'date':
                    comparison = new Date(a.metadata.generatedAt).getTime() -
                        new Date(b.metadata.generatedAt).getTime();
                    break;
            }

            return order === 'asc' ? comparison : -comparison;
        });
    }, [diagrams]);

    // إحصائيات المجموعة
    const getCollectionStats = useCallback(() => {
        const typeCount: Record<string, number> = {};
        let totalQuality = 0;
        let totalTime = 0;

        diagrams.forEach(diagram => {
            typeCount[diagram.type] = (typeCount[diagram.type] || 0) + 1;
            totalQuality += diagram.metadata.qualityScore;
            totalTime += diagram.metadata.generationTime;
        });

        return {
            total: diagrams.length,
            byType: typeCount,
            averageQuality: diagrams.length > 0 ? totalQuality / diagrams.length : 0,
            averageTime: diagrams.length > 0 ? totalTime / diagrams.length : 0,
            mostUsedType: Object.entries(typeCount).sort(([, a], [, b]) => b - a)[0]?.[0] as DiagramType
        };
    }, [diagrams]);

    return {
        // حالة المخططات
        diagrams,
        selectedDiagram,
        viewMode,

        // دوال إدارة المخططات
        addDiagram,
        removeDiagram,
        updateDiagram,
        clearDiagrams,
        setSelectedDiagram,
        setViewMode,

        // دوال البحث والتصفية
        filterByType,
        searchDiagrams,
        sortDiagrams,

        // إحصائيات
        stats: getCollectionStats(),

        // حالة المجموعة
        isEmpty: diagrams.length === 0,
        hasSelection: selectedDiagram !== null,
    };
}

/**
 * Hook لتحسين المخططات
 */
export function useDiagramOptimizer() {
    const [optimizationHistory, setOptimizationHistory] = useState<Array<{
        original: string;
        optimized: string;
        type: string;
        improvements: string[];
        timestamp: string;
    }>>([]);

    const optimizeMutation = useMutation({
        mutationFn: async ({
            plantUmlCode,
            optimizationType
        }: {
            plantUmlCode: string;
            optimizationType: 'readability' | 'performance' | 'aesthetics' | 'completeness'
        }) => {
            const result = await IntelligentDiagramService.optimizeDiagram(plantUmlCode, optimizationType);

            // حفظ في التاريخ
            setOptimizationHistory(prev => [...prev, {
                original: plantUmlCode,
                optimized: result.optimizedCode,
                type: optimizationType,
                improvements: result.improvements,
                timestamp: new Date().toISOString()
            }]);

            return result;
        },
        onSuccess: (result) => {
            toast.success('تم تحسين المخطط بنجاح!', {
                description: `تم تطبيق ${result.improvements.length} تحسين`
            });
        },
        onError: (error: Error) => {
            toast.error('فشل في تحسين المخطط', {
                description: error.message
            });
        }
    });

    const clearHistory = useCallback(() => {
        setOptimizationHistory([]);
    }, []);

    return {
        // حالة التحسين
        isOptimizing: optimizeMutation.isPending,
        isSuccess: optimizeMutation.isSuccess,
        isError: optimizeMutation.isError,
        error: optimizeMutation.error,
        result: optimizeMutation.data,

        // دوال التحكم
        optimizeDiagram: optimizeMutation.mutate,
        reset: optimizeMutation.reset,
        clearHistory,

        // التاريخ
        optimizationHistory,
        hasHistory: optimizationHistory.length > 0,
    };
}
