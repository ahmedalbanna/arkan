/**
 * API Route لتسجيل الخروج - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لتسجيل الخروج
 */

import { createApiResponseEnhanced } from '@/core/api';
import { SimpleApiHandler } from '@/core/api/handlers/base-handler';
import { withApiMiddleware } from '@/core/api/middleware/api-middleware';
import { ApiHandlerContext } from '@/core/types/api-types';

/**
 * معالج تسجيل الخروج
 */
class LogoutHandler extends SimpleApiHandler<{ message: string }> {
    protected async processRequest(context: ApiHandlerContext) {
        // إعداد خيارات الكوكيز لحذف الجلسة
        const options = {
            name: '__session',
            value: '',
            maxAge: -1, // انتهاء صلاحية الكوكي فوراً
            path: '/',
        };

        // إنشاء الاستجابة مع حذف الكوكي
        const response = createApiResponseEnhanced({ message: "Logout successful" }, 200);
        response.cookies.set(options);

        return { message: "Logout successful" };
    }
}

// إنشاء المعالج
const logoutHandler = new LogoutHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    logoutHandler,
    {
        requireAuth: true,
        logging: true
    }
);
