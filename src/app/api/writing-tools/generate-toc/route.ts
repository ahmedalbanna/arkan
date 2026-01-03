
'use server';

import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { generateToc } from '@/ai/flows/generate-toc';
import { GenerateTocInputSchema } from '@/ai/schemas';

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = GenerateTocInputSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const creditCost = 1;
    await deductCredit(user.id, creditCost);

    const result = await generateToc(validation.data);

    await logGeneration({
      agentId: 'generate-toc',
      userId: user.id,
      input: validation.data,
      output: result,
      creditCost,
    });

    return createApiResponse(result, 200);

  } catch (error) {
    return handleApiError(error);
  }
});
