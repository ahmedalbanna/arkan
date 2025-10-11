
'use server';

/**
 * @fileOverview An AI agent for making text sound more human-like.
 */

import { ai } from '@/ai/genkit';
import { humanizeTextPrompt } from '@/ai/prompts/humanize-text';
import { HumanizeTextInputSchema, HumanizeTextOutputSchema, type HumanizeTextInput, type HumanizeTextOutput } from '@/ai/schemas';

const humanizeTextFlow = ai.defineFlow({
  name: 'humanizeTextFlow',
  inputSchema: HumanizeTextInputSchema,
  outputSchema: HumanizeTextOutputSchema,
}, async (input) => {
  const { output } = await humanizeTextPrompt(input);
  if (!output) {
    throw new Error("Failed to humanize text.");
  }
  return output;
});

export async function humanizeText(input: HumanizeTextInput): Promise<HumanizeTextOutput> {
  const validation = HumanizeTextInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for humanizeText: ${validation.error.message}`);
  }
  return humanizeTextFlow(validation.data);
}
