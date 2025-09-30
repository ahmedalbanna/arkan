
'use server';

import { generateProposal } from '@/ai/flows/generate-proposal';
import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';

import { GenerateProposalInputSchema, type GenerateProposalInput } from '@/ai/schemas';

// The schema for the API route now directly uses the AI flow's input schema.
const generateProposalApiSchema = GenerateProposalInputSchema;

export const POST = withEnhancedAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = generateProposalApiSchema.safeParse(body);

    if (!validation.success) {
      return handleApiErrorEnhanced(validation.error);
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
      output: { resultLength: JSON.stringify(result).length },
      creditCost: creditCost,
    });

    return createApiResponseEnhanced(result, 200);
  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
});
