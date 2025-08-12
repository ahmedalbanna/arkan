'use server';

/**
 * @fileOverview An AI proofreading agent.
 *
 * - aiProofreadDocument - A function that handles the AI proofreading process.
 * - AiProofreadDocumentInput - The input type for the aiProofreadDocument function.
 * - AiProofreadDocumentOutput - The return type for the aiProofreadDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiProofreadDocumentInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the document to be proofread.'),
  constraints: z
    .string()
    .optional()
    .describe(
      'Optional constraints to tailor the proofreading suggestions, such as specific style guidelines or target audience.'
    ),
});
export type AiProofreadDocumentInput = z.infer<typeof AiProofreadDocumentInputSchema>;

const AiProofreadDocumentOutputSchema = z.object({
  proofreadDocument: z
    .string()
    .describe('The proofread document with suggested corrections.'),
});
export type AiProofreadDocumentOutput = z.infer<typeof AiProofreadDocumentOutputSchema>;

export async function aiProofreadDocument(input: AiProofreadDocumentInput): Promise<AiProofreadDocumentOutput> {
  return aiProofreadDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiProofreadDocumentPrompt',
  input: {schema: AiProofreadDocumentInputSchema},
  output: {schema: AiProofreadDocumentOutputSchema},
  model: 'googleai/gemini-1.5-flash',
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
    const {output} = await prompt(input);
    return output!;
  }
);
