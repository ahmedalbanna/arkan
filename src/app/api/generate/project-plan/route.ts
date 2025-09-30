
'use server';

import { generateProjectPlan } from '@/ai/flows/generate-project-plan';
import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { z } from 'zod';

const planSchema = z.object({
  projectDescription: z.string().min(10, "Project description must be at least 10 characters long."),
  keyDeliverables: z.string().min(10, "Please list at least one key deliverable."),
  numPhases: z.coerce.number().int().optional(),
});

export const POST = withEnhancedAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = planSchema.safeParse(body);
    if (!validation.success) {
      return handleApiErrorEnhanced(validation.error);
    }

    const agentInput = validation.data;
    const result = await generateProjectPlan(agentInput);

    const creditCost = 2;
    await deductCredit(user.id, creditCost);

    await logGeneration({
      agentId: `generate-project-plan`,
      userId: user.id,
      input: agentInput,
      output: { phaseCount: result.phases.length }, // Log minimal output
      creditCost: creditCost,
    });

    return createApiResponseEnhanced(result, 200);

  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
});
