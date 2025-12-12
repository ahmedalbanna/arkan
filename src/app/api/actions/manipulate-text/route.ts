'use server';

import { z } from 'zod';
import { manipulateText } from '@/ai/flows/manipulate-text';
import { deductCredit } from '@/services/credit-service';
import { ManipulateTextInputSchema } from '@/ai/schemas';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';

export const POST = withAuth(async ({ request, user }) => {
  try {
    let body = await request.json();
    let validation = ManipulateTextInputSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    let creditCost = 1;
    await deductCredit(user.id, creditCost);

    let agentInput = validation.data;
    let result = await manipulateText(agentInput);

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
