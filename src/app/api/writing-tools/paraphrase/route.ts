
'use server';

import { z } from 'zod';
import { paraphraseText } from '@/ai/flows/paraphrase-text';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { ParaphraseInputSchema } from '@/ai/schemas';

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = ParaphraseInputSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }
    
    const agentInput = validation.data;
    const result = await paraphraseText(agentInput);
    
    // Deduct credit only after a successful generation
    await deductCredit(user.id, 1);

    await logGeneration({
        agentId: 'paraphrase-text',
        userId: user.id,
        input: agentInput,
        output: result,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
