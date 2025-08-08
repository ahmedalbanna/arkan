
'use server';

/**
 * @fileOverview An AI agent for generating academic citations.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const CitationStyleSchema = z.enum(['apa', 'mla', 'chicago', 'ieee']);
export type CitationStyle = z.infer<typeof CitationStyleSchema>;

const GenerateCitationInputSchema = z.object({
  sourceText: z.string().describe('The source material to generate a citation for. This can be a URL, a block of text from an article, or a book title and author.'),
  style: CitationStyleSchema.describe('The citation style to use (e.g., APA, MLA).'),
});
export type GenerateCitationInput = z.infer<typeof GenerateCitationInputSchema>;

const GenerateCitationOutputSchema = z.object({
  citation: z.string().describe('The formatted citation string.'),
});
export type GenerateCitationOutput = z.infer<typeof GenerateCitationOutputSchema>;

export async function generateCitation(input: GenerateCitationInput): Promise<GenerateCitationOutput> {
  const { sourceText, style } = input;

  const prompt = ai.definePrompt({
    name: 'generateCitationPrompt',
    input: { schema: GenerateCitationInputSchema },
    output: { schema: GenerateCitationOutputSchema },
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

  const { output } = await prompt({ sourceText, style });
  return output!;
}
