'use server';

/**
 * @fileOverview An AI agent for generating detailed project proposals.
 *
 * - generateProposal - A function that handles the project proposal generation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { ProjectProposalSchema, type ProjectProposal } from '@/ai/schemas';
import { validateAndFixMarkdown } from './validate-markdown';


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
    const proposal = output!;

    // A helper to run validation on a field
    const fixField = async (text: string) => validateAndFixMarkdown(text);
    
    // An array of promises to fix all markdown fields concurrently
    const fixes = [
      fixField(proposal.objective).then(res => proposal.objective = res),
      fixField(proposal.methodology).then(res => proposal.methodology = res),
      fixField(proposal.evaluation).then(res => proposal.evaluation = res),
      ...proposal.stakeholders.map(s => fixField(s.interest).then(res => s.interest = res)),
      ...proposal.risks.map(r => Promise.all([
        fixField(r.description).then(res => r.description = res),
        fixField(r.mitigation).then(res => r.mitigation = res)
      ]))
    ];

    await Promise.all(fixes);

    return proposal;
  }
);
