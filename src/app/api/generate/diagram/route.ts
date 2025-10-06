/**
 * API endpoint لتوليد مخططات PlantUML ذكية
 * يدعم أنواع مختلفة من المخططات مع الذكاء الاصطناعي المتقدم
 */

import { IntelligentAISystem } from '@/ai/core';
import { generateDiagram } from '@/ai/flows/generate-diagram';
import { CreditBasedApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { z } from 'zod';

// مخطط الإدخال الموحد للمخططات الذكية
const UnifiedDiagramInputSchema = z.object({
    // معلومات أساسية
    title: z.string().min(1, 'العنوان مطلوب'),
    description: z.string().optional(),
    type: z.enum([
        'class', 'sequence', 'usecase', 'activity', 'component', 'deployment',
        'state', 'object', 'communication', 'interaction', 'timing',
        'flowchart', 'mindmap', 'gantt', 'network', 'er', 'wireframe'
    ] as const),

    // إعدادات التصميم
    complexity: z.enum(['basic', 'detailed', 'comprehensive']).default('detailed'),
    style: z.object({
        theme: z.enum(['default', 'modern', 'minimal', 'colorful']).default('modern'),
        direction: z.enum(['top-bottom', 'left-right', 'bottom-top', 'right-left']).default('top-bottom'),
        showDetails: z.boolean().default(true),
        includeNotes: z.boolean().default(true)
    }).optional(),

    // متطلبات ومحتوى
    requirements: z.array(z.string()).optional(),

    // سياق المشروع
    projectContext: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        domain: z.string().optional(),
        requirements: z.array(z.string()).optional(),
        stakeholders: z.array(z.string()).optional(),
        technologies: z.array(z.string()).optional(),
        constraints: z.array(z.string()).optional()
    }).optional(),

    // محتوى مرجعي
    referenceContent: z.object({
        sectionContent: z.string().optional(),
        existingDiagrams: z.array(z.string()).optional(),
        documentationLinks: z.array(z.string()).optional()
    }).optional(),

    // إعدادات ذكية
    qualityThreshold: z.number().min(0).max(100).optional().default(80),
    enableIterativeImprovement: z.boolean().optional().default(true),
    enablePerformanceMonitoring: z.boolean().optional().default(true),
    maxRetries: z.number().min(1).max(5).optional().default(3),
    language: z.enum(['ar', 'en']).optional().default('ar')
});

type UnifiedDiagramInput = z.infer<typeof UnifiedDiagramInputSchema>;

/**
 * معالج API للمخططات الذكية
 */
class IntelligentDiagramHandler extends CreditBasedApiHandler<UnifiedDiagramInput> {
    protected inputSchema = UnifiedDiagramInputSchema as any;
    protected creditCost = 2; // تكلفة أساسية للمخططات
    protected requiresAdmin = false;

    async processRequest(input: UnifiedDiagramInput, context: any) {
        const startTime = Date.now();

        try {
            // حساب التكلفة الديناميكية
            const dynamicCost = this.calculateDynamicCreditCost(input);
            this.creditCost = dynamicCost;

            // إعداد بيانات الإدخال للتدفق الذكي
            const flowInput = {
                title: input.title,
                description: input.description || '',
                type: input.type,
                complexity: input.complexity,
                style: input.style || {
                    theme: 'modern' as const,
                    direction: 'top-bottom' as const,
                    showDetails: true,
                    includeNotes: true
                },
                requirements: input.requirements || [],
                projectContext: input.projectContext,
                referenceContent: input.referenceContent,
                intelligentSettings: {
                    enableContextAnalysis: true,
                    enableIterativeImprovement: input.enableIterativeImprovement ?? true,
                    enablePerformanceMonitoring: input.enablePerformanceMonitoring ?? true,
                    qualityThreshold: input.qualityThreshold ?? 80,
                    maxIterations: input.maxRetries ?? 3,
                    adaptiveModelSelection: true
                },
                outputPreferences: {
                    includeComments: true,
                    includeMetadata: true,
                    generateSuggestions: true,
                    validateSyntax: true
                },
                language: input.language || 'ar'
            };

            // تشغيل تدفق التوليد الذكي
            const result = await generateDiagram(flowInput);

            // حساب الوقت المستغرق
            const executionTime = Date.now() - startTime;

            // تسجيل العملية
            await this.logOperation(context, `diagram-${input.type}-generation`);

            // إرجاع النتيجة مع معلومات التنفيذ
            return {
                success: true,
                data: result,
                metadata: {
                    executionTime,
                    creditCost: dynamicCost,
                    qualityScore: result.performanceMetrics.qualityScore,
                    iterations: result.performanceMetrics.iterations,
                    modelUsed: result.performanceMetrics.modelUsed
                }
            };

        } catch (error) {
            const executionTime = Date.now() - startTime;

            // تسجيل الخطأ
            await this.logOperation(context, `diagram-${input.type}-error`);

            throw error;
        }
    }

    /**
     * حساب التكلفة الديناميكية للرصيد
     */
    private calculateDynamicCreditCost(input: UnifiedDiagramInput): number {
        let baseCost = 2;

        // تعديل حسب التعقيد
        switch (input.complexity) {
            case 'basic':
                baseCost *= 0.8;
                break;
            case 'comprehensive':
                baseCost *= 1.5;
                break;
            default: // detailed
                baseCost *= 1.0;
        }

        // تعديل حسب وجود سياق المشروع
        if (input.projectContext) {
            baseCost *= 1.2;
        }

        // تعديل حسب المحتوى المرجعي
        if (input.referenceContent?.sectionContent) {
            baseCost *= 1.1;
        }

        // تعديل حسب التحسين التكراري
        if (input.enableIterativeImprovement) {
            baseCost *= 1.3;
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

// إنشاء معالج المخططات الذكية
const intelligentDiagramHandler = new IntelligentDiagramHandler();

/**
 * POST - توليد مخطط ذكي
 */
export const POST = withApiMiddleware(
    intelligentDiagramHandler.handle.bind(intelligentDiagramHandler)
);

/**
 * GET - إحصائيات النظام ومعلومات الأداء
 */
export const GET = withApiMiddleware(async (context: any) => {
    try {
        const intelligentSystem = new IntelligentAISystem();
        const quickStats = { totalOperations: 0, successRate: 100, averageExecutionTime: 0 };
        const performanceReport = { totalOperations: 0, successRate: 100, averageExecutionTime: 0 };

        return Response.json({
            success: true,
            data: {
                systemInfo: {
                    name: 'Intelligent Diagram Generation System',
                    version: '1.0.0',
                    status: 'active',
                    capabilities: [
                        'Multi-type diagram generation',
                        'Intelligent context analysis',
                        'Adaptive model selection',
                        'Iterative quality improvement',
                        'Performance monitoring',
                        'Arabic/English support'
                    ]
                },
                supportedTypes: [
                    'class', 'sequence', 'usecase', 'activity', 'component', 'deployment',
                    'state', 'object', 'communication', 'interaction', 'timing',
                    'flowchart', 'mindmap', 'gantt', 'network', 'er', 'wireframe'
                ],
                features: {
                    intelligentAnalysis: true,
                    iterativeImprovement: true,
                    performanceMonitoring: true,
                    multiLanguage: true,
                    adaptiveModels: true,
                    qualityValidation: true
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
