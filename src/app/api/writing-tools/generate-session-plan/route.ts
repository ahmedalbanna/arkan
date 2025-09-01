'use server';

import { z } from 'zod';
import { generateSessionPlan } from '@/ai/flows/generate-session-plan';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const generateSessionPlanApiSchema = z.object({
  chapterContent: z.string().min(100, 'Chapter content must be at least 100 characters long.'),
  sessionDuration: z.number().int().min(10, 'Session must be at least 10 minutes.').max(240, 'Session cannot exceed 4 hours.'),
  numActivities: z.number().int().min(1, 'Must have at least one activity.').max(10, 'Cannot have more than 10 activities.'),
  targetAudience: z.string().optional(),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = generateSessionPlanApiSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const agentInput = validation.data;
    const result = await generateSessionPlan(agentInput);

    const creditCost = 1; // Or calculate based on complexity
    await deductCredit(user.id, creditCost);

    await logGeneration({
        agentId: 'generate-session-plan',
        userId: user.id,
        input: agentInput,
        output: { activitiesCount: result.activities.length },
        creditCost: creditCost,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
