
'use server';

import { z } from 'zod';
import { paraphraseText, ParaphraseModeSchema } from '@/ai/flows/paraphrase-text';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const paraphraseSchema = z.object({
  text: z.string().min(10, 'Text must be at least 10 characters long.'),
  mode: ParaphraseModeSchema,
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = paraphraseSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    await deductCredit(user.id, 1);
    
    const agentInput = validation.data;
    const result = await paraphraseText(agentInput);

    await logGeneration({
        agentId: 'paraphrase-text',
        userId: user.id,
        input: agentInput,
        output: result,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
