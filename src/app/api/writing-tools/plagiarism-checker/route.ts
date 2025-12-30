'use server';

import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { plagiarismCheck } from '@/ai/flows/plagiarism-checker';
import { PlagiarismCheckInputSchema } from '@/ai/schemas';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = PlagiarismCheckInputSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const result = await plagiarismCheck(validation.data);
    
    await deductCredit(user.id, 2);

    await logGeneration({
      agentId: 'plagiarism-checker',
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
