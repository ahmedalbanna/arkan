
/**
 * API Route لوكيل الصور - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { z } from 'zod';

const schema = z.object({
  url: z.string().url(),
});

export const GET = createApiHandler(async (context) => {
    try {
        const { request } = context;
        const { searchParams } = new URL(request.url);
        const validation = schema.safeParse({ url: searchParams.get('url') });

        if (!validation.success) {
            return ApiResponse.badRequest('Invalid URL provided.');
        }

        const { url } = validation.data;

        // Basic check to ensure we are only proxying expected domains
        const allowedDomains = ['www.plantuml.com', 'placehold.co'];
        const requestUrl = new URL(url);
        if (!allowedDomains.includes(requestUrl.hostname)) {
            return ApiResponse.badRequest('Proxying from this domain is not allowed.');
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText} (${response.status})`);
        }

        const imageBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/png';

        return new Response(imageBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('Image proxy error:', error);
        return ApiResponse.error('Failed to proxy the requested image.', 502);
    }
}, { requireAuth: false });
