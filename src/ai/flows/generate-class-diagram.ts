'use server';

/**
 * @fileOverview AI agent for generating a PlantUML Class Diagram.
 * - generateClassDiagram
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema } from '@/ai/schemas';

const GenerateClassDiagramInputSchema = z.object({
    proposal: ProjectProposalSchema,
    otherSections: z.record(SectionNameSchema, z.string()).optional().describe("A map of previously generated text sections to provide context. The key is the section name and the value is the markdown content."),
    otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional().describe("A map of previously generated PlantUML diagrams (if any) to provide context. The key is the diagram type and the value is the PlantUML code."),
    prompt: z.string().describe("The prompt to use for generating the diagram.")
});
export type GenerateClassDiagramInput = z.infer<typeof GenerateClassDiagramInputSchema>;


const GenerateClassDiagramOutputSchema = z.object({
    plantUmlCode: z.string().describe("The complete PlantUML code for the Class diagram, starting with @startuml and ending with @enduml.")
});
export type GenerateClassDiagramOutput = z.infer<typeof GenerateClassDiagramOutputSchema>;

export async function generateClassDiagram(input: GenerateClassDiagramInput): Promise<GenerateClassDiagramOutput> {
  return generateClassDiagramFlow(input);
}

const generateClassDiagramFlow = ai.defineFlow(
  {
    name: 'generateClassDiagramFlow',
    inputSchema: GenerateClassDiagramInputSchema,
    outputSchema: GenerateClassDiagramOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
        name: 'generateClassDiagramPrompt',
        input: { schema: GenerateClassDiagramInputSchema },
        output: { schema: GenerateClassDiagramOutputSchema },
        prompt: input.prompt,
    });
    const { output } = await prompt(input);
    return output!;
  }
);