
'use server';

import { z } from 'zod';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { generateProposal } from '@/ai/flows/generate-proposal';

const proposalSchema = z.object({
  mainSubject: z.string().min(10),
  templateId: z.string().optional(),
  guidelines: z.array(z.string()).optional(),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = proposalSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }
    
    const creditCost = 2;
    await deductCredit(user.id, creditCost);

    const agentInput = validation.data;
    const result = await generateProposal(agentInput);

    await logGeneration({
      agentId: 'generate-proposal',
      userId: user.id,
      input: agentInput,
      output: result,
      creditCost,
    });

    return createApiResponse(result, 200);

  } catch (error) {
    return handleApiError(error);
  }
});
