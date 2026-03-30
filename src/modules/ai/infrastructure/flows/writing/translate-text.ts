
'use server';

/**
 * @fileOverview An AI agent for translating text.
 * - translateText
 */

import { ai } from '@/modules/ai/infrastructure/services/Genkit';
import { TranslateTextInputSchema, TranslateTextOutputSchema, type TranslateTextInput, type TranslateTextOutput } from '@/modules/ai/domain/schemas';

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
  async ({ text, targetLang }: any) => {
    const prompt = ai.definePrompt({
      name: 'translateTextPrompt',
      input: { schema: TranslateTextInputSchema },
      model: 'ollama/gemma:2b',
      prompt: `You are an expert translator. Your task is to translate the given text into the specified target language while perfectly preserving all markdown formatting.

**CRITICAL INSTRUCTIONS:**
1.  **Preserve Markdown**: Maintain all syntax ('#', '**', '-', etc.).
2.  **Translate ONLY Content**: Do not translate markdown syntax.

**Target Language:** {{{targetLang}}}

**Original Text with Markdown:**
---
{{{text}}}
---

Output ONLY the translated text. Do NOT include any preamble, filler, or JSON wrapping.`,
      config: {
        temperature: 0.1,
      }
    });

    const result = await prompt({text, targetLang });
    const translatedText = result.text || result.output || "";
    
    if (!translatedText || translatedText.trim().length === 0) {
      throw new Error('Model returned empty translation');
    }
    
    return translatedText.trim();
  }
);
