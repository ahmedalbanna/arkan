/**
 * API Route للتلخيص - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد للتلخيص
 */

import { summarizeText } from '@/ai/flows/summarize-text';
import { CreditBasedApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { logGeneration } from '@/services/generation-service';
import { z } from 'zod';

// Schema للتلخيص
const summarizeSchema = z.object({
    text: z.string().min(1, 'Text is required'),
    maxLength: z.number().optional(),
    style: z.enum(['concise', 'detailed', 'bullet-points']).optional(),
});

/**
 * معالج التلخيص
 */
class SummarizeHandler extends CreditBasedApiHandler<{
    text: string;
    maxLength?: number;
    style?: 'concise' | 'detailed' | 'bullet-points';
}, {
    summary: string;
}> {
    protected inputSchema = summarizeSchema;
    protected creditCost = 1;

    protected async processRequest(data: any, context: any) {
        const { user } = context;

        const agentInput = {
            text: data.text,
            maxLength: data.maxLength || 200,
            style: data.style || 'concise',
        };
        const result = await summarizeText(agentInput);

        // تسجيل العملية
        await logGeneration({
            agentId: 'summarize-text',
            userId: user.id,
            input: { textLength: data.text.length, style: agentInput.style },
            output: { summaryLength: result.summary.length },
            creditCost: this.creditCost,
        });

        return result;
    }
}

// إنشاء المعالج
const summarizeHandler = new SummarizeHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    summarizeHandler.handle.bind(summarizeHandler),
    {
        logging: true
    }
);
