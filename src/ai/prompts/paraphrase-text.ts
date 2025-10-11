'use server';

/**
 * @fileOverview Text paraphrasing prompt definitions
 */


import { ParaphraseInputSchema, ParaphraseOutputSchema, type ParaphraseMode } from '@/ai/schemas';

// Mock function for testing environment
const createMockPrompt = (config: any) => {
    return async (input: any) => {
        // Mock implementation for testing
        return { output: {} };
    };
};

// Use mock in test environment, real implementation in production
const ai = typeof process !== 'undefined' && process.env.NODE_ENV === 'test'
    ? { definePrompt: createMockPrompt }
    : require('@/ai/genkit').ai;

const styleDescriptions: Record<ParaphraseMode, string> = {
    standard: "Provide a balanced rewrite that improves clarity while retaining the original meaning.",
    fluent: "Rewrite the text to sound more natural and fluent, as if written by a native speaker.",
    formal: "Rewrite the text using a more formal, academic, and professional tone.",
    creative: "Rewrite the text in a more creative and engaging style, using vivid language.",
    simplify: "Rewrite the text to be simpler and easier to understand for a general audience.",
};

export const paraphrasePrompt = ai.definePrompt({
    name: 'paraphraseTextPrompt',
    input: { schema: ParaphraseInputSchema },
    output: { schema: ParaphraseOutputSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: `You are an expert editor and rewriter. Your task is to paraphrase the provided text according to the specified style.

**Paraphrase Style:** {{{mode}}}
**Style Description:** ${styleDescriptions.standard}

**Instructions:**
1. Read the original text carefully to understand its meaning and context.
2. Rewrite the text according to the specified style while preserving all key information.
3. Maintain the original markdown formatting (headings, lists, bold text, etc.).
4. Ensure the paraphrased text flows naturally and reads well.

**Original Text:**
---
{{{text}}}
---
`,
});
