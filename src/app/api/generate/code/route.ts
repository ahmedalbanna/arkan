/**
 * API Route لتوليد الكود - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لتوليد الكود
 */

import { generateCode } from '@/ai/flows/unified';
import { CreditBasedApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { logGeneration } from '@/services';
import { z } from 'zod';

// Schema لتوليد الكود
const generateCodeSchema = z.object({
    prompt: z.string().min(10, { message: 'Prompt must be at least 10 characters long.' }),
});

/**
 * معالج توليد الكود
 */
class GenerateCodeHandler extends CreditBasedApiHandler<{
    prompt: string;
}, any> {
    protected inputSchema = generateCodeSchema;
    protected creditCost = 1;
    protected requiresAdmin = false;
    protected async processRequest(data: any, context: any) {
        const { user } = context;

        const agentInput = data;
        const result = await generateCode(agentInput);

        // تسجيل العملية
        await logGeneration({
            agentId: 'generate-code',
            userId: user.id,
            input: agentInput,
            output: result,
            creditCost: this.creditCost,
        });

        return result;
    }
}

// إنشاء المعالج
const generateCodeHandler = new GenerateCodeHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    generateCodeHandler.handle.bind(generateCodeHandler),
    {
        logging: true
    }
);
