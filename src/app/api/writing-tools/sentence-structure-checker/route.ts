'use server';

import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { sentenceStructureCheck } from '@/ai/flows/sentence-structure-checker';
import { SentenceStructureCheckInputSchema } from '@/ai/schemas';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = SentenceStructureCheckInputSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const result = await sentenceStructureCheck(validation.data);
    
    await deductCredit(user.id, 1);

    await logGeneration({
      agentId: 'sentence-structure-checker',
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
