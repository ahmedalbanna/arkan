
'use server';

/**
 * @fileOverview An AI agent for generating a project introduction from a full proposal.
 *
 * - generateIntroduction - A function that handles the project introduction generation.
 * - GenerateIntroductionInput - The input type for the generateIntroduction function (the full proposal).
 * - GenerateIntroductionOutput - The return type for the generateIntroduction function (the introduction text).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema } from '@/ai/schemas';

const GenerateIntroductionInputSchema = z.object({
  proposal: ProjectProposalSchema,
  otherSections: z.record(SectionNameSchema, z.string()).optional().describe("A map of previously generated text sections to provide context. The key is the section name and the value is the markdown content."),
  otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional().describe("A map of previously generated PlantUML diagrams to provide context. The key is the diagram type and the value is the PlantUML code."),
  prompt: z.string().describe("The full prompt to use for generating the introduction, including context.")
});
export type GenerateIntroductionInput = z.infer<typeof GenerateIntroductionInputSchema>;

const GenerateIntroductionOutputSchema = z.object({
  introduction: z.string().describe("The complete, professionally written introduction for the project proposal document, formatted as a single string with markdown for paragraphs.")
});
export type GenerateIntroductionOutput = z.infer<typeof GenerateIntroductionOutputSchema>;

export async function generateIntroduction(input: GenerateIntroductionInput): Promise<GenerateIntroductionOutput> {
  return generateIntroductionFlow(input);
}

const generateIntroductionFlow = ai.defineFlow(
  {
    name: 'generateIntroductionFlow',
    inputSchema: GenerateIntroductionInputSchema,
    outputSchema: GenerateIntroductionOutputSchema,
  },
  async (input) => {
    const generateIntroductionPrompt = ai.definePrompt({
      name: 'generateIntroductionPrompt',
      input: { schema: GenerateIntroductionInputSchema },
      output: { schema: GenerateIntroductionOutputSchema },
      prompt: input.prompt, // Use the fully composed prompt passed from the API layer
    });

    const { output } = await generateIntroductionPrompt(input);
    return output!;
  }
);
