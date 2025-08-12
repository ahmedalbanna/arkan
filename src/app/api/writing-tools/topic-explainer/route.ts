
'use server';

import { z } from 'zod';
import { topicExplainer } from '@/ai/flows/topic-explainer';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const explainerSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters long.'),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = explainerSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }
    
    const agentInput = validation.data;
    const result = await topicExplainer(agentInput);

    // Deduct credit only after a successful generation
    await deductCredit(user.id, 1);

    await logGeneration({
        agentId: 'topic-explainer',
        userId: user.id,
        input: agentInput,
        output: { explanationLength: result.explanation.length },
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
