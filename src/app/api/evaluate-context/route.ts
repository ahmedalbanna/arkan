
'use server';

import { z } from 'zod';
import { evaluateAndSelectContext } from '@/ai/flows/evaluate-and-select-context';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema, ProjectPlanSchema } from '@/ai/schemas';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const evaluateContextSchema = z.object({
    proposal: ProjectProposalSchema.optional(),
    projectPlan: ProjectPlanSchema.optional().nullable(),
    existingSections: z.record(SectionNameSchema, z.string()).optional(),
    existingDiagrams: z.record(DiagramTypeSchema, z.string()).optional(),
    sectionsToGenerate: z.array(SectionNameSchema),
    externalContext: z.array(z.object({
        fileName: z.string(),
        content: z.string(),
        type: z.enum(['context', 'example'])
    })).optional(),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = evaluateContextSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    // Context evaluation is a complex step, deduct 1 credit.
    await deductCredit(user.id, 1);
    
    const agentInput = validation.data;
    const result = await evaluateAndSelectContext(agentInput);

    await logGeneration({
        agentId: 'evaluate-and-select-context',
        userId: user.id,
        input: agentInput,
        output: result,
    });
    
    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
