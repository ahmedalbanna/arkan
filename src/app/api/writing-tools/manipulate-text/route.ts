'use server';

import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { manipulateText } from '@/ai/flows/manipulate-text';
import { ManipulateTextInputSchema } from '@/ai/schemas';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = ManipulateTextInputSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const result = await manipulateText(validation.data);
    
    await deductCredit(user.id, 1);

    await logGeneration({
      agentId: 'manipulate-text',
      userId: user.id,
      input: validation.data,
      output: result,
      creditCost: 1,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
