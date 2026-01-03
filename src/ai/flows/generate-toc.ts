
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
{{{projectDescription}}}
---

**Instructions:**
1.  Analyze the project Description to understand its core components, objectives, and scope.
2.  Generate a list of relevant **chapters**.
3.  For each chapter, generate a list of 3-5 relevant **section** titles.
4.  The output must be an array of objects, where each object has a 'title' (for the chapter) and a 'sections' (an array of strings for the section titles).
5.  Include standard report chapters like 'Introduction', 'System Analysis', 'Conclusion', etc., but tailor the sections within them to the project description.
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
