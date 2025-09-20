
'use server';

/**
 * @fileOverview An AI agent for generating detailed project proposals.
 *
 * - generateProposal - A function that handles the project proposal generation.
 */

import { ai } from '@/ai/genkit';
import { generateProposalPrompt } from '@/ai/prompts/generate-proposal';
import { GenerateProposalInputSchema, ProjectProposalSchema, type ProjectProposal } from '@/ai/schemas';

// We wrap the prompt in a flow to handle input processing and ensure a clean interface.
export const generateProposal = ai.defineFlow(
  {
    name: 'generateProposalFlow',
    inputSchema: GenerateProposalInputSchema,
    outputSchema: ProjectProposalSchema,
  },
  async (input): Promise<ProjectProposal> => {
    const { projectIdea, guidelines, externalContext, advancedFields } = input;


    const { output } = await generateProposalPrompt({
      projectIdea,
      guidelines,
      externalContext,
      advancedFields, // Pass the advanced fields to the prompt
    });

    if (!output) {
      throw new Error("Proposal generation failed to produce an output. The AI may not have had enough context. Please try adding more detail.");
    }

    return output;
  }
);
