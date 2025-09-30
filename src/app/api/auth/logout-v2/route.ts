/**
 * API Route لتسجيل الخروج - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لتسجيل الخروج
 */

import { SimpleApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { NextResponse } from 'next/server';

/**
 * معالج تسجيل الخروج
 */
class LogoutHandler extends SimpleApiHandler<{ message: string }> {
    protected async processRequest(context: any) {
        // إعداد خيارات الكوكيز لحذف الجلسة
        const options = {
            name: '__session',
            value: '',
            maxAge: -1, // انتهاء صلاحية الكوكي فوراً
            path: '/',
        };

        // إنشاء الاستجابة مع حذف الكوكي
        const response = NextResponse.json({ message: "Logout successful" }, { status: 200 });
        response.cookies.set(options);

        return response;
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
