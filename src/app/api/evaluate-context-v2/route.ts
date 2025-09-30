/**
 * API Route لتقييم السياق (مهمل) - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لتقييم السياق المهمل
 */

import { SimpleApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';

/**
 * معالج تقييم السياق المهمل
 */
class EvaluateContextDeprecatedHandler extends SimpleApiHandler<{ message: string }> {
    protected async processRequest() {
        return { message: "This feature has been deprecated." };
    }
}

// إنشاء المعالج
const evaluateContextDeprecatedHandler = new EvaluateContextDeprecatedHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    evaluateContextDeprecatedHandler.handle.bind(evaluateContextDeprecatedHandler),
    { logging: true }
);
