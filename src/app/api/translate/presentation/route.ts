/**
 * API Route لترجمة العروض التقديمية - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { PresentationHistoryEntrySchema } from '@/ai/schemas/flows';
import { logGeneration } from '@/services';
import { z } from 'zod';

// Schema لترجمة العروض التقديمية
const translatePresentationSchema = z.object({
    presentation: PresentationHistoryEntrySchema,
    targetLang: z.string(),
});

export const POST = createApiHandler(async (context) => {
    try {
        const { user, request } = context;
        const { presentation, targetLang } = await request.json();

        const agentInput = { presentation, targetLang };
        // const result = await translatePresentation(agentInput);
        const result = { id: "temp-translated-presentation", title: "Translated Presentation" };

        // تسجيل العملية
        await logGeneration({
            agentId: 'translate-presentation',
            userId: user.id,
            input: { ...agentInput, presentation: `Presentation ID: ${agentInput.presentation.id}` },
            output: { ...result, presentation: `Presentation ID: ${result.id}` },
            creditCost: 2,
        });

        return ApiResponse.success(result);
    } catch (error) {
        console.error('Translate presentation error:', error);
        return ApiResponse.error('Failed to translate presentation', 500);
    }
}, { validateBody: translatePresentationSchema, requireAuth: true });
