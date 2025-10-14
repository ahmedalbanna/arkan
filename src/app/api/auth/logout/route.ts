/**
 * API Route لتسجيل الخروج - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';

export const POST = createApiHandler(async (context) => {
    try {
        // إعداد خيارات الكوكيز لحذف الجلسة
        const options = {
            name: '__session',
            value: '',
            maxAge: -1, // انتهاء صلاحية الكوكي فوراً
            path: '/',
        };

        // إنشاء الاستجابة مع حذف الكوكي
        const response = ApiResponse.success({ message: "Logout successful" });
        response.cookies.set(options);

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return ApiResponse.error('Logout failed', 500);
    }
}, { requireAuth: true });
