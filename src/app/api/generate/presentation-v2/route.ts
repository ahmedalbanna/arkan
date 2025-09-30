/**
 * API Route لتوليد العروض التقديمية - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لتوليد العروض التقديمية
 */

import { generatePresentation } from '@/ai/flows/generate-presentation';
import { ApiGeneratePresentationSchema } from '@/ai/schemas';
import { CreditBasedApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { logGeneration } from '@/services';

/**
 * معالج توليد العروض التقديمية
 */
class GeneratePresentationHandler extends CreditBasedApiHandler<any, any> {
    protected inputSchema = ApiGeneratePresentationSchema;
    protected creditCost = 1;

    protected async processRequest(data: any, context: any) {
        const { user } = context;

        const agentInput = data;
        const result = await generatePresentation(agentInput);

        // تسجيل العملية
        await logGeneration({
            agentId: 'generate-presentation',
            userId: user.id,
            input: {
                guidelineCount: agentInput.guidelines?.length || 0,
                sourceDocumentCount: agentInput.sourceDocuments.length,
            },
            output: {
                slideCount: result.slides.length
            },
            creditCost: this.creditCost,
        });

        return result;
    }
}

// إنشاء المعالج
const generatePresentationHandler = new GeneratePresentationHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    generatePresentationHandler.handle.bind(generatePresentationHandler),
    {
        logging: true
    }
);
