
'use server';

import { z } from 'zod';
import { generatePresentation } from '@/ai/flows/generate-presentation';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema } from '@/ai/schemas';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const ApiGeneratePresentationSchema = z.object({
  proposal: ProjectProposalSchema.optional(),
  sections: z.record(SectionNameSchema, z.string()).optional(),
  diagrams: z.record(DiagramTypeSchema, z.string()).optional(),
  guidelines: z.array(z.string()).optional(),
  externalContextContent: z.string().optional(),
  templateId: z.string(),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = ApiGeneratePresentationSchema.safeParse(body);

    if (!validation.success) {
      return handleApiError(validation.error);
    }
    
    await deductCredit(user.id, 1);
    
    const agentInput = validation.data;
    const result = await generatePresentation(agentInput);
    
    await logGeneration({
        agentId: 'generate-presentation',
        userId: user.id,
        input: agentInput,
        output: result,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
