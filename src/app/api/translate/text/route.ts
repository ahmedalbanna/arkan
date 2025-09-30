
'use server';

import { translateText } from '@/ai/flows/translate-text';
import { ApiTranslateTextSchema } from '@/ai/schemas';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';

export const POST = withEnhancedAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = ApiTranslateTextSchema.safeParse(body);
    if (!validation.success) {
      return handleApiErrorEnhanced(validation.error);
    }

    const agentInput = validation.data;
    const result = await translateText(agentInput);

    const creditCost = 1;
    await deductCredit(user.id, creditCost);

    await logGeneration({
      agentId: 'translate-text',
      userId: user.id,
      input: agentInput,
      output: result,
      creditCost: creditCost,
    });

    const cleanedTranslatedText = result.translatedText.replace(/---.*?---/g, '');
    return createApiResponseEnhanced({ translatedText: cleanedTranslatedText }, 200);
  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
});
