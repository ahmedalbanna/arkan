/**
 * API Route لتلخيص المشروع - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { summarizeProject } from '@/ai/flows/unified';
import { ApiResponse, createApiHandler } from '@/core/api';
import { logGeneration } from '@/services';
import { z } from 'zod';

// Schema لتلخيص المشروع
const summarizeSchema = z.object({
    proposal: z.any(),
    reportMarkdown: z.string().optional(),
});

export const POST = createApiHandler(async (context) => {
    try {
        const { user, request } = context;
        const data = await request.json();

        const agentInput = data;
        const result = await summarizeProject(agentInput);

        // تسجيل العملية
        await logGeneration({
            agentId: 'summarize-project',
            userId: user.id,
            input: agentInput,
            output: result,
            creditCost: 1,
        });

        return ApiResponse.success(result);
    } catch (error) {
        console.error('Summarize project error:', error);
        return ApiResponse.error('Failed to summarize project', 500);
    }
}, { validateBody: summarizeSchema, requireAuth: true });
