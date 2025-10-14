/**
 * API Route لتحليل السياق - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { analyzeContext } from '@/ai/flows/unified';
import { ApiResponse, createApiHandler } from '@/core/api';
import { logGeneration } from '@/services';
import { z } from 'zod';

// Schema لملف واحد في الطلب
const FileContextSchema = z.object({
    fileName: z.string(),
    content: z.string(), // سيكون الآن دائماً markdown أو نص عادي
    type: z.enum(['context', 'example', 'question', 'textbook', 'guidelines']),
});

// Schema الرئيسي لطلب API
const analyzeContextSchema = z.object({
    prompt: z.string().min(10, 'Prompt must be at least 10 characters long.'),
    contextFiles: z.array(FileContextSchema),
});

export const POST = createApiHandler(async (context) => {
    try {
        const { user, request } = context;
        const data = await request.json();

        const agentInput = data;
        const result = await analyzeContext(agentInput);

        // تسجيل العملية
        await logGeneration({
            agentId: 'analyze-context',
            userId: user.id,
            input: {
                prompt: agentInput.prompt,
                fileCount: agentInput.contextFiles.length
            },
            output: {
                schema: "[...Zod Schema...]",
                data: "[...JSON Data...]"
            },
            creditCost: 2, // مهمة معقدة
        });

        return ApiResponse.success(result);
    } catch (error) {
        console.error('Analyze context error:', error);
        return ApiResponse.error('Failed to analyze context', 500);
    }
}, { validateBody: analyzeContextSchema, requireAuth: true });
