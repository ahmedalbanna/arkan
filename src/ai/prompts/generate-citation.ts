'use server';

/**
 * @fileOverview Citation generation prompt definitions
 */

import { GenerateCitationInputSchema, GenerateCitationOutputSchema } from '@/ai/schemas';

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

export const generateCitationPrompt = ai.definePrompt({
    name: 'generateCitationPrompt',
    input: { schema: GenerateCitationInputSchema },
    output: { schema: GenerateCitationOutputSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: `You are an expert academic librarian specializing in generating accurate citations. Your task is to analyze the provided source material and generate one or more correctly formatted citations in the specified style.

If the source material contains multiple distinct sources, generate a citation for each one.

**Citation Style:** {{{style}}}

**Instructions:**
1.  Analyze the source material to identify the necessary components (author, title, publication date, URL, etc.) for each source.
2.  If a source is a URL, attempt to access it to gather the required information.
3.  Format each citation strictly according to the rules of the specified style.
4.  Return an array of citation strings. Do not include any extra text, labels, or explanations.

**Source Material:**
---
{{{sourceText}}}
---
`,
});
