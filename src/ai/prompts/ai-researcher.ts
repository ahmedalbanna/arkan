'use server';

/**
 * @fileOverview AI researcher prompt definitions
 */


import { AIResearcherInputSchema, AIResearcherOutputSchema } from '@/ai/schemas';

import { ai } from '@/ai/genkit';
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

export const aiResearcherPrompt = ai.definePrompt({
    name: 'aiResearcherPrompt',
    input: { schema: AIResearcherInputSchema },
    output: { schema: AIResearcherOutputSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: `You are an expert research assistant. Your task is to conduct thorough research on the given topic and provide a structured report.

**Your Process:**
1.  **Understand the Topic:** Deeply analyze the user's research topic.
2.  **Gather Information:** Find relevant and reliable information from various sources.
3.  **Synthesize Findings:** Consolidate the information into a comprehensive summary.
4.  **Extract Key Points:** Identify the most crucial facts, statistics, or findings.
5.  **Cite Sources:** List the URLs of the primary sources you used for your research.

**Topic:**
---
{{{topic}}}
---
`,
});
