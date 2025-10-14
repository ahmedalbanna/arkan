/**
 * API Route لتوليد الكودبيس - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { generateCodebase } from '@/ai/flows/unified';
import { ProjectProposalSchema } from '@/ai/schemas';
import { ApiResponse, createApiHandler } from '@/core/api';
import { logGeneration } from '@/services';
import { z } from 'zod';

// Schema لتوليد الكودبيس
const codebaseSchema = z.object({
    proposal: ProjectProposalSchema,
});

export const POST = createApiHandler(async (context) => {
    try {
        const { user, request } = context;
        const { proposal } = await request.json();

        const agentInput = { proposal };
        const result = await generateCodebase(agentInput);

        // تسجيل العملية
        await logGeneration({
            agentId: 'generate-codebase',
            userId: user.id,
            input: { proposalTitle: proposal.title },
            output: { fileCount: result.files.length },
            creditCost: 5, // مهمة معقدة ومكلفة
        });

        return ApiResponse.success(result);
    } catch (error) {
        console.error('Generate codebase error:', error);
        return ApiResponse.error('Failed to generate codebase', 500);
    }
}, { validateBody: codebaseSchema, requireAuth: true });
