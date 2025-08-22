

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
import type { AdvancedProposalFields } from '@/hooks/useProposalGenerationStore';


const generateProposalSchema = z.object({
  projectIdea: z.string().min(1, { message: 'Project idea is required.' }),
  templateId: z.string(),
  customGuidelines: z.array(z.string()).optional(),
  externalContext: z.array(z.object({
      fileName: z.string(),
      content: z.string(),
      type: z.enum(['context', 'example', 'question', 'textbook', 'guidelines']),
  })).optional(),
  advancedFields: z.object({
    projectTitle: z.string(),
    projectObjective: z.string(),
    expectedOutcomes: z.string(),
    stakeholders: z.string(),
    projectContext: z.string(),
    risksAndChallenges: z.string(),
    projectRationale: z.string(),
    additionalContext: z.string(),
    methodology: z.string(),
    timeline: z.string(),
    budget: z.string(),
  }).optional(),
});

function formatAdvancedPrompt(fields: AdvancedProposalFields): string {
    return `
Here are the specific details for the project:
- **Project Title**: ${'\'\'\''}${fields.projectTitle}'\'\'\''}
- **Project Objective**: ${'\'\'\''}${fields.projectObjective}'\'\'\''}
- **Expected Outcomes**: ${'\'\'\''}${fields.expectedOutcomes}'\'\'\''}
- **Methodology**: ${'\'\'\''}${fields.methodology}'\'\'\''}
- **Timeline**: ${'\'\'\''}${fields.timeline}'\'\'\''}
- **Budget**: ${'\'\'\''}${fields.budget}'\'\'\''}
- **Stakeholders**: ${'\'\'\''}${fields.stakeholders}'\'\'\''}
- **Project Rationale**: ${'\'\'\''}${fields.projectRationale}'\'\'\''}
- **Project Context**: ${'\'\'\''}${fields.projectContext}'\'\'\''}
- **Risks & Challenges**: ${'\'\'\''}${fields.risksAndChallenges}'\'\'\''}
- **Additional Context**: ${'\'\'\''}${fields.additionalContext}'\'\'\''}

Based on these details, please generate a comprehensive and professional project proposal in a well-structured markdown format.
`;
}


export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = generateProposalSchema.safeParse(body);

    if (!validation.success) {
      return handleApiError(validation.error);
    }
    
    let { projectIdea, templateId, customGuidelines, externalContext, advancedFields } = validation.data;
    
    if (advancedFields) {
        projectIdea = formatAdvancedPrompt(advancedFields);
    }
    
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
            creditCost: 0, // Template selection is a free action
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
        },
        output: { resultLength: result.length },
        creditCost: creditCost,
    });
    
    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
