/**
 * API Route لتحسين Markdown - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { improveReportMarkdown } from '@/ai/flows/unified';
import { ApiResponse, createApiHandler } from '@/core/api';
import { logGeneration } from '@/services';
import { z } from 'zod';

// Schema لتحسين Markdown
const improveMarkdownSchema = z.object({
    markdownContent: z.string().min(20, 'Markdown content is too short.'),
    userPrompt: z.string().min(10, 'Instructions for the AI must be at least 10 characters.'),
});

export const POST = createApiHandler(async (context) => {
    try {
        const { user, request } = context;
        const { markdownContent, userPrompt } = await request.json();

        const result = await improveReportMarkdown({ markdownContent, userPrompt });

        // تسجيل العملية
        await logGeneration({
            agentId: 'improve-report-markdown',
            userId: user.id,
            input: { markdownLength: markdownContent.length, prompt: userPrompt },
            output: { improvedMarkdownLength: result.improvedMarkdown.length },
            creditCost: 1
        });

        return ApiResponse.success(result);
    } catch (error) {
        console.error('Improve markdown error:', error);
        return ApiResponse.error('Failed to improve markdown', 500);
    }
}, { validateBody: improveMarkdownSchema, requireAuth: true });
