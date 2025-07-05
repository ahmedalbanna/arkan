'use server';

/**
 * @fileOverview AI agent for generating a PlantUML Class Diagram.
 * - generateClassDiagram
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProjectProposalSchema } from '@/ai/schemas';

const DiagramTypeEnum = z.enum([
    'useCase',
    'class',
    'sequence',
    'activity',
    'component',
    'archimate',
]);

const GenerateClassDiagramInputSchema = z.object({
    proposal: ProjectProposalSchema,
    otherDiagrams: z.record(DiagramTypeEnum, z.string()).optional().describe("A map of previously generated PlantUML diagrams (if any) to provide context. The key is the diagram type and the value is the PlantUML code.")
});
export type GenerateClassDiagramInput = z.infer<typeof GenerateClassDiagramInputSchema>;


const GenerateClassDiagramOutputSchema = z.object({
    plantUmlCode: z.string().describe("The complete PlantUML code for the Class diagram, starting with @startuml and ending with @enduml.")
});
export type GenerateClassDiagramOutput = z.infer<typeof GenerateClassDiagramOutputSchema>;

export async function generateClassDiagram(input: GenerateClassDiagramInput): Promise<GenerateClassDiagramOutput> {
  return generateClassDiagramFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateClassDiagramPrompt',
  input: { schema: GenerateClassDiagramInputSchema },
  output: { schema: GenerateClassDiagramOutputSchema },
  prompt: `You are an expert software architect specializing in PlantUML. Based on the project proposal below, generate a PlantUML **Class Diagram**.

{{#if otherDiagrams}}
To ensure consistency and accuracy, consider the information from these previously generated diagrams. This context is crucial for creating a diagram that aligns with the rest of the system design. For example, a Use Case diagram can help identify classes and their responsibilities.
{{#each otherDiagrams}}
--- {{ @key }} Diagram ---
\`\`\`plantuml
{{{this}}}
\`\`\`
---
{{/each}}
{{/if}}

The diagram should:
1.  Identify key classes (entities) from the project's 'objective' and 'expected_outcome'. Think about major nouns like User, Project, Order, etc.
2.  Define attributes for each class.
3.  Define methods (operations) for each class that represent its behavior.
4.  Establish relationships (associations, aggregations, inheritance) between the classes.
5.  Structure the output strictly as PlantUML code, enclosed within '@startuml' and '@enduml' tags. Do not add any other text or explanation.

Project Proposal Data:
\`\`\`json
{{{json proposal}}}
\`\`\`
`,
});

const generateClassDiagramFlow = ai.defineFlow(
  {
    name: 'generateClassDiagramFlow',
    inputSchema: GenerateClassDiagramInputSchema,
    outputSchema: GenerateClassDiagramOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
