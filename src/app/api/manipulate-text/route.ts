
'use server';

import { manipulateText } from '@/ai/flows/manipulate-text';
import { ManipulateTextInputSchema } from '@/ai/schemas';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';

export const POST = withEnhancedAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = ManipulateTextInputSchema.safeParse(body);
    if (!validation.success) {
      return handleApiErrorEnhanced(validation.error);
    }

    const creditCost = 1;
    await deductCredit(user.id, creditCost);

    const agentInput = validation.data;
    const result = await manipulateText(agentInput);

    await logGeneration({
      agentId: 'manipulate-text',
      userId: user.id,
      input: agentInput,
      output: result,
      creditCost: creditCost,
    });

    return createApiResponseEnhanced(result, 200);
  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
});
