'use server';

/**
 * @fileOverview AI agent for generating a PlantUML ArchiMate Diagram.
 * - generateArchimateDiagram
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProjectProposalSchema, DiagramTypeSchema } from '@/ai/schemas';

const GenerateArchimateDiagramInputSchema = z.object({
    proposal: ProjectProposalSchema,
    otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional().describe("A map of previously generated PlantUML diagrams (if any) to provide context. The key is the diagram type and the value is the PlantUML code."),
    prompt: z.string().describe("The prompt to use for generating the diagram.")
});
export type GenerateArchimateDiagramInput = z.infer<typeof GenerateArchimateDiagramInputSchema>;


const GenerateArchimateDiagramOutputSchema = z.object({
    plantUmlCode: z.string().describe("The complete PlantUML code for the ArchiMate diagram, starting with @startuml and ending with @enduml.")
});
export type GenerateArchimateDiagramOutput = z.infer<typeof GenerateArchimateDiagramOutputSchema>;

export async function generateArchimateDiagram(input: GenerateArchimateDiagramInput): Promise<GenerateArchimateDiagramOutput> {
  return generateArchimateDiagramFlow(input);
}

const generateArchimateDiagramFlow = ai.defineFlow(
  {
    name: 'generateArchimateDiagramFlow',
    inputSchema: GenerateArchimateDiagramInputSchema,
    outputSchema: GenerateArchimateDiagramOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
        name: 'generateArchimateDiagramPrompt',
        input: { schema: GenerateArchimateDiagramInputSchema },
        output: { schema: GenerateArchimateDiagramOutputSchema },
        prompt: input.prompt,
    });

    const { output } = await prompt(input);
    return output!;
  }
);
