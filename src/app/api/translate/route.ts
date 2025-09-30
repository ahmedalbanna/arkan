
'use server';

import { translateText } from '@/ai/flows/translate-text';
import { deductCredit, logGeneration } from '@/services';
import { z } from 'zod';

const translateSchema = z.object({
  text: z.string().min(1),
  targetLang: z.string().min(2),
});

export const POST = withEnhancedAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = translateSchema.safeParse(body);
    if (!validation.success) {
      return handleApiErrorEnhanced(validation.error);
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
    return createApiResponseEnhanced({ translatedText: cleanedTranslatedText }, 200);
  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
});
