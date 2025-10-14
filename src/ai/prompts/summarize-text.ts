'use server';

/**
 * @fileOverview Text summarization prompt definitions
 */


import { ai } from '@/ai/genkit';
import { SummarizeInputSchema, SummarizeLength, SummarizeOutputSchema } from '@/ai/schemas';
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

const lengthDescriptions: Record<SummarizeLength, string> = {
    short: "a single, concise paragraph.",
    medium: "a few paragraphs, capturing the main points and key supporting details.",
    long: "a detailed summary, covering all significant topics and arguments.",
};

export const summarizePrompt = ai.definePrompt({
    name: 'summarizeTextPrompt',
    input: { schema: SummarizeInputSchema },
    output: { schema: SummarizeOutputSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: `You are an expert summarizer. Your task is to read the provided text and generate a summary of the specified length.

**Desired Length**: The summary should be ${lengthDescriptions.short}

**Instructions:**
1. Read the text carefully to understand its main points and key details.
2. Create a summary that captures the essential information in the specified length.
3. Maintain the original meaning and context.
4. Use clear, concise language.

**Text to Summarize:**
---
{{{text}}}
---
`,
});
