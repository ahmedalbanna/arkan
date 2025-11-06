
'use server';

import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { translateText } from '@/ai/flows/translate-text';
import { TranslateTextInputSchema } from '@/ai/schemas';

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = TranslateTextInputSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const agentInput = validation.data;
    const result = await translateText(agentInput);

    const creditCost = 1;
    await deductCredit(user.id, creditCost);

    await logGeneration({
        agentId: 'translate-text',
        userId: user.id,
        input: {
            textLength: agentInput.text.length,
            targetLang: agentInput.targetLang,
        },
        output: {
            translatedLength: result.translatedText.length
        },
        creditCost: creditCost,
    });

    return createApiResponse(result, 200);

  } catch (error) {
    return handleApiError(error);
  }
});
