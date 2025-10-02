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
    operationType: z.enum(['single-section', 'complete-report']).describe('نوع العملية المطلوبة'),

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
    })).optional().describe('ملفات الأمثلة')
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
