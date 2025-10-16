

'use server';

/**
 * @fileOverview An AI agent for translating an entire presentation history entry object.
 * - translatePresentation
 */

import { ai } from '@/ai/genkit';
import { translatePresentationPrompt } from '@/ai/prompts/translate-presentation';
import { PresentationHistoryEntrySchema, TranslatePresentationInputSchema, type PresentationHistoryEntry, type TranslatePresentationInput } from '@/ai/schemas';

export async function translatePresentation(
  input: TranslatePresentationInput
): Promise<PresentationHistoryEntry> {
  return translatePresentationFlow(input);
}

const translatePresentationFlow = ai.defineFlow(
  {
    name: 'translatePresentationFlow',
    inputSchema: TranslatePresentationInputSchema,
    outputSchema: PresentationHistoryEntrySchema,
  },
  async ({ presentation, targetLang }) => {
    const { output } = await translatePresentationPrompt({ presentation, targetLang });
    return output!;
  }
);
