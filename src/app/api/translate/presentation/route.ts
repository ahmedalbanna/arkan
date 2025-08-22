
'use server';

import { z } from 'zod';
import { translatePresentation } from '@/ai/flows/translate-presentation';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { ApiTranslatePresentationSchema } from '@/ai/schemas';


export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = ApiTranslatePresentationSchema.safeParse(body);

    if (!validation.success) {
      return handleApiError(validation.error);
    }
    
    const agentInput = validation.data;
    const result = await translatePresentation(agentInput);

    const creditCost = 2;
    await deductCredit(user.id, creditCost);

    await logGeneration({
        agentId: 'translate-presentation',
        userId: user.id,
        input: { ...agentInput, presentation: `Presentation ID: ${agentInput.presentation.id}` },
        output: { ...result, presentation: `Presentation ID: ${result.id}` },
        creditCost: creditCost,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
