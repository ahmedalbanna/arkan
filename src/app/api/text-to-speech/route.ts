
'use server';

import { z } from 'zod';
import { deductCredit } from '@/services/credit-service';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const ttsSchema = z.object({
  text: z.string().min(1, 'Text content is required.'),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = ttsSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }
    
    const result = await textToSpeech({text: validation.data.text});

    // Deduct credit only after successful generation
    await deductCredit(user.id, 1);

    await logGeneration({
        agentId: 'text-to-speech',
        userId: user.id,
        input: { textLength: validation.data.text.length },
        output: { audioGenerated: true },
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
