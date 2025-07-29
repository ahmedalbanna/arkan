
'use server';

import { z } from 'zod';
import { translateProposal } from '@/ai/flows/translate-proposal';
import { deductCredit } from '@/services/credit-service';
import { ProjectProposalSchema } from '@/ai/schemas';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const translateProposalSchema = z.object({
  proposal: ProjectProposalSchema,
  targetLang: z.string().min(2),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = translateProposalSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    await deductCredit(user.id, 2);

    const agentInput = validation.data;
    const result = await translateProposal(agentInput);

    await logGeneration({
        agentId: 'translate-proposal',
        userId: user.id,
        input: { targetLang: agentInput.targetLang, proposalTitle: agentInput.proposal.title },
        output: { proposalTitle: result.title },
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
