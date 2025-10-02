/**
 * Hooks ذكية لتوليد وإدارة مخططات PlantUML
 * توفر واجهة سهلة ومتقدمة للمكونات مع دعم البرومبتات الذكية
 */

import { generateDiagram } from '@/ai/flows/generate-diagram';
import { DiagramPromptBuilder } from '@/ai/prompts/diagram-prompts';
import type { SectionName } from '@/ai/schemas/enums';
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
import { toast } from 'sonner';

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

    // سياق المشروع المحدث
    projectContext?: {
        title?: string;
        description?: string;
        domain?: string;
        requirements?: string[];
        stakeholders?: string[];
        technologies?: string[];
        constraints?: string[];
    };

    // محتوى مرجعي
    referenceContent?: {
        sectionContent?: string;
        existingDiagrams?: string[];
        documentationLinks?: string[];
    };

    // إعدادات التصميم المحدثة
    style?: {
        theme?: 'default' | 'modern' | 'minimal' | 'colorful';
        direction?: 'top-bottom' | 'left-right' | 'bottom-top' | 'right-left';
        showDetails?: boolean;
        includeNotes?: boolean;
    };

    complexity?: 'basic' | 'detailed' | 'comprehensive';
    language?: 'ar' | 'en';
    requirements?: string[];

    // إعدادات ذكية جديدة
    intelligentSettings?: {
        enableContextAnalysis?: boolean;
        enableIterativeImprovement?: boolean;
        enablePerformanceMonitoring?: boolean;
        qualityThreshold?: number;
        maxIterations?: number;
        adaptiveModelSelection?: boolean;
    };

    // تفضيلات المخرجات
    outputPreferences?: {
        includeComments?: boolean;
        includeMetadata?: boolean;
        generateSuggestions?: boolean;
        validateSyntax?: boolean;
    };

    autoGenerate?: boolean;
    onSuccess?: (result: any) => void;
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
            // إعداد بيانات الإدخال للتدفق الذكي الجديد
            const flowInput = {
                title: config.title || DIAGRAM_TYPES[config.type].title,
                description: config.description || '',
                type: config.type,
                complexity: config.complexity || 'detailed',
                style: {
                    theme: 'modern' as const,
                    direction: 'top-bottom' as const,
                    showDetails: true,
                    includeNotes: true,
                    ...config.style
                },
                requirements: config.requirements || [],
                language: config.language || 'ar',
                projectContext: config.projectContext,
                referenceContent: config.referenceContent,
                intelligentSettings: {
                    enableContextAnalysis: true,
                    enableIterativeImprovement: true,
                    enablePerformanceMonitoring: true,
                    qualityThreshold: 80,
                    maxIterations: 3,
                    adaptiveModelSelection: true,
                    ...config.intelligentSettings
                },
                outputPreferences: {
                    includeComments: true,
                    includeMetadata: true,
                    generateSuggestions: true,
                    validateSyntax: true,
                    ...config.outputPreferences
                }
            };

            // تحديث التقدم - التحضير
            setProgress({
                stage: 'preparing',
                message: 'جاري تحضير بيانات المخطط والبرومبتات الذكية...',
                percentage: 10
            });
            config.onProgress?.({
                stage: 'preparing',
                message: 'جاري تحضير بيانات المخطط والبرومبتات الذكية...',
                percentage: 10
            });

            // تحديث التقدم - التحليل
            setProgress({
                stage: 'analyzing',
                message: 'جاري تحليل السياق وبناء البرومبتات المخصصة...',
                percentage: 30
            });
            config.onProgress?.({
                stage: 'analyzing',
                message: 'جاري تحليل السياق وبناء البرومبتات المخصصة...',
                percentage: 30
            });

            // تحديث التقدم - التوليد
            setProgress({
                stage: 'generating',
                message: 'جاري توليد كود PlantUML بالذكاء الاصطناعي...',
                percentage: 60
            });
            config.onProgress?.({
                stage: 'generating',
                message: 'جاري توليد كود PlantUML بالذكاء الاصطناعي...',
                percentage: 60
            });

            // استخدام التدفق الذكي الجديد
            const result = await generateDiagram(flowInput as any);

            // تحديث التقدم - التحسين
            setProgress({
                stage: 'optimizing',
                message: 'جاري تحليل الجودة والتحسين النهائي...',
                percentage: 90
            });
            config.onProgress?.({
                stage: 'optimizing',
                message: 'جاري تحليل الجودة والتحسين النهائي...',
                percentage: 90
            });

            // تحديث التقدم - الإكمال
            setProgress({
                stage: 'completed',
                message: 'تم التوليد بنجاح باستخدام البرومبتات الذكية!',
                percentage: 100
            });
            config.onProgress?.({
                stage: 'completed',
                message: 'تم التوليد بنجاح باستخدام البرومبتات الذكية!',
                percentage: 100
            });

            return result;
        },
        onSuccess: (result) => {
            toast.success(`تم توليد ${DIAGRAM_TYPES[config.type].title} بنجاح!`, {
                description: `جودة: ${result.performanceMetrics.qualityScore}/100 - وقت التنفيذ: ${result.performanceMetrics.executionTime}ms - تكرارات: ${result.performanceMetrics.iterations}`
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
        if (config.autoGenerate && config.projectContext) {
            mutation.mutate();
        }
    }, [config.autoGenerate, config.type, JSON.stringify(config.projectContext)]);

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

        // إحصائيات محدثة
        executionTime: mutation.data?.performanceMetrics?.executionTime,
        qualityScore: mutation.data?.performanceMetrics?.qualityScore,
        elementCount: mutation.data?.elementCount,
        iterations: mutation.data?.performanceMetrics?.iterations,
        modelUsed: mutation.data?.performanceMetrics?.modelUsed,
        improvementSteps: mutation.data?.performanceMetrics?.improvementSteps,

        // تحليل الجودة
        qualityAnalysis: mutation.data?.qualityAnalysis,
        contextAnalysis: mutation.data?.contextAnalysis,
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

            setProgress({ completed: 0, total: typesToGenerate.length, current: undefined });
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
 * Hook لبناء البرومبتات الذكية
 */
export function useDiagramPrompts() {
    const [promptBuilder] = useState(() => new DiagramPromptBuilder());
    const [promptHistory, setPromptHistory] = useState<Array<{
        type: DiagramType;
        prompt: string;
        timestamp: string;
        config: any;
    }>>([]);

    const buildPromptMutation = useMutation({
        mutationFn: async ({
            diagramType,
            title,
            description,
            complexity,
            style,
            projectContext,
            requirements,
            stakeholders,
            language
        }: {
            diagramType: DiagramType;
            title: string;
            description?: string;
            complexity?: 'basic' | 'detailed' | 'comprehensive';
            style?: any;
            projectContext?: any;
            requirements?: string[];
            stakeholders?: string[];
            language?: 'ar' | 'en';
        }) => {
            const prompt = await promptBuilder.buildDiagramPrompt({
                diagramType: diagramType as any,
                title,
                description,
                complexity: complexity || 'detailed',
                style,
                projectContext,
                requirements,
                stakeholders,
                language: language || 'ar'
            });

            // حفظ في التاريخ
            setPromptHistory(prev => [...prev, {
                type: diagramType,
                prompt,
                timestamp: new Date().toISOString(),
                config: {
                    diagramType,
                    title,
                    description,
                    complexity,
                    style,
                    projectContext,
                    requirements,
                    stakeholders,
                    language
                }
            }]);

            return prompt;
        },
        onSuccess: (prompt) => {
            toast.success('تم بناء البرومبت بنجاح!', {
                description: `طول البرومبت: ${prompt.length} حرف`
            });
        },
        onError: (error: Error) => {
            toast.error('فشل في بناء البرومبت', {
                description: error.message
            });
        }
    });

    const buildImprovementPromptMutation = useMutation({
        mutationFn: async ({
            currentDiagram,
            qualityAssessment,
            targetQuality,
            focusAreas
        }: {
            currentDiagram: string;
            qualityAssessment: any;
            targetQuality: number;
            focusAreas?: string[];
        }) => {
            return promptBuilder.buildImprovementPrompt({
                currentDiagram,
                qualityAssessment,
                targetQuality,
                focusAreas
            });
        },
        onSuccess: () => {
            toast.success('تم بناء برومبت التحسين بنجاح!');
        },
        onError: (error: Error) => {
            toast.error('فشل في بناء برومبت التحسين', {
                description: error.message
            });
        }
    });

    const buildValidationPromptMutation = useMutation({
        mutationFn: async (diagramCode: string) => {
            return promptBuilder.buildValidationPrompt(diagramCode);
        },
        onSuccess: () => {
            toast.success('تم بناء برومبت التحقق بنجاح!');
        },
        onError: (error: Error) => {
            toast.error('فشل في بناء برومبت التحقق', {
                description: error.message
            });
        }
    });

    const clearHistory = useCallback(() => {
        setPromptHistory([]);
    }, []);

    return {
        // حالة البناء
        isBuildingPrompt: buildPromptMutation.isPending,
        isBuildingImprovement: buildImprovementPromptMutation.isPending,
        isBuildingValidation: buildValidationPromptMutation.isPending,

        // النتائج
        builtPrompt: buildPromptMutation.data,
        improvementPrompt: buildImprovementPromptMutation.data,
        validationPrompt: buildValidationPromptMutation.data,

        // الأخطاء
        promptError: buildPromptMutation.error,
        improvementError: buildImprovementPromptMutation.error,
        validationError: buildValidationPromptMutation.error,

        // دوال التحكم
        buildPrompt: buildPromptMutation.mutate,
        buildImprovementPrompt: buildImprovementPromptMutation.mutate,
        buildValidationPrompt: buildValidationPromptMutation.mutate,
        resetPrompts: () => {
            buildPromptMutation.reset();
            buildImprovementPromptMutation.reset();
            buildValidationPromptMutation.reset();
        },
        clearHistory,

        // التاريخ والإحصائيات
        promptHistory,
        hasHistory: promptHistory.length > 0,
        totalPrompts: promptHistory.length,
        promptsByType: promptHistory.reduce((acc, item) => {
            acc[item.type] = (acc[item.type] || 0) + 1;
            return acc;
        }, {} as Record<DiagramType, number>)
    };
}

/**
 * Hook لمكتبة المخططات المحفوظة
 */
export interface SavedDiagram {
    id: string;
    title: string;
    type: DiagramType;
    plantUmlCode: string;
    description?: string;
    elementCount: number;
    qualityScore?: number;
    createdAt: string;
    updatedAt: string;
    tags?: string[];
    isFavorite?: boolean;
    isShared?: boolean;
    metadata?: any;
}

export interface DiagramFilter {
    searchTerm?: string;
    type?: DiagramType;
    tags?: string[];
    sortBy?: 'recent' | 'name' | 'type' | 'quality';
    isFavorite?: boolean;
}

export function useDiagramLibrary(filter?: DiagramFilter) {
    const [diagrams, setDiagrams] = useState<SavedDiagram[]>([]);

    // محاكاة البيانات (يمكن استبدالها بـ API حقيقي)
    useEffect(() => {
        // بيانات وهمية للاختبار
        const mockDiagrams: SavedDiagram[] = [
            {
                id: '1',
                title: 'مخطط فئات نظام المكتبة',
                type: 'class',
                plantUmlCode: '@startuml\nclass Book\nclass User\n@enduml',
                elementCount: 2,
                qualityScore: 85,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isFavorite: true,
                tags: ['مكتبة', 'نظام']
            },
            {
                id: '2',
                title: 'مخطط تسلسل عملية الدفع',
                type: 'sequence',
                plantUmlCode: '@startuml\nactor User\nUser -> System\n@enduml',
                elementCount: 2,
                qualityScore: 92,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isFavorite: false,
                tags: ['دفع', 'تجارة']
            }
        ];
        setDiagrams(mockDiagrams);
    }, []);

    // تصفية المخططات
    const filteredDiagrams = diagrams.filter(diagram => {
        if (filter?.searchTerm && !diagram.title.toLowerCase().includes(filter.searchTerm.toLowerCase())) {
            return false;
        }
        if (filter?.type && diagram.type !== filter.type) {
            return false;
        }
        if (filter?.isFavorite && !diagram.isFavorite) {
            return false;
        }
        if (filter?.tags && !filter.tags.some(tag => diagram.tags?.includes(tag))) {
            return false;
        }
        return true;
    });

    // ترتيب المخططات
    const sortedDiagrams = [...filteredDiagrams].sort((a, b) => {
        switch (filter?.sortBy) {
            case 'name':
                return a.title.localeCompare(b.title);
            case 'type':
                return a.type.localeCompare(b.type);
            case 'quality':
                return (b.qualityScore || 0) - (a.qualityScore || 0);
            case 'recent':
            default:
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
    });

    // دوال إدارة المخططات
    const saveDiagram = useCallback((diagram: Omit<SavedDiagram, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newDiagram: SavedDiagram = {
            ...diagram,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setDiagrams(prev => [newDiagram, ...prev]);
        toast.success('تم حفظ المخطط بنجاح!');
        return newDiagram;
    }, []);

    const deleteDiagram = useCallback(async (id: string) => {
        setDiagrams(prev => prev.filter(d => d.id !== id));
        toast.success('تم حذف المخطط بنجاح!');
    }, []);

    const toggleFavorite = useCallback(async (id: string) => {
        setDiagrams(prev => prev.map(d =>
            d.id === id ? { ...d, isFavorite: !d.isFavorite } : d
        ));
        const diagram = diagrams.find(d => d.id === id);
        toast.success(diagram?.isFavorite ? 'تم إزالة من المفضلة' : 'تم إضافة للمفضلة');
    }, [diagrams]);

    const duplicateDiagram = useCallback(async (id: string) => {
        const original = diagrams.find(d => d.id === id);
        if (original) {
            const duplicate = saveDiagram({
                ...original,
                title: `${original.title} - نسخة`,
                isFavorite: false
            });
            return duplicate;
        }
        throw new Error('المخطط غير موجود');
    }, [diagrams, saveDiagram]);

    return {
        // البيانات
        diagrams: sortedDiagrams,
        totalDiagrams: diagrams.length,
        filteredCount: sortedDiagrams.length,

        // دوال الإدارة
        saveDiagram,
        deleteDiagram,
        toggleFavorite,
        duplicateDiagram,

        // الإحصائيات
        favoriteCount: diagrams.filter(d => d.isFavorite).length,
        typeDistribution: diagrams.reduce((acc, d) => {
            acc[d.type] = (acc[d.type] || 0) + 1;
            return acc;
        }, {} as Record<DiagramType, number>),
        averageQuality: diagrams.length > 0
            ? diagrams.reduce((sum, d) => sum + (d.qualityScore || 0), 0) / diagrams.length
            : 0
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
