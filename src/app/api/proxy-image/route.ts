/**
 * API Route لوكيل الصور - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';

export const GET = createApiHandler(async (context) => {
    try {
        const { request } = context;
        const { searchParams } = new URL(request.url);
        const imageUrl = searchParams.get('url');

        if (!imageUrl) {
            return ApiResponse.badRequest('URL parameter is required');
        }

        const response = await fetch(imageUrl);
        if (!response.ok) {
            return ApiResponse.error('Failed to fetch image', response.status);
        }

        const imageBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/png';

        return new Response(imageBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error) {
        console.error('Proxy image error:', error);
        return ApiResponse.error('Failed to proxy image', 500);
    }
}, { requireAuth: false });
