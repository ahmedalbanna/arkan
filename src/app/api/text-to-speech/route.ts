/**
 * API Route للتحويل إلى كلام (معلق) - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';

export const POST = createApiHandler(async (context) => {
    return ApiResponse.error("This feature is currently disabled.", 503);
});
