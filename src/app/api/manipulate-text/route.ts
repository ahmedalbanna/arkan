
'use server';

import { z } from 'zod';
import { manipulateText } from '@/ai/flows/manipulate-text';
import { deductCredit } from '@/services/credit-service';
import { ManipulateTextInputSchema } from '@/ai/schemas';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = ManipulateTextInputSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const creditCost = 1;
    await deductCredit(user.id, creditCost);

    const agentInput = validation.data;
    const result = await manipulateText(agentInput);

    await logGeneration({
        agentId: 'manipulate-text',
        userId: user.id,
        input: agentInput,
        output: result,
        creditCost: creditCost,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
