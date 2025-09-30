/**
 * API Route للتحويل إلى كلام - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد للتحويل إلى كلام
 */

import { textToSpeech } from '@/ai/flows/text-to-speech';
import { CreditBasedApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { logGeneration } from '@/services/generation-service';
import { z } from 'zod';

// Schema للتحويل إلى كلام
const ttsSchema = z.object({
    text: z.string().min(1, 'Text content is required.'),
});

/**
 * معالج التحويل إلى كلام
 */
class TextToSpeechHandler extends CreditBasedApiHandler<{
    text: string;
}, any> {
    protected inputSchema = ttsSchema;
    protected creditCost = 1;

    protected async processRequest(data: any, context: any) {
        const { text } = data;
        const { user } = context;

        const result = await textToSpeech({ text });

        // تسجيل العملية
        await logGeneration({
            agentId: 'text-to-speech',
            userId: user.id,
            input: { textLength: text.length },
            output: { audioGenerated: true },
            creditCost: this.creditCost,
        });

        return result;
    }
}

// إنشاء المعالج
const textToSpeechHandler = new TextToSpeechHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    textToSpeechHandler.handle.bind(textToSpeechHandler),
    {
        logging: true
    }
);
