
'use server';

import { z } from 'zod';
import { translateText } from '@/ai/flows/translate-text';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { ApiTranslateTextSchema } from '@/ai/schemas';

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = ApiTranslateTextSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }
    
    const agentInput = validation.data;
    const result = await translateText(agentInput);

    // Deduct credit only after successful generation
    await deductCredit(user.id, 1);

    await logGeneration({
        agentId: 'translate-text',
        userId: user.id,
        input: agentInput,
        output: result,
    });

    const cleanedTranslatedText = result.translatedText.replace(/---.*?---/g, '');
    return createApiResponse({ translatedText: cleanedTranslatedText }, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
