
'use server';

/**
 * @fileOverview An AI agent for translating text.
 * - translateText
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  targetLang: z.string().describe('The target language (e.g., "English", "Arabic").'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translatedText: z.string().describe('The resulting translated text.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;


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
    const prompt = ai.definePrompt({
      name: 'translateTextPrompt',
      input: { schema: TranslateTextInputSchema },
      output: { schema: TranslateTextOutputSchema },
      prompt: `You are an expert translator. A user has provided text to be translated. Your task is to translate it to the specified target language and return only the translated text.

Target Language: {{{targetLang}}}

Original Text:
---
{{{text}}}
---
`,
    });

    const { output } = await prompt({ text, targetLang });
    return output!;
  }
);
