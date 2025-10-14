/**
 * API Route للترجمة - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { logGeneration } from '@/services';
import { z } from 'zod';

// Schema للترجمة
const translateSchema = z.object({
    text: z.string().min(1),
    targetLang: z.string().min(2),
});

export const POST = createApiHandler(async (context) => {
    try {
        const { user, request } = context;
        const { text, targetLang } = await request.json();

        const agentInput = { text, targetLang };
        // const result = await translateText(agentInput);
        const result = { translatedText: `Translated: ${text}` };

        // تسجيل العملية
        await logGeneration({
            agentId: 'translate-text',
            userId: user.id,
            input: agentInput,
            output: result,
            creditCost: 1
        });

        // تنظيف النص المترجم
        const cleanedTranslatedText = result.translatedText.replace(/---.*?---/g, '');

        return ApiResponse.success({
            translatedText: cleanedTranslatedText
        });
    } catch (error) {
        console.error('Translate error:', error);
        return ApiResponse.error('Failed to translate text', 500);
    }
}, { validateBody: translateSchema, requireAuth: true });
