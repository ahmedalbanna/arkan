/**
 * API Route لتوليد التقرير الكامل (مهمل) - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';

export const POST = createApiHandler(async (context) => {
    return ApiResponse.error("This feature has been deprecated.", 410);
}, { requireAuth: true });
