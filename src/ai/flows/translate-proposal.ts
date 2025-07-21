
'use server';

/**
 * @fileOverview An AI agent for translating an entire project proposal object.
 * - translateProposal
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ProjectProposalSchema } from '@/ai/schemas';

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

**CRITICAL INSTRUCTIONS:**
1.  **Translate ONLY Text Values**: You must only translate the values of keys that contain human-readable text (e.g., "title", "objective", "description", "name", "mitigation").
2.  **DO NOT Translate Keys**: The JSON keys themselves (like "title", "objective", etc.) must remain in English.
3.  **Preserve Structure**: The original JSON structure, including all nested objects and arrays, must be perfectly preserved.
4.  **Preserve Non-Text Data**: Do not alter data that is not natural language text. This includes dates (YYYY-MM-DD format), numbers (like "durationWeeks", "totalAmount"), booleans, and currency codes (like "USD").
5.  **Return ONLY JSON**: Your final output must be only the translated JSON object, with no extra text or markdown formatting around it.

**Target Language:** {{{targetLang}}}

**Original Proposal JSON:**
\`\`\`json
${stringifiedProposal}
\`\`\`
`,
    });

    const { output } = await prompt({ proposal, targetLang });
    return output!;
  }
);
