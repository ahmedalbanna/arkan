'use server';

/**
 * @fileOverview Presentation outline generation prompt definitions
 */


import { ai } from '@/ai/genkit';
import { GeneratePresentationOutlineInputSchema, GeneratePresentationOutlineOutputSchema } from '@/ai/schemas';
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

export const generatePresentationOutlinePrompt = ai.definePrompt({
    name: 'generatePresentationOutlinePrompt',
    input: { schema: GeneratePresentationOutlineInputSchema },
    output: { schema: GeneratePresentationOutlineOutputSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: `You are an expert at creating presentation outlines. Based on the following topic and any provided documentation, generate a structured outline for a presentation. The outline should have a cover slide and a series of main points, each with potential sub-points including a title and content for each point.

Topic: {{{prompt}}}

{{#if documentation}}
--- DOCUMENTATION ---
Use the following documentation as the primary source of information for the outline.
{{{documentation}}}
-------------------
{{/if}}
`,
});
