
'use server';

/**
 * @fileOverview AI agent for generating a PlantUML Entity-Relationship (ER) Diagram.
 * - generateErDiagram
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema } from '@/ai/schemas';

const GenerateErDiagramInputSchema = z.object({
  proposal: ProjectProposalSchema,
  otherSections: z.record(SectionNameSchema, z.string()).optional().describe("A map of previously generated text sections to provide context. The key is the section name and the value is the markdown content."),
  otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional().describe("A map of previously generated PlantUML diagrams (if any) to provide context. The key is the diagram type and the value is the PlantUML code."),
  prompt: z.string().describe("The full prompt to use for generating the diagram, including context.")
});
export type GenerateErDiagramInput = z.infer<typeof GenerateErDiagramInputSchema>;


const GenerateErDiagramOutputSchema = z.object({
  plantUmlCode: z.string().describe("The complete PlantUML code for the ER diagram, starting with @startuml and ending with @enduml.")
});
export type GenerateErDiagramOutput = z.infer<typeof GenerateErDiagramOutputSchema>;

export async function generateErDiagram(input: GenerateErDiagramInput): Promise<GenerateErDiagramOutput> {
  return generateErDiagramFlow(input);
}

const generateErDiagramFlow = ai.defineFlow(
  {
    name: 'generateErDiagramFlow',
    inputSchema: GenerateErDiagramInputSchema,
    outputSchema: GenerateErDiagramOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'generateErDiagramPrompt',
      input: { schema: GenerateErDiagramInputSchema },
      output: { schema: GenerateErDiagramOutputSchema },
      prompt: input.prompt, // Use the fully composed prompt passed from the API layer
    });
    const { output } = await prompt(input);
    return output!;
  }
);
