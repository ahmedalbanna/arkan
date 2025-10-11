
'use server';

/**
 * @fileOverview An AI proofreading agent.
 *
 * - aiProofreadDocument - A function that handles the AI proofreading process.
 * - AiProofreadDocumentInput - The input type for the aiProofreadDocument function.
 * - AiProofreadDocumentOutput - The return type for the aiProofreadDocument function.
 */

import { ai } from '@/ai/genkit';
import { aiProofreadDocumentPrompt } from '@/ai/prompts/ai-proofread-document';
import { AiProofreadDocumentInputSchema, AiProofreadDocumentOutputSchema, type AiProofreadDocumentInput, type AiProofreadDocumentOutput } from '@/ai/schemas';

export async function aiProofreadDocument(input: AiProofreadDocumentInput): Promise<AiProofreadDocumentOutput> {
  return aiProofreadDocumentFlow(input);
}

const aiProofreadDocumentFlow = ai.defineFlow(
  {
    name: 'aiProofreadDocumentFlow',
    inputSchema: AiProofreadDocumentInputSchema,
    outputSchema: AiProofreadDocumentOutputSchema,
  },
  async input => {
    const { output } = await aiProofreadDocumentPrompt(input);
    return output!;
  }
);
