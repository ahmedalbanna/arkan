/**
 * خدمة ذكية للتعامل مع API توليد التقارير المحسن
 * تدعم جميع ميزات النظام الذكي الجديد
 */

import type { SectionName } from '@/ai/schemas/enums';
import { apiClient } from '@/services/shared/api-client';

// أنواع البيانات للخدمة الذكية
export interface IntelligentReportConfig {
    operationType: 'single-section' | 'complete-report';
    sectionToGenerate?: SectionName;
    sectionsToGenerate?: SectionName[];
    proposal?: any;
    projectPlan?: any;
    guidelines?: string[];
    contextFiles?: Array<{
        fileName: string;
        content: string;
        type: string;
    }>;
    qualityThreshold?: number;
    enableIterativeImprovement?: boolean;
    enablePerformanceMonitoring?: boolean;
    generateInOrder?: boolean;
    useIntelligentDependencies?: boolean;
    maxRetries?: number;
    otherSections?: Record<string, string>;
    instructionText?: string;
    exampleFiles?: Array<{
        fileName: string;
        content: string;
    }>;
}

export interface SingleSectionResult {
    sectionName: string;
    content: string;
    singleSection: true;
    metadata: {
        operationType: 'single-section';
        executionTime: number;
        creditCost: number;
        timestamp: string;
    };
}

export interface CompleteReportResult {
    generatedSections: Record<string, string>;
    sectionMetadata: Record<string, {
        qualityScore: number;
        generationTime: number;
        iterations: number;
        modelUsed: string;
    }>;
    overallMetrics: {
        totalSections: number;
        successfulSections: number;
        averageQuality: number;
        totalTime: number;
        averageTime: number;
    };
    performanceReport?: any;
    completeReport: true;
    metadata: {
        operationType: 'complete-report';
        executionTime: number;
        creditCost: number;
        timestamp: string;
    };
}

export interface PerformanceStats {
    success: true;
    data: {
        quickStats: {
            completedSessions: number;
            avgQualityToday: number;
            avgExecutionTimeToday: number;
        };
        performanceReport: {
            totalSessions: number;
            averageExecutionTime: number;
            successRate: number;
            recommendations: string[];
        };
        systemInfo: {
            supportedSections: SectionName[];
            features: {
                intelligentContextAnalysis: boolean;
                adaptiveModelSelection: boolean;
                qualityValidation: boolean;
                iterativeImprovement: boolean;
                performanceMonitoring: boolean;
                completeReportGeneration: boolean;
            };
        };
    };
}

// معلومات الأقسام المدعومة
export const SUPPORTED_SECTIONS: Record<SectionName, {
    title: string;
    description: string;
    estimatedTime: number;
    qualityThreshold: number;
    dependencies: SectionName[];
}> = {
    'abstract': {
        title: 'الملخص التنفيذي',
        description: 'ملخص شامل ومقنع لجميع جوانب التقرير',
        estimatedTime: 5000,
        qualityThreshold: 90,
        dependencies: ['introduction', 'systemAnalysis', 'systemDesign', 'conclusion']
    },
    'acknowledgment': {
        title: 'شكر وتقدير',
        description: 'صفحة شكر مهنية لجميع المساهمين',
        estimatedTime: 3000,
        qualityThreshold: 80,
        dependencies: []
    },
    'introduction': {
        title: 'المقدمة',
        description: 'مقدمة شاملة تهيئ القارئ لفهم التقرير',
        estimatedTime: 6000,
        qualityThreshold: 85,
        dependencies: []
    },
    'literatureReview': {
        title: 'مراجعة الأدبيات',
        description: 'مراجعة شاملة للأدبيات ذات الصلة',
        estimatedTime: 8000,
        qualityThreshold: 88,
        dependencies: ['introduction']
    },
    'systemAnalysis': {
        title: 'تحليل النظام',
        description: 'تحليل شامل للنظام الحالي والمتطلبات',
        estimatedTime: 7000,
        qualityThreshold: 87,
        dependencies: ['introduction', 'literatureReview']
    },
    'designStrategy': {
        title: 'استراتيجية التصميم',
        description: 'استراتيجية تصميم شاملة ومبررة',
        estimatedTime: 6500,
        qualityThreshold: 86,
        dependencies: ['systemAnalysis']
    },
    'systemDesign': {
        title: 'تصميم النظام',
        description: 'تصميم مفصل وشامل للنظام',
        estimatedTime: 8500,
        qualityThreshold: 88,
        dependencies: ['designStrategy', 'systemAnalysis']
    },
    'systemProgramming': {
        title: 'برمجة النظام',
        description: 'وصف مفصل لعملية التطوير والبرمجة',
        estimatedTime: 7500,
        qualityThreshold: 85,
        dependencies: ['systemDesign']
    },
    'systemTesting': {
        title: 'اختبار النظام',
        description: 'استراتيجية اختبار شاملة والنتائج',
        estimatedTime: 7000,
        qualityThreshold: 86,
        dependencies: ['systemProgramming', 'systemDesign']
    },
    'recommendations': {
        title: 'التوصيات',
        description: 'توصيات عملية ومبررة للتحسين',
        estimatedTime: 5500,
        qualityThreshold: 84,
        dependencies: ['systemTesting', 'systemAnalysis']
    },
    'conclusion': {
        title: 'الخاتمة',
        description: 'خاتمة شاملة تلخص النتائج والإنجازات',
        estimatedTime: 6000,
        qualityThreshold: 87,
        dependencies: ['systemTesting', 'recommendations', 'systemAnalysis']
    },
    'references': {
        title: 'المراجع',
        description: 'قائمة مراجع دقيقة ومكتملة',
        estimatedTime: 4000,
        qualityThreshold: 95,
        dependencies: ['literatureReview', 'systemAnalysis']
    },
    'appendices': {
        title: 'الملاحق',
        description: 'ملاحق منظمة للمواد الداعمة',
        estimatedTime: 4500,
        qualityThreshold: 80,
        dependencies: []
    }
};

/**
 * خدمة التقارير الذكية الرئيسية
 */
export class IntelligentReportService {

    /**
     * تحليل السياق وتقديم توصيات للوضع المناسب
     */
    static async getModeRecommendation(config: {
        proposal?: any;
        projectPlan?: any;
        contextFiles?: Array<{ fileName: string; content: string; type: string }>;
        sectionsToGenerate?: SectionName[];
        guidelines?: string[];
    }): Promise<{
        recommendedMode: 'intelligent' | 'traditional' | 'hybrid';
        confidence: number;
        reasoning: string[];
        sectionRecommendations: Record<SectionName, {
            recommendedMode: 'intelligent' | 'traditional';
            reason: string;
            complexity: 'low' | 'medium' | 'high';
        }>;
    }> {

        // تحليل تعقيد المشروع
        const projectComplexity = this.analyzeProjectComplexity(config.proposal, config.projectPlan);

        // تحليل المحتوى المتاح
        const contentAnalysis = this.analyzeAvailableContent(config.contextFiles);

        // تحليل الأقسام المطلوبة
        const sectionAnalysis = this.analyzeRequiredSections(config.sectionsToGenerate || []);

        // حساب التقويم العام
        let recommendedMode: 'intelligent' | 'traditional' | 'hybrid' = 'traditional';
        let confidence = 0.5;
        const reasoning: string[] = [];

        // المعايير للتوصية بالوضع الذكي
        if (projectComplexity.score >= 7) {
            recommendedMode = 'intelligent';
            confidence += 0.3;
            reasoning.push('المشروع معقد ويتطلب تحليل سياق متقدم');
        }

        if (contentAnalysis.hasVisualContent || contentAnalysis.documentCount >= 3) {
            recommendedMode = 'intelligent';
            confidence += 0.2;
            reasoning.push('محتوى غني يتطلب تحليل ذكي');
        }

        if (sectionAnalysis.hasComplexSections) {
            recommendedMode = 'intelligent';
            confidence += 0.2;
            reasoning.push('أقسام معقدة تتطلب تحسين تكراري');
        }

        if (contentAnalysis.contextQuality >= 8) {
            recommendedMode = 'intelligent';
            confidence += 0.15;
            reasoning.push('جودة السياق عالية تسمح بالتوليد الذكي');
        }

        // تقليل التوصية إذا كان المحتوى محدود
        if (contentAnalysis.contextQuality < 5) {
            recommendedMode = 'traditional';
            confidence -= 0.2;
            reasoning.push('المحتوى محدود، الوضع التقليدي أكثر ملاءمة');
        }

        // تقييم الحاجة للوضع المختلط
        const mixedNeeds = sectionAnalysis.sections.some(s => s.complexity === 'high') &&
            sectionAnalysis.sections.some(s => s.complexity === 'low');

        if (mixedNeeds && confidence >= 0.6) {
            recommendedMode = 'hybrid';
            reasoning.push('أقسام متنوعة التعقيد تتطلب وضع مختلط');
        }

        // إنتاج توصيات الأقسام
        const sectionRecommendations: Record<SectionName, {
            recommendedMode: 'intelligent' | 'traditional';
            reason: string;
            complexity: 'low' | 'medium' | 'high';
        }> = sectionAnalysis.sections.reduce((acc, section) => {
            const sectionInfo = SUPPORTED_SECTIONS[section.name];
            acc[section.name] = {
                recommendedMode: section.complexity === 'high' ? 'intelligent' : 'traditional',
                reason: section.complexity === 'high' ? 'أقسام متعددة التبعيات' : 'أقسام بسيطة نسبياً',
                complexity: section.complexity
            };
            return acc;
        }, {} as Record<SectionName, { recommendedMode: 'intelligent' | 'traditional'; reason: string; complexity: 'low' | 'medium' | 'high'; }>);

        return {
            recommendedMode,
            confidence: Math.max(0, Math.min(1, confidence)),
            reasoning,
            sectionRecommendations
        };
    }

    /**
     * تحليل تعقيد المشروع
     */
    private static analyzeProjectComplexity(proposal?: any, projectPlan?: any): {
        score: number;
        factors: string[];
    } {
        let score = 0;
        const factors: string[] = [];

        if (proposal) {
            const proposalLength = JSON.stringify(proposal).length;
            if (proposalLength > 5000) {
                score += 2;
                factors.push('عرض تقديمي متكامل ومفصل');
            }

            if (proposal.budget && parseFloat(proposal.budget) > 100000) {
                score += 1;
                factors.push('مشروع بميزانية كبيرة');
            }
        }

        if (projectPlan) {
            const planLength = JSON.stringify(projectPlan).length;
            if (planLength > 3000) {
                score += 2;
                factors.push('خطة مشروع مفصلة');
            }

            if (projectPlan.timeline && projectPlan.timeline.phases?.length > 5) {
                score += 1;
                factors.push('خطط زمنية معقدة');
            }
        }

        return {
            score: Math.min(10, score),
            factors
        };
    }

    /**
     * تحليل المحتوى المتاح
     */
    private static analyzeAvailableContent(contextFiles?: Array<{ fileName: string; content: string; type: string }>): {
        contextQuality: number;
        documentCount: number;
        hasVisualContent: boolean;
        totalContentSize: number;
    } {
        if (!contextFiles || contextFiles.length === 0) {
            return {
                contextQuality: 3,
                documentCount: 0,
                hasVisualContent: false,
                totalContentSize: 0
            };
        }

        let contextQuality = 5;
        let totalContentSize = 0;
        let hasVisualContent = false;

        contextFiles.forEach(file => {
            totalContentSize += file.content.length;

            if (file.content.length > 1000) {
                contextQuality += 1;
            }

            if (['image', 'chart', 'diagram'].includes(file.type)) {
                hasVisualContent = true;
                contextQuality += 2;
            }
        });

        const avgQuality = Math.min(10, contextQuality / contextFiles.length);

        return {
            contextQuality: avgQuality,
            documentCount: contextFiles.length,
            hasVisualContent,
            totalContentSize
        };
    }

    /**
     * تحليل الأقسام المطلوبة
     */
    private static analyzeRequiredSections(sectionsToGenerate: SectionName[]): {
        hasComplexSections: boolean;
        sections: Array<{
            name: SectionName;
            complexity: 'low' | 'medium' | 'high';
            dependencies: number;
        }>;
    } {
        const sections = sectionsToGenerate.map(section => {
            const info = SUPPORTED_SECTIONS[section];
            const dependencies = info.dependencies.length;
            const complexity: 'low' | 'medium' | 'high' = dependencies > 2 ? 'high' :
                dependencies > 0 ? 'medium' : 'low';

            return {
                name: section,
                complexity,
                dependencies
            };
        });

        const hasComplexSections = sections.some(s => s.complexity === 'high');

        return {
            hasComplexSections,
            sections
        };
    }

    /**
     * توليد قسم فردي بالنظام الذكي
     */
    static async generateSingleSection(config: {
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
        onProgress?: (progress: {
            stage: string;
            message: string;
            percentage: number;
        }) => void;
    }): Promise<SingleSectionResult> {

        const requestConfig: IntelligentReportConfig = {
            operationType: 'single-section',
            sectionToGenerate: config.sectionToGenerate,
            proposal: config.proposal,
            projectPlan: config.projectPlan,
            guidelines: config.guidelines,
            contextFiles: config.contextFiles,
            otherSections: config.otherSections,
            instructionText: config.instructionText,
            exampleFiles: config.exampleFiles,
            qualityThreshold: config.qualityThreshold || SUPPORTED_SECTIONS[config.sectionToGenerate].qualityThreshold,
            enableIterativeImprovement: config.enableIterativeImprovement ?? true,
            enablePerformanceMonitoring: config.enablePerformanceMonitoring ?? true
        };

        // تتبع التقدم
        config.onProgress?.({
            stage: 'preparing',
            message: `جاري تحضير توليد قسم ${SUPPORTED_SECTIONS[config.sectionToGenerate].title}...`,
            percentage: 10
        });

        try {
            config.onProgress?.({
                stage: 'generating',
                message: 'جاري التوليد بالنظام الذكي...',
                percentage: 30
            });

            const response = await apiClient.post<SingleSectionResult>('/api/generate/report', requestConfig);

            config.onProgress?.({
                stage: 'completed',
                message: 'تم التوليد بنجاح!',
                percentage: 100
            });

            return response;

        } catch (error) {
            config.onProgress?.({
                stage: 'error',
                message: `خطأ في التوليد: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`,
                percentage: 0
            });
            throw error;
        }
    }

    /**
     * توليد تقرير كامل بالتدفق الذكي
     */
    static async generateCompleteReport(config: {
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
        onProgress?: (progress: {
            stage: string;
            message: string;
            percentage: number;
            currentSection?: string;
            completedSections?: string[];
            sectionProgress?: Record<string, {
                status: 'pending' | 'generating' | 'completed' | 'error';
                qualityScore?: number;
                generationTime?: number;
            }>;
        }) => void;
    }): Promise<CompleteReportResult> {

        const sectionsToGenerate = config.sectionsToGenerate || [
            'abstract', 'acknowledgment', 'introduction', 'literatureReview',
            'systemAnalysis', 'designStrategy', 'systemDesign', 'systemProgramming',
            'systemTesting', 'recommendations', 'conclusion', 'references', 'appendices'
        ] as SectionName[];

        const requestConfig: IntelligentReportConfig = {
            operationType: 'complete-report',
            sectionsToGenerate,
            proposal: config.proposal,
            projectPlan: config.projectPlan,
            guidelines: config.guidelines,
            contextFiles: config.contextFiles,
            qualityThreshold: config.qualityThreshold || 85,
            enableIterativeImprovement: config.enableIterativeImprovement ?? true,
            enablePerformanceMonitoring: config.enablePerformanceMonitoring ?? true,
            generateInOrder: config.generateInOrder ?? true,
            useIntelligentDependencies: config.useIntelligentDependencies ?? true,
            maxRetries: config.maxRetries || 3
        };

        // تحضير تتبع التقدم
        const sectionProgress: Record<string, {
            status: 'pending' | 'generating' | 'completed' | 'error';
            qualityScore?: number;
            generationTime?: number;
        }> = {};

        sectionsToGenerate.forEach(section => {
            sectionProgress[section] = { status: 'pending' };
        });

        config.onProgress?.({
            stage: 'preparing',
            message: `جاري تحضير توليد ${sectionsToGenerate.length} قسم...`,
            percentage: 5,
            sectionProgress
        });

        try {
            config.onProgress?.({
                stage: 'generating',
                message: 'بدء التوليد بالتدفق الذكي...',
                percentage: 10,
                sectionProgress
            });

            const response = await apiClient.post<CompleteReportResult>('/api/generate/report', requestConfig);

            // تحديث تقدم الأقسام بناءً على النتائج
            Object.entries(response.sectionMetadata).forEach(([section, metadata]) => {
                if (sectionProgress[section]) {
                    sectionProgress[section] = {
                        status: 'completed',
                        qualityScore: metadata.qualityScore,
                        generationTime: metadata.generationTime
                    };
                }
            });

            config.onProgress?.({
                stage: 'completed',
                message: `تم توليد ${response.overallMetrics.successfulSections}/${response.overallMetrics.totalSections} أقسام بنجاح!`,
                percentage: 100,
                completedSections: Object.keys(response.generatedSections),
                sectionProgress
            });

            return response;

        } catch (error) {
            config.onProgress?.({
                stage: 'error',
                message: `خطأ في التوليد: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`,
                percentage: 0,
                sectionProgress
            });
            throw error;
        }
    }

    /**
     * الحصول على إحصائيات الأداء
     */
    static async getPerformanceStats(): Promise<PerformanceStats> {
        return await apiClient.get<PerformanceStats>('/api/generate/report');
    }

    /**
     * تقدير الوقت المطلوب لتوليد أقسام محددة
     */
    static estimateGenerationTime(sections: SectionName[]): {
        totalEstimatedTime: number;
        sectionEstimates: Record<string, number>;
        averageQualityThreshold: number;
    } {
        let totalTime = 0;
        let totalQualityThreshold = 0;
        const sectionEstimates: Record<string, number> = {};

        sections.forEach(section => {
            const sectionInfo = SUPPORTED_SECTIONS[section];
            if (sectionInfo) {
                sectionEstimates[section] = sectionInfo.estimatedTime;
                totalTime += sectionInfo.estimatedTime;
                totalQualityThreshold += sectionInfo.qualityThreshold;
            }
        });

        return {
            totalEstimatedTime: totalTime,
            sectionEstimates,
            averageQualityThreshold: totalQualityThreshold / sections.length
        };
    }

    /**
     * التحقق من التبعيات بين الأقسام
     */
    static validateSectionDependencies(sections: SectionName[]): {
        isValid: boolean;
        missingDependencies: Record<string, SectionName[]>;
        recommendedOrder: SectionName[];
    } {
        const missingDependencies: Record<string, SectionName[]> = {};
        let isValid = true;

        sections.forEach(section => {
            const sectionInfo = SUPPORTED_SECTIONS[section];
            if (sectionInfo && sectionInfo.dependencies.length > 0) {
                const missing = sectionInfo.dependencies.filter(dep => !sections.includes(dep));
                if (missing.length > 0) {
                    missingDependencies[section] = missing;
                    isValid = false;
                }
            }
        });

        // ترتيب موصى به للأقسام
        const recommendedOrder = this.getRecommendedSectionOrder(sections);

        return {
            isValid,
            missingDependencies,
            recommendedOrder
        };
    }

    /**
     * الحصول على الترتيب الموصى به للأقسام
     */
    static getRecommendedSectionOrder(sections: SectionName[]): SectionName[] {
        const defaultOrder: SectionName[] = [
            'abstract', 'acknowledgment', 'introduction', 'literatureReview',
            'systemAnalysis', 'designStrategy', 'systemDesign', 'systemProgramming',
            'systemTesting', 'recommendations', 'conclusion', 'references', 'appendices'
        ];

        return defaultOrder.filter(section => sections.includes(section));
    }

    /**
     * حساب تكلفة الائتمان المتوقعة
     */
    static calculateEstimatedCreditCost(config: {
        operationType: 'single-section' | 'complete-report';
        sectionsCount?: number;
    }): number {
        if (config.operationType === 'single-section') {
            return 1;
        } else {
            const sectionsCount = config.sectionsCount || 13;
            // خصم 20% للتقارير الكاملة
            return Math.max(1, Math.ceil(sectionsCount * 0.8));
        }
    }

    /**
     * تحليل جودة التقرير المولد
     */
    static analyzeReportQuality(result: CompleteReportResult): {
        overallGrade: 'ممتاز' | 'جيد جداً' | 'جيد' | 'مقبول' | 'ضعيف';
        qualityInsights: {
            highQualitySections: string[];
            lowQualitySections: string[];
            averageIterations: number;
            totalGenerationTime: number;
            recommendations: string[];
        };
    } {
        const { sectionMetadata, overallMetrics } = result;
        const avgQuality = overallMetrics.averageQuality;

        let overallGrade: 'ممتاز' | 'جيد جداً' | 'جيد' | 'مقبول' | 'ضعيف';
        if (avgQuality >= 90) overallGrade = 'ممتاز';
        else if (avgQuality >= 85) overallGrade = 'جيد جداً';
        else if (avgQuality >= 80) overallGrade = 'جيد';
        else if (avgQuality >= 70) overallGrade = 'مقبول';
        else overallGrade = 'ضعيف';

        const highQualitySections = Object.entries(sectionMetadata)
            .filter(([_, meta]) => meta.qualityScore >= 90)
            .map(([section]) => SUPPORTED_SECTIONS[section as SectionName]?.title || section);

        const lowQualitySections = Object.entries(sectionMetadata)
            .filter(([_, meta]) => meta.qualityScore < 80)
            .map(([section]) => SUPPORTED_SECTIONS[section as SectionName]?.title || section);

        const averageIterations = Object.values(sectionMetadata)
            .reduce((sum, meta) => sum + meta.iterations, 0) / Object.keys(sectionMetadata).length;

        const recommendations: string[] = [];
        if (lowQualitySections.length > 0) {
            recommendations.push(`يُنصح بمراجعة الأقسام التالية: ${lowQualitySections.join(', ')}`);
        }
        if (averageIterations > 2) {
            recommendations.push('قد تحتاج لتحسين جودة المدخلات أو التوجيهات');
        }
        if (overallMetrics.totalTime > 60000) {
            recommendations.push('يمكن تحسين السرعة بتقليل عدد الأقسام أو تعطيل التحسين التكراري');
        }

        return {
            overallGrade,
            qualityInsights: {
                highQualitySections,
                lowQualitySections,
                averageIterations,
                totalGenerationTime: overallMetrics.totalTime,
                recommendations
            }
        };
    }
}

/**
 * دوال مساعدة للتعامل مع الأقسام
 */
export const SectionUtils = {
    /**
     * الحصول على معلومات قسم محدد
     */
    getSectionInfo(sectionName: SectionName) {
        return SUPPORTED_SECTIONS[sectionName];
    },

    /**
     * الحصول على جميع الأقسام المدعومة
     */
    getAllSections(): SectionName[] {
        return Object.keys(SUPPORTED_SECTIONS) as SectionName[];
    },

    /**
     * تصفية الأقسام حسب الفئة
     */
    getSectionsByCategory(category: 'basic' | 'technical' | 'analysis' | 'documentation'): SectionName[] {
        const categories = {
            basic: ['abstract', 'acknowledgment', 'introduction', 'conclusion'] as SectionName[],
            technical: ['systemDesign', 'systemProgramming', 'systemTesting'] as SectionName[],
            analysis: ['literatureReview', 'systemAnalysis', 'designStrategy', 'recommendations'] as SectionName[],
            documentation: ['references', 'appendices'] as SectionName[]
        };
        return categories[category] || [];
    },

    /**
     * تنسيق وقت التوليد المتوقع
     */
    formatEstimatedTime(milliseconds: number): string {
        const seconds = Math.ceil(milliseconds / 1000);
        if (seconds < 60) return `${seconds} ثانية`;
        const minutes = Math.ceil(seconds / 60);
        return `${minutes} دقيقة`;
    },

    /**
     * تنسيق نقاط الجودة
     */
    formatQualityScore(score: number): {
        score: number;
        grade: string;
        color: 'green' | 'blue' | 'yellow' | 'orange' | 'red';
    } {
        let grade: string;
        let color: 'green' | 'blue' | 'yellow' | 'orange' | 'red';

        if (score >= 90) {
            grade = 'ممتاز';
            color = 'green';
        } else if (score >= 85) {
            grade = 'جيد جداً';
            color = 'blue';
        } else if (score >= 80) {
            grade = 'جيد';
            color = 'yellow';
        } else if (score >= 70) {
            grade = 'مقبول';
            color = 'orange';
        } else {
            grade = 'ضعيف';
            color = 'red';
        }

        return { score, grade, color };
    }
};
