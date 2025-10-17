/**
 * تدفق ذكي لتوليد أقسام مقترح المشروع
 * يستخدم النظام الذكي الحقيقي لفهم السياق وتوليد محتوى عالي الجودة
 */

import {
    ContextAnalyzer,
    IterativeImprovementEngine,
    OutputQualityValidator,
    PerformanceMonitor
} from '@/ai/core';
import { ai } from '@/ai/genkit';
import {
    calculateReadingTime,
    extractKeyPoints,
    extractOutline,
    generateProposalSectionPrompt,
    ProposalSectionPromptInputSchema
} from '@/ai/prompts/proposal-section-generator';
import { z } from 'zod';

const PROPOSAL_SECTION_TYPES = {}
type ProposalSectionType = {}
// استخدام Schema من الـ prompt الجديد
const ProposalSectionInputSchema = ProposalSectionPromptInputSchema;

// إضافة إعدادات ذكية للـ flow
const EnhancedProposalSectionInputSchema = ProposalSectionInputSchema.extend({
    // إعدادات ذكية متقدمة
    intelligentSettings: z.object({
        enableContextAnalysis: z.boolean().default(true),
        enableIterativeImprovement: z.boolean().default(true),
        enablePerformanceMonitoring: z.boolean().default(true),
        qualityThreshold: z.number().min(0).max(100).default(85),
        maxIterations: z.number().min(1).max(5).default(3),
        adaptiveModelSelection: z.boolean().default(true),
        improvementStrategy: z.enum(['conservative', 'balanced', 'aggressive']).default('balanced')
    }).optional(),

    // تفضيلات المخرجات
    outputPreferences: z.object({
        includeOutline: z.boolean().default(true),
        includeKeyPoints: z.boolean().default(true),
        generateSuggestions: z.boolean().default(true),
        validateContent: z.boolean().default(true),
        estimateReadingTime: z.boolean().default(true)
    }).optional()
});

// مخطط المخرجات المحسن
const EnhancedProposalSectionOutputSchema = z.object({
    type: z.string(),
    title: z.string(),
    content: z.string(),
    outline: z.array(z.string()),
    keyPoints: z.array(z.string()),
    wordCount: z.number(),
    estimatedReadingTime: z.number(),

    // معلومات الجودة
    qualityScore: z.number(),
    completeness: z.number(),
    clarity: z.number(),
    relevance: z.number(),

    // اقتراحات التحسين
    suggestions: z.array(z.string()),

    // معلومات إضافية
    metadata: z.object({
        generatedAt: z.string(),
        executionTime: z.number(),
        modelUsed: z.string(),
        iterations: z.number(),
        qualityScore: z.number()
    }),

    // أقسام مقترحة ذات صلة
    relatedSections: z.array(z.string()),

    // تحليل السياق
    contextAnalysis: z.object({
        contentType: z.string(),
        complexity: z.string(),
        keyEntities: z.array(z.string()),
        mainThemes: z.array(z.string()),
        targetAudience: z.string()
    }),

    // معلومات الأداء
    performanceMetrics: z.object({
        executionTime: z.number(),
        modelUsed: z.string(),
        iterations: z.number(),
        qualityScore: z.number(),
        improvementSteps: z.array(z.string())
    })
});

export type ProposalSectionInput = z.infer<typeof EnhancedProposalSectionInputSchema>;
export type ProposalSectionOutput = z.infer<typeof EnhancedProposalSectionOutputSchema>;

/**
 * دالة مساعدة لاقتراح أقسام ذات صلة
 */
function suggestRelatedSections(sectionType: string, projectContext: any): string[] {
    const relatedSections: { [key: string]: string[] } = {
        executive_summary: ['objectives', 'scope', 'budget', 'timeline'],
        problem_statement: ['objectives', 'scope', 'methodology'],
        objectives: ['scope', 'success_criteria', 'methodology'],
        scope: ['objectives', 'deliverables', 'constraints'],
        methodology: ['timeline', 'team', 'risk_assessment'],
        timeline: ['budget', 'team', 'deliverables'],
        budget: ['timeline', 'team', 'risk_assessment'],
        team: ['methodology', 'timeline', 'budget'],
        deliverables: ['scope', 'success_criteria', 'timeline'],
        risk_assessment: ['methodology', 'budget', 'timeline'],
        success_criteria: ['objectives', 'deliverables'],
        conclusion: ['executive_summary', 'success_criteria']
    };

    return relatedSections[sectionType] || [];
}

/**
 * دالة مساعدة لاستخراج النقاط الرئيسية من السياق
 */
function extractKeyEntities(input: ProposalSectionInput): string[] {
    const entities: string[] = [];

    // استخراج من العنوان والوصف
    const text = `${input.projectContext.title} ${input.projectContext.description}`.toLowerCase();

    // كلمات مفتاحية تقنية
    const techKeywords = ['تطبيق', 'نظام', 'منصة', 'موقع', 'برنامج', 'تقنية', 'ذكي'];
    // كلمات مفتاحية تجارية
    const businessKeywords = ['مشروع', 'شركة', 'عمل', 'خدمة', 'منتج', 'حل'];

    [...techKeywords, ...businessKeywords].forEach(keyword => {
        if (text.includes(keyword)) {
            entities.push(keyword);
        }
    });

    // إضافة التقنيات المذكورة
    if (input.projectContext.technologies) {
        entities.push(...input.projectContext.technologies);
    }

    return [...new Set(entities)]; // إزالة التكرار
}

/**
 * دالة مساعدة لاستخراج المواضيع الرئيسية
 */
function extractMainThemes(input: ProposalSectionInput): string[] {
    const themes: string[] = [];

    // تحليل المجال
    if (input.projectContext.domain) {
        themes.push(input.projectContext.domain);
    }

    // تحليل الصناعة
    if (input.projectContext.industry) {
        themes.push(input.projectContext.industry);
    }

    // تحليل الأهداف
    if (input.projectContext.objectives) {
        input.projectContext.objectives.forEach(objective => {
            if (objective.includes('تحسين')) themes.push('تحسين');
            if (objective.includes('تطوير')) themes.push('تطوير');
            if (objective.includes('أتمتة')) themes.push('أتمتة');
            if (objective.includes('رقمنة')) themes.push('رقمنة');
        });
    }

    return [...new Set(themes)];
}

/**
 * تدفق توليد قسم المقترح الذكي
 */
export const generateProposalSection = ai.defineFlow(
    {
        name: 'generateProposalSection',
        inputSchema: EnhancedProposalSectionInputSchema,
        outputSchema: EnhancedProposalSectionOutputSchema,
    },
    async (input: ProposalSectionInput): Promise<ProposalSectionOutput> => {
        const startTime = Date.now();
        console.log('🚀 بدء توليد قسم المقترح:', input.type);

        // بدء مراقبة الأداء
        let performanceSessionId: string | null = null;
        if (input.intelligentSettings?.enablePerformanceMonitoring !== false) {
            performanceSessionId = PerformanceMonitor.startSession({
                taskType: 'proposal-section-generation',
                domain: 'project-proposals',
                userInput: `${input.type}: ${input.projectContext.title}`
            });
        }

        try {
            // 1. تحليل السياق الذكي (إذا كان مفعلاً)
            let contextAnalysis: any;
            if (input.intelligentSettings?.enableContextAnalysis !== false) {
                console.log('🧠 تحليل السياق الذكي...');
                const contextStart = Date.now();

                try {
                    contextAnalysis = await ContextAnalyzer.analyzeContext({
                        userInput: `${input.projectContext.title}: ${input.projectContext.description}`,
                        externalContext: input.externalContext,
                        guidelines: input.referenceContent?.guidelines ? [input.referenceContent.guidelines] : undefined,
                        projectType: input.projectContext.domain || 'general'
                    });

                    const contextTime = Date.now() - contextStart;
                    if (performanceSessionId) {
                        PerformanceMonitor.recordPhaseTime(performanceSessionId, 'contextAnalysisTime', contextTime);
                    }

                    console.log('✅ تم تحليل السياق:', {
                        contentType: contextAnalysis.contentType,
                        complexity: contextAnalysis.complexityLevel,
                        audience: contextAnalysis.targetAudience
                    });
                } catch (error) {
                    console.warn('⚠️ خطأ في تحليل السياق، استخدام تحليل بسيط:', error);
                    // تحليل بسيط احتياطي
                    contextAnalysis = {
                        contentType: input.projectContext.domain?.includes('tech') ? 'technical' : 'business',
                        complexityLevel: input.style.complexity || 'detailed',
                        targetAudience: input.projectContext.targetAudience || 'general',
                        language: 'ar',
                        culturalContext: 'middle-east',
                        specificRequirements: input.projectContext.requirements || [],
                        availableContext: {
                            files: input.externalContext?.map(file => ({
                                name: file.fileName,
                                type: file.type,
                                relevance: 0.7
                            })) || [],
                            previousSections: [],
                            guidelines: input.referenceContent?.guidelines ? [input.referenceContent.guidelines] : []
                        },
                        modelRecommendation: {
                            primary: 'googleai/gemini-2.0-flash',
                            fallback: 'googleai/gemini-1.5-pro',
                            reasoning: 'تحليل بسيط احتياطي'
                        }
                    };
                }
            } else {
                // تحليل أساسي بدون النظام الذكي
                contextAnalysis = {
                    contentType: 'business',
                    complexityLevel: input.style.complexity || 'detailed',
                    keyEntities: extractKeyEntities(input),
                    mainThemes: extractMainThemes(input),
                    targetAudience: input.projectContext.targetAudience || 'general'
                };
            }

            // 2. التوليد الأولي باستخدام الـ prompt المحسن
            console.log('📝 بدء التوليد الأولي...');
            const generationStart = Date.now();

            const { output: initialOutput } = await generateProposalSectionPrompt({
                type: input.type,
                projectContext: input.projectContext,
                style: input.style,
                referenceContent: input.referenceContent,
                externalContext: input.externalContext
            });

            if (!initialOutput) {
                throw new Error("فشل في توليد المقترح. تحقق من المدخلات وحاول مرة أخرى.");
            }

            const generationTime = Date.now() - generationStart;
            if (performanceSessionId) {
                PerformanceMonitor.recordPhaseTime(performanceSessionId, 'generationTime', generationTime);
            }

            console.log('✅ تم التوليد الأولي:', {
                wordCount: initialOutput.wordCount,
                estimatedReadingTime: initialOutput.estimatedReadingTime
            });

            // 3. تقييم الجودة والتحسين التكراري (إذا كان مفعلاً)
            let finalOutput = initialOutput;
            let qualityValidation: any = null;
            let iterations = 1;
            let improvementSteps: string[] = [];

            const qualityThreshold = input.intelligentSettings?.qualityThreshold || 85;
            const enableImprovement = input.intelligentSettings?.enableIterativeImprovement !== false;
            const validateContent = input.outputPreferences?.validateContent !== false;

            if (validateContent && input.intelligentSettings?.enableContextAnalysis !== false) {
                console.log('🔍 تقييم جودة المخرجات...');
                const validationStart = Date.now();

                try {
                    qualityValidation = await OutputQualityValidator.validateOutput(
                        initialOutput.content,
                        `${input.projectContext.title}: ${input.projectContext.description}`,
                        contextAnalysis
                    );

                    const validationTime = Date.now() - validationStart;
                    if (performanceSessionId) {
                        PerformanceMonitor.recordPhaseTime(performanceSessionId, 'qualityValidationTime', validationTime);
                    }

                    console.log('📊 نتائج تقييم الجودة:', {
                        overall: qualityValidation.metrics.overall,
                        completeness: qualityValidation.metrics.completeness,
                        accuracy: qualityValidation.metrics.accuracy,
                        needsImprovement: qualityValidation.needsImprovement
                    });

                    // التحسين التكراري إذا لزم الأمر
                    if (enableImprovement && qualityValidation.needsImprovement && qualityValidation.metrics.overall < qualityThreshold) {
                        console.log('🔄 بدء التحسين التكراري...');
                        const improvementStart = Date.now();

                        try {
                            const improvementSession = await IterativeImprovementEngine.runImprovementSession(
                                `${input.projectContext.title}: ${input.projectContext.description}`,
                                'generation',
                                'proposal-sections',
                                input.externalContext,
                                {
                                    maxIterations: input.intelligentSettings?.maxIterations || 3,
                                    qualityThreshold,
                                    improvementStrategy: input.intelligentSettings?.improvementStrategy || 'balanced',
                                    allowModelSwitching: input.intelligentSettings?.adaptiveModelSelection !== false
                                }
                            );

                            const improvementTime = Date.now() - improvementStart;
                            if (performanceSessionId) {
                                PerformanceMonitor.recordPhaseTime(performanceSessionId, 'iterativeImprovementTime', improvementTime);
                            }

                            if (improvementSession.status === 'completed') {
                                const bestResult = IterativeImprovementEngine.getBestOutput(improvementSession);
                                console.log('✨ تم التحسين بنجاح! النقاط النهائية:', bestResult.qualityScore);

                                // تحديث النتيجة النهائية
                                finalOutput = {
                                    ...initialOutput,
                                    content: bestResult.output,
                                    qualityScore: bestResult.qualityScore
                                };

                                // إضافة الاقتراحات منفصلة
                                if (!finalOutput.suggestions) {
                                    finalOutput.suggestions = [];
                                }
                                finalOutput.suggestions.push(...improvementSession.iterations.flatMap(iter => iter.improvements || []));

                                iterations = improvementSession.iterations.length;
                                improvementSteps = improvementSession.iterations.map(iter =>
                                    `التكرار ${iter.iterationNumber}: تحسين ${iter.improvements?.join(', ') || 'عام'}`
                                );
                            } else {
                                console.log('⚠️ لم يتم التحسين بنجاح، استخدام المخرجات الأولية');
                            }
                        } catch (improvementError) {
                            console.warn('⚠️ خطأ في التحسين التكراري:', improvementError);
                            if (performanceSessionId) {
                                PerformanceMonitor.recordError(performanceSessionId, `خطأ في التحسين: ${improvementError}`);
                            }
                        }
                    } else {
                        console.log('✅ جودة المخرجات مقبولة، لا حاجة للتحسين');
                    }
                } catch (validationError) {
                    console.warn('⚠️ خطأ في تقييم الجودة:', validationError);
                    if (performanceSessionId) {
                        PerformanceMonitor.recordError(performanceSessionId, `خطأ في التقييم: ${validationError}`);
                    }
                }
            }

            // 4. إعداد النتيجة النهائية
            const executionTime = Date.now() - startTime;
            const sectionInfo = PROPOSAL_SECTION_TYPES[input.type as ProposalSectionType];

            // حساب المعلومات الإضافية
            const wordCount = finalOutput.content.split(/\s+/).length;
            const estimatedReadingTime = calculateReadingTime(finalOutput.content);
            const outline = input.outputPreferences?.includeOutline !== false ?
                extractOutline(finalOutput.content) : [];
            const keyPoints = input.outputPreferences?.includeKeyPoints !== false ?
                extractKeyPoints(finalOutput.content) : [];
            const relatedSections = suggestRelatedSections(input.type, input.projectContext);

            const result: ProposalSectionOutput = {
                type: input.type,
                title: sectionInfo?.title || input.type,
                content: finalOutput.content,
                outline,
                keyPoints,
                wordCount,
                estimatedReadingTime,

                // معلومات الجودة
                qualityScore: qualityValidation?.metrics.overall || (finalOutput.qualityScore ?? 85),
                completeness: qualityValidation?.metrics.completeness || 85,
                clarity: qualityValidation?.metrics.clarity || 85,
                relevance: qualityValidation?.metrics.relevance || 85,

                // اقتراحات التحسين
                suggestions: finalOutput.suggestions || qualityValidation?.suggestions || [],

                // معلومات إضافية
                metadata: {
                    generatedAt: new Date().toISOString(),
                    executionTime,
                    modelUsed: 'googleai/gemini-2.0-flash',
                    iterations,
                    qualityScore: qualityValidation?.metrics.overall || (finalOutput.qualityScore ?? 85)
                },

                // أقسام مقترحة ذات صلة
                relatedSections,

                // تحليل السياق
                contextAnalysis: {
                    contentType: contextAnalysis.contentType,
                    complexity: contextAnalysis.complexityLevel || contextAnalysis.complexity,
                    keyEntities: contextAnalysis.keyEntities || extractKeyEntities(input),
                    mainThemes: contextAnalysis.mainThemes || extractMainThemes(input),
                    targetAudience: contextAnalysis.targetAudience
                },

                // معلومات الأداء
                performanceMetrics: {
                    executionTime,
                    modelUsed: 'googleai/gemini-2.0-flash',
                    iterations,
                    qualityScore: qualityValidation?.metrics.overall || (finalOutput.qualityScore ?? 85),
                    improvementSteps
                }
            };

            // تسجيل معلومات الأداء
            if (performanceSessionId) {
                PerformanceMonitor.recordQualityMetrics(performanceSessionId, {
                    qualityScore: result.qualityScore,
                    improvementIterations: iterations,
                    finalAccuracy: result.qualityScore
                });

                PerformanceMonitor.recordResourceUsage(performanceSessionId, {
                    tokensUsed: Math.ceil(wordCount * 1.3), // تقدير تقريبي
                    modelSwitches: iterations - 1
                });

                PerformanceMonitor.endSession(performanceSessionId, true);
            }

            console.log('🎉 تم إنتاج قسم المقترح بنجاح!', {
                type: result.type,
                wordCount: result.wordCount,
                qualityScore: result.qualityScore,
                executionTime,
                iterations
            });

            return result;

        } catch (error) {
            const executionTime = Date.now() - startTime;

            console.error('❌ خطأ في توليد قسم المقترح:', error);

            if (performanceSessionId) {
                PerformanceMonitor.recordError(performanceSessionId, error instanceof Error ? error.message : 'خطأ غير معروف');
                PerformanceMonitor.endSession(performanceSessionId, false);
            }

            throw new Error(`فشل في توليد قسم المقترح: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
        }
    }
);
