
'use server';

import { textToSpeech } from '@/ai/flows/text-to-speech';
import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { deductCredit, logGeneration } from '@/services';
import { z } from 'zod';

// Schema للتحويل إلى كلام
const ttsSchema = z.object({
  text: z.string().min(1, 'Text content is required.'),
});

/**
 * معالج التحويل إلى كلام
 */
export const POST = withEnhancedAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = ttsSchema.safeParse(body);
    if (!validation.success) {
      return handleApiErrorEnhanced(validation.error, '400');
    }

    const result = await textToSpeech({ text: validation.data.text });

    const creditCost = 1;
    await deductCredit(user.id, creditCost);

    await logGeneration({
      agentId: 'text-to-speech',
      userId: user.id,
      input: { textLength: validation.data.text.length },
      output: { audioGenerated: true },
      creditCost: creditCost,
    });

    return createApiResponseEnhanced(result, 200);
  } catch (error) {
    return handleApiErrorEnhanced(error, '500');
  }
});
