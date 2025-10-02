/**
 * API Route لتقييم التقارير - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لتقييم التقارير
 */

import { evaluateReport } from '@/ai/flows/evaluate-report';
import { DiagramTypeSchema, ProjectProposalSchema, SectionNameSchema } from '@/ai/schemas';
import { CreditBasedApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { logGeneration } from '@/services';
import { z } from 'zod';

// Schema لتقييم التقارير
const evaluateReportSchema = z.object({
    proposal: ProjectProposalSchema.optional().nullable(),
    reportSections: z.record(SectionNameSchema, z.string()),
    diagrams: z.record(DiagramTypeSchema, z.string()).optional().nullable(),
    acceptanceCriteria: z.array(z.string()).optional().nullable(),
});

/**
 * معالج تقييم التقارير
 */
class EvaluateReportHandler extends CreditBasedApiHandler<{
    proposal?: any;
    reportSections: Record<string, string>;
    diagrams?: Record<string, string> | null;
    acceptanceCriteria?: string[] | null;
}, any> {
    protected inputSchema = evaluateReportSchema;
    protected creditCost = 1;
    protected requiresAdmin = false;

    protected async processRequest(data: any, context: any) {
        const { user } = context;

        const agentInput = data;
        const result = await evaluateReport(agentInput);

        // تسجيل العملية
        await logGeneration({
            agentId: 'evaluate-report',
            userId: user.id,
            input: agentInput,
            output: result,
            creditCost: this.creditCost,
        });

        return result;
    }
}

// إنشاء المعالج
const evaluateReportHandler = new EvaluateReportHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    evaluateReportHandler.handle.bind(evaluateReportHandler),
    {
        logging: true
    }
);
