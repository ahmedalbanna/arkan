/**
 * API Route لتوليد الكودبيس - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لتوليد الكودبيس
 */

import { generateCodebase } from '@/ai/flows/generate-codebase';
import { ProjectProposalSchema } from '@/ai/schemas';
import { CreditBasedApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { logGeneration } from '@/services';
import { z } from 'zod';

// Schema لتوليد الكودبيس
const codebaseSchema = z.object({
    proposal: ProjectProposalSchema,
});

/**
 * معالج توليد الكودبيس
 */
class GenerateCodebaseHandler extends CreditBasedApiHandler<{
    proposal: any;
}, any> {
    protected inputSchema = codebaseSchema;
    protected creditCost = 5; // مهمة معقدة ومكلفة

    protected async processRequest(data: any, context: any) {
        const { user } = context;

        const agentInput = { proposal: data.proposal };
        const result = await generateCodebase(agentInput);

        // تسجيل العملية
        await logGeneration({
            agentId: 'generate-codebase',
            userId: user.id,
            input: { proposalTitle: data.proposal.title },
            output: { fileCount: result.files.length },
            creditCost: this.creditCost,
        });

        return result;
    }
}

// إنشاء المعالج
const generateCodebaseHandler = new GenerateCodebaseHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    generateCodebaseHandler.handle.bind(generateCodebaseHandler),
    {
        logging: true
    }
);
