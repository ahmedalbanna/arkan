
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

const GeneratePresentationOutlineInputSchema = z.object({
  prompt: z.string().describe('The topic or prompt for the presentation.'),
});
export type GeneratePresentationOutlineInput = z.infer<typeof GeneratePresentationOutlineInputSchema>;

const OutlineItemSchema = z.object({
  title: z.string().describe('The title of the slide or section.'),
  content: z.string().describe('A brief description of the content for this item.'),
  children: z.array(z.lazy(() => OutlineItemSchema)).optional().describe('Sub-items for this outline entry.'),
});

const GeneratePresentationOutlineOutputSchema = z.object({
  cover: z.object({
    title: z.string(),
  }),
  outline: z.array(OutlineItemSchema),
});
export type GeneratePresentationOutlineOutput = z.infer<typeof GeneratePresentationOutlineOutputSchema>;

export async function generatePresentationOutline(
  input: GeneratePresentationOutlineInput
): Promise<GeneratePresentationOutlineOutput> {
  return generatePresentationOutlineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePresentationOutlinePrompt',
  input: { schema: GeneratePresentationOutlineInputSchema },
  output: { schema: GeneratePresentationOutlineOutputSchema },
  prompt: `You are an expert at creating presentation outlines. Based on the following prompt, generate a structured outline for a presentation. The outline should have a cover slide and a series of main points, each with potential sub-points including a title and content for each point.

Prompt: {{{prompt}}}
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
