/**
 * API Route لتوليد إعدادات الوكلاء - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { generateAgentConfig } from '@/ai/flows/unified';
import { ApiResponse, createApiHandler } from '@/core/api';
import { z } from 'zod';

// Schema لتوليد إعدادات الوكيل
const generateSchema = z.object({
    prompt: z.string().min(10, "Prompt must be at least 10 characters long."),
    includeJsonOutput: z.boolean().optional(),
    contextFiles: z.array(z.object({
        name: z.string(),
        type: z.string(),
        content: z.string(), // data URI
    })).optional(),
});

export const POST = createApiHandler(async (context) => {
    try {
        const { user, request } = context;
        const data = await request.json();

        const result = await generateAgentConfig({
            prompt: data.prompt,
            includeJsonOutput: data.includeJsonOutput,
            contextFiles: data.contextFiles,
        });

        return ApiResponse.success(result);
    } catch (error) {
        console.error('Generate agent config error:', error);
        return ApiResponse.error('Failed to generate agent config', 500);
    }
}, { validateBody: generateSchema, requireAdmin: true });
