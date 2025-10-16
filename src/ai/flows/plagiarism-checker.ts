'use server';

/**
 * @fileOverview An AI agent for checking text for potential plagiarism.
 */

import { ai } from '@/ai/genkit';
import { plagiarismCheckPrompt } from '@/ai/prompts/plagiarism-checker';
import { PlagiarismCheckInputSchema, PlagiarismCheckOutputSchema, type PlagiarismCheckInput, type PlagiarismCheckOutput } from '@/ai/schemas';


const plagiarismCheckFlow = ai.defineFlow({
  name: 'plagiarismCheckFlow',
  inputSchema: PlagiarismCheckInputSchema,
  outputSchema: PlagiarismCheckOutputSchema,
}, async (input) => {
  const { output } = await plagiarismCheckPrompt(input);
  if (!output) {
    throw new Error('Plagiarism check failed to produce an output.');
  }
  return output;
});

export async function plagiarismCheck(input: PlagiarismCheckInput): Promise<PlagiarismCheckOutput> {
  const validation = PlagiarismCheckInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for plagiarismCheck: ${validation.error.message}`);
  }
  return plagiarismCheckFlow(validation.data);
}
