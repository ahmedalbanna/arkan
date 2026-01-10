
'use server';

/**
 * @fileOverview An AI agent for translating text.
 * - translateText
 */

import { ai } from '@/ai/genkit';
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
    const prompt = ai.definePrompt({
      name: 'translateTextPrompt',
      input: { schema: TranslateTextInputSchema },
      output: { schema: TranslateTextOutputSchema },
      model: 'ollama/gemma:2b',
      prompt: `You are an expert translator. Your task is to translate the given text into the specified target language while perfectly preserving all markdown formatting.
Your output must be a valid JSON object that adheres to the defined schema.

**CRITICAL INSTRUCTIONS:**
1.  **Preserve Markdown**: You MUST maintain the original markdown structure. Headings (e.g., '#', '##'), lists (e.g., '-', '1.'), bold text (e.g., '**text**'), italics, and any other markdown syntax must be kept intact in the translated output.
2.  **Translate ONLY Content**: Only translate the textual content within the markdown. Do not translate markdown syntax.

**Target Language:** {{{targetLang}}}

**Original Text with Markdown:**
---
{{{text}}}
---
`,
      config: {
        temperature: 0.2,
      }
    });

    const { output } = await prompt({ text, targetLang });
    if (!output) {
      return { translatedText: '' };
    }
    return output;
  }
);
