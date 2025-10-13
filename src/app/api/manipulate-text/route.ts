/**
 * API Route لمعالجة النصوص - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لمعالجة النصوص
 */

import { manipulateText } from '@/ai/flows/unified';
import { ManipulateTextInputSchema } from '@/ai/schemas';
import { CreditBasedApiHandler } from '@/core/api/handlers/base-handler';
import { withApiMiddleware } from '@/core/api/middleware/api-middleware';
import { logGeneration } from '@/services';

/**
 * معالج معالجة النصوص
 */
class ManipulateTextHandler extends CreditBasedApiHandler<any, any> {
    protected inputSchema = ManipulateTextInputSchema;
    protected creditCost = 1;
    protected requiresAdmin = false;

    protected async processRequest(data: any, context: any) {
        const { user } = context;

        const agentInput = data;
        const result = await manipulateText(agentInput);

        // تسجيل العملية
        await logGeneration({
            agentId: 'manipulate-text',
            userId: user.id,
            input: agentInput,
            output: result,
            creditCost: this.creditCost,
        });

        return result;
    }
}

// إنشاء المعالج
const manipulateTextHandler = new ManipulateTextHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    manipulateTextHandler,
    {
        logging: true
    }
);
