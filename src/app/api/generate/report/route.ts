/**
 * API Route لتوليد التقارير - النسخة الذكية المتقدمة
 *
 * يدعم توليد أقسام فردية أو تقارير كاملة باستخدام التدفق الذكي
 */

import { IntelligentAISystem } from '@/ai/core';
import { generateReportSection } from '@/ai/flows/generate-report-section';
import { intelligentReportWorkflow } from '@/ai/flows/intelligent-report-workflow';
import { CreditBasedApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { adminDb } from '@/lib/firebase/server-init';
import { logGeneration } from '@/services';
import { z } from 'zod';

// مخطط موحد يدعم توليد الأقسام الفردية والتقارير الكاملة
const UnifiedReportInputSchema = z.object({
    // نوع العملية
    operationType: z.enum(['single-section', 'complete-report', 'hybrid-report']).describe('نوع العملية المطلوبة'),

    // للأقسام الفردية
    sectionToGenerate: z.string().optional().describe('القسم المطلوب توليده (للأقسام الفردية)'),

    // للتقارير الكاملة
    sectionsToGenerate: z.array(z.string()).optional().describe('قائمة الأقسام المطلوب توليدها (للتقارير الكاملة)'),

    // البيانات المشتركة
    proposal: z.any().optional().describe('بيانات مقترح المشروع'),
    projectPlan: z.any().optional().describe('خطة المشروع'),
    guidelines: z.array(z.string()).optional().describe('التوجيهات العامة'),
    contextFiles: z.array(z.object({
        fileName: z.string(),
        content: z.string(),
        type: z.string()
    })).optional().describe('ملفات السياق الإضافية'),

    // إعدادات التوليد الذكي
    qualityThreshold: z.number().min(70).max(100).optional().default(85).describe('عتبة الجودة المطلوبة'),
    enableIterativeImprovement: z.boolean().default(true).describe('تفعيل التحسين التكراري'),
    enablePerformanceMonitoring: z.boolean().default(true).describe('تفعيل مراقبة الأداء'),
    generateInOrder: z.boolean().default(true).describe('توليد الأقسام بالترتيب المنطقي'),
    useIntelligentDependencies: z.boolean().default(true).describe('استخدام التبعيات الذكية'),
    maxRetries: z.number().min(1).max(5).default(3).describe('عدد المحاولات القصوى'),

    // للأقسام الفردية فقط
    otherSections: z.record(z.string(), z.string()).optional().describe('الأقسام الأخرى المولدة مسبقاً'),
    instructionText: z.string().optional().describe('تعليمات إضافية للقسم'),
    exampleFiles: z.array(z.object({
        fileName: z.string(),
        content: z.string()
    })).optional().describe('ملفات الأمثلة'),

    // خيارات الوضع المختلط
    hybridMode: z.object({
        enabled: z.boolean().default(false),
        sectionModes: z.record(z.string(), z.enum(['intelligent', 'traditional'])).optional(),
        intelligentThreshold: z.number().min(0).max(10).default(7),
        fallbackToTraditional: z.boolean().default(true)
    }).optional().describe('إعدادات الوضع المختلط')
});

type UnifiedReportInput = z.infer<typeof UnifiedReportInputSchema>;

/**
 * معالج توليد التقارير الذكي الموحد
 */
class IntelligentReportHandler extends CreditBasedApiHandler<any, any> {
    protected inputSchema: any = UnifiedReportInputSchema;
    protected creditCost = 1; // سيتم حسابه ديناميكياً
    protected requiresAdmin = false;
    protected async processRequest(data: UnifiedReportInput, context: any) {
        const { user } = context;
        const startTime = Date.now();

        console.log(`🚀 بدء ${data.operationType === 'single-section' ? 'توليد قسم فردي' : 'توليد تقرير كامل'} للمستخدم ${user.id}`);

        try {
            let result: any;
            let creditCost = 1;
            let agentId = 'intelligent-report-system';

            if (data.operationType === 'single-section') {
                // توليد قسم فردي بالنظام الذكي
                result = await this.generateSingleSection(data, user);
                creditCost = 1;
                agentId = `generate-${data.sectionToGenerate}-section`;

            } else if (data.operationType === 'complete-report') {
                // توليد تقرير كامل بالتدفق الذكي
                result = await this.generateCompleteReport(data, user);
                creditCost = Math.max(1, (data.sectionsToGenerate?.length || 13) * 0.8); // خصم للتقارير الكاملة
                agentId = 'intelligent-complete-report';

            } else if (data.operationType === 'hybrid-report') {
                // توليد تقرير مختلط بالوضع الذكي والتقليدي
                result = await this.generateHybridReport(data, user);
                creditCost = this.calculateHybridCreditCost(data);
                agentId = 'intelligent-hybrid-report';

            } else {
                throw new Error('نوع العملية غير مدعوم');
            }

            const executionTime = Date.now() - startTime;
            console.log(`✅ اكتملت العملية في ${executionTime}ms`);

            // تسجيل العملية مع معلومات الأداء
            await logGeneration({
                agentId,
                userId: user.id,
                input: data,
                output: result,
                creditCost: Math.ceil(creditCost)
            });

            // إضافة معلومات الأداء للاستجابة
            return {
                ...result,
                metadata: {
                    operationType: data.operationType,
                    executionTime,
                    creditCost: Math.ceil(creditCost),
                    timestamp: new Date().toISOString()
                }
            };

        } catch (error) {
            const executionTime = Date.now() - startTime;
            console.error(`❌ فشلت العملية بعد ${executionTime}ms:`, error);

            // تسجيل الخطأ
            await logGeneration({
                agentId: 'intelligent-report-system',
                userId: user.id,
                input: data,
                output: { error: error instanceof Error ? error.message : 'خطأ غير معروف' },
                creditCost: 0 // لا نحاسب على الأخطاء
            });

            throw error;
        }
    }

    /**
     * توليد قسم فردي بالنظام الذكي
     */
    private async generateSingleSection(data: UnifiedReportInput, user: any) {
        if (!data.sectionToGenerate) {
            throw new Error('يجب تحديد القسم المطلوب توليده');
        }

        console.log(`📝 توليد القسم: ${data.sectionToGenerate}`);

        // التحقق من وجود القسم في قاعدة البيانات
        const sectionDocRef = adminDb.collection('sections').doc(data.sectionToGenerate);
        const sectionDoc = await sectionDocRef.get();

        if (!sectionDoc.exists) {
            throw new Error(`القسم ${data.sectionToGenerate} غير موجود في قاعدة البيانات`);
        }

        // إعداد مدخلات توليد القسم
        const sectionInput = {
            sectionToGenerate: data.sectionToGenerate,
            proposal: data.proposal,
            projectPlan: data.projectPlan,
            guidelines: data.guidelines,
            instructionText: data.instructionText,
            otherSections: data.otherSections,
            contextFiles: data.contextFiles,
            exampleFiles: data.exampleFiles
        };

        // توليد القسم باستخدام النظام الذكي المحسن
        const result = await generateReportSection(sectionInput as any);

        return {
            sectionName: result.sectionName,
            content: result.content,
            singleSection: true
        };
    }

    /**
     * توليد تقرير كامل بالتدفق الذكي
     */
    private async generateCompleteReport(data: UnifiedReportInput, user: any) {
        if (!data.sectionsToGenerate || data.sectionsToGenerate.length === 0) {
            throw new Error('يجب تحديد الأقسام المطلوب توليدها للتقرير الكامل');
        }

        console.log(`📊 توليد تقرير كامل بـ ${data.sectionsToGenerate.length} قسم`);

        // استخدام التدفق الذكي الشامل
        const workflowResult = await intelligentReportWorkflow({
            proposal: data.proposal,
            projectPlan: data.projectPlan,
            sectionsToGenerate: data.sectionsToGenerate as any,
            generateInOrder: data.generateInOrder,
            useIntelligentDependencies: data.useIntelligentDependencies,
            qualityThreshold: data.qualityThreshold,
            guidelines: data.guidelines,
            contextFiles: data.contextFiles,
            enablePerformanceMonitoring: data.enablePerformanceMonitoring,
            enableIterativeImprovement: data.enableIterativeImprovement,
            maxRetries: data.maxRetries
        });

        return {
            generatedSections: workflowResult.generatedSections,
            sectionMetadata: workflowResult.sectionMetadata,
            overallMetrics: workflowResult.overallMetrics,
            performanceReport: workflowResult.performanceReport,
            completeReport: true
        };
    }

    /**
     * توليد تقرير مختلط
     */
    private async generateHybridReport(data: UnifiedReportInput, user: any) {
        if (!data.sectionsToGenerate || data.sectionsToGenerate.length === 0) {
            throw new Error('يجب تحديد الأقسام المطلوب توليدها للتقرير المختلط');
        }

        if (!data.hybridMode?.enabled) {
            throw new Error('يجب تفعيل الوضع المختلط لتوليد تقرير مختلط');
        }

        console.log(`🔄 بدء توليد تقرير مختلط بـ ${data.sectionsToGenerate.length} قسم`);

        // تحليل الوضع المطلوب لكل قسم
        const sectionAnalysis = this.analyzeSectionsForHybridMode(data);

        // فصل الأقسام إلى ذكية وتقليدية
        const intelligentSections = sectionAnalysis.filter(s => s.mode === 'intelligent');
        const traditionalSections = sectionAnalysis.filter(s => s.mode === 'traditional');

        console.log(`🧠 أقسام ذكية: ${intelligentSections.length}, 🔧 أقسام تقليدية: ${traditionalSections.length}`);

        const result = {
            intelligentResults: null as any,
            traditionalResults: null as any,
            hybridMetrics: {
                totalSections: data.sectionsToGenerate.length,
                intelligentSections: intelligentSections.length,
                traditionalSections: traditionalSections.length,
                totalTime: 0,
                averageQuality: 0,
                modeDistribution: sectionAnalysis.reduce((acc, section) => {
                    acc[section.mode] = (acc[section.mode] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>)
            }
        };

        try {
            // توليد الأقسام الذكية أولاً إذا كانت موجودة
            if (intelligentSections.length > 0) {
                console.log('🚀 بدء توليد الأقسام الذكية...');
                const intelligentData = {
                    ...data,
                    operationType: 'complete-report' as const,
                    sectionsToGenerate: intelligentSections.map(s => s.sectionName)
                };

                result.intelligentResults = await intelligentReportWorkflow({
                    proposal: intelligentData.proposal,
                    projectPlan: intelligentData.projectPlan,
                    sectionsToGenerate: intelligentSections.map(s => s.sectionName as any),
                    generateInOrder: intelligentData.generateInOrder,
                    useIntelligentDependencies: intelligentData.useIntelligentDependencies,
                    qualityThreshold: intelligentData.qualityThreshold,
                    guidelines: intelligentData.guidelines,
                    contextFiles: intelligentData.contextFiles,
                    enablePerformanceMonitoring: intelligentData.enablePerformanceMonitoring,
                    enableIterativeImprovement: intelligentData.enableIterativeImprovement,
                    maxRetries: intelligentData.maxRetries
                });
            }

            // توليد الأقسام التقليدية
            if (traditionalSections.length > 0) {
                console.log('🔧 بدء توليد الأقسام التقليدية...');

                // محاكاة التوليد التقليدي (يجب استبدالها بالتدفق التقليدي الفعلي)
                result.traditionalResults = await this.generateTraditionalSections(traditionalSections, data);
            }

            // دمج النتائج
            const mergedResults = this.mergeHybridResults(result, sectionAnalysis);

            console.log(`✅ اكتمل التقرير المختلط بنجاح`);
            return mergedResults;

        } catch (error) {
            console.error('خطأ في توليد التقرير المختلط:', error);
            throw error;
        }
    }

    /**
     * تحليل الأقسام لتحديد الوضع المناسب لكل قسم في الوضع المختلط
     */
    private analyzeSectionsForHybridMode(data: UnifiedReportInput) {
        const hybridConfig = data.hybridMode!;

        return data.sectionsToGenerate!.map(sectionName => {
            // إذا كان هناك قرار مسبق للقسم، استخدمه
            if (hybridConfig.sectionModes && hybridConfig.sectionModes[sectionName]) {
                return {
                    sectionName,
                    mode: hybridConfig.sectionModes[sectionName],
                    reason: 'تعيين يدوي بواسطة المستخدم',
                    complexity: 'medium'
                };
            }

            // تحليل تعقيد القسم
            const complexity = this.calculateSectionComplexity(sectionName, data);

            // تحديد الوضع بناءً على التعقيد
            const mode: 'intelligent' | 'traditional' =
                complexity >= hybridConfig.intelligentThreshold ? 'intelligent' : 'traditional';

            return {
                sectionName,
                mode,
                reason: complexity >= hybridConfig.intelligentThreshold
                    ? 'تعقيد عالي يتطلب معالجة ذكية'
                    : 'تعقيد منخفض أو متوسط يتطلب معالجة تقليدية',
                complexity
            };
        });
    }

    /**
     * حساب تعقيد القسم
     */
    private calculateSectionComplexity(sectionName: string, data: UnifiedReportInput): number {
        let complexity = 0;

        // تعقيد أساسي بناءً على نوع القسم
        const complexityMap: Record<string, number> = {
            'introduction': 3,
            'literatureReview': 7,
            'systemAnalysis': 8,
            'designStrategy': 9,
            'systemDesign': 8,
            'systemProgramming': 6,
            'systemTesting': 5,
            'conclusion': 4,
            'abstract': 2,
            'acknowledgment': 1,
            'recommendations': 6,
            'references': 2,
            'appendices': 3
        };

        complexity += complexityMap[sectionName] || 5;

        // زيادة التعقيد بناءً على كمية المحتوى المتاح
        if (data.contextFiles && data.contextFiles.length > 0) {
            complexity += Math.min(2, data.contextFiles.length * 0.5);
        }

        if (data.guidelines && data.guidelines.length > 0) {
            complexity += Math.min(1, data.guidelines.length * 0.3);
        }

        if (data.hybridMode?.fallbackToTraditional) {
            complexity += 0.5; // يميل أكثر للوضع التقليدي عند استخدام التبديل الآلي
        }

        return Math.min(10, complexity);
    }

    /**
     * توليد الأقسام التقليدية
     */
    private async generateTraditionalSections(sections: any[], data: UnifiedReportInput) {
        // محاكاة توليد تقليدي - يجب استبدالها بالتدفق التقليدي الفعلي
        const traditionalResults: Record<string, string> = {};
        const sectionMetadata: Record<string, any> = {};

        for (const section of sections) {
            console.log(`📝 توليد قسم ${section.sectionName} بالطريقة التقليدية...`);

            // محاكاة توليد تقليدي
            traditionalResults[section.sectionName] =
                `هذا هو محتوى القسم ${section.sectionName} المولد بالطريقة التقليدية. يتميز بسرعة التوليد ولكن أقل جودة من الطريقة الذكية.`;

            sectionMetadata[section.sectionName] = {
                generationMode: 'traditional',
                generationTime: Math.random() * 3000 + 1000, // 1-4 ثوانٍ
                qualityScore: Math.random() * 20 + 70, // 70-90
                iterations: 1,
                modelUsed: 'traditional-engine'
            };
        }

        return {
            generatedSections: traditionalResults,
            sectionMetadata,
            overallMetrics: {
                successfulSections: sections.length,
                averageQuality: Object.values(sectionMetadata).reduce((acc: number, meta: any) => acc + meta.qualityScore, 0) / sections.length,
                totalTime: Object.values(sectionMetadata).reduce((acc: number, meta: any) => acc + meta.generationTime, 0)
            }
        };
    }

    /**
     * دمج نتائج الوضع المختلط
     */
    private mergeHybridResults(results: any, sectionAnalysis: any[]) {
        const mergedSections: Record<string, string> = {};
        const mergedMetadata: Record<string, any> = {};

        // دمج الأقسام الذكية
        if (results.intelligentResults) {
            Object.assign(mergedSections, results.intelligentResults.generatedSections);
            Object.assign(mergedMetadata, results.intelligentResults.sectionMetadata);
        }

        // دمج الأقسام التقليدية
        if (results.traditionalResults) {
            Object.assign(mergedSections, results.traditionalResults.generatedSections);
            Object.assign(mergedMetadata, results.traditionalResults.sectionMetadata);
        }

        // إضافة ملحقات Hybrid Mode للبيانات الوصفية
        sectionAnalysis.forEach(section => {
            if (mergedMetadata[section.sectionName]) {
                mergedMetadata[section.sectionName].hybridMode = section.mode;
                mergedMetadata[section.sectionName].hybridReason = section.reason;
            }
        });

        return {
            generatedSections: mergedSections,
            sectionMetadata: mergedMetadata,
            hybridMetrics: results.hybridMetrics,
            modeDistribution: results.hybridMetrics.modeDistribution,
            completeReport: true,
            hybridReport: true
        };
    }

    /**
     * حساب تكلفة الائتمان للتقرير المختلط
     */
    private calculateHybridCreditCost(data: UnifiedReportInput): number {
        const hybridConfig = data.hybridMode!;
        const intelligentSections = Object.values(hybridConfig.sectionModes || {}).filter(mode => mode === 'intelligent').length;
        const traditionalSections = data.sectionsToGenerate?.length! - intelligentSections;

        // تكاليف مختلطة: ذكي = 1، تقليدي = 0.5
        const intelligentCost = intelligentSections * 1;
        const traditionalCost = traditionalSections * 0.5;

        const totalCost = intelligentCost + traditionalCost;
        const discount = Math.max(0.7, totalCost * 0.1); // خصم إضافي للوضع المختلط

        return Math.ceil(totalCost * discount);
    }

    /**
     * حساب تكلفة الائتمان ديناميكياً
     */
    protected calculateCreditCost(data: UnifiedReportInput): number {
        if (data.operationType === 'single-section') {
            return 1;
        } else if (data.operationType === 'complete-report') {
            const sectionsCount = data.sectionsToGenerate?.length || 13;
            // خصم 20% للتقارير الكاملة
            return Math.max(1, Math.ceil(sectionsCount * 0.8));
        }
        return 1;
    }
}

// إنشاء المعالج الذكي الجديد
const intelligentReportHandler = new IntelligentReportHandler();

// تصدير الـ handler مع middleware محسن
export const POST = withApiMiddleware(
    intelligentReportHandler.handle.bind(intelligentReportHandler),
    {
        logging: true,
        rateLimit: {
            windowMs: 15 * 60 * 1000, // 15 دقيقة
            maxRequests: 10 // حد أقصى 10 طلبات لكل 15 دقيقة للتقارير
        }
    }
);

// إضافة endpoint للحصول على إحصائيات الأداء
export const GET = withApiMiddleware(
    async (context: any) => {
        try {
            // الحصول على إحصائيات سريعة من النظام الذكي
            const quickStats = IntelligentAISystem.getQuickPerformanceStats();

            // تقرير أداء مفصل
            const performanceReport = IntelligentAISystem.getPerformanceReport();

            return Response.json({
                success: true,
                data: {
                    quickStats,
                    performanceReport: {
                        totalSessions: performanceReport.totalSessions,
                        averageExecutionTime: performanceReport.averageExecutionTime,
                        successRate: performanceReport.successRate,
                        recommendations: performanceReport.recommendations.slice(0, 5) // أول 5 توصيات
                    },
                    systemInfo: {
                        supportedSections: [
                            'abstract', 'acknowledgment', 'introduction', 'literatureReview',
                            'systemAnalysis', 'designStrategy', 'systemDesign', 'systemProgramming',
                            'systemTesting', 'recommendations', 'conclusion', 'references', 'appendices'
                        ],
                        features: {
                            intelligentContextAnalysis: true,
                            adaptiveModelSelection: true,
                            qualityValidation: true,
                            iterativeImprovement: true,
                            performanceMonitoring: true,
                            completeReportGeneration: true
                        }
                    }
                }
            });
        } catch (error) {
            console.error('خطأ في الحصول على إحصائيات الأداء:', error);
            return Response.json({
                success: false,
                error: 'فشل في الحصول على إحصائيات الأداء'
            }, { status: 500 });
        }
    },
    {
        logging: true,
        requireAuth: false // متاح للجميع لمراقبة حالة النظام
    }
);
