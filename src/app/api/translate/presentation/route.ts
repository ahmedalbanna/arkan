
'use server';

import { translatePresentation } from '@/ai/flows/translate-presentation';
import { ApiTranslatePresentationSchema } from '@/ai/schemas';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';


export const POST = withEnhancedAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = ApiTranslatePresentationSchema.safeParse(body);

    if (!validation.success) {
      return handleApiErrorEnhanced(validation.error);
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

    return createApiResponseEnhanced(result, 200);
  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
});
