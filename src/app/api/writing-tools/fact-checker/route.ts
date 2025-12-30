'use server';

import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { factCheckText } from '@/ai/flows/fact-checker';
import { FactCheckInputSchema } from '@/ai/schemas';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = FactCheckInputSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const result = await factCheckText(validation.data);
    
    await deductCredit(user.id, 2);

    await logGeneration({
      agentId: 'fact-checker',
      userId: user.id,
      input: validation.data,
      output: result,
      creditCost: 2,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
