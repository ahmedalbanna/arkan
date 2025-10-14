/**
 * API Route لتوليد المقترحات - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { generateProposal } from '@/ai/flows/unified';
import { GenerateProposalInputSchema, type GenerateProposalInput } from '@/ai/schemas';
import { ApiResponse, createApiHandler } from '@/core/api';
import { logGeneration } from '@/services';

export const POST = createApiHandler(async (context) => {
    try {
        const { user, request } = context;
        const { projectIdea, guidelines, externalContext, advancedFields } = await request.json();

        const agentInput: GenerateProposalInput = {
            projectIdea,
            guidelines,
            externalContext,
            advancedFields,
        };

        // توليد المقترح
        const result = await generateProposal(agentInput);

        // تسجيل العملية
        await logGeneration({
            agentId: 'generate-proposal',
            userId: user.id,
            input: {
                projectIdea,
                guidelines,
                externalContextFileCount: externalContext?.length || 0,
                usedAdvancedMode: !!advancedFields,
            },
            output: { resultLength: JSON.stringify(result).length },
            creditCost: 1,
        });

        return ApiResponse.success(result);
    } catch (error) {
        console.error('Generate proposal error:', error);
        return ApiResponse.error('Failed to generate proposal', 500);
    }
}, { validateBody: GenerateProposalInputSchema, requireAuth: true });
