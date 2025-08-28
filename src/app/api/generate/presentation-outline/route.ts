
'use server';

import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { generatePresentationOutline } from '@/ai/flows/generate-presentation-outline';
import { z } from 'zod';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';

const schema = z.object({
  prompt: z.string().min(3, "Prompt must be at least 3 characters long."),
  documentation: z.string().optional(),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = schema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const result = await generatePresentationOutline(validation.data);

    const creditCost = 1;
    await deductCredit(user.id, creditCost);

    await logGeneration({
      agentId: 'generate-presentation-outline',
      userId: user.id,
      input: validation.data,
      output: { outlineLength: result.outline.length },
      creditCost: creditCost,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
