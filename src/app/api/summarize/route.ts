/**
 * API Route للتلخيص - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { summarizeText } from '@/ai/flows/unified';
import { ApiResponse, createApiHandler } from '@/core/api';
import { logGeneration } from '@/services';
import { z } from 'zod';

// Schema للتلخيص
const summarizeSchema = z.object({
    text: z.string().min(50, 'Text must be at least 50 characters long.'),
    maxLength: z.coerce.number().int().min(50).max(2000).default(500),
});

export const POST = createApiHandler(async (context) => {
    try {
        const { user, request } = context;
        const { text, maxLength } = await request.json();

        const agentInput = { text, maxLength };
        const result = await summarizeText(agentInput);

        // تسجيل العملية
        await logGeneration({
            agentId: 'summarize-text',
            userId: user.id,
            input: { textLength: text.length, maxLength },
            output: { summaryLength: result.summary.length },
            creditCost: 1,
        });

        return ApiResponse.success(result);
    } catch (error) {
        console.error('Summarize error:', error);
        return ApiResponse.error('Failed to summarize text', 500);
    }
}, { validateBody: summarizeSchema, requireAuth: true });
