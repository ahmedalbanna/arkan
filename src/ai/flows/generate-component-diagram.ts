'use server';

/**
 * @fileOverview AI agent for generating a PlantUML Component Diagram.
 * - generateComponentDiagram
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

const GenerateComponentDiagramInputSchema = z.object({
    proposal: ProjectProposalSchema,
    otherDiagrams: z.record(DiagramTypeEnum, z.string()).optional().describe("A map of previously generated PlantUML diagrams (if any) to provide context. The key is the diagram type and the value is the PlantUML code.")
});
export type GenerateComponentDiagramInput = z.infer<typeof GenerateComponentDiagramInputSchema>;


const GenerateComponentDiagramOutputSchema = z.object({
    plantUmlCode: z.string().describe("The complete PlantUML code for the Component diagram, starting with @startuml and ending with @enduml.")
});
export type GenerateComponentDiagramOutput = z.infer<typeof GenerateComponentDiagramOutputSchema>;

export async function generateComponentDiagram(input: GenerateComponentDiagramInput): Promise<GenerateComponentDiagramOutput> {
  return generateComponentDiagramFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateComponentDiagramPrompt',
  input: { schema: GenerateComponentDiagramInputSchema },
  output: { schema: GenerateComponentDiagramOutputSchema },
  prompt: `You are an expert software architect specializing in PlantUML. Based on the project proposal below, generate a high-level PlantUML **Component Diagram**.

{{#if otherDiagrams}}
To ensure consistency and accuracy, consider the information from these previously generated diagrams. This context is crucial for creating a diagram that aligns with the rest of the system design. For example, the Class diagram can inform which classes belong to which components.
{{#each otherDiagrams}}
--- {{ @key }} Diagram ---
\`\`\`plantuml
{{{this}}}
\`\`\`
---
{{/each}}
{{/if}}

The diagram should:
1.  Identify the main software components of the system (e.g., 'Frontend App', 'API Gateway', 'User Service', 'Database'). Infer these from the project objective and potential architecture.
2.  Show the interfaces provided and required by the components.
3.  Illustrate the dependencies and relationships between these components.
4.  Structure the output strictly as PlantUML code, enclosed within '@startuml' and '@enduml' tags. Do not add any other text or explanation.

Project Proposal Data:
\`\`\`json
{{{json proposal}}}
\`\`\`
`,
});

const generateComponentDiagramFlow = ai.defineFlow(
  {
    name: 'generateComponentDiagramFlow',
    inputSchema: GenerateComponentDiagramInputSchema,
    outputSchema: GenerateComponentDiagramOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
