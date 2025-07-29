
'use server';

import { z } from 'zod';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { ProjectProposalSchema } from '@/ai/schemas';
import { generateProjectPlan } from '@/ai/flows/generate-project-plan';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const planSchema = z.object({
  proposal: ProjectProposalSchema,
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = planSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    // This is a more complex task, so we deduct 2 credits.
    await deductCredit(user.id, 2);
    
    const agentInput = { proposal: validation.data.proposal };
    const result = await generateProjectPlan(agentInput);

    await logGeneration({
        agentId: `generate-project-plan`,
        userId: user.id,
        input: { proposalTitle: validation.data.proposal.title }, // Log minimal input
        output: { phaseCount: result.phases.length }, // Log minimal output
    });

    return createApiResponse(result, 200);

  } catch (error) {
    return handleApiError(error);
  }
});
