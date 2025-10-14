/**
 * API Route لتقييم السياق (مهمل) - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';

export const POST = createApiHandler(async (context) => {
    return ApiResponse.success({ message: "This feature has been deprecated." });
}, { requireAuth: true });
