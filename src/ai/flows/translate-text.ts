

'use server';

/**
 * @fileOverview An AI agent for translating text.
 * - translateText
 */

import { ai } from '@/ai/genkit';
import { translateTextPrompt } from '@/ai/prompts/translate-text';
import { TranslateTextInputSchema, TranslateTextOutputSchema, type TranslateTextInput, type TranslateTextOutput } from '@/ai/schemas';

export async function translateText(
  input: TranslateTextInput
): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async ({ text, targetLang }) => {
    const { output } = await translateTextPrompt({ text, targetLang });
    if (!output) {
      return { translatedText: '' };
    }

    const cleanedTranslatedText = output.translatedText.replace(/---/g, '').trim();

    return { translatedText: cleanedTranslatedText };
  }
);
