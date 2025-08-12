
'use server';

import { z } from 'zod';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { generateProjectPlan } from '@/ai/flows/generate-project-plan';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const planSchema = z.object({
  projectDescription: z.string().min(10, "Project description must be at least 10 characters long."),
  keyDeliverables: z.string().min(10, "Please list at least one key deliverable."),
  numPhases: z.coerce.number().int().optional(),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = planSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }
    
    const agentInput = validation.data;
    const result = await generateProjectPlan(agentInput);

    // This is a more complex task, so we deduct 2 credits after success.
    await deductCredit(user.id, 2);

    await logGeneration({
        agentId: `generate-project-plan`,
        userId: user.id,
        input: agentInput,
        output: { phaseCount: result.phases.length }, // Log minimal output
    });

    return createApiResponse(result, 200);

  } catch (error) {
    return handleApiError(error);
  }
});
