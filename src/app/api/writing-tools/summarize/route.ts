
'use server';

import { z } from 'zod';
import { summarizeText } from '@/ai/flows/summarize-text';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { SummarizeInputSchema } from '@/ai/schemas';

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = SummarizeInputSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const agentInput = validation.data;
    const result = await summarizeText(agentInput);

    // Deduct credit only after successful generation
    await deductCredit(user.id, 1);
    
    await logGeneration({
        agentId: 'summarize-text',
        userId: user.id,
        input: agentInput,
        output: result,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
