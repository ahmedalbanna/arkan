'use server';

/**
 * @fileOverview AI proofreading prompt definitions
 */


import { ai } from '@/ai/genkit';
import { AiProofreadDocumentInputSchema, AiProofreadDocumentOutputSchema } from '@/ai/schemas';
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

export const aiProofreadPrompt = ai.definePrompt({
    name: 'aiProofreadDocumentPrompt',
    input: { schema: AiProofreadDocumentInputSchema },
    output: { schema: AiProofreadDocumentOutputSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: `You are an AI proofreading assistant. Review the document text and provide suggestions for spelling, grammar, and style corrections.

Document Text: {{{documentText}}}

Constraints (if any): {{{constraints}}}

Proofread Document:`,
});
