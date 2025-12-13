
'use server';

/**
 * @fileOverview An AI agent for generating a table of contents from a project Description.
 */

import { ai } from '@/ai/genkit';
import { GenerateTocInputSchema, GenerateTocOutputSchema, type GenerateTocInput, type GenerateTocOutput } from '@/ai/schemas';

const generateTocPrompt = ai.definePrompt({
  name: 'generateTocPrompt',
  input: { schema: GenerateTocInputSchema },
  output: { schema: GenerateTocOutputSchema },
  model: 'googleai/gemini-2.5-flash-lite',
  prompt: `You are an expert project planner and technical writer. Based on the provided project Description, generate a logical and comprehensive table of contents for a formal report.

**Project Description:**
---
{{{text}}}
---

**Instructions:**
1.  Analyze the project Description to understand its core components, objectives, and scope.
2.  Generate a list of relevant section titles for a detailed report.
3.  The list should be ordered logically, starting from an introduction and ending with a conclusion.
4.  Include standard sections like 'System Analysis', 'System Design', and 'Conclusion'.
5.  Do not include any numbering or bullet points in the output, just the section titles.
`,
  config: {
    temperature: 0.4,
  }
});

const generateTocFlow = ai.defineFlow({
  name: 'generateTocFlow',
  inputSchema: GenerateTocInputSchema,
  outputSchema: GenerateTocOutputSchema,
}, async (input) => {
  const { output } = await generateTocPrompt(input);
  if (!output) {
    throw new Error('Table of Contents generation failed to produce an output.');
  }
  return output;
});

export async function generateToc(input: GenerateTocInput): Promise<GenerateTocOutput> {
  const validation = GenerateTocInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for generateToc: ${validation.error.message}`);
  }
  return generateTocFlow(validation.data);
}
