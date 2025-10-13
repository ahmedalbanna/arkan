/**
 * API Route لترجمة النصوص - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لترجمة النصوص
 */

// import { translateText } from '@/ai/flows/translate-text';
import { CreditBasedApiHandler } from '@/core/api/handlers/base-handler';
import { withApiMiddleware } from '@/core/api/middleware/api-middleware';
import { logGeneration } from '@/services';
import { z } from 'zod';

export const ApiTranslateTextSchema = z.object({
    text: z.string(),
    targetLang: z.string(),
});

/**
 * معالج ترجمة النصوص
 */
class TranslateTextHandler extends CreditBasedApiHandler<z.infer<typeof ApiTranslateTextSchema>, { translatedText: string }> {
    protected inputSchema = ApiTranslateTextSchema;
    protected creditCost = 1;
    protected requiresAdmin = false;
    protected async processRequest(data: z.infer<typeof ApiTranslateTextSchema>, context: any) {
        const { user } = context;

        const agentInput = data;
        // const result = await translateText(agentInput);
        const result = { translatedText: `Translated: ${agentInput.text}` };

        // تسجيل العملية
        await logGeneration({
            agentId: 'translate-text',
            userId: user.id,
            input: agentInput,
            output: result,
            creditCost: this.creditCost,
        });

        const cleanedTranslatedText = result.translatedText.replace(/---.*?---/g, '');
        return { translatedText: cleanedTranslatedText };
    }
}

// إنشاء المعالج
const translateTextHandler = new TranslateTextHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    translateTextHandler,
    { logging: true }
);
