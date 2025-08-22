
'use server';

import { z } from 'zod';
import { translateText } from '@/ai/flows/translate-text';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const translateSchema = z.object({
  text: z.string().min(1),
  targetLang: z.string().min(2),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = translateSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    await deductCredit(user.id, 1);

    const agentInput = validation.data;
    const result = await translateText(agentInput);

    await logGeneration({
      agentId: 'translate-text',
      userId: user.id,
      input: agentInput,
      output: result,
      creditCost: 1
    });

    const cleanedTranslatedText = result.translatedText.replace(/---.*?---/g, '');
    return createApiResponse({ translatedText: cleanedTranslatedText }, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
