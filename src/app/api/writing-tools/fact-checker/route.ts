
'use server';

import { z } from 'zod';
import { factCheckText } from '@/ai/flows/fact-checker';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const factCheckSchema = z.object({
  text: z.string().min(50, 'Text must be at least 50 characters for fact-checking.'),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = factCheckSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }
    
    const agentInput = validation.data;
    const result = await factCheckText(agentInput);

    // This is a complex task, deduct after success
    await deductCredit(user.id, 2);

    await logGeneration({
        agentId: 'fact-checker',
        userId: user.id,
        input: { textLength: agentInput.text.length },
        output: { claimCount: result.claims.length, score: result.originalityScore },
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
