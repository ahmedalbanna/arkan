
'use server';

import { z } from 'zod';
import { evaluateReport } from '@/ai/flows/evaluate-report';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema } from '@/ai/schemas';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const evaluateReportSchema = z.object({
  proposal: ProjectProposalSchema,
  reportSections: z.record(SectionNameSchema, z.string()),
  diagrams: z.record(DiagramTypeSchema, z.string()).optional(),
  acceptanceCriteria: z.array(z.string()),
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

    // Only deduct credit after a successful generation
    await deductCredit(user.id, 1);
    
    // Log the successful generation
    await logGeneration({
        agentId: 'evaluate-report',
        userId: user.id,
        input: agentInput,
        output: result,
    });
    
    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
