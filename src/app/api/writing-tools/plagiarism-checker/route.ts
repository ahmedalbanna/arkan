
'use server';

import { z } from 'zod';
import { plagiarismCheck } from '@/ai/flows/plagiarism-checker';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const plagiarismCheckSchema = z.object({
  text: z.string().min(100, 'Text must be at least 100 characters for a plagiarism check.'),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = plagiarismCheckSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }
    
    const agentInput = validation.data;
    const result = await plagiarismCheck(agentInput);
    
    const creditCost = 2;
    await deductCredit(user.id, creditCost);

    await logGeneration({
        agentId: 'plagiarism-checker',
        userId: user.id,
        input: { textLength: agentInput.text.length },
        output: { score: result.originalityScore, matches: result.matches.length },
        creditCost: creditCost,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
