'use server';

/**
 * @fileOverview An AI agent for generating detailed project proposals.
 *
 * - generateProposal - A function that handles the project proposal generation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { ProjectProposalSchema, type ProjectProposal } from '@/ai/schemas';


const GenerateProposalInputSchema = z.object({
  projectIdea: z.string().describe('A short description of the project idea.'),
  prompt: z.string().describe('The prompt to use for generating the proposal.')
});
export type GenerateProposalInput = z.infer<typeof GenerateProposalInputSchema>;

export async function generateProposal(input: GenerateProposalInput): Promise<ProjectProposal> {
  return generateProposalFlow(input);
}

const generateProposalFlow = ai.defineFlow(
  {
    name: 'generateProposalFlow',
    inputSchema: GenerateProposalInputSchema,
    outputSchema: ProjectProposalSchema,
  },
  async (input) => {
    const generateProposalPrompt = ai.definePrompt({
        name: 'generateProposalPrompt',
        input: { schema: GenerateProposalInputSchema },
        output: { schema: ProjectProposalSchema },
        prompt: input.prompt,
    });
    const { output } = await generateProposalPrompt(input);
    return output!;
  }
);
