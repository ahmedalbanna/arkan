/**
 * API Route لتحليل المشاكل الأكاديمية - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { analyzeAcademicDocument } from '@/ai/flows/unified';
import { AcademicDocumentTypeSchema } from '@/ai/schemas/enums';
import { ApiResponse, createApiHandler } from '@/core/api';
import { logGeneration } from '@/services';
import { z } from 'zod';

// Schema لتحليل المشاكل الأكاديمية
const analyzeSchema = z.object({
    documentType: AcademicDocumentTypeSchema,
    markdown: z.string().min(20, 'Markdown content is too short.'),
});

export const POST = createApiHandler(async (context) => {
    try {
        const { user, request } = context;
        const { documentType, markdown } = await request.json();

        const agentInput = {
            documentType,
            markdownContent: markdown,
        };

        // تحليل المستند الأكاديمي
        const result = await analyzeAcademicDocument(agentInput);

        // تسجيل العملية
        await logGeneration({
            agentId: `analyze-${documentType}`,
            userId: user.id,
            input: agentInput,
            output: result,
            creditCost: 1,
        });

        return ApiResponse.success(result);
    } catch (error) {
        console.error('Analyze academic error:', error);
        return ApiResponse.error('Failed to analyze academic document', 500);
    }
}, { validateBody: analyzeSchema, requireAuth: true });
