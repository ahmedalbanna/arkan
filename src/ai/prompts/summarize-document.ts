'use server';

/**
 * @fileOverview Document summarization prompt definitions
 */


import { ai } from '@/ai/genkit';
import { SummarizeDocumentInputSchema, SummarizeDocumentOutputSchema } from '@/ai/schemas';
// // Mock function for testing environment
// const createMockPrompt = (config: any) => {
//   return async (input: any) => {
//     // Mock implementation for testing
//     return { output: {} };
//   };
// };

// // Use mock in test environment, real implementation in production
// const ai = typeof process !== 'undefined' && process.env.NODE_ENV === 'test'
//   ? { definePrompt: createMockPrompt }
//   : require('@/ai/genkit').ai;

export const summarizeDocumentPrompt = ai.definePrompt({
  name: 'summarizeDocumentPrompt',
  input: { schema: SummarizeDocumentInputSchema },
  output: { schema: SummarizeDocumentOutputSchema },
  model: 'googleai/gemini-2.0-flash',
  prompt: `You are an expert summarizer, able to distill the most important information from a document.

  Please provide a concise summary of the following document:
  {{media url=documentDataUri}}`,
});
