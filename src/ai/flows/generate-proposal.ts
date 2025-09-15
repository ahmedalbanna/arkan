'use server';

/**
 * @fileOverview An AI agent for generating detailed project proposals.
 *
 * - generateProposal - A function that handles the project proposal generation.
 */

import { ai } from '@/ai/genkit';
import { GenerateProposalInputSchema, ProjectProposalSchema, type ProjectProposal } from '@/ai/schemas';
import { generateProposalPrompt } from '@/ai/prompts/generate-proposal';

// We wrap the prompt in a flow to handle input processing and ensure a clean interface.
export const generateProposal = ai.defineFlow(
  {
    name: 'generateProposalFlow',
    inputSchema: GenerateProposalInputSchema,
    outputSchema: ProjectProposalSchema,
  },
  async (input): Promise<ProjectProposal> => {
    const { projectIdea, guidelines, externalContext } = input;

    const textContext = externalContext?.filter(f => !f.content.startsWith('data:')) || [];
    const mediaContext = externalContext?.filter(f => f.content.startsWith('data:')) || [];

    const { output } = await generateProposalPrompt({
      projectIdea,
      guidelines,
      textContext,
      mediaContext,
    });

    if (!output) {
      throw new Error("Proposal generation failed to produce an output. The AI may not have had enough context. Please try adding more detail.");
    }

    return output;
  }
);
