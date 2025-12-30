'use server';

import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { grammarCheck } from '@/ai/flows/grammar-checker';
import { GrammarCheckInputSchema } from '@/ai/schemas';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = GrammarCheckInputSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const result = await grammarCheck(validation.data);
    
    await deductCredit(user.id, 1);

    await logGeneration({
      agentId: 'grammar-checker',
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
