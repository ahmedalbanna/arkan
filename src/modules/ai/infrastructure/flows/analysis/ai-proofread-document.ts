
'use server';

/**
 * @fileOverview An AI proofreading agent.
 *
 * - aiProofreadDocument - A function that handles the AI proofreading process.
 * - AiProofreadDocumentInput - The input type for the aiProofreadDocument function.
 * - AiProofreadDocumentOutput - The return type for the aiProofreadDocument function.
 */

import { ai } from '@/modules/ai/infrastructure/services/Genkit';
import { AiProofreadDocumentInputSchema, AiProofreadDocumentOutputSchema, type AiProofreadDocumentInput, type AiProofreadDocumentOutput } from '@/modules/ai/domain/schemas';

const prompt = ai.definePrompt({
  name: 'aiProofreadDocumentPrompt',
  input: { schema: AiProofreadDocumentInputSchema },
  output: { schema: AiProofreadDocumentOutputSchema },

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
  async (input: AiProofreadDocumentInput) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function aiProofreadDocument(input: AiProofreadDocumentInput): Promise<AiProofreadDocumentOutput> {
  return aiProofreadDocumentFlow(input);
}
