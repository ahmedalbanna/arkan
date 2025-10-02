
'use server';

import { translateProposal } from '@/ai/flows/translate-proposal';
import { ApiTranslateProposalSchema } from '@/ai/schemas';
import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { deductCredit, logGeneration } from '@/services';

/**
 * معالج ترجمة المقترحات
 */
export const POST = withEnhancedAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = ApiTranslateProposalSchema.safeParse(body);
    if (!validation.success) {
      return handleApiErrorEnhanced(validation.error, '400');
    }

    const agentInput = validation.data;
    const result = await translateProposal(agentInput);

    const creditCost = 2;
    await deductCredit(user.id, creditCost);

    await logGeneration({
      agentId: 'translate-proposal',
      userId: user.id,
      input: { targetLang: agentInput.targetLang, proposalTitle: agentInput.proposal.title },
      output: { proposalTitle: result.title },
      creditCost: creditCost,
    });

    return createApiResponseEnhanced(result, 200);
  } catch (error) {
    return handleApiErrorEnhanced(error, '500');
  }
});
