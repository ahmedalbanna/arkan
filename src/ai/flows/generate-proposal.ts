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
});
type GenerateProposalInput = z.infer<typeof GenerateProposalInputSchema>;

export async function generateProposal(input: GenerateProposalInput): Promise<ProjectProposal> {
  return generateProposalFlow(input);
}

const generateProposalPrompt = ai.definePrompt({
  name: 'generateProposalPrompt',
  input: { schema: GenerateProposalInputSchema },
  output: { schema: ProjectProposalSchema },
  prompt: `You are an expert project manager. A user will provide you with a project idea. Your task is to generate a comprehensive and professional project proposal based on that idea.

The proposal should be well-structured, realistic, and detailed. Fill out all the fields in the required output format with plausible information. Make sure the start and end dates in the timeline are logical based on today's date.

Project Idea: {{{projectIdea}}}
`,
});

const generateProposalFlow = ai.defineFlow(
  {
    name: 'generateProposalFlow',
    inputSchema: GenerateProposalInputSchema,
    outputSchema: ProjectProposalSchema,
  },
  async (input) => {
    const { output } = await generateProposalPrompt(input);
    return output!;
  }
);
