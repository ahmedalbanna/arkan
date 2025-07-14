
'use server';

import { z } from 'zod';
import { generateProposal } from '@/ai/flows/generate-proposal';
import { deductCredit } from '@/services/credit-service';
import { AGENTS } from '@/lib/agents';
import type { ProjectProposal } from '@/ai/schemas';

// In a real app, this would come from the authenticated session
const HARDCODED_USER_ID = 'user-1';

export interface ProposalGenerationState {
  proposal?: ProjectProposal;
  error?: string;
}

const GenerateProposalSchema = z.object({
  projectIdea: z.string().min(10, { message: 'Project idea must be at least 10 characters long.' }),
});


export async function handleGenerateProposal(
  prevState: ProposalGenerationState,
  formData: FormData
): Promise<ProposalGenerationState> {
  const validatedFields = GenerateProposalSchema.safeParse({
    projectIdea: formData.get('projectIdea'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.projectIdea?.[0],
    };
  }
  
  const proposalAgent = AGENTS.find(a => a.id === 'generate-proposal');
  if (!proposalAgent) {
    return { error: 'Proposal generation agent not configured.' };
  }
  if (!proposalAgent.isEnabled) {
    return { error: 'The Proposal Generation agent is currently disabled.' };
  }


  const { projectIdea } = validatedFields.data;

  try {
    await deductCredit(HARDCODED_USER_ID, 1);
    const result = await generateProposal({ 
        projectIdea,
        prompt: typeof proposalAgent.prompt === 'string' ? proposalAgent.prompt : proposalAgent.prompt.base
    });
    
    return {
        proposal: result,
    };
  } catch (e: any) {
    console.error(e);
    const errorMessage = e.message || 'An error occurred while generating the proposal. Please try again.';
    return { error: errorMessage };
  }
}
