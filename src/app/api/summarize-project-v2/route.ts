/**
 * API Route لتلخيص المشروع - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لتلخيص المشروع
 */

import { summarizeFullProject } from '@/ai/flows/summarize-project';
import { AnyProjectProposalSchema } from '@/ai/schemas';
import { CreditBasedApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { logGeneration } from '@/services';
import { z } from 'zod';

// Schema لتلخيص المشروع
const summarizeSchema = z.object({
    proposal: AnyProjectProposalSchema,
    reportMarkdown: z.string().optional(),
});

/**
 * معالج تلخيص المشروع
 */
class SummarizeProjectHandler extends CreditBasedApiHandler<{
    proposal: any;
    reportMarkdown?: string;
}, any> {
    protected inputSchema = summarizeSchema;
    protected creditCost = 1;

    protected async processRequest(data: any, context: any) {
        const { user } = context;

        const agentInput = {
            proposal: data.proposal,
            reportMarkdown: data.reportMarkdown || '',
        };
        const result = await summarizeFullProject(agentInput);

        // تسجيل العملية
        await logGeneration({
            agentId: 'summarize-full-project',
            userId: user.id,
            input: { proposalTitle: agentInput.proposal.title, reportLength: agentInput.reportMarkdown.length },
            output: result,
            creditCost: this.creditCost
        });

        return result;
    }
}

// إنشاء المعالج
const summarizeProjectHandler = new SummarizeProjectHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    summarizeProjectHandler.handle.bind(summarizeProjectHandler),
    {
        logging: true
    }
);
