/**
 * API Route لتوليد الصور - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { generateImage } from '@/ai/flows/unified';
import { ApiResponse, createApiHandler } from '@/core/api';
import { logGeneration } from '@/services';
import { z } from 'zod';

// Schema لتوليد الصور
const generateImageSchema = z.object({
    prompt: z.string().min(3, "Prompt must be at least 3 characters long."),
});

export const POST = createApiHandler(async (context) => {
    try {
        const { user, request } = context;
        const { prompt } = await request.json();

        const result = await generateImage({ prompt } as any);

        // تسجيل العملية
        await logGeneration({
            agentId: 'generate-image',
            userId: user.id,
            input: { prompt },
            output: { imageUrl: `data:image/...;base64,...[TRUNCATED]` },
            creditCost: 5 // توليد الصور مكلف
        });

        return ApiResponse.success(result);
    } catch (error) {
        console.error('Generate image error:', error);
        return ApiResponse.error('Failed to generate image', 500);
    }
}, { validateBody: generateImageSchema, requireAuth: true });
