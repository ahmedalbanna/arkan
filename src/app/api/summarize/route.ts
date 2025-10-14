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
    text: z.string().min(1, 'Text is required'),
    maxLength: z.number().optional(),
    style: z.enum(['concise', 'detailed', 'bullet-points']).optional(),
});

export const POST = createApiHandler(async (context) => {
    try {
        const { user, request } = context;
        const body = await request.json();
        const { text, maxLength, style } = body;

        const agentInput = {
            text,
            maxLength: maxLength || 200,
            style: style || 'concise',
            length: 'medium',
        };

        const result = await summarizeText(agentInput as any);

        // تسجيل العملية
        await logGeneration({
            agentId: 'summarize-text',
            userId: user.id,
            input: { textLength: text.length, style: agentInput.style, length: agentInput.length },
            output: { summaryLength: result.summary.length },
            creditCost: 1,
        });

        return ApiResponse.success(result);
    } catch (error) {
        console.error('Summarize error:', error);
        return ApiResponse.error('Failed to summarize text', 500);
    }
}, { validateBody: summarizeSchema, requireAuth: true });
