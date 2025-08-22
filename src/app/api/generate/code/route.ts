
'use server';

import { z } from 'zod';
import { generateCode } from '@/ai/flows/generate-code';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const generateCodeSchema = z.object({
  prompt: z.string().min(10, { message: 'Prompt must be at least 10 characters long.' }),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = generateCodeSchema.safeParse(body);

    if (!validation.success) {
      return handleApiError(validation.error);
    }
    
    const agentInput = validation.data;
    const result = await generateCode(agentInput);

    const creditCost = 1;
    await deductCredit(user.id, creditCost);

    await logGeneration({
        agentId: 'generate-code', // Assuming a static ID for this agent
        userId: user.id,
        input: agentInput,
        output: result,
        creditCost: creditCost,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
