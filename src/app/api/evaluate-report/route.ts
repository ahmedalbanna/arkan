
'use server';

import { z } from 'zod';
import { evaluateReport } from '@/ai/flows/evaluate-report';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema } from '@/ai/schemas';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const evaluateReportSchema = z.object({
  proposal: ProjectProposalSchema.optional().nullable(),
  reportSections: z.record(SectionNameSchema, z.string()),
  diagrams: z.record(DiagramTypeSchema, z.string()).optional().nullable(),
  acceptanceCriteria: z.array(z.string()).optional().nullable(),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = evaluateReportSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
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

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
