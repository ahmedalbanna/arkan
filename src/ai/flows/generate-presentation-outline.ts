
'use server';

/**
 * @fileOverview An AI agent for generating presentation outlines.
 *
 * - generatePresentationOutline - A function that handles the presentation outline generation process.
 * - GeneratePresentationOutlineInput - The input type for the generatePresentationOutline function.
 * - GeneratePresentationOutlineOutput - The return type for the generatePresentationOutline function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { GeneratePresentationOutlineInputSchema, type GeneratePresentationOutlineInput, GeneratePresentationOutlineOutputSchema, type GeneratePresentationOutlineOutput } from '@/ai/schemas';

export async function generatePresentationOutline(
  input: GeneratePresentationOutlineInput
): Promise<GeneratePresentationOutlineOutput> {
  return generatePresentationOutlineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePresentationOutlinePrompt',
  input: { schema: GeneratePresentationOutlineInputSchema },
  output: { schema: GeneratePresentationOutlineOutputSchema },
  prompt: `You are an expert at creating presentation outlines. Based on the following topic and any provided documentation, generate a structured outline for a presentation. The outline should have a cover slide and a series of main points, each with potential sub-points including a title and content for each point.

Topic: {{{prompt}}}

{{#if documentation}}
--- DOCUMENTATION ---
Use the following documentation as the primary source of information for the outline.
{{{documentation}}}
-------------------
{{/if}}
`,
});

const generatePresentationOutlineFlow = ai.defineFlow(
  {
    name: 'generatePresentationOutlineFlow',
    inputSchema: GeneratePresentationOutlineInputSchema,
    outputSchema: GeneratePresentationOutlineOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
