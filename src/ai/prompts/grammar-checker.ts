'use server';

/**
 * @fileOverview Grammar checking prompt definitions
 */


import { GrammarCheckInputSchema, GrammarCheckOutputSchema } from '@/ai/schemas';

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

export const grammarCheckPrompt = ai.definePrompt({
    name: 'grammarCheckPrompt',
    input: { schema: GrammarCheckInputSchema },
    output: { schema: GrammarCheckOutputSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: `You are an expert English grammar and spelling checker. Your task is to analyze the following text, correct any errors, and provide a clear explanation for each correction.

**Instructions:**
1.  Read the original text and identify all grammatical errors, spelling mistakes, and punctuation issues.
2.  Create a fully corrected version of the text in the \`correctedText\` field. You MUST preserve the original markdown formatting (headings, lists, bold text, etc.).
3.  For each individual correction you make, create an object in the \`corrections\` array with the original text snippet, the corrected snippet, and a simple explanation of the grammatical rule or reason for the change.

**Original Text:**
---
{{{text}}}
---
`,
    config: {
        temperature: 0.1, // Very low temp for accuracy
    }
});
