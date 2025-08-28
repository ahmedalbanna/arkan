
'use server';

import { z } from 'zod';
import { summarizeTextWithRatio } from '@/ai/flows/text-stylist';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const summarizeSchema = z.object({
  text: z.string().min(20, 'Text must be at least 20 characters long to summarize.'),
  ratio: z.number().int().min(10).max(90),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = summarizeSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const result = await summarizeTextWithRatio(validation.data);

    const creditCost = 1;
    await deductCredit(user.id, creditCost);

    await logGeneration({
        agentId: 'summarize-text-with-ratio',
        userId: user.id,
        input: validation.data,
        output: result,
        creditCost: creditCost,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
