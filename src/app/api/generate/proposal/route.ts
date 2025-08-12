
'use server';

import { z } from 'zod';
import { generateProposal } from '@/ai/flows/generate-proposal';
import { selectProposalTemplate } from '@/ai/flows/select-proposal-template';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import type { ProposalTemplate } from '@/services/template-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { adminDb } from '@/lib/firebase/server-init';
import type { ExternalContext } from '@/lib/types';


const generateProposalSchema = z.object({
  projectIdea: z.string().min(10, { message: 'Project idea must be at least 10 characters long.' }),
  templateId: z.string(),
  customGuidelines: z.array(z.string()).optional(),
  externalContext: z.array(z.object({
      fileName: z.string(),
      content: z.string(),
      type: z.enum(['context', 'example', 'question', 'textbook', 'guidelines']),
  })).optional(),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = generateProposalSchema.safeParse(body);

    if (!validation.success) {
      return handleApiError(validation.error);
    }
    
    let { projectIdea, templateId, customGuidelines, externalContext } = validation.data;
    
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
    
    const agentInput = {
      projectIdea,
      prompt: template.prompt,
      guidelines: finalGuidelines,
      externalContext: externalContext,
    };

    let result = await generateProposal(agentInput);

    // Deduct credit only after a successful generation
    await deductCredit(user.id, 1);

    await logGeneration({
        agentId: 'generate-proposal', 
        userId: user.id,
        input: { 
            projectIdea, 
            templateId: validation.data.templateId, 
            finalTemplateId: templateId, 
            customGuidelines,
            externalContextFileCount: externalContext?.length || 0,
        },
        output: { title: result.title, category: result.category },
    });
    
    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
