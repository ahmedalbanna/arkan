
'use server';

import { z } from 'zod';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { generateCodebase } from '@/ai/flows/generate-codebase';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { ProjectProposalSchema } from '@/ai/schemas';

const codebaseSchema = z.object({
  proposal: ProjectProposalSchema,
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = codebaseSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }
    
    const agentInput = { proposal: validation.data.proposal };
    const result = await generateCodebase(agentInput);

    // This is a very complex task, so we deduct 5 credits after success.
    await deductCredit(user.id, 5);

    await logGeneration({
      agentId: 'generate-codebase',
      userId: user.id,
      input: { proposalTitle: validation.data.proposal.title },
      output: { fileCount: result.files.length },
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
