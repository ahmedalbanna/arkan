

'use server';

/**
 * @fileOverview A document summarization AI agent.
 *
 * - summarizeDocument - A function that handles the document summarization process.
 * - SummarizeDocumentInput - The input type for the summarizeDocument function.
 * - SummarizeDocumentOutput - The return type for the summarizeDocument function.
 */

import { ai } from '@/modules/ai/infrastructure/services/Genkit';
import { SummarizeDocumentInputSchema, SummarizeDocumentOutputSchema, type SummarizeDocumentInput, type SummarizeDocumentOutput } from '@/modules/ai/domain/schemas';

export async function summarizeDocument(input: SummarizeDocumentInput): Promise<SummarizeDocumentOutput> {
  return summarizeDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeDocumentPrompt',
  input: { schema: SummarizeDocumentInputSchema },
  // No output schema - model returns plain text
  model: 'ollama/gemma:2b',
  config: {
    temperature: 0.3,
  },
  prompt: `You are an expert summarizer, able to distill the most important information from a document.

Output ONLY the summary text. Do NOT wrap it in JSON or any other format.

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
    const result = await prompt(input);
    if (!result) {
      throw new Error('Failed to summarize document.');
    }
    
    // Wrap the plain text in the expected output structure
    const output: SummarizeDocumentOutput = {
      summary: result.text || result.output || ''
    };
    
    if (!output.summary || output.summary.trim().length === 0) {
      throw new Error('Model returned empty summary');
    }
    
    return output;
  }
);
