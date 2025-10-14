/**
 * API Route لحل المشاكل الأكاديمية - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { solveAcademicDocument } from '@/ai/flows/unified';
import { AnalyzedDocumentSchema } from '@/ai/schemas/flows';
import { ApiResponse, createApiHandler } from '@/core/api';
import { logGeneration } from '@/services';
import { z } from 'zod';

// Schema لحل المشاكل الأكاديمية
const solveSchema = z.object({
    analyzedDocument: AnalyzedDocumentSchema,
    contextMarkdown: z.string().optional(),
});

export const POST = createApiHandler(async (context) => {
    try {
        const { user, request } = context;
        const { analyzedDocument, contextMarkdown } = await request.json();

        // تحديد تكلفة الائتمانات بناءً على نوع المستند
        const creditCost = analyzedDocument?.documentType === 'exam' ? 3 : 2;

        // حل المشكلة الأكاديمية
        const result = await solveAcademicDocument({
            analyzedDocument,
            contextMarkdown
        });

        // تسجيل العملية
        await logGeneration({
            agentId: `solve-${analyzedDocument.documentType}`,
            userId: user.id,
            input: {
                analyzedDocument,
                contextMarkdown: !!contextMarkdown
            },
            output: result,
            creditCost: creditCost,
        });

        return ApiResponse.success(result);
    } catch (error) {
        console.error('Solve academic error:', error);
        return ApiResponse.error('Failed to solve academic document', 500);
    }
}, { validateBody: solveSchema, requireAuth: true });
