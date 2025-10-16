'use server';

import { ai } from '@/ai/genkit';
import { TranslateTextInputSchema, TranslateTextOutputSchema } from '@/ai/schemas';

export const translateTextPrompt = ai.definePrompt({
    name: 'translateTextPrompt',
    input: { schema: TranslateTextInputSchema },
    output: { schema: TranslateTextOutputSchema },
    model: 'googleai/gemini-2.0-flash',
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
    config: {
        temperature: 0.2,
    }
});
