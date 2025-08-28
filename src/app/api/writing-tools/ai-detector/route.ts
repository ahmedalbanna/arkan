
'use server';

import { z } from 'zod';
import { detectAiContent } from '@/ai/flows/detect-ai-content';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const detectorSchema = z.object({
  text: z.string().min(50, 'Text must be at least 50 characters for analysis.'),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = detectorSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const agentInput = validation.data;
    const result = await detectAiContent(agentInput);

    const creditCost = 1;
    await deductCredit(user.id, creditCost);

    await logGeneration({
        agentId: 'detect-ai-content',
        userId: user.id,
        input: { textLength: agentInput.text.length },
        output: result,
        creditCost: creditCost,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
