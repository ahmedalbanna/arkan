
'use server';

import { z } from 'zod';
import { generatePresentation } from '@/ai/flows/generate-presentation';
import { ProjectProposalSchema, type PresentationSlide } from '@/ai/schemas';
import { AGENTS } from '@/lib/agents';
import { deductCredit } from '@/services/credit-service';

// In a real app, this would come from the authenticated session
const HARDCODED_USER_ID = 'user-1';

export interface PresentationState {
  slides?: PresentationSlide[];
  error?: string;
}

const GeneratePresentationSchema = z.object({
  proposalJson: z.string().min(1, 'Please paste the project proposal content.'),
});

export async function handleGeneratePresentation(
  prevState: PresentationState,
  formData: FormData
): Promise<PresentationState> {

  const validatedFields = GeneratePresentationSchema.safeParse({
    proposalJson: formData.get('proposalJson'),
  });

  if (!validatedFields.success) {
    return {
      error: 'Proposal JSON is required.',
    };
  }

  let proposalData;
  try {
    proposalData = JSON.parse(validatedFields.data.proposalJson);
  } catch (e) {
    return { error: 'Invalid JSON format. Please check the content.' };
  }

  const validatedProposal = ProjectProposalSchema.safeParse(proposalData);
  if (!validatedProposal.success) {
    return {
      error: 'The proposal data does not match the required structure.',
    };
  }

  const presentationAgent = AGENTS.find(a => a.id === 'generate-presentation');
  if (!presentationAgent) {
    return { error: 'Presentation generation agent not configured.' };
  }
  
  if (!presentationAgent.isEnabled) {
    return { error: 'The Presentation Generation agent is currently disabled.' };
  }

  try {
    await deductCredit(HARDCODED_USER_ID, 1);
    const result = await generatePresentation({
      proposal: validatedProposal.data,
      prompt: typeof presentationAgent.prompt === 'string' ? presentationAgent.prompt : presentationAgent.prompt.base
    });

    return {
      slides: result.slides,
    };
  } catch (e: any) {
    console.error(e);
    const errorMessage = e.message || 'An error occurred while generating the presentation. Please try again.';
    return { error: errorMessage };
  }
}
