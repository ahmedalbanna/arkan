/**
 * API Route لترجمة المقترحات - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { ProjectProposalSchema } from '@/ai/schemas/project';
import { logGeneration } from '@/services';
import { z } from 'zod';

// Schema لترجمة المقترحات
const translateProposalSchema = z.object({
    proposal: ProjectProposalSchema,
    targetLang: z.string(),
});

export const POST = createApiHandler(async (context) => {
    try {
        const { user, request } = context;
        const { proposal, targetLang } = await request.json();

        const agentInput = { proposal, targetLang };
        // const result = await translateProposal(agentInput);
        const result = { title: "Translated Proposal" };

        // تسجيل العملية
        await logGeneration({
            agentId: 'translate-proposal',
            userId: user.id,
            input: { targetLang: agentInput.targetLang, proposalTitle: agentInput.proposal.title },
            output: { proposalTitle: result.title },
            creditCost: 2,
        });

        return ApiResponse.success(result);
    } catch (error) {
        console.error('Translate proposal error:', error);
        return ApiResponse.error('Failed to translate proposal', 500);
    }
}, { validateBody: translateProposalSchema, requireAuth: true });
