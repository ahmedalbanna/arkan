

'use server';

/**
 * @fileOverview An AI agent for generating presentation slides from a project proposal and report.
 * - generatePresentation
 */

import { ai } from '@/ai/genkit';
import { generatePresentationPrompt } from '@/ai/prompts/generate-presentation';
import {
  GeneratePresentationInputSchema,
  GeneratePresentationOutputSchema,
  type GeneratePresentationInput,
  type GeneratePresentationOutput,
} from '@/ai/schemas';

export async function generatePresentation(input: GeneratePresentationInput): Promise<GeneratePresentationOutput> {
  return generatePresentationFlow(input);
}

const generatePresentationFlow = ai.defineFlow(
  {
    name: 'generatePresentationFlow',
    inputSchema: GeneratePresentationInputSchema,
    outputSchema: GeneratePresentationOutputSchema,
  },
  async (input) => {
    const { output } = await generatePresentationPrompt(input);
    return output!;
  }
);
