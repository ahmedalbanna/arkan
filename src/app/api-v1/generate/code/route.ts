
'use server';

import { generateCode } from '@/ai/flows/generate-code';
import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { deductCredit, logGeneration } from '@/services';
import { z } from 'zod';

const generateCodeSchema = z.object({
  prompt: z.string().min(10, { message: 'Prompt must be at least 10 characters long.' }),
});

export const POST = withEnhancedAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = generateCodeSchema.safeParse(body);

    if (!validation.success) {
      return handleApiErrorEnhanced(validation.error);
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

    return createApiResponseEnhanced(result, 200);
  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
});
