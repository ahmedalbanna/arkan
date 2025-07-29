
'use server';

import { z } from 'zod';
import { manipulateText } from '@/ai/flows/manipulate-text';
import { deductCredit } from '@/services/credit-service';
import { ManipulateTextInputSchema } from '@/ai/schemas';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = ManipulateTextInputSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    await deductCredit(user.id, 1);

    const agentInput = validation.data;
    const result = await manipulateText(agentInput);

    await logGeneration({
        agentId: 'manipulate-text',
        userId: user.id,
        input: agentInput,
        output: result,
    });
    
    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
