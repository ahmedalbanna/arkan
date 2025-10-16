'use server';

import { ai } from '@/ai/genkit';
import { SummarizeDocumentInputSchema, SummarizeDocumentOutputSchema } from '@/ai/schemas';

export const summarizeDocumentPrompt = ai.definePrompt({
    name: 'summarizeDocumentPrompt',
    input: { schema: SummarizeDocumentInputSchema },
    output: { schema: SummarizeDocumentOutputSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: `You are an expert summarizer, able to distill the most important information from a document.

  Please provide a concise summary of the following document:
  {{media url=documentDataUri}}`,
});
