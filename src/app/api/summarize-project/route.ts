
'use server';

import { z } from 'zod';
import { summarizeFullProject } from '@/ai/flows/summarize-project';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { AnyProjectProposalSchema } from '@/ai/schemas';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const summarizeSchema = z.object({
  proposal: AnyProjectProposalSchema,
  reportMarkdown: z.string(),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = summarizeSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    await deductCredit(user.id, 1);

    const agentInput = validation.data;
    const result = await summarizeFullProject(agentInput);

    await logGeneration({
        agentId: 'summarize-full-project',
        userId: user.id,
        input: { proposalTitle: agentInput.proposal.title, reportLength: agentInput.reportMarkdown.length },
        output: result,
    });
    
    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
