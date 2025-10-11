'use server';

/**
 * @fileOverview AI proofreading prompt definitions
 */

import { ai } from '@/ai/genkit';
import { AiProofreadDocumentInputSchema, AiProofreadDocumentOutputSchema } from '@/ai/schemas';

export const aiProofreadDocumentPrompt = ai.definePrompt({
    name: 'aiProofreadDocumentPrompt',
    input: { schema: AiProofreadDocumentInputSchema },
    output: { schema: AiProofreadDocumentOutputSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: `You are an AI proofreading assistant. Review the document text and provide suggestions for spelling, grammar, and style corrections.

Document Text: {{{documentText}}}

Constraints (if any): {{{constraints}}}

Proofread Document:`,
});
