/**
 * API Route لتسجيل الخروج - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لتسجيل الخروج
 */

import { SimpleApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { createApiResponseEnhanced } from '@/lib/core/api';
import { ApiHandlerContext } from '../../shared/types/api-types';

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
    logoutHandler.handle.bind(logoutHandler),
    {
        requireAuth: true,
        logging: true
    }
);
