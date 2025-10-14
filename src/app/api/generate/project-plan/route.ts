/**
 * API Route لتوليد مخطط المشروع - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { generateProjectPlan } from '@/ai/flows/unified';
import { ApiResponse, createApiHandler } from '@/core/api';
import { logGeneration } from '@/services';
import { z } from 'zod';

// Schema لتوليد مخطط المشروع
const planSchema = z.object({
    projectDescription: z.string().min(10, "Project description must be at least 10 characters long."),
    keyDeliverables: z.string().min(10, "Please list at least one key deliverable."),
    numPhases: z.coerce.number().int().optional(),
});

export const POST = createApiHandler(async (context) => {
    try {
        const { user, request } = context;
        const data = await request.json();

        const agentInput = data;
        const result = await generateProjectPlan(agentInput);

        // تسجيل العملية
        await logGeneration({
            agentId: 'generate-project-plan',
            userId: user.id,
            input: agentInput,
            output: { phaseCount: result.phases.length }, // تسجيل الحد الأدنى من المخرجات
            creditCost: 2, // مهمة معقدة
        });

        return ApiResponse.success(result);
    } catch (error) {
        console.error('Generate project plan error:', error);
        return ApiResponse.error('Failed to generate project plan', 500);
    }
}, { validateBody: planSchema, requireAuth: true });
