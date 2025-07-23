
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
  translatedText: z.string().describe('The resulting translated text, with original markdown formatting preserved.'),
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
      prompt: `You are an expert translator. Your task is to translate the given text into the specified target language while perfectly preserving all markdown formatting.

**CRITICAL INSTRUCTIONS:**
1.  **Preserve Markdown**: You MUST maintain the original markdown structure. Headings (e.g., '#', '##'), lists (e.g., '-', '1.'), bold text (e.g., '**text**'), italics, and any other markdown syntax must be kept intact in the translated output.
2.  **Translate ONLY Content**: Only translate the textual content within the markdown. Do not translate markdown syntax.
3.  **Return Only Translated Text**: Your final output should only be the translated text with its preserved markdown. Do not add any conversational text or explanations.

**Target Language:** {{{targetLang}}}

**Original Text with Markdown:**
---
{{{text}}}
---
`,
    });

    const { output } = await prompt({ text, targetLang });
    if (!output) {
      return { translatedText: '' };
    }

    return { translatedText: output.translatedText };
  }
);
