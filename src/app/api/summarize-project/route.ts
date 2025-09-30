
'use server';

import { summarizeFullProject } from '@/ai/flows/summarize-project';
import { AnyProjectProposalSchema } from '@/ai/schemas';
import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { deductCredit, logGeneration } from '@/services';
import { z } from 'zod';

// Schema لتلخيص المشروع
const summarizeSchema = z.object({
  proposal: AnyProjectProposalSchema,
  reportMarkdown: z.string().optional(),
});

/**
 * معالج تلخيص المشروع
 */
export const POST = withEnhancedAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = summarizeSchema.safeParse(body);
    if (!validation.success) {
      return handleApiErrorEnhanced(validation.error, '400');
    }
    try {


      const creditCost = 1;
      await deductCredit(user.id, creditCost);

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
        creditCost: creditCost
      });

      return createApiResponseEnhanced(result, 200);
    } catch (error) {
      return handleApiErrorEnhanced(error, '500');
    }
  } catch (error) {
    return handleApiErrorEnhanced(error, '500');
  }
});
