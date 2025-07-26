
'use server';

/**
 * @fileOverview An AI agent for translating an entire project proposal object.
 * - translateProposal
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ProjectProposalSchema, ProjectProposal } from '@/ai/schemas';

const TranslateProposalInputSchema = z.object({
  proposal: ProjectProposalSchema.describe('The project proposal object to be translated.'),
  targetLang: z.string().describe('The target language (e.g., "English", "Arabic").'),
});
export type TranslateProposalInput = z.infer<typeof TranslateProposalInputSchema>;


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
    
    const stringifiedProposal = JSON.stringify(proposal, null, 2);

    const prompt = ai.definePrompt({
      name: 'translateProposalPrompt',
      input: { schema: TranslateProposalInputSchema },
      output: { schema: ProjectProposalSchema },
      prompt: `You are an expert translator. A user has provided a JSON object representing a project proposal. Your task is to translate all user-facing text values within this object to the specified target language.

Follow these rules:

- Translate ONLY the VALUES of the JSON object that are user-facing text. DO NOT translate the JSON keys.
- Maintain the exact structure of the original JSON object.
- Ensure the output is valid JSON.
- The target language is: {{{targetLang}}}

JSON Object to Translate:
---
${stringifiedProposal}
---

Translated JSON Object:
`,
    });

    const { output } = await prompt({ proposal, targetLang });
    return output!;
  }
);
