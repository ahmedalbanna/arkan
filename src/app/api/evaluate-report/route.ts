
'use server';

import { evaluateReport } from '@/ai/flows/evaluate-report';
import { DiagramTypeSchema, ProjectProposalSchema, SectionNameSchema } from '@/ai/schemas';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { z } from 'zod';

const evaluateReportSchema = z.object({
  proposal: ProjectProposalSchema.optional().nullable(),
  reportSections: z.record(SectionNameSchema, z.string()),
  diagrams: z.record(DiagramTypeSchema, z.string()).optional().nullable(),
  acceptanceCriteria: z.array(z.string()).optional().nullable(),
});

export const POST = withEnhancedAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = evaluateReportSchema.safeParse(body);
    if (!validation.success) {
      return handleApiErrorEnhanced(validation.error);
    }

    const agentInput = validation.data;
    const result = await evaluateReport(agentInput);

    const creditCost = 1;
    await deductCredit(user.id, creditCost);

    await logGeneration({
      agentId: 'evaluate-report',
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
