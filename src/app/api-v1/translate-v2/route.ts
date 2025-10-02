/**
 * API Route للتحويل - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد للتحويل
 */

import { translateText } from '@/ai/flows/translate-text';
import { CreditBasedApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { logGeneration } from '@/services';
import { z } from 'zod';

// Schema للتحويل
const translateSchema = z.object({
    text: z.string().min(1),
    targetLang: z.string().min(2),
});

/**
 * معالج التحويل
 */
class TranslateHandler extends CreditBasedApiHandler<{
    text: string;
    targetLang: string;
}, {
    translatedText: string;
}> {
    protected inputSchema = translateSchema;
    protected creditCost = 1;
    protected requiresAdmin = false;
    protected async processRequest(data: any, context: any) {
        const { text, targetLang } = data;
        const { user } = context;

        const agentInput = { text, targetLang };
        const result = await translateText(agentInput);

        // تسجيل العملية
        await logGeneration({
            agentId: 'translate-text',
            userId: user.id,
            input: agentInput,
            output: result,
            creditCost: this.creditCost
        });

        // تنظيف النص المترجم
        const cleanedTranslatedText = result.translatedText.replace(/---.*?---/g, '');

        return {
            translatedText: cleanedTranslatedText
        };
    }
}

// إنشاء المعالج
const translateHandler = new TranslateHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    translateHandler.handle.bind(translateHandler),
    {
        logging: true
    }
);
