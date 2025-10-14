'use server';

/**
 * @fileOverview Text manipulation prompt definitions
 */


import { ai } from '@/ai/genkit';
import { ManipulateTextInputSchema, ManipulateTextOutputSchema } from '@/ai/schemas';
// // Mock function for testing environment
// const createMockPrompt = (config: any) => {
//     return async (input: any) => {
//         // Mock implementation for testing
//         return { output: {} };
//     };
// };

// // Use mock in test environment, real implementation in production
// const ai = typeof process !== 'undefined' && process.env.NODE_ENV === 'test'
//     ? { definePrompt: createMockPrompt }
//     : require('@/ai/genkit').ai;

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
