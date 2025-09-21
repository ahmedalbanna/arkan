

'use server';

import { generateProposal } from '@/ai/flows/generate-proposal';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { z } from 'zod';

import { GenerateProposalInputSchema, type AdvancedProposalFields, type GenerateProposalInput } from '@/ai/schemas';
import { createApiResponse, handleApiError, withAuth } from '@/lib/api-utils';
import { adminDb } from '@/lib/firebase/server-init';

// The schema for the API route now directly uses the AI flow's input schema.
const generateProposalApiSchema = GenerateProposalInputSchema.extend({
  templateId: z.string(),
  customGuidelines: z.array(z.string()).optional(),
  advancedFields: z.custom<AdvancedProposalFields>().optional(),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = generateProposalApiSchema.safeParse(body);

    if (!validation.success) {
      return handleApiError(validation.error);
    }

    let { projectIdea, templateId, customGuidelines, externalContext, advancedFields } = validation.data;



    const templateDoc = await adminDb.collection('templates').doc('proposal').collection('items').doc(templateId).get();
    if (!templateDoc.exists) {
      return handleApiError({ message: 'Proposal template not found.' }, 404);
    }
    const template = templateDoc.data();
    if (!template) {
      return handleApiError({ message: 'Proposal template data is missing.' }, 404);
    }

    // The AI flow now handles the simple vs. advanced logic internally.
    const agentInput: GenerateProposalInput = {
      projectIdea,
      guidelines: [...(template.guidelines || []), ...(customGuidelines || [])],
      externalContext,
      advancedFields,
      jsonStructure: template.jsonStructure ? JSON.stringify(template.jsonStructure, null, 2) : undefined,
    };

    let result = await generateProposal(agentInput);

    const creditCost = 1;
    await deductCredit(user.id, creditCost);

    await logGeneration({
      agentId: 'generate-proposal',
      userId: user.id,
      input: {
        projectIdea,
        templateId: validation.data.templateId,
        finalTemplateId: templateId,
        customGuidelines,
        externalContextFileCount: externalContext?.length || 0,
        usedAdvancedMode: !!advancedFields,
      },
      output: { resultLength: JSON.stringify(result).length },
      creditCost: creditCost,
    });

    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
