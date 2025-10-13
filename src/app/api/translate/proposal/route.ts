/**
 * API Route لترجمة المقترحات - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لترجمة المقترحات
 */

// import { translateProposal } from '@/ai/flows/translate-proposal';
import { ProjectProposalSchema } from '@/ai/schemas/project';
import { CreditBasedApiHandler } from '@/core/api/handlers/base-handler';
import { withApiMiddleware } from '@/core/api/middleware/api-middleware';
import { logGeneration } from '@/services';
import { z } from 'zod';

export const ApiTranslateProposalSchema = z.object({
    proposal: ProjectProposalSchema,
    targetLang: z.string(),
});

/**
 * معالج ترجمة المقترحات
 */
class TranslateProposalHandler extends CreditBasedApiHandler<z.infer<typeof ApiTranslateProposalSchema>, any> {
    protected inputSchema = ApiTranslateProposalSchema;
    protected creditCost = 2;
    protected requiresAdmin = false;
    protected async processRequest(data: z.infer<typeof ApiTranslateProposalSchema>, context: any) {
        const { user } = context;

        const agentInput = data;
        // const result = await translateProposal(agentInput);
        const result = { title: "Translated Proposal" };

        // تسجيل العملية
        await logGeneration({
            agentId: 'translate-proposal',
            userId: user.id,
            input: { targetLang: agentInput.targetLang, proposalTitle: agentInput.proposal.title },
            output: { proposalTitle: result.title },
            creditCost: this.creditCost,
        });

        return result;
    }
}

// إنشاء المعالج
const translateProposalHandler = new TranslateProposalHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    translateProposalHandler,
    { logging: true }
);
