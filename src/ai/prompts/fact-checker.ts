'use server';

/**
 * @fileOverview Fact checking prompt definitions
 */


import { FactCheckInputSchema, FactCheckOutputSchema } from '@/ai/schemas';

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

export const factCheckPrompt = ai.definePrompt({
    name: 'factCheckPrompt',
    input: { schema: FactCheckInputSchema },
    output: { schema: FactCheckOutputSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: `You are an expert fact-checker and research analyst. Your task is to analyze the following text, identify all verifiable claims, and determine their factual accuracy.

**Your Process:**
1.  **Identify Claims:** Carefully read the text and extract all specific, factual statements that can be verified (e.g., statistics, historical events, scientific statements).
2.  **Verify Claims:** For each claim, determine its status ('Verified', 'False', or 'Inconclusive').
3.  **Find a Source:** Provide one high-quality, reliable source (e.g., a reputable news organization, scientific journal, or official website) that supports your verification. Provide the domain name (e.g., 'wikipedia.org', 'nasa.gov').
4.  **Explain Your Reasoning:** Briefly explain your conclusion for each claim.
5.  **Calculate Originality Score:** Based on the accuracy of the claims, provide an overall originality/accuracy score from 0 to 100.

**Text to Analyze:**
---
{{{text}}}
---
`,
});
