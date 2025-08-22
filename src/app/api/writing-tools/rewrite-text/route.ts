
'use server';

import { z } from 'zod';
import { rewriteText } from '@/ai/flows/text-stylist';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const rewriteSchema = z.object({
  text: z.string().min(10, 'Text must be at least 10 characters long.'),
  style: z.string().min(1, 'A style must be selected.'),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = rewriteSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }
    
    const result = await rewriteText(validation.data);
    
    const creditCost = 1;
    await deductCredit(user.id, creditCost);

    await logGeneration({
        agentId: 'rewrite-text',
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
