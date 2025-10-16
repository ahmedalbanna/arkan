
'use server';

import { z } from 'zod';
import { translateProposal } from '@/ai/flows/translate-proposal';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { ApiTranslateProposalSchema } from '@/ai/schemas';

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = ApiTranslateProposalSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
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

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
