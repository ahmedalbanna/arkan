'use server';

/**
 * @fileOverview An AI agent for generating PlantUML code from a text description.
 */

import { ai } from '@/ai/genkit';
import { generatePlantUMLPrompt } from '@/ai/prompts/generate-plantuml';
import { GeneratePlantUMLInputSchema, GeneratePlantUMLOutputSchema, type GeneratePlantUMLInput, type GeneratePlantUMLOutput } from '@/ai/schemas';

const generatePlantUMLFlow = ai.defineFlow({
  name: 'generatePlantUMLFlow',
  inputSchema: GeneratePlantUMLInputSchema,
  outputSchema: GeneratePlantUMLOutputSchema
}, async (input) => {
  const { output } = await generatePlantUMLPrompt(input);
  if (!output) {
    throw new Error("PlantUML code generation failed.");
  }
  return output;
});

export async function generatePlantUML(input: GeneratePlantUMLInput): Promise<GeneratePlantUMLOutput> {
  const validation = GeneratePlantUMLInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for generatePlantUML: ${validation.error.message}`);
  }
  return generatePlantUMLFlow(validation.data);
}
