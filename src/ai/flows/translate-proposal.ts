

'use server';

/**
 * @fileOverview An AI agent for translating an entire project proposal object.
 * - translateProposal
 */

import { ai } from '@/ai/genkit';
import { translateProposalPrompt } from '@/ai/prompts/translate-proposal';
import { ProjectProposal, ProjectProposalSchema, TranslateProposalInputSchema, type TranslateProposalInput } from '@/ai/schemas';

export async function translateProposal(
  input: TranslateProposalInput
): Promise<ProjectProposal> {
  return translateProposalFlow(input);
}

const translateProposalFlow = ai.defineFlow(
  {
    name: 'translateProposalFlow',
    inputSchema: TranslateProposalInputSchema,
    outputSchema: ProjectProposalSchema,
  },
  async ({ proposal, targetLang }) => {
    const { output } = await translateProposalPrompt({ proposal, targetLang });
    return output!;
  }
);
