
'use server';

import { z } from 'zod';
import { humanizeText } from '@/ai/flows/humanize-text';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const humanizeSchema = z.object({
  text: z.string().min(10, 'Text must be at least 10 characters long.'),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = humanizeSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    await deductCredit(user.id, 1);
    
    const agentInput = validation.data;
    const result = await humanizeText(agentInput);

    await logGeneration({
        agentId: 'humanize-text',
        userId: user.id,
        input: agentInput,
        output: result,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
