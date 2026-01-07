
'use server';

/**
 * @fileOverview An AI proofreading agent.
 *
 * - aiProofreadDocument - A function that handles the AI proofreading process.
 * - AiProofreadDocumentInput - The input type for the aiProofreadDocument function.
 * - AiProofreadDocumentOutput - The return type for the aiProofreadDocument function.
 */

import { ai } from '@/ai/genkit';
import { AiProofreadDocumentInputSchema, AiProofreadDocumentOutputSchema, type AiProofreadDocumentInput, type AiProofreadDocumentOutput } from '@/lib/schemas';

export async function aiProofreadDocument(input: AiProofreadDocumentInput): Promise<AiProofreadDocumentOutput> {
  return aiProofreadDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiProofreadDocumentPrompt',
  input: { schema: AiProofreadDocumentInputSchema },
  output: { schema: AiProofreadDocumentOutputSchema },
  model: 'googleai/gemini-2.5-flash-lite',
  prompt: `You are an AI proofreading assistant. Review the document text and provide suggestions for spelling, grammar, and style corrections.

Document Text: {{{documentText}}}

Constraints (if any): {{{constraints}}}

Proofread Document:`,
});

const aiProofreadDocumentFlow = ai.defineFlow(
  {
    name: 'aiProofreadDocumentFlow',
    inputSchema: AiProofreadDocumentInputSchema,
    outputSchema: AiProofreadDocumentOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
