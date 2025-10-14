/**
 * API Route لتوليد الكود - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { generateCode } from '@/ai/flows/unified';
import { ApiResponse, createApiHandler } from '@/core/api';
import { logGeneration } from '@/services';
import { z } from 'zod';

// Schema لتوليد الكود
const generateCodeSchema = z.object({
    prompt: z.string().min(10, { message: 'Prompt must be at least 10 characters long.' }),
});

export const POST = createApiHandler(async (context) => {
    try {
        const { user, request } = context;
        const { prompt } = await request.json();

        const agentInput = { prompt };
        const result = await generateCode(agentInput);

        // تسجيل العملية
        await logGeneration({
            agentId: 'generate-code',
            userId: user.id,
            input: agentInput,
            output: result,
            creditCost: 1,
        });

        return ApiResponse.success(result);
    } catch (error) {
        console.error('Generate code error:', error);
        return ApiResponse.error('Failed to generate code', 500);
    }
}, { validateBody: generateCodeSchema, requireAuth: true });
