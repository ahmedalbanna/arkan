
'use server';

/**
 * @fileOverview An AI agent for generating presentation outlines.
 *
 * - generatePresentationOutline - A function that handles the presentation outline generation process.
 * - GeneratePresentationOutlineInput - The input type for the generatePresentationOutline function.
 * - GeneratePresentationOutlineOutput - The return type for the generatePresentationOutline function.
 */

import { ai } from '@/ai/genkit';
import { generatePresentationOutlinePrompt } from '@/ai/prompts/generate-presentation-outline';
import { GeneratePresentationOutlineInputSchema, GeneratePresentationOutlineOutputSchema, type GeneratePresentationOutlineInput, type GeneratePresentationOutlineOutput } from '@/ai/schemas';

export async function generatePresentationOutline(
  input: GeneratePresentationOutlineInput
): Promise<GeneratePresentationOutlineOutput> {
  return generatePresentationOutlineFlow(input);
}

const generatePresentationOutlineFlow = ai.defineFlow(
  {
    name: 'generatePresentationOutlineFlow',
    inputSchema: GeneratePresentationOutlineInputSchema,
    outputSchema: GeneratePresentationOutlineOutputSchema,
  },
  async (input) => {
    const { output } = await generatePresentationOutlinePrompt(input);
    return output!;
  }
);
