/**
 * API Route لمعالجة النصوص - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { manipulateText } from '@/ai/flows/unified';
import { ManipulateTextInputSchema } from '@/ai/schemas';
import { ApiResponse, createApiHandler } from '@/core/api';
import { logGeneration } from '@/services';

export const POST = createApiHandler(async (context) => {
    try {
        const { user, request } = context;
        const data = await request.json();

        const agentInput = data;
        const result = await manipulateText(agentInput);

        // تسجيل العملية
        await logGeneration({
            agentId: 'manipulate-text',
            userId: user.id,
            input: agentInput,
            output: result,
            creditCost: 1,
        });

        return ApiResponse.success(result);
    } catch (error) {
        console.error('Manipulate text error:', error);
        return ApiResponse.error('Failed to manipulate text', 500);
    }
}, { validateBody: ManipulateTextInputSchema, requireAuth: true });
