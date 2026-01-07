

'use server';

/**
 * @fileOverview A document summarization AI agent.
 *
 * - summarizeDocument - A function that handles the document summarization process.
 * - SummarizeDocumentInput - The input type for the summarizeDocument function.
 * - SummarizeDocumentOutput - The return type for the summarizeDocument function.
 */

import { ai } from '@/ai/genkit';
import { SummarizeDocumentInputSchema, SummarizeDocumentOutputSchema, type SummarizeDocumentInput, type SummarizeDocumentOutput } from '@/ai/schemas';

export async function summarizeDocument(input: SummarizeDocumentInput): Promise<SummarizeDocumentOutput> {
  return summarizeDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeDocumentPrompt',
  input: { schema: SummarizeDocumentInputSchema },
  output: { schema: SummarizeDocumentOutputSchema },
  model: 'googleai/gemini-2.5-flash-lite',
  prompt: `You are an expert summarizer, able to distill the most important information from a document.

  Please provide a concise summary of the following document:
  {{media url=documentDataUri}}`,
});

const summarizeDocumentFlow = ai.defineFlow(
  {
    name: 'summarizeDocumentFlow',
    inputSchema: SummarizeDocumentInputSchema,
    outputSchema: SummarizeDocumentOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
