
'use server';

/**
 * @fileOverview An AI agent for generating presentation slides from a project proposal and report.
 * - generatePresentation
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  ProjectProposalSchema,
  DiagramTypeSchema,
  SectionNameSchema,
  GeneratePresentationInputSchema,
  type GeneratePresentationInput,
  GeneratePresentationOutputSchema,
  type GeneratePresentationOutput
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
    const prompt = ai.definePrompt({
      name: 'generatePresentationPrompt',
      input: { schema: GeneratePresentationInputSchema },
      output: { schema: GeneratePresentationOutputSchema },
      prompt: input.prompt,
    });

    const { output } = await prompt(input);
    return output!;
  }
);

