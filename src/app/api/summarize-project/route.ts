
'use server';

import { summarizeFullProject } from '@/ai/flows/summarize-project';
import { AnyProjectProposalSchema } from '@/ai/schemas';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { z } from 'zod';

const summarizeSchema = z.object({
  proposal: AnyProjectProposalSchema,
  reportMarkdown: z.string().optional(),
});

export const POST = withEnhancedAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = summarizeSchema.safeParse(body);
    if (!validation.success) {
      return handleApiErrorEnhanced(validation.error);
    }

    await deductCredit(user.id, 1);

    const agentInput = {
      proposal: validation.data.proposal,
      reportMarkdown: validation.data.reportMarkdown || '',
    };
    const result = await summarizeFullProject(agentInput);

    await logGeneration({
      agentId: 'summarize-full-project',
      userId: user.id,
      input: { proposalTitle: agentInput.proposal.title, reportLength: agentInput.reportMarkdown.length },
      output: result,
      creditCost: 1
    });

    return createApiResponseEnhanced(result, 200);
  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
});
