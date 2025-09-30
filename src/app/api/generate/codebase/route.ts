
'use server';

import { generateCodebase } from '@/ai/flows/generate-codebase';
import { ProjectProposalSchema } from '@/ai/schemas';
import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { deductCredit, logGeneration } from '@/services';
import { z } from 'zod';

// Schema لتوليد الكودبيس
const codebaseSchema = z.object({
  proposal: ProjectProposalSchema,
});

/**
 * معالج توليد الكودبيس
 */
export const POST = withEnhancedAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = codebaseSchema.safeParse(body);
    if (!validation.success) {
      return handleApiErrorEnhanced(validation.error);
    }

    const agentInput = { proposal: validation.data.proposal };
    const result = await generateCodebase(agentInput);

    const creditCost = 5;
    await deductCredit(user.id, creditCost);

    await logGeneration({
      agentId: 'generate-codebase',
      userId: user.id,
      input: { proposalTitle: validation.data.proposal.title },
      output: { fileCount: result.files.length },
      creditCost: creditCost,
    });

    return createApiResponseEnhanced(result, 200);
  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
});
