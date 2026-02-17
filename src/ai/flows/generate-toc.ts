
'use server';

/**
 * @fileOverview An AI agent for generating a table of contents from a project Description.
 */

import { ai } from '@/ai/genkit';
import { GenerateTocInputSchema, GenerateTocOutputSchema, type GenerateTocInput, type GenerateTocOutput } from '@/ai/schemas';
import { validateJsonOutput, getJsonPromptInstructions, RECOMMENDED_TEMPERATURES } from '@/ai/utils/json-output-validator';

const generateTocPrompt = ai.definePrompt({
  name: 'generateTocPrompt',
  input: { schema: GenerateTocInputSchema },
  output: { schema: GenerateTocOutputSchema },
  model: 'ollama/phi4-mini:latest',
  config: {
    responseSchema: GenerateTocOutputSchema,
    temperature: RECOMMENDED_TEMPERATURES.BALANCED,
  },

  prompt: `You are an expert project planner and technical writer. Based on the provided project Description, generate a logical and comprehensive table of contents for a formal report.

${getJsonPromptInstructions(`{
  "tableOfContents": [
    {
      "title": "Chapter Title",
      "sections": ["Section 1", "Section 2", "Section 3"]
    }
  ]
}`)}

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

**JSON Output:**`,
});

const generateTocFlow = ai.defineFlow({
  name: 'generateTocFlow',
  inputSchema: GenerateTocInputSchema,
  outputSchema: GenerateTocOutputSchema,
}, async (input) => {
  try {
    const { output } = await generateTocPrompt(input);

    if (!output) {
      throw new Error('No output received from the model.');
    }

    const validation = validateJsonOutput({
      schema: GenerateTocOutputSchema,
      output,
      flowName: 'generateTocFlow',
      attemptRecovery: true,
      enableLogging: true,
    });

    if (!validation.success) {
      throw new Error(validation.error || 'Failed to validate output');
    }

    return validation.data!;
  } catch (error) {
    console.error('Error in generateTocFlow:', error);
    throw new Error(`Table of Contents generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

export async function generateToc(input: GenerateTocInput): Promise<GenerateTocOutput> {
  const validation = GenerateTocInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for generateToc: ${validation.error.message}`);
  }
  return generateTocFlow(validation.data);
}
