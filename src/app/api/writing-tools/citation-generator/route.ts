
'use server';

import { z } from 'zod';
import { generateCitation } from '@/ai/flows/generate-citation';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { GenerateCitationInputSchema } from '@/ai/schemas';

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = GenerateCitationInputSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }
    
    const agentInput = validation.data;
    const result = await generateCitation(agentInput);
    
    // Deduct credit only after a successful generation
    await deductCredit(user.id, 1);

    await logGeneration({
        agentId: 'generate-citation',
        userId: user.id,
        input: agentInput,
        output: result,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
