/**
 * API Route لتقييم التقارير - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { evaluateReport } from '@/ai/flows/unified';
import { DiagramTypeSchema, ProjectProposalSchema, SectionNameSchema } from '@/ai/schemas';
import { ApiResponse, createApiHandler } from '@/core/api';
import { logGeneration } from '@/services';
import { z } from 'zod';

// Schema لتقييم التقارير
const evaluateReportSchema = z.object({
    proposal: ProjectProposalSchema.optional().nullable(),
    reportSections: z.record(SectionNameSchema, z.string()),
    diagrams: z.record(DiagramTypeSchema, z.string()).optional().nullable(),
    acceptanceCriteria: z.array(z.string()).optional().nullable(),
});

export const POST = createApiHandler(async (context) => {
    try {
        const { user, request } = context;
        const data = await request.json();

        const agentInput = data;
        const result = await evaluateReport(agentInput);

        // تسجيل العملية
        await logGeneration({
            agentId: 'evaluate-report',
            userId: user.id,
            input: agentInput,
            output: result,
            creditCost: 1,
        });

        return ApiResponse.success(result);
    } catch (error) {
        console.error('Evaluate report error:', error);
        return ApiResponse.error('Failed to evaluate report', 500);
    }
}, { validateBody: evaluateReportSchema, requireAuth: true });
