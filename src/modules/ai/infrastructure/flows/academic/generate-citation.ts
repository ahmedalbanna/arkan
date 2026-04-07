
'use server';

/**
 * @fileOverview An AI agent for generating academic citations.
 */

import { ai, OLLAMA_MODELS } from '@/modules/ai/infrastructure/services/Genkit';
import { GenerateCitationInputSchema, GenerateCitationOutputSchema, type GenerateCitationInput, type GenerateCitationOutput } from '@/modules/ai/domain/schemas';

const generateCitationPrompt = ai.definePrompt({
  name: 'generateCitationPrompt',
  input: { schema: GenerateCitationInputSchema },
  output: { schema: GenerateCitationOutputSchema },
  model: OLLAMA_MODELS.PHI3_MINI,

  prompt: `You are an expert academic librarian specializing in generating accurate citations. Your task is to analyze the provided source material and generate one or more correctly formatted citations in the specified style.

If the source material contains multiple distinct sources, generate a citation for each one.

**Citation Style:** {{{style}}}

**Instructions:**
1.  Analyze the source material to identify the necessary components (author, title, publication date, URL, etc.) for each source.
2.  If a source is a URL, attempt to access it to gather the required information.
3.  Format each citation strictly according to the rules of the specified style.
4.  Return an array of citation strings. Do not include any extra text, labels, or explanations.

**Source Material:**
---
{{{sourceText}}}
---
`,
});

const generateCitationFlow = ai.defineFlow({
  name: 'generateCitation',
  inputSchema: GenerateCitationInputSchema,
  outputSchema: GenerateCitationOutputSchema,
}, async (input: GenerateCitationInput) => {
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
