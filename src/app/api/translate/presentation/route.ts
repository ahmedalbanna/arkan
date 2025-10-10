/**
 * API Route لترجمة العروض التقديمية - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لترجمة العروض التقديمية
 */

// import { translatePresentation } from '@/ai/flows/translate-presentation';
import { PresentationHistoryEntrySchema } from '@/ai/schemas/flows';
import { CreditBasedApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { logGeneration } from '@/services';
import { z } from 'zod';

export const ApiTranslatePresentationSchema = z.object({
    presentation: PresentationHistoryEntrySchema,
    targetLang: z.string(),
});

/**
 * معالج ترجمة العروض التقديمية
 */
class TranslatePresentationHandler extends CreditBasedApiHandler<z.infer<typeof ApiTranslatePresentationSchema>, any> {
    protected inputSchema = ApiTranslatePresentationSchema;
    protected creditCost = 2;
    protected requiresAdmin = false;
    protected async processRequest(data: z.infer<typeof ApiTranslatePresentationSchema>, context: any) {
        const { user } = context;

        const agentInput = data;
        // const result = await translatePresentation(agentInput);
        const result = { id: "temp-translated-presentation", title: "Translated Presentation" };

        // تسجيل العملية
        await logGeneration({
            agentId: 'translate-presentation',
            userId: user.id,
            input: { ...agentInput, presentation: `Presentation ID: ${agentInput.presentation.id}` },
            output: { ...result, presentation: `Presentation ID: ${result.id}` },
            creditCost: this.creditCost,
        });

        return result;
    }
}

// إنشاء المعالج
const translatePresentationHandler = new TranslatePresentationHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    translatePresentationHandler.handle.bind(translatePresentationHandler),
    { logging: true }
);
