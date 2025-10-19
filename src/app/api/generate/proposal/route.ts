
'use server';

import { generateProposal } from '@/ai/flows/generate-proposal';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { z } from 'zod';

import { GenerateProposalInputSchema, type GenerateProposalInput } from '@/ai/schemas';
import { createApiResponse, handleApiError, withAuth } from '@/lib/api-utils';

// The schema for the API route now directly uses the AI flow's input schema.
const generateProposalApiSchema = GenerateProposalInputSchema;

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = generateProposalApiSchema.safeParse(body);

    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const { projectIdea, guidelines, externalContext, advancedFields } = validation.data;

    const agentInput: GenerateProposalInput = {
      projectIdea,
      guidelines,
      externalContext,
      advancedFields,
    };

    let result = await generateProposal(agentInput);

    const creditCost = 1;
    await deductCredit(user.id, creditCost);

    await logGeneration({
      agentId: 'generate-proposal',
      userId: user.id,
      input: {
        projectIdea,
        guidelines,
        externalContextFileCount: externalContext?.length || 0,
        usedAdvancedMode: !!advancedFields,
      },
      output: { result },
      creditCost: creditCost,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
