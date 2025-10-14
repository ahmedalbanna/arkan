/**
 * API Route لتوليد العروض التقديمية - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { generatePresentation } from '@/ai/flows/unified';
import { ProjectPlanSchema, ProjectProposalSchema } from '@/ai/schemas/project';
import { ApiResponse, createApiHandler } from '@/core/api';
import { logGeneration } from '@/services';
import { z } from 'zod';

// Schema لتوليد العروض التقديمية
const generatePresentationSchema = z.object({
    proposal: z.lazy(() => ProjectProposalSchema).nullable().optional(),
    projectPlan: z.lazy(() => ProjectPlanSchema).nullable().optional(),
    sourceDocuments: z.array(z.object({
        fileName: z.string(),
        content: z.string(),
    })).min(1, "At least one source document is required."),
});

export const POST = createApiHandler(async (context) => {
    try {
        const { user, request } = context;
        const data = await request.json();

        const agentInput = data;
        const result = await generatePresentation(agentInput);

        // تسجيل العملية
        await logGeneration({
            agentId: 'generate-presentation',
            userId: user.id,
            input: {
                guidelineCount: agentInput.guidelines?.length || 0,
                sourceDocumentCount: agentInput.sourceDocuments.length,
            },
            output: {
                slideCount: result.slides.length
            },
            creditCost: 1,
        });

        return ApiResponse.success(result);
    } catch (error) {
        console.error('Generate presentation error:', error);
        return ApiResponse.error('Failed to generate presentation', 500);
    }
}, { validateBody: generatePresentationSchema, requireAuth: true });
