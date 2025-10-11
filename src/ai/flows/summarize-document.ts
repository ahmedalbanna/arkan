

'use server';

/**
 * @fileOverview A document summarization AI agent.
 *
 * - summarizeDocument - A function that handles the document summarization process.
 * - SummarizeDocumentInput - The input type for the summarizeDocument function.
 * - SummarizeDocumentOutput - The return type for the summarizeDocument function.
 */

import { ai } from '@/ai/genkit';
import { summarizeDocumentPrompt } from '@/ai/prompts/summarize-document';
import { SummarizeDocumentInputSchema, SummarizeDocumentOutputSchema, type SummarizeDocumentInput, type SummarizeDocumentOutput } from '@/ai/schemas';

export async function summarizeDocument(input: SummarizeDocumentInput): Promise<SummarizeDocumentOutput> {
  return summarizeDocumentFlow(input);
}

const summarizeDocumentFlow = ai.defineFlow(
  {
    name: 'summarizeDocumentFlow',
    inputSchema: SummarizeDocumentInputSchema,
    outputSchema: SummarizeDocumentOutputSchema,
  },
  async input => {
    const { output } = await summarizeDocumentPrompt(input);
    return output!;
  }
);
