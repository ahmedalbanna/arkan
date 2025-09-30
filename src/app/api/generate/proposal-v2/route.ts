/**
 * API Route لتوليد المقترحات - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لتوليد المقترحات
 */

import { generateProposal } from '@/ai/flows/generate-proposal';
import { GenerateProposalInputSchema, type GenerateProposalInput } from '@/ai/schemas';
import { CreditBasedApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { logGeneration } from '@/services';

/**
 * معالج توليد المقترحات
 */
class GenerateProposalHandler extends CreditBasedApiHandler<GenerateProposalInput, any> {
    protected requiresAdmin?: boolean | undefined;
    protected inputSchema = GenerateProposalInputSchema;
    protected creditCost = 1;

    protected async processRequest(data: any, context: any) {
        const { projectIdea, guidelines, externalContext, advancedFields } = data;
        const { user } = context;

        const agentInput: GenerateProposalInput = {
            projectIdea,
            guidelines,
            externalContext,
            advancedFields,
        };

        // توليد المقترح
        const result = await generateProposal(agentInput);

        // تسجيل العملية
        await logGeneration({
            agentId: 'generate-proposal',
            userId: user.id,
            input: {
                projectIdea,
                guidelines,
                externalContextFileCount: externalContext?.length || 0,
                usedAdvancedMode: !!advancedFields,
            },
            output: { resultLength: JSON.stringify(result).length },
            creditCost: this.creditCost,
        });

        return result;
    }
}

// إنشاء المعالج
const generateProposalHandler = new GenerateProposalHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    generateProposalHandler.handle.bind(generateProposalHandler),
    {
        logging: true
    }
);
