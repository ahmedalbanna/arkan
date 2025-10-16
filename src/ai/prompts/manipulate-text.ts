'use server';

import { ai } from '@/ai/genkit';
import { ManipulateTextInputSchema, ManipulateTextOutputSchema } from '@/ai/schemas';

export const manipulateTextPrompt = ai.definePrompt({
    name: 'manipulateTextPrompt',
    input: { schema: ManipulateTextInputSchema },
    output: { schema: ManipulateTextOutputSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: `You are an expert editor. A user has provided a piece of text and a command for how to change it. Your task is to follow the command and return only the rewritten text.

Command: {{{command}}}

Original Text:
---
{{{textToManipulate}}}
---
`,
    config: {
        temperature: 0.5,
    }
});
