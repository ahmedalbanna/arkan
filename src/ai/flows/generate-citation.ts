
'use server';

/**
 * @fileOverview An AI agent for generating academic citations.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { GenerateCitationInputSchema, type GenerateCitationInput, GenerateCitationOutputSchema, type GenerateCitationOutput } from '@/ai/schemas';

const generateCitationPrompt = ai.definePrompt({
    name: 'generateCitationPrompt',
    input: { schema: GenerateCitationInputSchema },
    output: { schema: GenerateCitationOutputSchema },
    model: 'googleai/gemini-1.5-flash',
    prompt: `You are an expert academic librarian specializing in generating accurate citations. Your task is to analyze the provided source material and generate a single, correctly formatted citation in the specified style.

**Citation Style:** {{{style}}}

**Instructions:**
1.  Analyze the source material to identify the necessary components (author, title, publication date, URL, etc.).
2.  If the source is a URL, attempt to access it to gather the required information.
3.  Format the citation strictly according to the rules of the specified style.
4.  Return only the final citation string. Do not include any extra text, labels, or explanations.

**Source Material:**
---
{{{sourceText}}}
---
`,
  });

const generateCitationFlow = ai.defineFlow({
    name: 'generateCitationFlow',
    inputSchema: GenerateCitationInputSchema,
    outputSchema: GenerateCitationOutputSchema,
}, async (input) => {
    const { output } = await generateCitationPrompt(input);
    if (!output) {
      throw new Error("Citation generation failed.");
    }
    return output;
});

export async function generateCitation(input: GenerateCitationInput): Promise<GenerateCitationOutput> {
  const validation = GenerateCitationInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for generateCitation: ${validation.error.message}`);
  }
  return generateCitationFlow(validation.data);
}
