
'use server';

import { z } from 'zod';
import { summarizeText, SummarizeLengthSchema } from '@/ai/flows/summarize-text';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const summarizeSchema = z.object({
  text: z.string().min(20, 'Text must be at least 20 characters long.'),
  length: SummarizeLengthSchema,
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = summarizeSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    await deductCredit(user.id, 1);
    
    const agentInput = validation.data;
    const result = await summarizeText(agentInput);

    await logGeneration({
        agentId: 'summarize-text',
        userId: user.id,
        input: agentInput,
        output: result,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
