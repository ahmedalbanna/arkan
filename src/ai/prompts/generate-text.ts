// src/ai/prompts/generate-text.ts
'use server';

import { ai } from '@/ai/genkit';
import { GenerateTextInputSchema, GenerateTextOutputSchema } from '@/ai/schemas';

export const generateTextPrompt = ai.definePrompt({
    name: 'generateTextPrompt',
    input: { schema: GenerateTextInputSchema },
    output: { schema: GenerateTextOutputSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: `You are a writing assistant. Generate text based on the following prompt.

Prompt: {{{prompt}}}

Generated Text:`,
});
