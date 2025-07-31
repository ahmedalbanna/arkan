
'use server';

import { z } from 'zod';
import { generateProposal } from '@/ai/flows/generate-proposal';
import { selectProposalTemplate } from '@/ai/flows/select-proposal-template';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import type { ProposalTemplate } from '@/services/template-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { adminDb } from '@/lib/firebase/server-init';

const generateProposalSchema = z.object({
  projectIdea: z.string().min(10, { message: 'Project idea must be at least 10 characters long.' }),
  templateId: z.string(),
  customGuidelines: z.array(z.string()).optional(),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = generateProposalSchema.safeParse(body);

    if (!validation.success) {
      return handleApiError(validation.error);
    }

    await deductCredit(user.id, 1);

    let { projectIdea, templateId, customGuidelines } = validation.data;
    
    // If the user selects the "automatic" template, first call the AI to select the best template.
    if (templateId === 'automatic-ai') {
        const selectionResult = await selectProposalTemplate({ projectIdea });
        templateId = selectionResult.templateId;
        // Log this intermediate step
        await logGeneration({
            agentId: 'select-proposal-template',
            userId: user.id,
            input: { projectIdea },
            output: { selectedTemplateId: templateId },
        });
    }

    const templateDoc = await adminDb.collection('templates').doc('proposal').collection('items').doc(templateId).get();
    if (!templateDoc.exists) {
      return handleApiError({ message: 'Proposal template not found.' }, 404);
    }
    const template = templateDoc.data() as ProposalTemplate;

    const finalGuidelines = [...(template.guidelines || []), ...(customGuidelines || [])];
    
    let finalPrompt = template.prompt;
    if (finalGuidelines.length > 0) {
        finalPrompt += '\n\nAdditionally, please adhere to the following guidelines:\n' + finalGuidelines.map(g => `- ${g}`).join('\n');
    }

    const agentInput = {
      projectIdea,
      prompt: finalPrompt,
    };

    let result = await generateProposal(agentInput);

    await logGeneration({
        agentId: 'generate-proposal-report', // Agent ID for logging
        userId: user.id,
        input: { projectIdea, templateId: validation.data.templateId, finalTemplateId: templateId, customGuidelines }, // Log the user-facing input
        output: result,
    });
    
    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
