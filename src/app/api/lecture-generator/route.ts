/**
 * API Route لتوليد المحاضرات - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { createLectureUnit } from '@/ai/flows/unified';
import { CreateLectureUnitInputSchema } from '@/ai/schemas';
import { ApiResponse, createApiHandler } from '@/core/api';
import { logGeneration } from '@/services';

export const POST = createApiHandler(async (context) => {
    try {
        const { user, request } = context;
        const data = await request.json();

        const agentInput = data;
        const result = await createLectureUnit(agentInput as any);

        // تسجيل العملية
        await logGeneration({
            agentId: 'create-lecture-unit',
            userId: user.id,
            input: agentInput,
            output: {
                lectureChars: result.theoreticalLecture.lectureContent.length,
                sessionActivities: result.practicalSession.activities.length,
            },
            creditCost: 5, // مهمة معقدة ومكلفة
        });

        return ApiResponse.success(result);
    } catch (error) {
        console.error('Lecture generator error:', error);
        return ApiResponse.error('Failed to generate lecture', 500);
    }
}, { validateBody: CreateLectureUnitInputSchema, requireAuth: true });
