
'use server';

import { ai } from '@/ai/genkit';
import { GenerateProposalInputSchema, GenerateProposalOutputSchema, type GenerateProposalInput, type GenerateProposalOutput } from '@/ai/schemas/flows';

export async function generateProposal(input: GenerateProposalInput): Promise<GenerateProposalOutput> {
  const proposalPrompt = ai.definePrompt({
    name: 'generateProposalPrompt',
    input: { schema: GenerateProposalInputSchema },
    output: { schema: GenerateProposalOutputSchema },
    model: 'googleai/gemini-2.5-flash-lite',
    system: `You are an expert project manager and proposal writer. Your task is to generate a comprehensive project proposal based on a user's idea. The output must be a single, well-structured markdown document.`,
    prompt: `
      Based on the following project idea, generate a complete and professional project proposal in Markdown format.

      **Project Idea:**
      {{{mainSubject}}}

      {{#if guidelines}}
      **Custom Guidelines to Follow:**
      {{#each guidelines}}
      - {{{this}}}
      {{/each}}
      {{/if}}

      ---
      **CRITICAL INSTRUCTIONS:**
      - The output MUST be a single Markdown string.
      - The proposal should include sections for Objective, Methodology, Expected Outcomes, Timeline, Budget, Stakeholders, and Risks.
      - Be specific and provide realistic details where possible.
    `,
    config: {
      temperature: 0.6,
    },
  });

  const { output } = await proposalPrompt(input);

  if (!output) {
    throw new Error('Proposal generation failed to produce an output.');
  }

  return output;
}
