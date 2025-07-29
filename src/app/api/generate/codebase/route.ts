
'use server';

import { z } from 'zod';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { ProjectProposalSchema } from '@/ai/schemas';
import { generateCodebase } from '@/ai/flows/generate-codebase';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

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

    // This is a very complex task, so we deduct 5 credits.
    await deductCredit(user.id, 5);

    const agentInput = { proposal: validation.data.proposal };
    const result = await generateCodebase(agentInput);

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
