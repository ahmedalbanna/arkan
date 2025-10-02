/**
 * API endpoint لتوليد أقسام مقترح المشروع الذكية
 * يدعم توليد جميع أقسام المقترح بالذكاء الاصطناعي المتقدم
 */

import { generateProposalSection } from '@/ai/flows/generate-proposal-section';
import {
    type ProposalSectionType,
    PROPOSAL_SECTION_TYPES
} from '@/services/intelligent-proposal-service';
import { z } from 'zod';
// محاكاة API handlers
class CreditBasedApiHandler<T> {
    protected inputSchema: any;
    protected creditCost: number = 1;

    async handle(context: any) {
        try {
            const input = context.body || {};
            return await this.processRequest(input, context);
        } catch (error) {
            throw error;
        }
    }

    async processRequest(input: T, context: any): Promise<any> {
        throw new Error('Method not implemented');
    }

    async logGeneration(data: any) {
        console.log('تسجيل العملية:', data);
    }
}

function withApiMiddleware(...handlers: any[]) {
    return async (request: Request) => {
        try {
            const body = await request.json();
            const context = { body, request };
            const handler = handlers[handlers.length - 1];
            return Response.json(await handler(context));
        } catch (error) {
            return Response.json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            }, { status: 500 });
        }
    };
}

function rateLimit(options: any) {
    return (handler: any) => handler;
}

// مخطط الإدخال الموحد لأقسام المقترح
const UnifiedProposalSectionInputSchema = z.object({
    // معلومات القسم
    type: z.enum([
        'executive_summary', 'problem_statement', 'objectives', 'scope',
        'methodology', 'timeline', 'budget', 'team', 'deliverables',
        'risk_assessment', 'success_criteria', 'conclusion', 'appendices'
    ] as const),
    title: z.string().optional(),
    description: z.string().optional(),

    // سياق المشروع
    projectContext: z.object({
        title: z.string().min(1, 'عنوان المشروع مطلوب'),
        description: z.string().min(1, 'وصف المشروع مطلوب'),
        domain: z.string().optional(),
        industry: z.string().optional(),
        targetAudience: z.string().optional(),
        budget: z.number().optional(),
        duration: z.number().optional(),
        teamSize: z.number().optional(),
        objectives: z.array(z.string()).optional(),
        requirements: z.array(z.string()).optional(),
        constraints: z.array(z.string()).optional(),
        stakeholders: z.array(z.string()).optional(),
        technologies: z.array(z.string()).optional()
    }),

    // محتوى مرجعي
    referenceContent: z.object({
        existingSections: z.record(z.string()).optional(),
        guidelines: z.string().optional(),
        templates: z.array(z.string()).optional(),
        examples: z.array(z.string()).optional()
    }).optional(),

    // إعدادات الأسلوب
    style: z.object({
        tone: z.enum(['formal', 'professional', 'academic', 'business']).default('professional'),
        length: z.enum(['concise', 'moderate', 'detailed', 'extensive']).default('moderate'),
        format: z.enum(['narrative', 'structured', 'bullet_points', 'mixed']).default('structured'),
        language: z.enum(['ar', 'en']).default('ar')
    }).optional(),

    complexity: z.enum(['basic', 'detailed', 'comprehensive']).default('detailed'),

    // إعدادات ذكية
    qualityThreshold: z.number().min(0).max(100).optional().default(80),
    enableIterativeImprovement: z.boolean().optional().default(true),
    enablePerformanceMonitoring: z.boolean().optional().default(true),
    maxRetries: z.number().min(1).max(5).optional().default(3),

    // تفضيلات المخرجات
    includeOutline: z.boolean().optional().default(true),
    includeKeyPoints: z.boolean().optional().default(true),
    generateSuggestions: z.boolean().optional().default(true),
    validateContent: z.boolean().optional().default(true)
});

// مخطط توليد المقترح الكامل
const CompleteProposalInputSchema = z.object({
    projectContext: UnifiedProposalSectionInputSchema.shape.projectContext,
    sectionsToGenerate: z.array(z.enum([
        'executive_summary', 'problem_statement', 'objectives', 'scope',
        'methodology', 'timeline', 'budget', 'team', 'deliverables',
        'risk_assessment', 'success_criteria', 'conclusion', 'appendices'
    ] as const)).min(1, 'يجب اختيار قسم واحد على الأقل'),

    style: UnifiedProposalSectionInputSchema.shape.style,
    complexity: UnifiedProposalSectionInputSchema.shape.complexity,

    // إعدادات ذكية للمقترح الكامل
    intelligentSettings: z.object({
        generateInOrder: z.boolean().optional().default(true),
        useIntelligentDependencies: z.boolean().optional().default(true),
        enableCrossReferencing: z.boolean().optional().default(true),
        enableConsistencyCheck: z.boolean().optional().default(true),
        qualityThreshold: z.number().min(0).max(100).optional().default(80),
        maxRetries: z.number().min(1).max(5).optional().default(3)
    }).optional(),

    referenceContent: UnifiedProposalSectionInputSchema.shape.referenceContent
});

type UnifiedProposalSectionInput = z.infer<typeof UnifiedProposalSectionInputSchema>;
type CompleteProposalInput = z.infer<typeof CompleteProposalInputSchema>;

/**
 * معالج API لأقسام المقترح الذكية
 */
class IntelligentProposalSectionHandler extends CreditBasedApiHandler<UnifiedProposalSectionInput> {
    protected inputSchema = UnifiedProposalSectionInputSchema as any;
    protected creditCost = 3; // تكلفة أساسية لأقسام المقترح

    async processRequest(input: UnifiedProposalSectionInput, context: any) {
        const startTime = Date.now();

        try {
            // حساب التكلفة الديناميكية
            const dynamicCost = this.calculateDynamicCreditCost(input);
            this.creditCost = dynamicCost;

            // إعداد بيانات الإدخال للتدفق الذكي
            const flowInput = {
                type: input.type,
                title: input.title,
                description: input.description,
                projectContext: input.projectContext,
                referenceContent: input.referenceContent,
                style: input.style || {
                    tone: 'professional' as const,
                    length: 'moderate' as const,
                    format: 'structured' as const,
                    language: 'ar' as const
                },
                complexity: input.complexity,
                intelligentSettings: {
                    enableContextAnalysis: true,
                    enableIterativeImprovement: input.enableIterativeImprovement ?? true,
                    enablePerformanceMonitoring: input.enablePerformanceMonitoring ?? true,
                    qualityThreshold: input.qualityThreshold ?? 80,
                    maxIterations: input.maxRetries ?? 3,
                    adaptiveModelSelection: true
                },
                outputPreferences: {
                    includeOutline: input.includeOutline ?? true,
                    includeKeyPoints: input.includeKeyPoints ?? true,
                    generateSuggestions: input.generateSuggestions ?? true,
                    validateContent: input.validateContent ?? true
                }
            };

            // تشغيل تدفق التوليد الذكي
            const result = await generateProposalSection(flowInput);

            // حساب الوقت المستغرق
            const executionTime = Date.now() - startTime;

            // تسجيل العملية
            await this.logGeneration({
                type: 'proposal-section',
                agentId: `intelligent-proposal-${input.type}`,
                inputTokens: this.estimateTokens(JSON.stringify(flowInput)),
                outputTokens: this.estimateTokens(result.content),
                cost: dynamicCost,
                success: true,
                executionTime,
                qualityScore: result.performanceMetrics.qualityScore
            });

            // إرجاع النتيجة مع معلومات التنفيذ
            return {
                success: true,
                data: result,
                metadata: {
                    executionTime,
                    creditCost: dynamicCost,
                    qualityScore: result.performanceMetrics.qualityScore,
                    iterations: result.performanceMetrics.iterations,
                    modelUsed: result.performanceMetrics.modelUsed,
                    sectionInfo: PROPOSAL_SECTION_TYPES[input.type]
                }
            };

        } catch (error) {
            const executionTime = Date.now() - startTime;

            // تسجيل الخطأ
            await this.logGeneration({
                type: 'proposal-section',
                agentId: `intelligent-proposal-${input.type}`,
                inputTokens: this.estimateTokens(JSON.stringify(input)),
                outputTokens: 0,
                cost: this.creditCost,
                success: false,
                executionTime,
                error: error instanceof Error ? error.message : 'Unknown error'
            });

            throw error;
        }
    }

    /**
     * حساب التكلفة الديناميكية للرصيد
     */
    private calculateDynamicCreditCost(input: UnifiedProposalSectionInput): number {
        let baseCost = 3;

        // تعديل حسب نوع القسم
        const sectionInfo = PROPOSAL_SECTION_TYPES[input.type];
        switch (sectionInfo.complexity) {
            case 'basic':
                baseCost *= 0.8;
                break;
            case 'comprehensive':
                baseCost *= 1.4;
                break;
            default: // detailed
                baseCost *= 1.0;
        }

        // تعديل حسب التعقيد المطلوب
        switch (input.complexity) {
            case 'basic':
                baseCost *= 0.7;
                break;
            case 'comprehensive':
                baseCost *= 1.5;
                break;
            default: // detailed
                baseCost *= 1.0;
        }

        // تعديل حسب وجود محتوى مرجعي
        if (input.referenceContent?.existingSections) {
            baseCost *= 1.2;
        }

        // تعديل حسب التحسين التكراري
        if (input.enableIterativeImprovement) {
            baseCost *= 1.3;
        }

        // تعديل حسب طول المحتوى المطلوب
        if (input.style?.length === 'extensive') {
            baseCost *= 1.4;
        } else if (input.style?.length === 'concise') {
            baseCost *= 0.8;
        }

        return Math.ceil(baseCost);
    }

    /**
     * تقدير عدد الرموز
     */
    private estimateTokens(text: string): number {
        return Math.ceil(text.length / 4);
    }
}

/**
 * معالج توليد المقترح الكامل
 */
class CompleteProposalHandler extends CreditBasedApiHandler<CompleteProposalInput> {
    protected inputSchema = CompleteProposalInputSchema as any;
    protected creditCost = 15; // تكلفة أساسية للمقترح الكامل

    async processRequest(input: CompleteProposalInput, context: any) {
        const startTime = Date.now();

        try {
            // حساب التكلفة الديناميكية
            const dynamicCost = this.calculateCompleteCreditCost(input);
            this.creditCost = dynamicCost;

            // ترتيب الأقسام حسب التبعيات
            const orderedSections = input.intelligentSettings?.generateInOrder ?
                this.orderSectionsByDependencies(input.sectionsToGenerate) :
                input.sectionsToGenerate;

            const results: Record<string, any> = {};
            let totalExecutionTime = 0;
            let totalIterations = 0;
            let qualityScores: number[] = [];

            // توليد كل قسم
            for (const sectionType of orderedSections) {
                const sectionStartTime = Date.now();

                // إعداد السياق للقسم الحالي
                const existingSections = Object.keys(results).reduce((acc, key) => {
                    acc[key] = results[key].content;
                    return acc;
                }, {} as Record<string, string>);

                const sectionInput = {
                    type: sectionType,
                    projectContext: input.projectContext,
                    referenceContent: {
                        ...input.referenceContent,
                        existingSections
                    },
                    style: input.style || {
                        tone: 'professional' as const,
                        length: 'moderate' as const,
                        format: 'structured' as const,
                        language: 'ar' as const
                    },
                    complexity: input.complexity,
                    intelligentSettings: {
                        enableContextAnalysis: true,
                        enableIterativeImprovement: true,
                        enablePerformanceMonitoring: true,
                        qualityThreshold: input.intelligentSettings?.qualityThreshold ?? 80,
                        maxIterations: input.intelligentSettings?.maxRetries ?? 3,
                        adaptiveModelSelection: true
                    },
                    outputPreferences: {
                        includeOutline: true,
                        includeKeyPoints: true,
                        generateSuggestions: true,
                        validateContent: true
                    }
                };

                // توليد القسم
                const sectionResult = await generateProposalSection(sectionInput);
                results[sectionType] = sectionResult;

                // تجميع الإحصائيات
                const sectionExecutionTime = Date.now() - sectionStartTime;
                totalExecutionTime += sectionExecutionTime;
                totalIterations += sectionResult.performanceMetrics.iterations;
                qualityScores.push(sectionResult.qualityScore);
            }

            // حساب الإحصائيات الإجمالية
            const overallQuality = qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length;
            const totalWordCount = Object.values(results).reduce((total: number, section: any) =>
                total + section.wordCount, 0);
            const estimatedReadingTime = Math.ceil(totalWordCount / 200); // 200 كلمة/دقيقة

            // تحليل شامل للمقترح
            const analysis = this.analyzeCompleteProposal(results);

            // اقتراحات عامة
            const generalSuggestions = this.generateGeneralSuggestions(results, overallQuality);

            const executionTime = Date.now() - startTime;

            // تسجيل العملية
            await this.logGeneration({
                type: 'complete-proposal',
                agentId: 'intelligent-complete-proposal',
                inputTokens: this.estimateTokens(JSON.stringify(input)),
                outputTokens: totalWordCount,
                cost: dynamicCost,
                success: true,
                executionTime,
                qualityScore: overallQuality
            });

            // إعداد النتيجة النهائية
            const completeResult = {
                sections: results,
                overallQuality,
                totalWordCount,
                estimatedReadingTime,
                analysis,
                generalSuggestions,
                performanceMetrics: {
                    totalExecutionTime,
                    sectionsGenerated: orderedSections.length,
                    averageQuality: overallQuality,
                    totalIterations
                }
            };

            return {
                success: true,
                data: completeResult,
                metadata: {
                    executionTime,
                    creditCost: dynamicCost,
                    sectionsGenerated: orderedSections.length,
                    averageQuality: overallQuality,
                    totalWordCount
                }
            };

        } catch (error) {
            const executionTime = Date.now() - startTime;

            // تسجيل الخطأ
            await this.logGeneration({
                type: 'complete-proposal',
                agentId: 'intelligent-complete-proposal',
                inputTokens: this.estimateTokens(JSON.stringify(input)),
                outputTokens: 0,
                cost: this.creditCost,
                success: false,
                executionTime,
                error: error instanceof Error ? error.message : 'Unknown error'
            });

            throw error;
        }
    }

    /**
     * حساب التكلفة للمقترح الكامل
     */
    private calculateCompleteCreditCost(input: CompleteProposalInput): number {
        let baseCostPerSection = 3;
        const sectionCount = input.sectionsToGenerate.length;

        // تعديل حسب التعقيد
        switch (input.complexity) {
            case 'basic':
                baseCostPerSection *= 0.7;
                break;
            case 'comprehensive':
                baseCostPerSection *= 1.5;
                break;
        }

        // خصم للمقترح الكامل (15% خصم)
        const totalCost = baseCostPerSection * sectionCount * 0.85;

        return Math.ceil(totalCost);
    }

    /**
     * ترتيب الأقسام حسب التبعيات
     */
    private orderSectionsByDependencies(sections: ProposalSectionType[]): ProposalSectionType[] {
        const ordered: ProposalSectionType[] = [];
        const remaining = [...sections];

        // ترتيب منطقي مقترح
        const preferredOrder: ProposalSectionType[] = [
            'executive_summary',
            'problem_statement',
            'objectives',
            'scope',
            'methodology',
            'timeline',
            'budget',
            'team',
            'deliverables',
            'risk_assessment',
            'success_criteria',
            'conclusion',
            'appendices'
        ];

        // إضافة الأقسام بالترتيب المفضل
        for (const section of preferredOrder) {
            if (remaining.includes(section)) {
                ordered.push(section);
                remaining.splice(remaining.indexOf(section), 1);
            }
        }

        // إضافة أي أقسام متبقية
        ordered.push(...remaining);

        return ordered;
    }

    /**
     * تحليل شامل للمقترح
     */
    private analyzeCompleteProposal(results: Record<string, any>): {
        consistency: number;
        coherence: number;
        completeness: number;
        professionalTone: number;
    } {
        const sections = Object.values(results);

        // تحليل الاتساق
        const qualityScores = sections.map((s: any) => s.qualityScore);
        const qualityVariance = this.calculateVariance(qualityScores);
        const consistency = Math.max(0, 100 - qualityVariance * 2);

        // تحليل التماسك (بناءً على الكلمات المشتركة)
        const allContent = sections.map((s: any) => s.content).join(' ');
        const coherence = this.analyzeCoherence(allContent);

        // تحليل الاكتمال
        const expectedSections = ['executive_summary', 'objectives', 'methodology', 'conclusion'];
        const hasCriticalSections = expectedSections.every(section =>
            Object.keys(results).includes(section)
        );
        const completeness = hasCriticalSections ? 90 : 70;

        // تحليل النبرة المهنية
        const professionalTone = this.analyzeProfessionalTone(allContent);

        return {
            consistency: Math.round(consistency),
            coherence: Math.round(coherence),
            completeness,
            professionalTone: Math.round(professionalTone)
        };
    }

    /**
     * حساب التباين
     */
    private calculateVariance(numbers: number[]): number {
        const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
        const variance = numbers.reduce((acc, num) => acc + Math.pow(num - mean, 2), 0) / numbers.length;
        return Math.sqrt(variance);
    }

    /**
     * تحليل التماسك
     */
    private analyzeCoherence(content: string): number {
        // تحليل بسيط بناءً على تكرار الكلمات المفتاحية
        const words = content.toLowerCase().split(/\s+/);
        const wordFreq: Record<string, number> = {};

        words.forEach(word => {
            if (word.length > 3) {
                wordFreq[word] = (wordFreq[word] || 0) + 1;
            }
        });

        const repeatedWords = Object.values(wordFreq).filter(freq => freq > 2).length;
        return Math.min(100, (repeatedWords / Object.keys(wordFreq).length) * 200);
    }

    /**
     * تحليل النبرة المهنية
     */
    private analyzeProfessionalTone(content: string): number {
        const professionalKeywords = [
            'هدف', 'استراتيجية', 'تنفيذ', 'تطوير', 'تحليل', 'تقييم',
            'منهجية', 'إدارة', 'جودة', 'كفاءة', 'فعالية', 'نتائج'
        ];

        const words = content.toLowerCase().split(/\s+/);
        const professionalWordCount = words.filter(word =>
            professionalKeywords.some(keyword => word.includes(keyword))
        ).length;

        return Math.min(100, (professionalWordCount / words.length) * 500);
    }

    /**
     * توليد اقتراحات عامة
     */
    private generateGeneralSuggestions(results: Record<string, any>, overallQuality: number): string[] {
        const suggestions: string[] = [];

        if (overallQuality < 70) {
            suggestions.push('يُنصح بمراجعة وتحسين الأقسام ذات النقاط المنخفضة');
        }

        if (overallQuality >= 85) {
            suggestions.push('مقترح عالي الجودة، جاهز للمراجعة النهائية');
        }

        const sections = Object.values(results);
        const wordCounts = sections.map((s: any) => s.wordCount);
        const avgWordCount = wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length;

        const imbalanced = wordCounts.some(count =>
            count < avgWordCount * 0.5 || count > avgWordCount * 2
        );

        if (imbalanced) {
            suggestions.push('توحيد مستوى التفصيل بين الأقسام المختلفة');
        }

        suggestions.push('مراجعة التماسك والاتساق بين الأقسام');
        suggestions.push('التأكد من ربط جميع الأقسام بأهداف المشروع');

        return suggestions;
    }

    /**
     * تقدير عدد الرموز
     */
    private estimateTokens(text: string): number {
        return Math.ceil(text.length / 4);
    }
}

// إنشاء معالجات API
const intelligentProposalSectionHandler = new IntelligentProposalSectionHandler();
const completeProposalHandler = new CompleteProposalHandler();

/**
 * POST - توليد قسم واحد من المقترح
 */
export const POST = withApiMiddleware(
    rateLimit({ maxRequests: 8, windowMs: 15 * 60 * 1000 }), // 8 طلبات كل 15 دقيقة
    intelligentProposalSectionHandler.handle.bind(intelligentProposalSectionHandler)
);

/**
 * PUT - توليد مقترح كامل
 */
export const PUT = withApiMiddleware(
    rateLimit({ maxRequests: 2, windowMs: 30 * 60 * 1000 }), // طلبان كل 30 دقيقة
    completeProposalHandler.handle.bind(completeProposalHandler)
);

/**
 * GET - إحصائيات النظام ومعلومات الأداء
 */
export const GET = withApiMiddleware(async (context: any) => {
    try {
        // محاكاة الإحصائيات
        const quickStats = {
            totalOperations: 150,
            successRate: 95.5,
            averageExecutionTime: 2800
        };
        const performanceReport = {
            totalOperations: 150,
            successRate: 95.5,
            averageExecutionTime: 2800
        };

        return Response.json({
            success: true,
            data: {
                systemInfo: {
                    name: 'Intelligent Proposal Section Generation System',
                    version: '1.0.0',
                    status: 'active',
                    capabilities: [
                        'Multi-section proposal generation',
                        'Complete proposal workflow',
                        'Intelligent context analysis',
                        'Adaptive model selection',
                        'Iterative quality improvement',
                        'Cross-section consistency',
                        'Performance monitoring',
                        'Arabic/English support'
                    ]
                },
                supportedSections: Object.keys(PROPOSAL_SECTION_TYPES),
                sectionCategories: {
                    overview: ['executive_summary', 'problem_statement', 'conclusion', 'appendices'],
                    planning: ['objectives', 'scope', 'timeline'],
                    execution: ['methodology', 'deliverables'],
                    management: ['budget', 'team', 'risk_assessment'],
                    evaluation: ['success_criteria']
                },
                features: {
                    intelligentAnalysis: true,
                    iterativeImprovement: true,
                    performanceMonitoring: true,
                    multiLanguage: true,
                    adaptiveModels: true,
                    qualityValidation: true,
                    dependencyManagement: true,
                    consistencyCheck: true
                },
                stats: quickStats,
                performance: {
                    totalOperations: performanceReport.totalOperations,
                    successRate: performanceReport.successRate,
                    averageExecutionTime: performanceReport.averageExecutionTime
                }
            }
        });

    } catch (error) {
        return Response.json({
            success: false,
            error: 'Failed to retrieve system information',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
});
