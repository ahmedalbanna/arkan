
'use server';

import { z } from 'zod';
import { aiResearcher } from '@/ai/flows/ai-researcher';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const researcherSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters long.'),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = researcherSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }
    
    const agentInput = validation.data;
    const result = await aiResearcher(agentInput);
    
    const creditCost = 2;
    await deductCredit(user.id, creditCost);

    await logGeneration({
        agentId: 'ai-researcher',
        userId: user.id,
        input: agentInput,
        output: { summaryLength: result.summary.length, sources: result.sources.length },
        creditCost: creditCost,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
